import { h } from 'harmaja'
import { Summary } from '../../../shared/area-administration'
import { ChartData } from 'chart.js'
import chartColors from './chart-colors'
import { Doughnut } from '../util/chart-js-wrapper'
import * as L from 'lonna'
import * as FS from '../util/fetch-status'
import LoadingSpinner from './loading-spinner'

type Props = {
  summary: L.Property<FS.FetchStatus<Summary>>
}

const toChartData = FS.map<Summary, ChartData>(summary => ({
  labels: summary.areas.map(({ areaName }) => areaName),
  datasets: [
    {
      data: summary.areas.map(({ areaTotalShots }) => areaTotalShots),
      backgroundColor: chartColors,
      borderWidth: 0,
    },
  ],
}))

export default ({ summary }: Props) => {
  return (
    <div className="data-container">
      <h2 className="data-container__title">Vaccinated per area</h2>
      {summary.pipe(
        L.map(toChartData),
        L.map(
          FS.fold(
            () => <LoadingSpinner />,
            () => <p>Error loading data.</p>,
            data => <Doughnut data={data} />
          )
        )
      )}
    </div>
  )
}
