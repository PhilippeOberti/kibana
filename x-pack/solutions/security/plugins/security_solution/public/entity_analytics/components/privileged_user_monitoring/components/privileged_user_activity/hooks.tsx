/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo } from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import { useExpandableFlyoutApi } from '@kbn/expandable-flyout';
import type { DataViewSpec } from '@kbn/data-views-plugin/public';
import { encode } from '@kbn/rison';
import * as E from 'fp-ts/Either';
import { useFlyoutApi } from '@kbn/flyout';
import { useAppToasts } from '../../../../../common/hooks/use_app_toasts';
import { useSpaceId } from '../../../../../common/hooks/use_space_id';
import {
  generateListESQLQuery,
  generateVisualizationESQLQuery,
} from '../../../privileged_user_monitoring_onboarding/components/sample_dashboard/esql_data_generation';
import { VisualizationToggleOptions } from './types';
import {
  buildAccountSwitchesColumns,
  buildAuthenticationsColumns,
  buildGrantedRightsColumns,
} from './columns';
import { getLensAttributes } from './get_lens_attributes';
import {
  ACCOUNT_SWITCH_STACK_BY,
  AUTHENTICATIONS_STACK_BY,
  ERROR_ENCODING_ESQL_QUERY,
  GRANTED_RIGHTS_STACK_BY,
} from './constants';
import { getAuthenticationsEsqlSource } from '../../queries/authentications_esql_query';
import { getAccountSwitchesEsqlSource } from '../../queries/account_switches_esql_query';
import { getGrantedRightsEsqlSource } from '../../queries/granted_rights_esql_query';
import { useIsExperimentalFeatureEnabled } from '../../../../../common/hooks/use_experimental_features';

export const useDiscoverPath = (query: string) => {
  const { addWarning } = useAppToasts();

  const discoverUrl = useMemo(() => {
    try {
      const encodedAppState = encode({
        query: {
          esql: query,
        },
      });
      return `#/?_a=${encodedAppState}`;
    } catch (error) {
      addWarning(error, { title: ERROR_ENCODING_ESQL_QUERY });
      return '#/'; // Fallback to root if encoding fails
    }
  }, [query, addWarning]);

  return discoverUrl;
};

const toggleOptionsConfig = {
  [VisualizationToggleOptions.GRANTED_RIGHTS]: {
    generateEsqlSource: getGrantedRightsEsqlSource,
    buildColumns: buildGrantedRightsColumns,
    stackByOptions: GRANTED_RIGHTS_STACK_BY,
  },
  [VisualizationToggleOptions.ACCOUNT_SWITCHES]: {
    generateEsqlSource: getAccountSwitchesEsqlSource,
    buildColumns: buildAccountSwitchesColumns,
    stackByOptions: ACCOUNT_SWITCH_STACK_BY,
  },
  [VisualizationToggleOptions.AUTHENTICATIONS]: {
    generateEsqlSource: getAuthenticationsEsqlSource,
    buildColumns: buildAuthenticationsColumns,
    stackByOptions: AUTHENTICATIONS_STACK_BY,
  },
};

export const usePrivilegedUserActivityParams = (
  selectedToggleOption: VisualizationToggleOptions,
  sourcererDataView: DataViewSpec
) => {
  const spaceId = useSpaceId();

  const indexPattern = sourcererDataView?.title ?? '';
  const fields = sourcererDataView?.fields;

  const esqlSource = useMemo(
    () =>
      spaceId && indexPattern && fields
        ? toggleOptionsConfig[selectedToggleOption].generateEsqlSource(
            spaceId,
            indexPattern,
            fields
          )
        : E.left({
            error: 'GenerateEsqlSource requires spaceId, indexPattern, fields to be defined',
          }),
    [selectedToggleOption, spaceId, indexPattern, fields]
  );

  const generateTableQuery = useMemo(() => generateListESQLQuery(esqlSource), [esqlSource]);
  const generateVisualizationQuery = useMemo(
    () => generateVisualizationESQLQuery(esqlSource),
    [esqlSource]
  );

  const { openRightPanel } = useExpandableFlyoutApi();
  const { openMainPanel } = useFlyoutApi();
  const newFlyoutEnabled = useIsExperimentalFeatureEnabled('newFlyout');

  const columns = useMemo(
    () =>
      toggleOptionsConfig[selectedToggleOption].buildColumns(
        openRightPanel,
        openMainPanel,
        newFlyoutEnabled
      ),
    [selectedToggleOption, openRightPanel, openMainPanel, newFlyoutEnabled]
  );

  return {
    getLensAttributes,
    generateVisualizationQuery,
    generateTableQuery,
    columns,
  };
};

export const useToggleOptions = () =>
  useMemo(
    () => [
      {
        id: VisualizationToggleOptions.GRANTED_RIGHTS,
        label: (
          <FormattedMessage
            id="xpack.securitySolution.entityAnalytics.privilegedUserMonitoring.userActivity.grantedRights"
            defaultMessage="Granted rights"
          />
        ),
      },

      {
        id: VisualizationToggleOptions.ACCOUNT_SWITCHES,
        label: (
          <FormattedMessage
            id="xpack.securitySolution.entityAnalytics.privilegedUserMonitoring.userActivity.accountSwitches"
            defaultMessage="Account switches"
          />
        ),
      },
      {
        id: VisualizationToggleOptions.AUTHENTICATIONS,
        label: (
          <FormattedMessage
            id="xpack.securitySolution.entityAnalytics.privilegedUserMonitoring.userActivity.authentications"
            defaultMessage="Authentications"
          />
        ),
      },
    ],
    []
  );

export const useStackByOptions = (selectedToggleOption: VisualizationToggleOptions) =>
  toggleOptionsConfig[selectedToggleOption].stackByOptions;
