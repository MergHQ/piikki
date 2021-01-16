import * as express from 'express'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/TaskEither'
import { startDataSync } from './sync/data-sync'
import { pipe } from 'fp-ts/lib/function'
import { getLocalAdministrations, getLocalSummary } from './service/local-data-service'
import { getAdministrations } from './service/hs-api-service'
import * as morgan from 'morgan'
import * as cors from 'cors'
import { doTaskEither } from './errors'

const server = express()

server.use(morgan('common'))
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
server.get('/administrations', doTaskEither(getLocalAdministrations))
server.put('/syncData', checkDataSyncToken, (_, res) =>
  doTaskEither(T.chain(startDataSync)(getAdministrations))
)

const port = process.env.PORT || 4000

server.listen(port, () => console.log('Server listening on', port))
