import { createTables, transaction } from '../db'
import { v4 } from 'uuid'
import * as T from 'fp-ts/TaskEither'
import {
  ThlAreaAdministrations,
  ShotHistory,
  ThlAgeGroupAdministrations,
} from '../service/thl-data-service'
import { findFirst, compact, map } from 'fp-ts/lib/Array'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/lib/function'
import { passError } from '../errors'

export type Area = {
  id: string
  areaName: string
  totalFirstDoseShots: number
  totalSecondDoseShots: number
}

export type Administration = {
  id: string
  areaId: string
  date: Date
  firstDoseShots: number
  secondDoseShots: number
}

const passthorugh = <T>(te: T.TaskEither<string, void>) => (
  passthrough: T
): T.TaskEither<string, T> =>
  pipe(
    te,
    T.map(() => passthrough)
  )

const createLoadTables = T.tryCatch(() => createTables(true), passError('DataSyncError'))

const dropOldTables = transaction('DataSyncError')(async client => {
  await client.query('drop table administration')
  await client.query('drop table area')
  await client.query('drop table age_group')
})

const renameTables = transaction('DataSyncError')(async client => {
  await client.query('alter table administration_load rename to administration')
  await client.query('alter table area_load rename to area')
  await client.query('alter table age_group_load rename to age_group')
})

const insertAreas = transaction<
  Pick<
    ThlAreaAdministrations,
    'area' | 'totalFirstDoseShots' | 'totalSecondDoseShots'
  >[][],
  Area[]
>('DataSyncError')(async (client, areas) => {
  const dbAreas: Area[] = areas.map(
    ({ area, totalFirstDoseShots, totalSecondDoseShots }) => ({
      id: v4(),
      areaName: area,
      totalFirstDoseShots,
      totalSecondDoseShots,
    })
  )
  await Promise.all(
    dbAreas.map(a =>
      client.query('insert into area_load values ($1, $2, $3, $4)', [
        a.id,
        a.areaName,
        a.totalFirstDoseShots,
        a.totalSecondDoseShots,
      ])
    )
  )

  return dbAreas
})

const insertAdministrations = transaction('DataSyncError')(
  async (client, dbAreas: Area[], shotHistory: ShotHistory[]) => {
    const administrations: O.Option<Administration>[] = shotHistory.map(
      ({ date, firstDoseShots, secondDoseShots, area }) =>
        pipe(
          dbAreas,
          findFirst(a => a.areaName === area),
          O.map(dbArea => ({
            id: v4(),
            areaId: dbArea.id,
            date: new Date(date),
            firstDoseShots,
            secondDoseShots,
          }))
        )
    )

    return Promise.all(
      compact(administrations).map(a =>
        client.query('insert into administration_load values ($1, $2, $3, $4, $5)', [
          a.id,
          a.areaId,
          a.date,
          a.firstDoseShots,
          a.secondDoseShots,
        ])
      )
    )
  }
)

const insertAgeGroups = transaction(
  'DataSyncError'
)((client, ageGroupAdministrations: ThlAgeGroupAdministrations[]) =>
  Promise.all(
    ageGroupAdministrations.map(({ ageGroupName, firstDoseShots, secondDoseShots }) =>
      client.query('insert into age_group_load values ($1, $2, $3, $4)', [
        v4(),
        ageGroupName,
        firstDoseShots,
        secondDoseShots,
      ])
    )
  )
)

export const startDataSync = (
  areaAdministrations: ThlAreaAdministrations[],
  ageGroupAdministrations: ThlAgeGroupAdministrations[]
) =>
  pipe(
    areaAdministrations,
    map(({ area, totalFirstDoseShots, totalSecondDoseShots }) => ({
      area,
      totalFirstDoseShots,
      totalSecondDoseShots,
    })),
    passthorugh(createLoadTables),
    T.chain(insertAreas),
    T.chain(areas =>
      insertAdministrations(
        areas,
        areaAdministrations.flatMap(({ shotHistory }) => shotHistory)
      )
    ),
    T.chain(() => insertAgeGroups(ageGroupAdministrations)),
    T.chain(() => dropOldTables()),
    T.chain(() => renameTables())
  )
