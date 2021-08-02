import { findFirst } from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'

export type ErrorName = 'DbError' | 'DataSyncError' | 'ThlApiError' | 'S3PutError'

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
    errorName: 'ThlApiError',
    message: 'Error fetching data from THL api',
    status: 500,
  },
  {
    errorName: 'S3PutError',
    message: 'Unable to put object to S3',
    status: 500,
  },
]

export const passError =
  (name: ErrorName) =>
  (e: Error): ErrorName => {
    console.error(e)
    return name
  }

export const logError = (err: ErrorName) =>
  pipe(
    errors,
    findFirst(e => e.errorName === err),
    O.fold(
      () => console.error('Uknown error happened'),
      err => console.error(`[${err.errorName}] ${err.message}`)
    )
  )
