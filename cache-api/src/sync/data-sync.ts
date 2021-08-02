import * as T from 'fp-ts/TaskEither'
import {
  ThlAreaAdministrations,
  ThlAgeGroupAdministrations,
} from '../service/thl-data-service'
import { pipe } from 'fp-ts/lib/function'
import { putObject } from '../service/s3'
import { Summary } from '../../../shared/area-administration'

export type Area = {
  id: string
  areaName: string
  totalFirstDoseShots: number
  totalSecondDoseShots: number
}

export type Administration = {
  id: string
  areaId: string
  date: Date
  firstDoseShots: number
  secondDoseShots: number
}

const summarize = (data: ThlAreaAdministrations[]): Summary => ({
  totalFirstDoseShots: data.reduce((p, c) => p + c.totalFirstDoseShots, 0),
  totalSecondDoseShots: data.reduce((p, c) => p + c.totalSecondDoseShots, 0),
  areas: data.map(({ areaName, totalFirstDoseShots, totalSecondDoseShots }) => ({
    areaName,
    areaFirstDoseShots: totalFirstDoseShots,
    areaSecondDoseShots: totalSecondDoseShots,
  })),
})

export const startDataSync = (
  areaAdministrations: ThlAreaAdministrations[],
  ageGroupAdministrations: ThlAgeGroupAdministrations[]
) =>
  pipe(
    T.of([areaAdministrations, ageGroupAdministrations, summarize(areaAdministrations)]),
    T.map(data => data.map(object => JSON.stringify(object))),
    T.chain(([areaJson, ageJson, summary]) =>
      T.sequenceArray([
        putObject('administrations/areas', areaJson),
        putObject('administrations/ageGroups', ageJson),
        putObject('administrations/summary', summary),
      ])
    )
  )
