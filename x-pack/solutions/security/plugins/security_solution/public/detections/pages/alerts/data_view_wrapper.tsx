/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import {
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiSkeletonLoading,
  EuiSkeletonRectangle,
  EuiSpacer,
} from '@elastic/eui';
import { HeaderPage } from '../../../common/components/header_page';
import { useSourcererDataView } from '../../../sourcerer/containers';
import { SourcererScopeName } from '../../../sourcerer/store/model';
import { useIsExperimentalFeatureEnabled } from '../../../common/hooks/use_experimental_features';
import { useDataViewSpec } from '../../../data_view_manager/hooks/use_data_view_spec';
import { AlertsPageContent } from './content';
import { DATA_VIEW_ERROR_TEST_ID } from '../../components/alert_summary/wrapper';
import * as i18n from './translations';

export const AlertsPageDataViewWrapper = memo(() => {
  const { sourcererDataView: oldSourcererDataViewSpec, loading: oldSourcererDataViewIsLoading } =
    useSourcererDataView(SourcererScopeName.detections);

  const newDataViewPickerEnabled = useIsExperimentalFeatureEnabled('newDataViewPickerEnabled');
  const { dataViewSpec: experimentalDataViewSpec, status: experimentalDataViewStatus } =
    useDataViewSpec(SourcererScopeName.detections);

  const isLoading = useMemo(
    () =>
      newDataViewPickerEnabled
        ? experimentalDataViewStatus !== 'ready'
        : oldSourcererDataViewIsLoading,
    [experimentalDataViewStatus, newDataViewPickerEnabled, oldSourcererDataViewIsLoading]
  );

  const dataView = useMemo(
    () => (newDataViewPickerEnabled ? experimentalDataViewSpec : oldSourcererDataViewSpec),
    [experimentalDataViewSpec, newDataViewPickerEnabled, oldSourcererDataViewSpec]
  );

  return (
    <EuiSkeletonLoading
      isLoading={isLoading}
      loadingContent={
        <>
          <EuiSkeletonRectangle height={40} width="100%" />
          <EuiSpacer />
          <HeaderPage title={i18n.PAGE_TITLE}>
            <EuiFlexGroup gutterSize="m">
              <EuiFlexItem>
                <EuiSkeletonRectangle height={40} width={110} />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiSkeletonRectangle height={40} width={110} />
              </EuiFlexItem>
            </EuiFlexGroup>
          </HeaderPage>
          <EuiHorizontalRule margin="none" />
          <EuiSpacer size="l" />
          <EuiSkeletonRectangle height={32} width="100%" />
          <EuiSpacer />
          <EuiSkeletonRectangle height={375} width="100%" />
          <EuiSpacer />
          <EuiSkeletonRectangle height={600} width="100%" />
        </>
      }
      loadedContent={
        <>
          {!dataView || !dataView.id ? (
            <EuiEmptyPrompt
              color="danger"
              data-test-subj={DATA_VIEW_ERROR_TEST_ID}
              iconType="error"
              title={<h2>{'error'}</h2>}
            />
          ) : (
            <AlertsPageContent dataView={dataView} />
          )}
        </>
      }
    />
  );
});

AlertsPageDataViewWrapper.displayName = 'AlertsPageDataViewWrapper';
