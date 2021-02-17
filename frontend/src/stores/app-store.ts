import * as L from 'lonna'
import { AgeGroupAdministration } from '../../../shared/age-group-administration'
import { Summary, AreaAdministration } from '../../../shared/area-administration'
import {
  getAgeGroupAdministrations,
  getAreaAdministrations,
  getSummary,
} from '../service/piikki'
import { FetchStatus } from '../util/fetch-status'

export type AppProps = {
  totalVaccinatees: number
  summary: L.Property<FetchStatus<Summary>>
  areaAdministrations: L.Property<FetchStatus<AreaAdministration[]>>
  ageGroupAdministrations: L.Property<FetchStatus<AgeGroupAdministration[]>>
}

const summaryP = L.fromPromise<Summary, FetchStatus<Summary>>(
  getSummary(),
  () => ({ state: 'loading' }),
  xs => ({ state: 'done', data: xs }),
  err => ({ state: 'error' })
)

const administrationsP = L.fromPromise<
  AreaAdministration[],
  FetchStatus<AreaAdministration[]>
>(
  getAreaAdministrations(),
  () => ({ state: 'loading' }),
  xs => ({ state: 'done', data: xs }),
  err => ({ state: 'error' })
)

const ageGroupAdministrationsP = L.fromPromise<
  AgeGroupAdministration[],
  FetchStatus<AgeGroupAdministration[]>
>(
  getAgeGroupAdministrations(),
  () => ({ state: 'loading' }),
  xs => ({ state: 'done', data: xs }),
  err => ({ state: 'error' })
)

export default () => ({
  areaAdministrations: administrationsP,
  ageGroupAdministrations: ageGroupAdministrationsP,
  summary: summaryP,
  totalVaccinatees: 5584105,
})
