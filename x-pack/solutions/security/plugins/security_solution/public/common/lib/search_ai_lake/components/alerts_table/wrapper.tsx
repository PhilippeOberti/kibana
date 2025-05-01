/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useEffect, useMemo, useState } from 'react';
import type { DataView, DataViewSpec } from '@kbn/data-views-plugin/common';
import { type EuiDataGridColumn, EuiEmptyPrompt, EuiSkeletonRectangle } from '@elastic/eui';
import type { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { i18n } from '@kbn/i18n';
import type { Alert } from '@kbn/alerting-types';
import { Table } from './table';
import { useFetchIntegrations } from '../../hooks/use_fetch_integrations';
import { useFindRulesQuery } from '../../../../../detection_engine/rule_management/api/hooks/use_find_rules_query';
import { useKibana } from '../../../kibana';

const DATAVIEW_ERROR = i18n.translate(
  'xpack.securitySolution.common.aiForSocTableTab.dataViewError',
  {
    defaultMessage: 'Unable to create data view',
  }
);

export const ERROR_TEST_ID = 'ai4dsoc-alerts-table-dataview-error';
export const LOADING_SKELETON_TEST_ID = 'ai4dsoc-alerts-table-dataview-loading-skeleton';
export const CONTENT_TEST_ID = 'ai4dsoc-alerts-table-dataview-content';

const dataViewSpec: DataViewSpec = { title: '.alerts-security.alerts-default' };

interface AIForSOCAlertsTableProps {
  /**
   * Id to pass down to the ResponseOps alerts table
   */
  id: string;
  /**
   * Callback fired when the alerts have been first loaded
   */
  onLoaded?: (alerts: Alert[], columns: EuiDataGridColumn[]) => void;
  /**
   * Query that contains the id of the alerts to display in the table
   */
  query: Pick<QueryDslQueryContainer, 'bool' | 'ids'>;
}

/**
 * Component used in the Attack Discovery and Cases alerts tables, only in the AI4DSOC tier.
 * It fetches rules, packages (integrations) and creates a local adhoc dataView.
 * It renders a loading skeleton while packages are being fetched and while the dataView is being created.
 */
export const AIForSOCAlertsTable = memo(({ id, onLoaded, query }: AIForSOCAlertsTableProps) => {
  const { data } = useKibana().services;
  const [dataView, setDataView] = useState<DataView | undefined>(undefined);
  const [dataViewLoading, setDataViewLoading] = useState<boolean>(true);

  // Fetch all integrations
  const { installedPackages, isLoading: integrationIsLoading } = useFetchIntegrations();

  // Fetch all rules. For the AI for SOC effort, there should only be one rule per integration (which means for now 5-6 rules total)
  const { data: ruleData, isLoading: ruleIsLoading } = useFindRulesQuery({});
  const ruleResponse = useMemo(
    () => ({
      rules: ruleData?.rules || [],
      isLoading: ruleIsLoading,
    }),
    [ruleData, ruleIsLoading]
  );

  useEffect(() => {
    let dv: DataView;
    const createDataView = async () => {
      try {
        dv = await data.dataViews.create(dataViewSpec);
        setDataView(dv);
        setDataViewLoading(false);
      } catch (err) {
        setDataViewLoading(false);
      }
    };
    createDataView();

    // clearing after leaving the page
    return () => {
      if (dv?.id) {
        data.dataViews.clearInstanceCache(dv.id);
      }
    };
  }, [data.dataViews]);

  return (
    <EuiSkeletonRectangle
      data-test-subj={LOADING_SKELETON_TEST_ID}
      height={400}
      isLoading={integrationIsLoading || dataViewLoading}
      width="100%"
    >
      <>
        {!dataView || !dataView.id ? (
          <EuiEmptyPrompt
            color="danger"
            data-test-subj={ERROR_TEST_ID}
            iconType="error"
            title={<h2>{DATAVIEW_ERROR}</h2>}
          />
        ) : (
          <div data-test-subj={CONTENT_TEST_ID}>
            <Table
              dataView={dataView}
              id={id}
              onLoaded={onLoaded}
              packages={installedPackages}
              query={query}
              ruleResponse={ruleResponse}
            />
          </div>
        )}
      </>
    </EuiSkeletonRectangle>
  );
});

AIForSOCAlertsTable.displayName = 'AIForSOCAlertsTable';
