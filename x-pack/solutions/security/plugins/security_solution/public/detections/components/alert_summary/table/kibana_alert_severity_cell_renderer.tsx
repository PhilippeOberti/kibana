/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import { EuiBadge, useEuiTheme } from '@elastic/eui';
import type { Alert } from '@kbn/alerting-types';
import { getAlertFieldValueAsStringOrNull } from '../../../utils/get_alert_field_value_as_string_or_null';
import { getSeverityColor } from '../../alerts_kpis/severity_level_panel/helpers';

export interface KibanaAlertSeverityCellRendererProps {
  /**
   * Alert data passed from the renderCellValue callback via the AlertWithLegacyFormats interface
   */
  alert: Alert;
  /**
   * Column id passed from the renderCellValue callback via EuiDataGridProps['renderCellValue'] interface
   */
  field: string;
}

/**
 *
 */
export const KibanaAlertSeverityCellRenderer = memo(
  ({ alert, field }: KibanaAlertSeverityCellRendererProps) => {
    const { euiTheme } = useEuiTheme();

    const displayValue: string | null = useMemo(
      () => getAlertFieldValueAsStringOrNull(alert, field),
      [alert, field]
    );

    const color = useMemo(
      () => getSeverityColor(displayValue || '', euiTheme),
      [displayValue, euiTheme]
    );

    return <>{displayValue && <EuiBadge color={color}>{displayValue}</EuiBadge>}</>;
  }
);

KibanaAlertSeverityCellRenderer.displayName = 'KibanaAlertSeverityCellRenderer';
