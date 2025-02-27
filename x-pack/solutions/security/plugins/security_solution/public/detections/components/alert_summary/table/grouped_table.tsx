/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback } from 'react';
import type { Filter, Query } from '@kbn/es-query';
import { TableId } from '@kbn/securitysolution-data-table';
import type { DataView } from '@kbn/data-views-plugin/common';
import { Table } from './table';
import type { RunTimeMappings } from '../../../../sourcerer/store/model';
import { GroupedAlertsTable } from '../../alerts_table/alerts_grouping';

export interface TableProps {
  /**
   *
   */
  dataView: DataView;
}

/**
 *
 */
export const GroupedTable = memo(({ dataView }: TableProps) => {
  const from = '';
  const globalFilters: Filter[] = [];
  const globalQuery: Query = { query: '', language: '' };
  const hasIndexMaintenance = false;
  const hasIndexWrite = false;
  const loading = false;
  const renderChildComponent = useCallback(() => <Table dataView={dataView} />, [dataView]);
  const runtimeMappings: RunTimeMappings = undefined;
  const signalIndexName = '';
  const to = '';

  return (
    <GroupedAlertsTable
      from={from}
      globalFilters={globalFilters}
      globalQuery={globalQuery}
      hasIndexMaintenance={hasIndexMaintenance}
      hasIndexWrite={hasIndexWrite}
      loading={loading}
      renderChildComponent={renderChildComponent}
      runtimeMappings={runtimeMappings}
      signalIndexName={signalIndexName}
      tableId={TableId.alertsOnAlertSummaryPage}
      to={to}
    />
  );
});

GroupedTable.displayName = 'GroupedTable';
