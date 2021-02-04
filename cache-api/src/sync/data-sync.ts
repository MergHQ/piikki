import { createTables, transaction } from '../db'
import { v4 } from 'uuid'
import * as T from 'fp-ts/TaskEither'
import { ThlAreaAdministrations, ShotHistory } from '../service/thl-data-service'
import { findFirst, compact, map } from 'fp-ts/lib/Array'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/lib/function'
import { passError } from '../errors'

export type Area = {
  id: string
  areaName: string
  totalShots: number
}

export type Administration = {
  id: string
  areaId: string
  date: Date
  shots: number
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
})

const renameTables = transaction('DataSyncError')(async client => {
  await client.query('alter table administration_load rename to administration')
  await client.query('alter table area_load rename to area')
})

const insertAreas = transaction<
  Pick<ThlAreaAdministrations, 'area' | 'totalShots'>[][],
  Area[]
>('DataSyncError')(async (client, areas) => {
  const dbAreas: Area[] = areas.map(({ area, totalShots }) => ({
    id: v4(),
    areaName: area,
    totalShots,
  }))
  await Promise.all(
    dbAreas.map(a =>
      client.query('insert into area_load values ($1, $2, $3)', [
        a.id,
        a.areaName,
        a.totalShots,
      ])
    )
  )

  return dbAreas
})

const insertAdministrations = transaction('DataSyncError')(
  async (client, dbAreas: Area[], shotHistory: ShotHistory[]) => {
    const administrations: O.Option<Administration>[] = shotHistory.map(
      ({ date, shots, area }) =>
        pipe(
          dbAreas,
          findFirst(a => a.areaName === area),
          O.map(dbArea => ({
            id: v4(),
            areaId: dbArea.id,
            date: new Date(date),
            shots,
          }))
        )
    )

    return Promise.all(
      compact(administrations).map(a =>
        client.query('insert into administration_load values ($1, $2, $3, $4)', [
          a.id,
          a.areaId,
          a.date,
          a.shots,
        ])
      )
    )
  }
)

export const startDataSync = (areaAdministrations: ThlAreaAdministrations[]) =>
  pipe(
    areaAdministrations,
    map(({ area, totalShots }) => ({ area, totalShots })),
    passthorugh(createLoadTables),
    T.chain(insertAreas),
    T.chain(areas =>
      insertAdministrations(
        areas,
        areaAdministrations.flatMap(({ shotHistory }) => shotHistory)
      )
    ),
    T.chain(() => dropOldTables()),
    T.chain(() => renameTables())
  )
