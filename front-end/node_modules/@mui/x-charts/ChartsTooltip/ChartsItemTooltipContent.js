"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChartsItemTooltipContent = ChartsItemTooltipContent;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _utils = require("@mui/base/utils");
var _SeriesContextProvider = require("../context/SeriesContextProvider");
var _DefaultChartsItemTooltipContent = require("./DefaultChartsItemTooltipContent");
var _CartesianContextProvider = require("../context/CartesianContextProvider");
var _colorGetter = _interopRequireDefault(require("../internals/colorGetter"));
var _ZAxisContextProvider = require("../context/ZAxisContextProvider");
var _jsxRuntime = require("react/jsx-runtime");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function ChartsItemTooltipContent(props) {
  const {
    content,
    itemData,
    sx,
    classes,
    contentProps
  } = props;
  const series = React.useContext(_SeriesContextProvider.SeriesContext)[itemData.type].series[itemData.seriesId];
  const {
    xAxis,
    yAxis,
    xAxisIds,
    yAxisIds
  } = React.useContext(_CartesianContextProvider.CartesianContext);
  const {
    zAxis,
    zAxisIds
  } = React.useContext(_ZAxisContextProvider.ZAxisContext);
  const defaultXAxisId = xAxisIds[0];
  const defaultYAxisId = yAxisIds[0];
  const defaultZAxisId = zAxisIds[0];
  let getColor;
  switch (series.type) {
    case 'pie':
      getColor = (0, _colorGetter.default)(series);
      break;
    case 'scatter':
      getColor = (0, _colorGetter.default)(series, xAxis[series.xAxisKey ?? defaultXAxisId], yAxis[series.yAxisKey ?? defaultYAxisId], zAxis[series.zAxisKey ?? defaultZAxisId]);
      break;
    default:
      getColor = (0, _colorGetter.default)(series, xAxis[series.xAxisKey ?? defaultXAxisId], yAxis[series.yAxisKey ?? defaultYAxisId]);
      break;
  }
  const Content = content ?? _DefaultChartsItemTooltipContent.DefaultChartsItemTooltipContent;
  const chartTooltipContentProps = (0, _utils.useSlotProps)({
    elementType: Content,
    externalSlotProps: contentProps,
    additionalProps: {
      itemData,
      series,
      sx,
      classes,
      getColor
    },
    ownerState: {}
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Content, (0, _extends2.default)({}, chartTooltipContentProps));
}
process.env.NODE_ENV !== "production" ? ChartsItemTooltipContent.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  classes: _propTypes.default.object.isRequired,
  content: _propTypes.default.elementType,
  contentProps: _propTypes.default.shape({
    classes: _propTypes.default.object,
    getColor: _propTypes.default.func,
    itemData: _propTypes.default.shape({
      dataIndex: _propTypes.default.number,
      seriesId: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]).isRequired,
      type: _propTypes.default.oneOf(['bar', 'line', 'pie', 'scatter']).isRequired
    }),
    series: _propTypes.default.object,
    sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
  }),
  itemData: _propTypes.default.shape({
    dataIndex: _propTypes.default.number,
    seriesId: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]).isRequired,
    type: _propTypes.default.oneOf(['bar', 'line', 'pie', 'scatter']).isRequired
  }).isRequired,
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;