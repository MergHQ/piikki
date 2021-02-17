const colors = [
  '#a50026',
  '#d73027',
  '#f46d43',
  '#fdae61',
  '#fee090',
  '#ffffbf',
  '#e0f3f8',
  '#abd9e9',
  '#74add1',
  '#4575b4',
  '#313695',
  '#66c2a5',
  '#fc8d62',
  '#8da0cb',
  '#e78ac3',
  '#a6d854',
  '#ffd92f',
  '#e5c494',
  '#b3b3b3',
  '#eff3ff',
  '#bdd7e7',
  '#6baed6',
  '#3182bd',
  '#08519c',
]
export default colors

export const getWithIdx = (idx: number) => colors[idx % colors.length]
