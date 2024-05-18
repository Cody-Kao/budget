import * as React from 'react';
import { SvgContext } from '../context/DrawingProvider';
export function useSvgRef() {
  const svgRef = React.useContext(SvgContext);
  if (svgRef === undefined) {
    throw new Error(['MUI X: Could not find the svg ref context.', 'It looks like you rendered your component outside of a ChartsContainer parent component.'].join('\n'));
  }
  return svgRef;
}