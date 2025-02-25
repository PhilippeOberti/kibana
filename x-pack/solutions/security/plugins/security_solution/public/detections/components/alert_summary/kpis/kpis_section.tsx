/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import type { GroupBySelection } from '../../alerts_kpis/alerts_progress_bar_panel/types';
import { SeverityLevelPanel } from '../../alerts_kpis/severity_level_panel';
import { AlertsByRulePanel } from '../../alerts_kpis/alerts_by_rule_panel';
import { AlertsProgressBarPanel } from '../../alerts_kpis/alerts_progress_bar_panel';

/**
 *
 */
export const KPIsSection = memo(() => {
  const signalIndexName = '';
  const groupBySelection: GroupBySelection = 'host.name';
  const setGroupBySelection = () => {};

  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        <SeverityLevelPanel signalIndexName={signalIndexName} />
      </EuiFlexItem>
      <EuiFlexItem>
        <AlertsByRulePanel signalIndexName={signalIndexName} />
      </EuiFlexItem>
      <EuiFlexItem>
        <AlertsProgressBarPanel
          signalIndexName={signalIndexName}
          groupBySelection={groupBySelection}
          setGroupBySelection={setGroupBySelection}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
});

KPIsSection.displayName = 'KPIsSection';
