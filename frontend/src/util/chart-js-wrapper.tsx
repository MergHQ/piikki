import { h } from 'harmaja'
import * as L from 'lonna'
import { ChartData, Chart, ChartOptions } from 'chart.js'

type Props = {
  data: ChartData
  useDesktopSize?: boolean
  options?: ChartOptions
}

type ChartComponentProps = Props & {
  type: string
}

const isMobileView = (useDesktopSize?: boolean) =>
  window.innerWidth - 2 < 600 && !useDesktopSize

const ChartComponent = ({ data, options, type, useDesktopSize }: ChartComponentProps) => {
  const canvas = L.atom<HTMLCanvasElement | null>(null)
  const isMobile = L.fromEvent(window, 'resize').pipe(
    L.map(() => isMobileView(useDesktopSize)),
    L.toStatelessProperty(() => isMobileView(useDesktopSize))
  )
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
      {L.view(isMobile, mobile => (
        <canvas
          ref={ref => canvas.set(ref)}
          width="800"
          height={mobile ? 2000 : 1000}
        ></canvas>
      ))}
    </div>
  )
}

export const Doughnut = (props: Props) => <ChartComponent {...props} type="doughnut" />

export const Bar = (props: Props) => <ChartComponent {...props} type="bar" />

export const HorizontalBar = (props: Props) => (
  <ChartComponent {...props} type="horizontalBar" />
)
