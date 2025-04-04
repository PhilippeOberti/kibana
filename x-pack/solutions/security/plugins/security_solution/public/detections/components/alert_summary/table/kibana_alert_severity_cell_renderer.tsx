/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import { EuiBadge, useEuiTheme } from '@elastic/eui';
import type { JsonValue } from '@kbn/utility-types';
import { getSeverityColor } from '../../alerts_kpis/severity_level_panel/helpers';

export interface KibanaAlertSeverityCellRendererProps {
  /**
   *
   */
  values: string | JsonValue[];
}

/**
 *
 */
export const KibanaAlertSeverityCellRenderer = memo(
  ({ values }: KibanaAlertSeverityCellRendererProps) => {
    const { euiTheme } = useEuiTheme();

    const displayValue: string = useMemo(() => {
      // Displays string as is.
      // Joins values of array with more than one element.
      // Returns null if the value is null.
      // Return the string of the value otherwise.
      if (typeof values === 'string') {
        return values;
      } else if (Array.isArray(values)) {
        if (values.length > 1) {
          return values.join(', ');
        } else {
          const value: JsonValue = values[0];
          if (typeof value === 'string') {
            return value;
          } else if (value == null) {
            return '';
          } else {
            return value.toString();
          }
        }
      } else {
        return '';
      }
    }, [values]);

    const color = useMemo(() => getSeverityColor(displayValue, euiTheme), [displayValue, euiTheme]);

    return <>{displayValue && <EuiBadge color={color}>{displayValue}</EuiBadge>}</>;
  }
);

KibanaAlertSeverityCellRenderer.displayName = 'KibanaAlertSeverityCellRenderer';
