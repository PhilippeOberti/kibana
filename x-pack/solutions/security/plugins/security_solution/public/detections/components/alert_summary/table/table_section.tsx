/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo } from 'react';
import type { DataView } from '@kbn/data-views-plugin/common';
import type { Filter } from '@kbn/es-query';
import { TableId } from '@kbn/securitysolution-data-table';
import type { RunTimeMappings } from '../../../../sourcerer/store/model';
import { useGlobalTime } from '../../../../common/containers/use_global_time';
import { Table } from './table';
import { inputsSelectors } from '../../../../common/store';
import { useDeepEqualSelector } from '../../../../common/hooks/use_selector';
import { GroupedAlertsTable } from '../../alerts_table/alerts_grouping';

const globalFilters: Filter[] = [];
const hasIndexMaintenance = true;
const hasIndexWrite = true;
const runtimeMappings: RunTimeMappings = {};

export interface TableSectionProps {
  /**
   * DataView created for the alert summary page
   */
  dataView: DataView;
}

/**
 * Section rendering the table in the alert summary page.
 * This component leverages the GroupedAlertsTable and the ResponseOps AlertsTable also used in the alerts page.
 */
export const TableSection = memo(({ dataView }: TableSectionProps) => {
  const indexNames = useMemo(() => dataView.getIndexPattern(), [dataView]);
  const { to, from } = useGlobalTime();

  const renderChildComponent = useCallback(
    (groupingFilters: Filter[]) => <Table dataView={dataView} groupingFilters={groupingFilters} />,
    [dataView]
  );

  const getGlobalQuerySelector = useMemo(() => inputsSelectors.globalQuerySelector(), []);
  const globalQuery = useDeepEqualSelector(getGlobalQuerySelector);

  return (
    <GroupedAlertsTable
      from={from}
      globalFilters={globalFilters}
      globalQuery={globalQuery}
      hasIndexMaintenance={hasIndexMaintenance}
      hasIndexWrite={hasIndexWrite}
      loading={false}
      renderChildComponent={renderChildComponent}
      runtimeMappings={runtimeMappings}
      signalIndexName={indexNames}
      tableId={TableId.alertsOnAlertSummaryPage}
      to={to}
    />
  );
});

TableSection.displayName = 'TableSection';
