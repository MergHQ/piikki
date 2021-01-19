import React from 'react'
import { AreaAdministration, Summary } from '../../shared/area-administration'
import AdministrationPieChart from '../components/CountryPieChart'
import AreasPieChart from '../components/AreasPieChart'
import Footer from '../components/Footer'
import { getAdministrations, getSummary } from '../service/piikki'
import DailyStatsChart from '../components/DailyStatsChart'
import Head from 'next/head'


type AppProps = {
  totalVaccinatees: number
  summary: Summary
  administrations: AreaAdministration[]
}

const head =
  <Head>
    <title>COVID-19 vaccination status in Finland</title>
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="description" content="View charts of the current COVID-19 vaccination status in Finland."/>
    <meta property="og:title" content="COVID-19 vaccination status in Finland" />
    <meta property="og:description" content="View charts of the current COVID-19 vaccination status in Finland." />
    <meta property="og:type" content="website" />
  </Head>

export default ({ summary, totalVaccinatees, administrations }: AppProps) => (
  <>
    {head}
    <div className="container">
      <h1>COVID-19 vaccinations in 🇫🇮</h1>
      <AdministrationPieChart summary={summary} totalVaccinatees={totalVaccinatees} />
      <AreasPieChart summary={summary} />
      <DailyStatsChart administrations={administrations} />
    </div>
    <Footer></Footer>
  </>
)

export const getServerSideProps = async () =>
  Promise.all([getSummary(), getAdministrations()]).then(
    ([summary, administrations]) => ({
      props: {
        totalVaccinatees: 3500000,
        summary,
        administrations,
      } as AppProps,
    })
  )
