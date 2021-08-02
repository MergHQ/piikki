import axios from 'axios'
import { pipe } from 'fp-ts/lib/function'
import * as T from 'fp-ts/TaskEither'
import * as R from 'ramda'
import { passError } from '../errors'
const jsonstat = require('jsonstat-toolkit')

const baseURL = 'https://sampo.thl.fi/pivot/prod/en/vaccreg/cov19cov/fact_cov19cov.json'

const thlClient = axios.create({
  baseURL,
})

type ThlRequestParams = Array<['row' | 'column', string]>

const toQueryParams = (params: ThlRequestParams): string =>
  `?${params.map(([k, v]) => `${k}=${v}`).join('&')}`

const areaParams = (dose: 1 | 2): ThlRequestParams => [
  ['row', 'area-518362'],
  ['column', 'dateweek20201226-525461L'],
  ['column', dose === 1 ? 'cov_vac_dose-533170' : 'cov_vac_dose-533164'],
]

const ageGroupParams = (dose: 1 | 2): ThlRequestParams => [
  ['row', 'cov_vac_age-518413'],
  ['column', 'dateweek20201226-525425'],
  ['column', dose === 1 ? 'cov_vac_dose-533170' : 'cov_vac_dose-533164'],
]

type ParsedThlAreaResponseEntry = {
  date: string
  area: string
  dose: 1 | 2
  shots: number
}

type ParsedThlAgeGroupResponseEntry = {
  ageGroup: string
  week: string
  dose: 1 | 2
  shots: number
}

export type ShotHistory = Pick<ParsedThlAreaResponseEntry, 'date'> & {
  firstDoseShots: number
  secondDoseShots: number
}

export type ThlAreaAdministrations = {
  areaName: string
  totalFirstDoseShots: number
  totalSecondDoseShots: number
  shotHistory: ShotHistory[]
}

export type ThlAgeGroupAdministrations = {
  ageGroupName: string
  firstDoseShots: number
  secondDoseShots: number
}

const parseAreasResponse: (v: ParsedThlAreaResponseEntry[]) => ThlAreaAdministrations[] =
  R.pipe(
    (v: ParsedThlAreaResponseEntry[]) => v.filter(a => a.area !== 'Finland'),
    R.groupBy(a => a.area),
    R.mapObjIndexed(list => {
      const grpByDose = R.groupBy(e => String(e.dose), list)
      const [dose1, dose2] = R.values(grpByDose)
      return {
        areaName: list[0].area,
        totalFirstDoseShots: R.sum(dose1.map(i => i.shots)),
        totalSecondDoseShots: R.sum(dose2.map(i => i.shots)),
        shotHistory: R.zipWith(
          (d1, d2) => ({
            area: d1.area,
            date: d1.date,
            firstDoseShots: d1.shots,
            secondDoseShots: d2.shots,
          }),
          dose1,
          dose2
        ),
      }
    }),
    R.values,
    R.flatten
  )

const parseAgeGroupReponse: (
  input: ParsedThlAgeGroupResponseEntry[]
) => ThlAgeGroupAdministrations[] = R.pipe(
  (input: ParsedThlAgeGroupResponseEntry[]) =>
    input.filter(({ week, ageGroup }) => week !== 'All times' && ageGroup !== 'All ages'),
  R.groupBy(e => e.ageGroup),
  R.mapObjIndexed(list => {
    const grpByDose = R.groupBy(e => String(e.dose), list)
    const [dose1, dose2] = R.values(grpByDose)
    return {
      ageGroupName: list[0].ageGroup,
      firstDoseShots: R.sum(dose1.map(e => e.shots)),
      secondDoseShots: R.sum(dose2.map(e => e.shots)),
    }
  }),
  R.values,
  R.flatten
)

const parseJsonstat = (formatFn: (rawRow: any) => any) => (data: unknown) =>
  jsonstat(data).Dataset(0).toTable({ type: 'arrobj' }).map(formatFn)

const doRequests = (params: ThlRequestParams[]) =>
  T.tryCatch(
    () =>
      Promise.all(
        params.map(param => thlClient.get(toQueryParams(param)).then(({ data }) => data))
      ).then(res => res.flatMap(data => data)),
    passError('ThlApiError')
  )

const fetchAreaAdministrations = pipe(
  doRequests([areaParams(1), areaParams(2)]),
  T.map((responses: any[]) =>
    responses.flatMap(
      parseJsonstat(({ value, dateweek20201226, area, cov_vac_dose }) => ({
        date: new Date(dateweek20201226).toJSON(),
        area: area === 'All areas' ? 'Finland' : area,
        dose: cov_vac_dose === 'First dose' ? 1 : 2,
        shots: value ? Number(value) : 0,
      }))
    )
  )
)

const fetchAgeGroupAdministrations = pipe(
  doRequests([ageGroupParams(1), ageGroupParams(2)]),
  T.map((responses: any[]) =>
    responses.flatMap(
      parseJsonstat(({ value, cov_vac_age, dateweek20201226, cov_vac_dose }) => ({
        ageGroup: cov_vac_age === '-19' ? '0-19' : cov_vac_age,
        week: dateweek20201226,
        dose: cov_vac_dose === 'First dose' ? 1 : 2,
        shots: value ? Number(value) : null,
      }))
    )
  )
)

export const getAreaAdministrations = pipe(
  fetchAreaAdministrations,
  T.map(parseAreasResponse)
)

export const getAgeGroupAdministrations = pipe(
  fetchAgeGroupAdministrations,
  T.map(parseAgeGroupReponse)
)
