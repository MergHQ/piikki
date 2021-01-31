import { h } from 'harmaja'
import * as L from 'lonna'
import { ChartData, Chart, ChartOptions } from 'chart.js'

type Props = {
  data: ChartData
  options?: ChartOptions
}

type ChartComponentProps = Props & {
  type: string
}

const ChartComponent = ({ data, options, type }: ChartComponentProps) => {
  const canvas = L.atom<HTMLCanvasElement | null>(null)

  canvas.onChange(c => {
    const ctx = c.getContext('2d')
    new Chart(ctx, {
      type,
      data,
      options: {
        ...options,
        responsive: true,
      },
    })
  })

  return (
    <div className={`${type}-chart-container`}>
      <canvas ref={ref => canvas.set(ref)} width="800" height="800"></canvas>
    </div>
  )
}

export const Doughnut = (props: Props) => <ChartComponent {...props} type="doughnut" />

export const Bar = (props: Props) => <ChartComponent {...props} type="bar" />
