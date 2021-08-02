export type ShotEntry = {
  areaId: string
  date: Date
  firstDoseShots: number
  secondDoseShots: number
}

export type AreaAdministration = {
  areaId: string
  areaName: string
  totalFirstDoseShots: number
  totalSecondDoseShots: number
  shotHistory: ShotEntry[]
}

export type Summary = {
  totalFirstDoseShots: number
  totalSecondDoseShots: number
  areas: Array<
    Pick<AreaAdministration, 'areaName'> & {
      areaFirstDoseShots: number
      areaSecondDoseShots: number
    }
  >
}
