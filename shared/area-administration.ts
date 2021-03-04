export type AreaAdministration = {
  areaId: string
  areaName: string
  totalFirstDoseShots: number
  totalSecondDoseShots: number
  shotHistory: {
    areaId: string
    date: Date
    firstDoseShots: number
    secondDoseShots: number
  }[]
}

export type Summary = {
  totalFirstDoseShots: number
  totalSecondDoseShots: number
  areas: Array<
    Pick<AreaAdministration, 'areaId' | 'areaName'> & {
      areaFirstDoseShots: number
      areaSecondDoseShots: number
    }
  >
}
