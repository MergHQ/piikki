import { taskEither as T, option as O } from 'fp-ts'
import { Pool, PoolClient, QueryResult } from 'pg'
import { ErrorName, passError } from './errors'
import memoize from './util/memoize'

const pool = new Pool({
  connectionString: process.env.DB_URL,
  max: 4,
})

export const createTables = (load?: boolean) =>
  pool.connect().then(async con => {
    try {
      con.query(`
      create table if not exists area${load ? '_load' : ''} (
        id varchar(255) primary key,
        "areaName" varchar(255) not null,
        "totalFirstDoseShots" int not null,
        "totalSecondDoseShots" int not null
      );

      create table if not exists administration${load ? '_load' : ''} (
        id varchar(255) not null,
        "areaId" varchar(255) not null,
        date timestamp not null,
        "firstDoseShots" int not null,
        "secondDoseShots" int not null,
        constraint fk_area
          foreign key ("areaId") references area${load ? '_load' : ''}(id)
      );

      create table if not exists age_group${load ? '_load' : ''} (
        id varchar(255) primary key,
        "ageGroupName" varchar(255) not null,
        "firstDoseShots" int not null,
        "secondDoseShots" int not null
      );
      `)
    } catch (e) {
      throw e
    } finally {
      con.release()
    }
  })

/**
 * Higher order function for queries
 */
export const withConnection = <T extends any[], R>(
  error: ErrorName,
  memoizeTtl: O.Option<number>
) => (
  fn: (client: PoolClient, ...args: T) => Promise<QueryResult>
): ((...args: T) => T.TaskEither<ErrorName, R[]>) => (
  ...args
): T.TaskEither<ErrorName, R[]> => {
  const doQuery = () =>
    pool.connect().then(connection =>
      fn(connection, ...args)
        .then(res => res.rows as R[])
        .finally(() => connection.release())
    )

  const memoizedQuery = O.fold(
    () => doQuery,
    (ttl: number) => {
      return memoize(() => {
        console.log('Cache is old, fetching from DB')
        return doQuery()
      }, ttl)
    }
  )(memoizeTtl)

  return T.tryCatch(() => memoizedQuery(), passError(error))
}

/**
 * Higher order function for transactions
 */
export const transaction = <T extends any[], R>(error: ErrorName) => (
  fn: (client: PoolClient, ...args: T) => Promise<R>
): ((...args: T) => T.TaskEither<ErrorName, R>) => (
  ...args
): T.TaskEither<ErrorName, R> => {
  const queryP = pool.connect().then(async connection => {
    await connection.query('BEGIN')
    return fn(connection, ...args)
      .then(async res => {
        await connection.query('COMMIT')
        return res
      })
      .catch(async e => {
        await connection.query('ROLLBACK')
        throw e
      })
      .finally(() => connection.release())
  })

  return T.tryCatch(() => queryP, passError(error))
}

export const getClient = () => pool.connect()
