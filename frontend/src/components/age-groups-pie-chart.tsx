import { h } from 'harmaja'
import { ChartData } from 'chart.js'
import chartColors from './chart-colors'
import { Doughnut } from '../util/chart-js-wrapper'
import * as L from 'lonna'
import * as FS from '../util/fetch-status'
import LoadingSpinner from './loading-spinner'
import { AgeGroupAdministration } from '../../../shared/age-group-administration'

type Props = {
  ageGroupAdministrations: L.Property<FS.FetchStatus<AgeGroupAdministration[]>>
}

const toChartData = FS.map<AgeGroupAdministration[], ChartData>(
  ageGroupAdministrations => ({
    labels: ageGroupAdministrations.map(({ ageGroupName }) => ageGroupName),
    datasets: [
      {
        data: ageGroupAdministrations.map(({ firstDoseShots }) => firstDoseShots),
        backgroundColor: chartColors,
        borderWidth: 0,
      },
    ],
  })
)

export default ({ ageGroupAdministrations }: Props) => {
  return (
    <div className="data-container">
      <h2 className="data-container__title">Vaccinated per age group</h2>
      <p>Only first dose</p>
      {ageGroupAdministrations.pipe(
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
