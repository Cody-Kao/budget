"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _getColor = _interopRequireDefault(require("../BarChart/getColor"));
var _getColor2 = _interopRequireDefault(require("../LineChart/getColor"));
var _getColor3 = _interopRequireDefault(require("../ScatterChart/getColor"));
var _getColor4 = _interopRequireDefault(require("../PieChart/getColor"));
function getColor(series, xAxis, yAxis, zAxis) {
  if (xAxis !== undefined && yAxis !== undefined) {
    if (series.type === 'bar') {
      return (0, _getColor.default)(series, xAxis, yAxis);
    }
    if (series.type === 'line') {
      return (0, _getColor2.default)(series, xAxis, yAxis);
    }
    if (series.type === 'scatter') {
      return (0, _getColor3.default)(series, xAxis, yAxis, zAxis);
    }
  }
  if (series.type === 'pie') {
    return (0, _getColor4.default)(series);
  }
  throw Error(`MUI X Charts: getColor called with unexpected arguments for series with id "${series.id}"`);
}
var _default = exports.default = getColor;