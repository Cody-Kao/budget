import { DefaultizedBarSeriesType, DefaultizedLineSeriesType, DefaultizedPieSeriesType, DefaultizedScatterSeriesType } from '../models';
import { AxisDefaultized } from '../models/axis';
import { ZAxisDefaultized } from '../models/z-axis';
declare function getColor(series: DefaultizedPieSeriesType): (dataIndex: number) => string;
declare function getColor(series: DefaultizedBarSeriesType | DefaultizedLineSeriesType, xAxis: AxisDefaultized, yAxis: AxisDefaultized): (dataIndex: number) => string;
declare function getColor(series: DefaultizedScatterSeriesType, xAxis: AxisDefaultized, yAxis: AxisDefaultized, zAxis?: ZAxisDefaultized): (dataIndex: number) => string;
export default getColor;
