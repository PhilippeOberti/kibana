/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import type { Alert } from '@kbn/alerting-types';
import { getAlertFieldValueAsStringOrNull } from '../../../utils/get_alert_field_value_as_string_or_null';
import { getOrEmptyTagFromValue } from '../../../../common/components/empty_value';

const styles = { display: 'flex', alignItems: 'center', height: '100%' };

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
 * Component used in the AI for SOC alert summary table.
 * It renders all the values currently as simply as possible (see code comments below).
 * It will be soon improved to support custom renders for specific fields (like kibana.alert.rule.parameters and kibana.alert.severity).
 */
export const CellValue = memo(({ alert, columnId }: CellValueProps) => {
  const displayValue: string | null = useMemo(
    () => getAlertFieldValueAsStringOrNull(alert, columnId),
    [alert, columnId]
  );

  return <div style={styles}>{getOrEmptyTagFromValue(displayValue)}</div>;
});

CellValue.displayName = 'CellValue';
