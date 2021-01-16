import axios from 'axios'
import { AreaAdministration } from '../shared/area-administration'
import { format } from 'date-fns'

const tg = axios.create({
  baseURL: `https://api.telegram.org/bot${process.env.BOT_TOKEN}`,
})

const piikki = axios.create({
  baseURL: 'https://piikki-api.lab.juiciness.io',
})

const parseResponse = (
  admstr: AreaAdministration[]
): { date: string; shots: number } => ({
  // Clean this shit up
  date: format(
    admstr
      .flatMap(a => a.shotHistory)
      .sort((i1, i2) => new Date(i2.date).getTime() - new Date(i1.date).getTime())
      .map(({ date }) => new Date(date))[0],
    'd.M.yyyy'
  ),
  shots: admstr.flatMap(a => a.shotHistory).reduce((p, c) => p + c.shots, 0),
})

piikki
  .get<AreaAdministration[]>('/administrations')
  .then(res => res.data)
  .then(parseResponse)
  .then(({ date, shots }) =>
    tg.post('/sendMessage', {
      chat_id: process.env.CHANNEL_ID,
      text: `(päivitetty ${date}) tiedon mukaan tällä hetkellä on rokotettu *${shots}* ${
        shots > 0 ? 'henkilöä' : 'henkilö'
      }`,
      parse_mode: 'Markdown',
    })
  )
