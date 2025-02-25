/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { useGetScopedSourcererDataView } from '../../../../sourcerer/components/use_get_sourcerer_data_view';
import { GroupedTable } from './grouped_table';
import { FieldList } from './field_list';
import { SourcererScopeName } from '../../../../sourcerer/store/model';

/**
 *
 */
export const TableSection = memo(() => {
  const dataView = useGetScopedSourcererDataView({
    sourcererScope: SourcererScopeName.detections,
  });

  return (
    <>
      {dataView && (
        <EuiFlexGroup>
          <EuiFlexItem>
            <FieldList dataView={dataView} />
          </EuiFlexItem>
          <EuiFlexItem>
            <GroupedTable dataView={dataView} />
          </EuiFlexItem>
        </EuiFlexGroup>
      )}{' '}
    </>
  );
});

TableSection.displayName = 'TableSection';
