import * as express from 'express'
import * as T from 'fp-ts/TaskEither'
import { startDataSync } from './sync/data-sync'
import {
  getLocalAgeGroupAdministrations,
  getLocalAreaAdministrations,
  getLocalSummary,
} from './service/local-data-service'
import {
  getAgeGroupAdministrations,
  getAreaAdministrations,
} from './service/thl-data-service'
import * as morgan from 'morgan'
import * as cors from 'cors'
import { doTaskEither } from './errors'
import { createTables } from './db'
import { pipe } from 'fp-ts/lib/function'

const server = express()

server.use(morgan('tiny'))
server.use(cors())

const checkDataSyncToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) =>
  req.get('x-token') === process.env.DATA_SYNC_TOKEN
    ? next()
    : res.status(401).json({ message: 'unauthorized' })

server.get('/administrations/summary', doTaskEither(getLocalSummary))
server.get('/administrations', doTaskEither(getLocalAreaAdministrations))
server.get('/administrations/ageGroups', doTaskEither(getLocalAgeGroupAdministrations))
server.put(
  '/syncData',
  checkDataSyncToken,
  doTaskEither(
    pipe(
      T.sequenceArray([getAreaAdministrations as any, getAgeGroupAdministrations as any]), // really don't know a better way to do this
      T.chain(([areaAdministrations, ageGroupAdministrations]: [any, any]) =>
        startDataSync(areaAdministrations, ageGroupAdministrations)
      )
    ),
    'data sync done'
  )
)

const port = process.env.PORT || 4000

createTables().then(() =>
  server.listen(port, () => console.log('Server listening on', port))
)
