import { withConnection } from '../db'
import { taskEither as T, option as O } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { Administration, Area } from '../sync/data-sync'
import * as R from 'ramda'
import { AreaAdministration, Summary } from '../../../shared/area-administration'

type QueryResult = Area & Omit<Administration, 'id'>

const cacheTTL = 60 * 1000 * 15 // 15 mins

const cachedAdministrationsQuery = withConnection<void[], QueryResult>(
  'DbError',
  O.some(cacheTTL)
)(client =>
  client.query(
    `
      select 
        area.*, 
        administration."areaId",
        administration.date,
        administration.shots
      from area
      inner join administration
      on (area.id = administration."areaId")
      `
  )
)

const parseQueryResult = R.pipe(
  R.groupBy<QueryResult>(res => res.id),
  R.mapObjIndexed(items => {
    const { id, areaName, totalShots } = items[0]
    return {
      areaId: id,
      areaName,
      totalShots,
      shotHistory: items.map(({ areaId, date, shots }) => ({
        areaId,
        date: new Date(date),
        shots,
      })),
    } as AreaAdministration
  }),
  R.values,
  R.flatten
)

const summarize = (data: AreaAdministration[]): Summary => ({
  totalShots: data.reduce((p, c) => p + c.totalShots, 0),
  areas: data.map(({ areaId, areaName, totalShots }) => ({
    areaId,
    areaName,
    areaTotalShots: totalShots,
  })),
})

export const getLocalAdministrations = pipe(
  cachedAdministrationsQuery(),
  T.map(parseQueryResult)
)

export const getLocalSummary = pipe(
  cachedAdministrationsQuery(),
  T.map(parseQueryResult),
  T.map(summarize)
)
