import axios from 'axios'
import { AreaAdministration, Summary } from '../../../shared/area-administration'
import { AgeGroupAdministration } from '../../../shared/age-group-administration'

const client = axios.create({
  baseURL: process.env.REACT_APP_LOCAL_API_URL || 'https://piikki-api.lab.juiciness.io',
})

export const getSummary = (): Promise<Summary | null> =>
  client.get<Summary>('/administrations/summary').then(res => res.data)

export const getAreaAdministrations = () =>
  client.get<AreaAdministration[]>('/administrations').then(res => res.data)

export const getAgeGroupAdministrations = () =>
  client.get<AgeGroupAdministration[]>('/administrations/ageGroups').then(res => res.data)
