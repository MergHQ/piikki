import React, { useState, useEffect } from 'react'
import * as V from 'victory'
import { Summary } from '../../shared/area-administration'

type Props = {
  summary: Summary
}

const getInitialData = (summary: Summary) => {
  const items = summary.areas.length
  return new Array(items).fill(summary.totalShots / items)
}

export default ({ summary }: Props) => {
  const [pieData, setPieData] = useState<any[]>(getInitialData(summary))

  useEffect(() => {
    setPieData(
      summary.areas.map(({ areaName, areaTotalShots }) => ({
        x: areaName,
        y: areaTotalShots,
        label: `${areaName} ${areaTotalShots}`,
      }))
    )
  }, [])

  return (
    <div className="data-container">
      <h2 className="data-container__title">Vaccinated per area</h2>
      <V.VictoryPie
        containerComponent={
          <V.VictoryContainer
            style={{
              touchAction: 'auto',
            }}
          />
        }
        labelComponent={<V.VictoryTooltip orientation="bottom" />}
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
