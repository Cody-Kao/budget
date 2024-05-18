import getBarColor from '../BarChart/getColor';
import getLineColor from '../LineChart/getColor';
import getScatterColor from '../ScatterChart/getColor';
import getPieColor from '../PieChart/getColor';
function getColor(series, xAxis, yAxis, zAxis) {
  if (xAxis !== undefined && yAxis !== undefined) {
    if (series.type === 'bar') {
      return getBarColor(series, xAxis, yAxis);
    }
    if (series.type === 'line') {
      return getLineColor(series, xAxis, yAxis);
    }
    if (series.type === 'scatter') {
      return getScatterColor(series, xAxis, yAxis, zAxis);
    }
  }
  if (series.type === 'pie') {
    return getPieColor(series);
  }
  throw Error(`MUI X Charts: getColor called with unexpected arguments for series with id "${series.id}"`);
}
export default getColor;