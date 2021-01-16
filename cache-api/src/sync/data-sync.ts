import { getClient } from '../db'
import { v4 } from 'uuid'
import * as T from 'fp-ts/TaskEither'
import { HsAreaAdministrations, ShotHistory } from '../service/hs-api-service'
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

const truncate = () => {
  const queryP = getClient().then(async client => {
    try {
      await client.query('truncate area cascade')
    } catch (e) {
      throw e
    } finally {
      client.release()
    }
  })

  return T.tryCatch(() => queryP, passError('DataSyncError'))
}

const insertAreas = (areas: Pick<HsAreaAdministrations, 'area' | 'totalShots'>[]) => {
  const queryP: Promise<Area[]> = getClient().then(async client => {
    try {
      await client.query('BEGIN')
      const dbAreas: Area[] = areas.map(({ area, totalShots }) => ({
        id: v4(),
        areaName: area,
        totalShots,
      }))
      await Promise.all(
        dbAreas.map(a =>
          client.query('insert into area values ($1, $2, $3)', [
            a.id,
            a.areaName,
            a.totalShots,
          ])
        )
      )
      await client.query('COMMIT')
      return dbAreas
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  })

  return T.tryCatch(() => queryP, passError('DataSyncError'))
}

const insertAdministrations = (dbAreas: Area[], shotHistory: ShotHistory[]) => {
  const queryP = getClient().then(async client => {
    try {
      await client.query('BEGIN')
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

      await Promise.all(
        compact(administrations).map(a =>
          client.query('insert into administration values ($1, $2, $3, $4)', [
            a.id,
            a.areaId,
            a.date,
            a.shots,
          ])
        )
      )
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  })

  return T.tryCatch(() => queryP, passError('DataSyncError'))
}

export const startDataSync = (areaAdministrations: HsAreaAdministrations[]) =>
  pipe(
    areaAdministrations,
    map(({ area, totalShots }) => ({ area, totalShots })),
    passthorugh(truncate()),
    T.chain(insertAreas),
    T.chain(areas =>
      insertAdministrations(
        areas,
        areaAdministrations.flatMap(({ shotHistory }) => shotHistory)
      )
    )
  )
