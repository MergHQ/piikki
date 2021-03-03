import axios from 'axios'
import { pipe } from 'fp-ts/lib/function'
import * as T from 'fp-ts/TaskEither'
import * as R from 'ramda'
import { passError } from '../errors'
const jsonstat = require('jsonstat-toolkit')

const baseURL = 'https://sampo.thl.fi/pivot/prod/fi/vaccreg/cov19cov/fact_cov19cov.json'

const thlClient = axios.create({
  baseURL,
})

type ThlRequestParams = Array<['row' | 'column', string]>

const toQueryParams = (params: ThlRequestParams): string =>
  `?${params.map(([k, v]) => `${k}=${v}`).join('&')}`

const areaParams: ThlRequestParams = [
  ['row', 'area-518362'],
  ['column', 'dateweek20201226-525461L'],
  ['column', 'cov_vac_dose-533170'],
]

const ageGroupParams: ThlRequestParams = [
  ['row', 'cov_vac_age-518413'],
  ['column', 'dateweek20201226-525425'],
  ['column', 'cov_vac_dose-533170'],
]

type ParsedThlAreaResponseEntry = {
  date: string
  area: string
  shots: number
}

type ParsedThlAgeGroupResponseEntry = {
  ageGroup: string
  week: string
  shots: number
}

export type ShotHistory = Pick<ParsedThlAreaResponseEntry, 'area' | 'date' | 'shots'>

export type ThlAreaAdministrations = {
  area: string
  totalShots: number
  shotHistory: ShotHistory[]
}

export type ThlAgeGroupAdministrations = {
  ageGroupName: string
  shots: number
}

export const parseInvalidTimestamp = (date: string) => {
  const [beginning, end] = R.splitAt(10, date.split('')).map(p => p.join(''))
  return `${beginning}T${end}`
}

const parseAreasResponse: (
  v: ParsedThlAreaResponseEntry[]
) => ThlAreaAdministrations[] = R.pipe(
  (v: ParsedThlAreaResponseEntry[]) => v.filter(a => a.area !== 'Finland'),
  R.groupBy(a => a.area),
  R.mapObjIndexed(list => ({
    area: list[0].area,
    totalShots: R.sum(list.map(i => i.shots)),
    shotHistory: list,
  })),
  R.values,
  R.flatten
)

const parseAgeGroupReponse: (
  input: ParsedThlAgeGroupResponseEntry[]
) => ThlAgeGroupAdministrations[] = R.pipe(
  (input: ParsedThlAgeGroupResponseEntry[]) =>
    input.filter(
      ({ week, ageGroup }) => week !== 'Kaikki ajat' && ageGroup !== 'Kaikki iät'
    ),
  R.groupBy(e => e.ageGroup),
  R.mapObjIndexed(list => ({
    ageGroupName: list[0].ageGroup,
    shots: R.sum(list.map(e => e.shots)),
  })),
  R.values,
  R.flatten
)

const parseJsonstat = (formatFn: (rawRow: any) => any) => (data: unknown) =>
  jsonstat(data).Dataset(0).toTable({ type: 'arrobj' }).map(formatFn)

const doRequest = (params: ThlRequestParams) =>
  T.tryCatch(
    () => thlClient.get(toQueryParams(params)).then(({ data }) => data),
    passError('ThlApiError')
  )

export const getAreaAdministrations = pipe(
  doRequest(areaParams),
  T.map(
    parseJsonstat(({ value, dateweek20201226, area }) => ({
      date: new Date(dateweek20201226).toJSON(),
      area: area === 'Kaikki alueet' ? 'Finland' : area,
      shots: value ? Number(value) : 0,
    }))
  ),
  T.map(parseAreasResponse)
)

export const getAgeGroupAdministrations = pipe(
  doRequest(ageGroupParams),
  T.map(
    parseJsonstat(({ value, cov_vac_age, dateweek20201226 }) => ({
      ageGroup: cov_vac_age === '-19' ? '0-19' : cov_vac_age,
      week: dateweek20201226,
      shots: value ? Number(value) : null,
    }))
  ),
  T.map(parseAgeGroupReponse)
)
