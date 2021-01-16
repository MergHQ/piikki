import { Request, Response } from 'express'
import { TaskEither } from 'fp-ts/TaskEither'
import { fold } from 'fp-ts/Either'
import { pipe } from 'fp-ts/lib/function'
import { map, fromNullable, getOrElse } from 'fp-ts/Option'

export type ErrorName = 'DbError' | 'DataSyncError' | 'HsApiError'

type PiikkiError = {
  errorName: ErrorName
  message: string
  status: number
}

const errors: PiikkiError[] = [
  {
    errorName: 'DbError',
    message: 'Database error',
    status: 500,
  },
  {
    errorName: 'DataSyncError',
    message: 'Error syncing data',
    status: 500,
  },
  {
    errorName: 'HsApiError',
    message: 'Error fetching data from HS api',
    status: 500,
  },
]

export const passError = (name: ErrorName) => (e: Error): ErrorName => {
  console.error(e)
  return name
}

export const doTaskEither = <T>(task: TaskEither<ErrorName, T>) => (
  _: Request,
  res: Response
): void => {
  task().then(
    fold(
      eName =>
        pipe(
          fromNullable(errors.find(({ errorName }) => eName === errorName)),
          map(({ message, status }) => ({ message, status })),
          getOrElse(() => ({ message: 'Internal server error', status: 500 })),
          ({ status, message }) => {
            res.status(status).json({ message })
          }
        ),
      successfulResult => res.json(successfulResult)
    )
  )
}
