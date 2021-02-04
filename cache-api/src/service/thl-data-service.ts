import axios from 'axios'
import { pipe } from 'fp-ts/lib/function'
import * as T from 'fp-ts/TaskEither'
import * as R from 'ramda'
import { passError } from '../errors'
import hcdMap from '../util/hcd-map'
const jsonstat = require('jsonstat-toolkit')

const baseURL =
  'https://sampo.thl.fi/pivot/prod/fi/vaccreg/cov19cov/fact_cov19cov.json?row=area-518362&column=dateweek20201226-525461L'

const thlClient = axios.create({
  baseURL,
})

type ParsedThlResponseEntry = {
  date: string
  area: string
  shots: number
}

export type ShotHistory = Pick<ParsedThlResponseEntry, 'area' | 'date' | 'shots'>

export type ThlAreaAdministrations = {
  area: string
  totalShots: number
  shotHistory: ShotHistory[]
}

export const parseInvalidTimestamp = (date: string) => {
  const [beginning, end] = R.splitAt(10, date.split('')).map(p => p.join(''))
  return `${beginning}T${end}`
}

const parseResponse: (v: ParsedThlResponseEntry[]) => ThlAreaAdministrations[] = R.pipe(
  (v: ParsedThlResponseEntry[]) => v.filter(a => a.area !== 'Finland'),
  R.groupBy(a => a.area),
  R.mapObjIndexed(list => ({
    area: list[0].area,
    totalShots: R.sum(list.map(i => i.shots)),
    shotHistory: list,
  })),
  R.values,
  R.flatten
)

const parseJsonstat = (data: unknown) =>
  jsonstat(data)
    .Dataset(0)
    .toTable({ type: 'arrobj' })
    .map(({ value, dateweek20201226, area }) => ({
      date: new Date(dateweek20201226).toJSON(),
      area: area === 'Kaikki alueet' ? 'Finland' : area,
      shots: value ? Number(value) : 0,
    }))

const doRequest = () =>
  T.tryCatch(() => thlClient.get('').then(({ data }) => data), passError('HsApiError'))

export const getAdministrations = pipe(
  doRequest(),
  T.map(parseJsonstat),
  T.map(parseResponse)
)
