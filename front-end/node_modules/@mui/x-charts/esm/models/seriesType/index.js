export * from './line';
export * from './bar';
export * from './scatter';
export * from './pie';
export function isDefaultizedBarSeries(series) {
  return series.type === 'bar';
}
export function isBarSeries(series) {
  return series.type === 'bar';
}