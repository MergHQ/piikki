import React from 'react'
import { Summary } from '../../shared/area-administration'
import AdministrationPieChart from '../components/AdministrationPieChart'
import AreasPieChart from '../components/AreasPieChart'
import Footer from '../components/Footer'
import { getSummary } from '../service/piikki'

type AppProps = {
  totalVaccinatees: number
  summary: Summary
}

export default ({ summary, totalVaccinatees }: AppProps) => (
  <>
    <div className="container">
      <h1>COVID-19 vaccinations in 🇫🇮</h1>
      <AdministrationPieChart summary={summary} totalVaccinatees={totalVaccinatees} />
      <AreasPieChart summary={summary} />
    </div>
    <Footer></Footer>
  </>
)

export const getServerSideProps = async () => ({
  props: {
    totalVaccinatees: 5000000,
    summary: await getSummary(),
  } as AppProps,
})
