import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import PropTypes from 'prop-types';
import { useSlotProps } from '@mui/base/utils';
import { SeriesContext } from '../context/SeriesContextProvider';
import { DefaultChartsItemTooltipContent } from './DefaultChartsItemTooltipContent';
import { CartesianContext } from '../context/CartesianContextProvider';
import colorGetter from '../internals/colorGetter';
import { ZAxisContext } from '../context/ZAxisContextProvider';
import { jsx as _jsx } from "react/jsx-runtime";
function ChartsItemTooltipContent(props) {
  const {
    content,
    itemData,
    sx,
    classes,
    contentProps
  } = props;
  const series = React.useContext(SeriesContext)[itemData.type].series[itemData.seriesId];
  const {
    xAxis,
    yAxis,
    xAxisIds,
    yAxisIds
  } = React.useContext(CartesianContext);
  const {
    zAxis,
    zAxisIds
  } = React.useContext(ZAxisContext);
  const defaultXAxisId = xAxisIds[0];
  const defaultYAxisId = yAxisIds[0];
  const defaultZAxisId = zAxisIds[0];
  let getColor;
  switch (series.type) {
    case 'pie':
      getColor = colorGetter(series);
      break;
    case 'scatter':
      getColor = colorGetter(series, xAxis[series.xAxisKey ?? defaultXAxisId], yAxis[series.yAxisKey ?? defaultYAxisId], zAxis[series.zAxisKey ?? defaultZAxisId]);
      break;
    default:
      getColor = colorGetter(series, xAxis[series.xAxisKey ?? defaultXAxisId], yAxis[series.yAxisKey ?? defaultYAxisId]);
      break;
  }
  const Content = content ?? DefaultChartsItemTooltipContent;
  const chartTooltipContentProps = useSlotProps({
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
  return /*#__PURE__*/_jsx(Content, _extends({}, chartTooltipContentProps));
}
process.env.NODE_ENV !== "production" ? ChartsItemTooltipContent.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  classes: PropTypes.object.isRequired,
  content: PropTypes.elementType,
  contentProps: PropTypes.shape({
    classes: PropTypes.object,
    getColor: PropTypes.func,
    itemData: PropTypes.shape({
      dataIndex: PropTypes.number,
      seriesId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      type: PropTypes.oneOf(['bar', 'line', 'pie', 'scatter']).isRequired
    }),
    series: PropTypes.object,
    sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
  }),
  itemData: PropTypes.shape({
    dataIndex: PropTypes.number,
    seriesId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    type: PropTypes.oneOf(['bar', 'line', 'pie', 'scatter']).isRequired
  }).isRequired,
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
export { ChartsItemTooltipContent };