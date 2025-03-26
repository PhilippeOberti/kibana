/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import type { Alert } from '@kbn/alerting-types';
import { isEmpty } from 'lodash/fp';
import type { JsonValue } from '@kbn/utility-types';
import { getOrEmptyTagFromValue } from '../../../../common/components/empty_value';

export interface CellValueProps {
  /**
   * Alert data passed from the renderCellValue callback via the AlertWithLegacyFormats interface
   */
  alert: Alert;
  /**
   * Column id passed from the renderCellValue callback via EuiDataGridProps['renderCellValue'] interface
   */
  columnId: string;
}

/**
 *
 */
export const CellValue = memo(({ alert, columnId }: CellValueProps) => {
  const displayValue: string | null = useMemo(() => {
    const cellValues: string | JsonValue[] = alert[columnId];

    if (typeof cellValues === 'string') {
      return cellValues;
    } else if (Array.isArray(cellValues)) {
      if (cellValues.length > 1) {
        return cellValues.join(', ');
      } else {
        const value: JsonValue = cellValues[0];
        if (typeof value === 'string') {
          return value;
        } else if (value == null) {
          return null;
        } else {
          return value.toString();
        }
      }
    } else {
      return null;
    }
  }, [alert, columnId]);

  return !isEmpty(displayValue) ? (
    <>{displayValue}</>
  ) : (
    <span>{getOrEmptyTagFromValue(displayValue)}</span>
  );
});

CellValue.displayName = 'CellValue';
