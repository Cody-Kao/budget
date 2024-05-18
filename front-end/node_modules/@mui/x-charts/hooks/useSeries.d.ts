/**
 * Get access to the internal state of series.
 * Structured by type of series:
 * { seriesType?: { series: { id1: precessedValue, ... }, seriesOrder: [id1, ...] } }
 * @returns FormattedSeries series
 */
export declare function useSeries(): import("../context/SeriesContextProvider").FormattedSeries;
/**
 * Get access to the internal state of pie series.
 * The returned object contains:
 * - series: a mapping from ids to series attributes.
 * - seriesOrder: the array of series ids.
 * @returns { series: Record<SeriesId, DefaultizedPieSeriesType>; seriesOrder: SeriesId[]; } | undefined pieSeries
 */
export declare function usePieSeries(): {
    series: Record<import("../models/seriesType/common").SeriesId, import("..").DefaultizedPieSeriesType>;
    seriesOrder: import("../models/seriesType/common").SeriesId[];
} | undefined;
/**
 * Get access to the internal state of line series.
 * The returned object contains:
 * - series: a mapping from ids to series attributes.
 * - seriesOrder: the array of series ids.
 * @returns { series: Record<SeriesId, DefaultizedLineSeriesType>; seriesOrder: SeriesId[]; } | undefined lineSeries
 */
export declare function useLineSeries(): import("../models/seriesType/config").FormatterResult<"line"> | undefined;
/**
 * Get access to the internal state of bar series.
 * The returned object contains:
 * - series: a mapping from ids to series attributes.
 * - seriesOrder: the array of series ids.
 * @returns { series: Record<SeriesId, DefaultizedBarSeriesType>; seriesOrder: SeriesId[]; } | undefined barSeries
 */
export declare function useBarSeries(): import("../models/seriesType/config").FormatterResult<"bar"> | undefined;
/**
 * Get access to the internal state of scatter series.
 * The returned object contains:
 * - series: a mapping from ids to series attributes.
 * - seriesOrder: the array of series ids.
 * @returns { series: Record<SeriesId, DefaultizedScatterSeriesType>; seriesOrder: SeriesId[]; } | undefined scatterSeries
 */
export declare function useScatterSeries(): {
    series: Record<import("../models/seriesType/common").SeriesId, import("..").DefaultizedScatterSeriesType>;
    seriesOrder: import("../models/seriesType/common").SeriesId[];
} | undefined;
