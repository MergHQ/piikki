import React, { useState, useEffect } from 'react'
import * as V from 'victory'
import { Summary } from '../../shared/area-administration'

type Props = {
  totalVaccinatees: number
  summary: Summary
}

const initialData = [{ y: 0 }, { y: 5000000 }]

export default ({ summary, totalVaccinatees }: Props) => {
  const [pieData, setPieData] = useState<any[]>(initialData)

  useEffect(() => {
    setPieData([
      {
        x: 'Vaccinated now',
        y: summary.totalShots,
        label: `Vaccinated ${summary.totalShots}`,
      },
      {
        x: 'To be vaccinated',
        y: totalVaccinatees - summary.totalShots,
        label: `Not vaccinated ${totalVaccinatees - summary.totalShots}`,
      },
    ])
  }, [])

  return (
    <div className="data-container">
      <h2 className="data-container__title">Current vaccine situation</h2>
      <V.VictoryPie
        labelComponent={<V.VictoryTooltip width={2} />}
        animate={{
          duration: 0.2,
          easing: 'exp',
        }}
        colorScale="qualitative"
        data={pieData}
        innerRadius={100}
      />
    </div>
  )
}
