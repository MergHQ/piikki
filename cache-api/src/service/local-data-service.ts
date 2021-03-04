import { withConnection } from '../db'
import { taskEither as T, option as O } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { Administration, Area } from '../sync/data-sync'
import * as R from 'ramda'
import { AreaAdministration, Summary } from '../../../shared/area-administration'
import { AgeGroupAdministration } from '../../../shared/age-group-administration'

type AreaQueryResult = Area & Omit<Administration, 'id'>

const cacheTTL = 60 * 1000 * 15 // 15 mins

const cachedAreaAdministrationsQuery = withConnection<void[], AreaQueryResult>(
  'DbError',
  O.some(cacheTTL)
)(client =>
  client.query(
    `
      select 
        area.*, 
        administration."areaId",
        administration.date,
        administration."firstDoseShots",
        administration."secondDoseShots"
      from area
      inner join administration
      on (area.id = administration."areaId")
      `
  )
)

const cachedAgeGroupAdministrationsQuery = withConnection<void[], AgeGroupAdministration>(
  'DbError',
  O.some(cacheTTL)
)(client => client.query('select * from age_group'))

const parseAreaQueryResult = R.pipe(
  R.groupBy<AreaQueryResult>(res => res.id),
  R.mapObjIndexed(items => {
    const { id, areaName, totalFirstDoseShots, totalSecondDoseShots } = items[0]
    return {
      areaId: id,
      areaName,
      totalFirstDoseShots,
      totalSecondDoseShots,
      shotHistory: items.map(({ areaId, date, firstDoseShots, secondDoseShots }) => ({
        areaId,
        date: new Date(date),
        firstDoseShots,
        secondDoseShots,
      })),
    } as AreaAdministration
  }),
  R.values,
  R.flatten
)

const summarize = (data: AreaAdministration[]): Summary => ({
  totalFirstDoseShots: data.reduce((p, c) => p + c.totalFirstDoseShots, 0),
  totalSecondDoseShots: data.reduce((p, c) => p + c.totalSecondDoseShots, 0),
  areas: data.map(({ areaId, areaName, totalFirstDoseShots, totalSecondDoseShots }) => ({
    areaId,
    areaName,
    areaFirstDoseShots: totalFirstDoseShots,
    areaSecondDoseShots: totalSecondDoseShots,
  })),
})

export const getLocalAreaAdministrations = pipe(
  cachedAreaAdministrationsQuery(),
  T.map(parseAreaQueryResult)
)

export const getLocalSummary = pipe(
  cachedAreaAdministrationsQuery(),
  T.map(parseAreaQueryResult),
  T.map(summarize)
)

export const getLocalAgeGroupAdministrations = cachedAgeGroupAdministrationsQuery()
