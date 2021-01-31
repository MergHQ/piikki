import { h } from 'harmaja'
import { Summary } from '../../../shared/area-administration'
import { ChartData } from 'chart.js'
import chartColors from './chartColors'
import { Doughnut } from '../util/chart-js-wrapper'
import * as L from 'lonna'

type Props = {
  summary: L.Property<Summary>
}

const toChartData = (summary: Summary): ChartData => ({
  labels: summary.areas.map(({ areaName }) => areaName),
  datasets: [
    {
      data: summary.areas.map(({ areaTotalShots }) => areaTotalShots),
      backgroundColor: chartColors,
      borderWidth: 0,
    },
  ],
})

export default ({ summary }: Props) => {
  return (
    <div className="data-container">
      <h2 className="data-container__title">Vaccinated per area</h2>
      {summary.pipe(
        L.map(toChartData),
        L.map(data => <Doughnut data={data} />)
      )}
    </div>
  )
}
