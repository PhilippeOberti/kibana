/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import type { Alert } from '@kbn/alerting-types';
import { AssistantRowControlColumn } from './assistant_row_control_column';
import { OpenFlyoutRowControlColumn } from './open_flyout_row_control_column';

export interface ActionsCellProps {
  /**
   * Alert data passed from the renderCellValue callback via the AlertWithLegacyFormats interface
   */
  alert: Alert;
}

/**
 * Component used in the AI for SOC alert summary table.
 * It is passed to the renderActionsCell property of the EuiDataGrid.
 * It renders all the icons in the row action icons:
 * - open flyout
 * - assistant
 * - more actions (soon)
 */
export const ActionsCell = memo(({ alert, ...props }: ActionsCellProps) => {
  // debugger;
  return (
    <EuiFlexGroup alignItems="center" gutterSize="xs">
      <EuiFlexItem>
        <OpenFlyoutRowControlColumn alert={alert} />
      </EuiFlexItem>
      <EuiFlexItem>
        <AssistantRowControlColumn alert={alert} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
});

ActionsCell.displayName = 'ActionsCell';
