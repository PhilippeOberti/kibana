/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { getStopsWithColorsFromRanges } from '@kbn/visualizations-plugin/common/utils';
import { getVisSchemas, SchemaConfig, VisToExpressionAst } from '@kbn/visualizations-plugin/public';
import { buildExpression, buildExpressionFunction } from '@kbn/expressions-plugin/public';
import {
  GaugeArguments,
  GaugeExpressionFunctionDefinition,
  GaugeShape,
  GaugeShapes,
} from '@kbn/expression-gauge-plugin/common';
import { Gauge, GaugeType, GaugeVisParams } from './types';

const gaugeTypeToShape = (type: GaugeType): GaugeShape => {
  return {
    [GaugeType.Arc]: GaugeShapes.ARC,
    [GaugeType.Circle]: GaugeShapes.CIRCLE,
  }[type];
};

const prepareDimension = (params: SchemaConfig) => {
  const visdimension = buildExpressionFunction('visdimension', { accessor: params.accessor });

  if (params.format) {
    visdimension.addArgument('format', params.format.id);
    visdimension.addArgument('formatParams', JSON.stringify(params.format.params));
  }

  return buildExpression([visdimension]);
};

export const getDefaultGaugeArgsFromParams = ({
  gaugeType,
  percentageMode,
  scale,
  style,
  labels,
}: Gauge): GaugeArguments => {
  const labelMajorMode = labels.show ? (style.subText ? 'custom' : 'auto') : 'none';

  return {
    shape: gaugeTypeToShape(gaugeType),
    ticksPosition: scale.show ? 'auto' : 'hidden',
    colorMode: 'palette',
    labelMajorMode,
    ...(labelMajorMode === 'custom' ? { labelMinor: style.subText } : {}),
    percentageMode,
  };
};

export const toExpressionAst: VisToExpressionAst<GaugeVisParams> = (vis, params) => {
  const schemas = getVisSchemas(vis, params);

  const { percentageMode, percentageFormatPattern, colorSchema, colorsRange, invertColors } =
    vis.params.gauge;

  // fix formatter for percentage mode
  if (percentageMode === true) {
    schemas.metric.forEach((metric: SchemaConfig) => {
      metric.format = {
        id: 'percent',
        params: { pattern: percentageFormatPattern },
      };
    });
  }

  const gauge = buildExpressionFunction<GaugeExpressionFunctionDefinition>('gauge', {
    ...getDefaultGaugeArgsFromParams(vis.params.gauge),
    metric: schemas.metric.map(prepareDimension),
    labelMajor: schemas.metric?.[0]?.label,
    percentageMode,
    respectRanges: true,
    commonLabel: schemas.metric.length > 1 ? schemas.metric?.[0]?.label : undefined,
  });

  if (colorsRange && colorsRange.length) {
    const stopsWithColors = getStopsWithColorsFromRanges(colorsRange, colorSchema, invertColors);
    const palette = buildExpressionFunction('palette', {
      ...stopsWithColors,
      range: percentageMode ? 'percent' : 'number',
      continuity: 'none',
      gradient: true,
      rangeMax: percentageMode ? 100 : stopsWithColors.stop[stopsWithColors.stop.length - 1],
      rangeMin: stopsWithColors.stop[0],
    });

    gauge.addArgument('palette', buildExpression([palette]));
  }

  const ast = buildExpression([gauge]);

  return ast.toAst();
};
