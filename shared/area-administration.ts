export type AreaAdministration = {
  areaId: string
  areaName: string
  totalShots: number
  shotHistory: {
    areaId: string
    date: Date
    shots: number
  }[]
}

export type Summary = {
  totalShots: number
  areas: Array<
    Pick<AreaAdministration, 'areaId' | 'areaName'> & { areaTotalShots: number }
  >
}
