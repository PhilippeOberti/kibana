/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useState } from 'react';
import { SearchBar } from '@kbn/unified-search-plugin/public';
import type { DataView } from '@kbn/data-views-plugin/common';
import type { AggregateQuery, Query, TimeRange } from '@kbn/es-query';

const defaultQuery: Query = {
  language: 'kuery',
  query: '',
};

export interface SearchBarSectionProps {
  /**
   *
   */
  dataView: DataView;
}

/**
 *
 */
export const SearchBarSection = memo(({ dataView }: SearchBarSectionProps) => {
  const [query, setQuery] = useState<Query | AggregateQuery | undefined>(defaultQuery);
  const [_, setTimeRange] = useState<TimeRange | null>(null);

  const onTimeRangeChange = useCallback((payload: { dateRange: TimeRange }) => {
    console.log('onTimeRangeChange', payload);
    setTimeRange(payload.dateRange);
  }, []);
  const onQueryChange = useCallback(
    (payload: { dateRange: TimeRange; query?: Query | AggregateQuery | undefined }) =>
      console.log('onQueryChange', payload),
    []
  );
  const onQuerySubmit = useCallback(
    (
      payload: {
        dateRange: TimeRange;
        query?: Query | AggregateQuery | undefined;
      },
      isUpdate?: boolean
    ) => {
      console.log('onQuerySubmit', payload, isUpdate);
      setQuery(payload.query);
    },
    []
  );

  return (
    <SearchBar
      indexPatterns={[dataView]}
      onQueryChange={onQueryChange}
      onQuerySubmit={onQuerySubmit}
      onTimeRangeChange={onTimeRangeChange}
      query={query}
      showFilterBar={false}
      showQueryMenu={false}
    />
  );
});

SearchBarSection.displayName = 'SearchBarSection';
