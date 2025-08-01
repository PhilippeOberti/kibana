/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { EuiButton, EuiInMemoryTable, EuiSearchBarProps } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { CoreStart } from '@kbn/core/public';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useDebounce from 'react-use/lib/useDebounce';
import { useEuiTablePersist } from '@kbn/shared-ux-table-persist';
import { TableText } from '..';
import { SEARCH_SESSIONS_TABLE_ID } from '../../../../../../common';
import { SearchSessionsMgmtAPI } from '../../lib/api';
import { AvailableColumns, getColumns } from '../../lib/get_columns';
import { UISession } from '../../types';
import { OnActionComplete } from '../actions';
import { getAppFilter } from './app_filter';
import { getStatusFilter } from './status_filter';
import { SearchUsageCollector } from '../../../../collectors';
import type { SearchSessionsConfigSchema } from '../../../../../../server/config';

interface Props {
  core: CoreStart;
  api: SearchSessionsMgmtAPI;
  timezone: string;
  config: SearchSessionsConfigSchema;
  kibanaVersion: string;
  searchUsageCollector: SearchUsageCollector;
  columns?: AvailableColumns[];
}

export function SearchSessionsMgmtTable({
  core,
  api,
  timezone,
  config,
  kibanaVersion,
  searchUsageCollector,
  columns,
  ...props
}: Props) {
  const [tableData, setTableData] = useState<UISession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedIsLoading, setDebouncedIsLoading] = useState(false);
  const showLatestResultsHandler = useRef<Function>();
  const refreshTimeoutRef = useRef<number | null>(null);
  const refreshInterval = useMemo(
    () => moment.duration(config.management.refreshInterval).asMilliseconds(),
    [config.management.refreshInterval]
  );

  const { pageSize, sorting, onTableChange } = useEuiTablePersist<UISession>({
    tableId: 'searchSessionsMgmt',
    initialSort: {
      field: 'created',
      direction: 'desc',
    },
  });

  // Debounce rendering the state of the Refresh button
  useDebounce(
    () => {
      setDebouncedIsLoading(isLoading);
    },
    250,
    [isLoading]
  );

  // refresh behavior
  const doRefresh = useCallback(async () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    setIsLoading(true);
    const renderResults = (results: UISession[]) => {
      setTableData(results);
    };
    showLatestResultsHandler.current = renderResults;

    if (document.visibilityState !== 'hidden') {
      let results: UISession[] = [];
      try {
        results = await api.fetchTableData();
      } catch (e) {} // eslint-disable-line no-empty

      if (showLatestResultsHandler.current === renderResults) {
        renderResults(results);
        setIsLoading(false);
      }
    }

    if (showLatestResultsHandler.current === renderResults && refreshInterval > 0) {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = window.setTimeout(doRefresh, refreshInterval);
    }
  }, [api, refreshInterval]);

  // initial data load
  useEffect(() => {
    doRefresh();
    searchUsageCollector.trackSessionsListLoaded();
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [doRefresh, searchUsageCollector]);

  const onActionComplete: OnActionComplete = () => {
    doRefresh();
  };

  const tableColumns = getColumns(
    core,
    api,
    config,
    timezone,
    onActionComplete,
    kibanaVersion,
    searchUsageCollector
  ).filter((column) => {
    if (!columns) return true;
    if (!('field' in column)) return true;
    return columns.includes(column.field);
  });

  // table config: search / filters
  const search: EuiSearchBarProps = {
    box: { incremental: true },
    filters: [getStatusFilter(tableData), getAppFilter(tableData)],
    toolsRight: (
      <TableText>
        <EuiButton
          fill
          iconType="refresh"
          onClick={doRefresh}
          disabled={debouncedIsLoading}
          isLoading={debouncedIsLoading}
          data-test-subj="sessionManagementRefreshBtn"
        >
          <FormattedMessage
            id="data.mgmt.searchSessions.search.tools.refresh"
            defaultMessage="Refresh"
          />
        </EuiButton>
      </TableText>
    ),
  };

  return (
    <EuiInMemoryTable<UISession>
      {...props}
      id={SEARCH_SESSIONS_TABLE_ID}
      data-test-subj={SEARCH_SESSIONS_TABLE_ID}
      rowProps={(searchSession: UISession) => ({
        'data-test-subj': `searchSessionsRow`,
        'data-test-search-session-id': `id-${searchSession.id}`,
      })}
      columns={tableColumns}
      items={tableData}
      pagination={{
        pageSize,
      }}
      search={search}
      sorting={sorting}
      onTableChange={onTableChange}
      tableLayout="auto"
    />
  );
}
