import * as L from 'lonna'
import { Summary, AreaAdministration } from '../../../shared/area-administration'
import { getAdministrations, getSummary } from '../service/piikki'
import { FetchStatus } from '../util/fetch-status'

export type AppProps = {
  totalVaccinatees: number
  summary: L.Property<FetchStatus<Summary>>
  administrations: L.Property<FetchStatus<AreaAdministration[]>>
}

const summaryP = L.fromPromise(
  getSummary(),
  () => ({ state: 'loading' }),
  xs => ({ state: 'done', data: xs }),
  err => ({ state: 'error' })
)

const administrationsP = L.fromPromise(
  getAdministrations(),
  () => ({ state: 'loading' }),
  xs => ({ state: 'done', data: xs }),
  err => ({ state: 'error' })
)

export default () => ({
  administrations: administrationsP,
  summary: summaryP,
  totalVaccinatees: 5584105,
})
