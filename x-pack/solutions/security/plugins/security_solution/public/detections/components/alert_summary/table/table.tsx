/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo } from 'react';
import { DataLoadingState, UnifiedDataTable } from '@kbn/unified-data-table';
import type { DataView } from '@kbn/data-views-plugin/common';
import { useKibana } from '../../../../common/lib/kibana';

/**
 * The max size of the documents returned by Elasticsearch
 */
const SAMPLE_SIZE = 500;

export interface TableProps {
  /**
   *
   */
  dataView: DataView;
}

/**
 *
 */
export const Table = memo(({ dataView }: TableProps) => {
  const onSetColumns = useCallback(() => window.alert('onSetColumns'), []);
  const showTimeCol = useMemo(() => !!dataView && !!dataView.timeFieldName, [dataView]);

  const {
    services: {
      uiSettings,
      fieldFormats,
      storage,
      dataViewFieldEditor,
      notifications: { toasts: toastsService },
      theme,
      data: dataPluginContract,
    },
  } = useKibana();
  const services = useMemo(
    () => ({
      theme,
      fieldFormats,
      storage,
      toastNotifications: toastsService,
      uiSettings,
      dataViewFieldEditor,
      data: dataPluginContract,
    }),
    [
      theme,
      fieldFormats,
      storage,
      toastsService,
      uiSettings,
      dataViewFieldEditor,
      dataPluginContract,
    ]
  );

  return (
    <UnifiedDataTable
      ariaLabelledBy=""
      columns={[]}
      dataView={dataView}
      loadingState={DataLoadingState.loaded}
      onSetColumns={onSetColumns}
      showTimeCol={showTimeCol}
      sort={[]}
      sampleSizeState={SAMPLE_SIZE}
      services={services}
    />
  );
});

Table.displayName = 'Table';
