import * as T from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { startDataSync } from './sync/data-sync'
import {
  getAgeGroupAdministrations,
  getAreaAdministrations,
} from './service/thl-data-service'
import { pipe } from 'fp-ts/lib/function'
import { logError } from './errors'

export const handler = () => {
  const pipeline = pipe(
    T.sequenceArray([getAreaAdministrations as any, getAgeGroupAdministrations as any]), // really don't know a better way to do this
    T.chain(([areaAdministrations, ageGroupAdministrations]: [any, any]) =>
      startDataSync(areaAdministrations, ageGroupAdministrations)
    )
  )

  return pipeline().then(E.fold(logError, () => console.log('Job done!')))
}
