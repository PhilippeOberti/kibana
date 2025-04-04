/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import type { Alert } from '@kbn/alerting-types';
import type { JsonValue } from '@kbn/utility-types';
import { KibanaAlertSeverityCellRenderer } from './kibana_alert_severity_cell_renderer';
import { KibanaAlertRelatedIntegrationsCellRenderer } from './kibana_alert_related_integrations_cell_renderer';
import { BasicCellRenderer } from './basic_cell_renderer';

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
  const cellValues: string | JsonValue[] = alert[columnId];

  if (columnId === 'kibana.alert.rule.parameters') {
    return <KibanaAlertRelatedIntegrationsCellRenderer values={cellValues} />;
  }

  if (columnId === 'kibana.alert.severity') {
    return <KibanaAlertSeverityCellRenderer values={cellValues} />;
  }

  return <BasicCellRenderer values={cellValues} />;
});

CellValue.displayName = 'CellValue';
