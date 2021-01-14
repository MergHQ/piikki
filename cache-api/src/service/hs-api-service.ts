import axios from 'axios'
import { pipe } from 'fp-ts/lib/function'
import * as T from 'fp-ts/TaskEither'
import * as R from 'ramda'
import * as O from 'fp-ts/Option'
import { lookup } from 'fp-ts/lib/Array'

const baseURL = 'https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod'

const hsClient = axios.create({
  baseURL,
})

type HsApiResponseItem = {
  date: string
  area: string
  shots: number
}

export type ShotHistory = Pick<HsApiResponseItem, 'area' | 'date' | 'shots'>

export type HsAreaAdministrations = {
  area: string
  totalShots: number
  shotHistory: ShotHistory[]
}

const parseResponse = R.pipe(
  (v: HsApiResponseItem[]) => v.filter(a => a.area !== 'Finland'),
  R.groupBy(a => a.area),
  R.mapObjIndexed(list => {
    const shotHistory = list.map((item, idx, l) => ({
      date: item.date,
      area: item.area,
      shots:
        item.shots -
        pipe(
          lookup(idx - 1, l),
          O.map(({ shots }) => shots),
          O.getOrElse(() => 0)
        ),
    }))

    return {
      area: list[0].area,
      totalShots: R.sum(shotHistory.map(i => i.shots)),
      shotHistory,
    } as HsAreaAdministrations
  }),
  R.values,
  R.flatten
)

const doRequest = () =>
  T.tryCatch(
    () =>
      hsClient
        .get('/finnishVaccinationData')
        .then(({ data }) => data as HsApiResponseItem[]),
    () => 'Cannot fetch data from HS servers'
  )

export const getAdministrations = pipe(doRequest(), T.map(parseResponse))
