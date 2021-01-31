import * as L from 'lonna'
import { Summary, AreaAdministration } from '../../../shared/area-administration'
import { getAdministrations, getSummary } from '../service/piikki'

export type AppProps = {
  totalVaccinatees: number
  summary: L.Property<Summary>
  administrations: L.Property<AreaAdministration[]>
}

const emptySummary = {
  areas: [],
  totalShots: 0,
}

const summaryP = L.fromPromise(
  getSummary(),
  () => emptySummary,
  xs => xs,
  err => emptySummary
)

const administrationsP = L.fromPromise(
  getAdministrations(),
  () => [],
  xs => xs,
  err => []
)

export default () => ({
  administrations: administrationsP,
  summary: summaryP,
  totalVaccinatees: 5584105,
})
