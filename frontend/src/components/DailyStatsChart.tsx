import { h } from 'harmaja'
import { AreaAdministration } from '../../../shared/area-administration'
import { ChartData } from 'chart.js'
import { getWithIdx } from './chartColors'
import { startOfDay, format, startOfWeek, sub, add, isSameWeek, isAfter } from 'date-fns'
import * as R from 'ramda'
import { Bar } from '../util/chart-js-wrapper'
import * as L from 'lonna'
import './week-selector.css'

type Props = {
  administrations: L.Property<AreaAdministration[]>
}

type Combined = {
  administrations: AreaAdministration[]
  selectedWeek: Date
}

const options = {
  scales: {
    yAxes: [
      {
        stacked: true,
        ticks: {
          beginAtZero: true,
        },
      },
    ],
    xAxes: [
      {
        stacked: true,
      },
    ],
  },
}

const toChartData = (administrations: AreaAdministration[]): ChartData => {
  const labels = R.pipe(
    (x0: AreaAdministration[]) => x0.flatMap(({ shotHistory }) => shotHistory),
    R.map(({ date }) => format(startOfDay(new Date(date)), 'd.M.yyyy')),
    R.uniq
  )

  return {
    labels: labels(administrations),
    datasets: administrations.map(({ shotHistory, areaName }, i) => ({
      label: areaName,
      data: shotHistory.map(({ shots }) => shots),
      backgroundColor: getWithIdx(i),
      borderWidth: 0,
    })),
  }
}

const applyWeekFilter = ({
  administrations,
  selectedWeek,
}: Combined): AreaAdministration[] =>
  administrations.map(({ shotHistory, ...rest }) => ({
    ...rest,
    shotHistory: shotHistory.filter(({ date }) =>
      isSameWeek(selectedWeek, new Date(date))
    ),
  }))

const isWeekDisabled = (d: Date) => isAfter(d, startOfWeek(new Date()))

const selectedWeek = L.atom(startOfWeek(new Date()))
const disableNextWeek = selectedWeek.pipe(
  L.map<Date, boolean>(d => isWeekDisabled(add(d, { weeks: 1 })))
)

const handleWeekChange = (op: 'add' | 'sub') => (_: unknown) => {
  switch (op) {
    case 'add':
      const selected = selectedWeek.get()
      const nextWeek = add(selected, { weeks: 1 })
      if (!isWeekDisabled(nextWeek)) {
        selectedWeek.set(nextWeek)
      }
      break
    case 'sub':
      selectedWeek.modify(d => sub(d, { weeks: 1 }))
      break
    default:
      console.warn('Unkown op', op)
  }
}

const WeekSelector = () => (
  <div className="week-selector-controls">
    <button className="week-selector__button" onClick={handleWeekChange('sub')}>
      ᐊ
    </button>
    <p>{L.view(selectedWeek, ts => `Week ${format(ts, 'w yyyy')}`)}</p>
    {L.view(disableNextWeek, disabled => (
      <button
        className="week-selector__button"
        disabled={disabled}
        onClick={handleWeekChange('add')}
      >
        ᐅ
      </button>
    ))}
  </div>
)

export default ({ administrations }: Props) => (
  <div className="data-container">
    <h2 className="data-container__title">Daily vaccinations administered per area</h2>
    <WeekSelector />
    {L.combineTemplate({
      administrations,
      selectedWeek,
    }).pipe(
      L.map<Combined, AreaAdministration[]>(applyWeekFilter),
      L.map(toChartData),
      L.map(data => <Bar data={data} options={options} />)
    )}
  </div>
)
