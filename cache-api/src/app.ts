import * as express from 'express'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/TaskEither'
import { startDataSync } from './sync/data-sync'
import { pipe } from 'fp-ts/lib/function'
import { getLocalAdministrations, getLocalSummary } from './service/local-data-service'
import { getAdministrations } from './service/hs-api-service'

const server = express()

const checkDataSyncToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) =>
  req.get('x-token') === process.env.DATA_SYNC_TOKEN
    ? next()
    : res.status(401).json({ message: 'unauthorized' })

server.get('/administrations/summary', (_, res) =>
  getLocalSummary().then(
    E.fold(
      error => res.status(500).json({ message: error }),
      summary => res.json(summary)
    )
  )
)

server.get('/administrations', (_, res) =>
  getLocalAdministrations().then(
    E.fold(
      error => res.status(500).json({ message: error }),
      admstr => res.json(admstr)
    )
  )
)

server.put('/syncData', checkDataSyncToken, (_, res) =>
  pipe(
    getAdministrations,
    T.chain(admstr => startDataSync(admstr)),
    task =>
      task().then(
        E.fold(
          error => res.status(500).json({ message: error }),
          () => res.json({ message: 'data sync done' })
        )
      )
  )
)

const port = process.env.PORT || 4000

server.listen(port, () => console.log('Server listening on', port))
