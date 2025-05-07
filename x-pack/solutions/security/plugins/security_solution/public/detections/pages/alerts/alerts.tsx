/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFlexGroup, EuiLoadingSpinner } from '@elastic/eui';
import React, { memo, useMemo } from 'react';
import type { DocLinks } from '@kbn/doc-links';
import { AlertsPageDataViewWrapper } from '../../components/alerts/data_view_wrapper';
import { SecuritySolutionPageWrapper } from '../../../common/components/page_wrapper';
import { NoApiIntegrationKeyCallOut } from '../../components/callouts/no_api_integration_key_callout';
import { useUserData } from '../../components/user_info';
import { AlertsPageNoIndex } from '../../components/alerts/alerts_page_no_index';
import { useListsConfig } from '../../containers/detection_engine/lists/use_lists_config';
import { AlertsPageUserUnauthenticated } from '../../components/alerts/alerts_page_user_unauthenticated';
import * as i18n from './translations';
import { useSignalHelpers } from '../../../sourcerer/containers/use_signal_helpers';
import { NeedAdminForUpdateRulesCallOut } from '../../components/callouts/need_admin_for_update_rules_callout';
import { MissingPrivilegesCallOut } from '../../components/callouts/missing_privileges_callout';
import { NoPrivileges } from '../../../common/components/no_privileges';
import { HeaderPage } from '../../../common/components/header_page';

export const ALERTS_PAGE_LOADING_TEST_ID = 'alerts-page-loading';

/**
 *
 */
export const AlertsPage = memo(() => {
  const [{ loading: userInfoLoading, isAuthenticated, canUserREAD, hasIndexRead }] = useUserData();
  const { loading: listsConfigLoading, needsConfiguration: needsListsConfiguration } =
    useListsConfig();
  const { signalIndexNeedsInit } = useSignalHelpers();

  const loading = useMemo(
    () => userInfoLoading || listsConfigLoading,
    [listsConfigLoading, userInfoLoading]
  );
  const userNotAuthenticated = useMemo(
    () => isAuthenticated != null && !isAuthenticated,
    [isAuthenticated]
  );
  const noIndex = useMemo(
    () => signalIndexNeedsInit || needsListsConfiguration,
    [needsListsConfiguration, signalIndexNeedsInit]
  );
  const privilegesRequired = useMemo(
    () => !signalIndexNeedsInit && (hasIndexRead === false || canUserREAD === false),
    [canUserREAD, hasIndexRead, signalIndexNeedsInit]
  );

  if (loading) {
    return (
      <SecuritySolutionPageWrapper>
        <HeaderPage border title={i18n.PAGE_TITLE} isLoading={loading} />
        <EuiFlexGroup justifyContent="center" alignItems="center">
          <EuiLoadingSpinner data-test-subj={ALERTS_PAGE_LOADING_TEST_ID} size="xl" />
        </EuiFlexGroup>
      </SecuritySolutionPageWrapper>
    );
  }

  if (userNotAuthenticated) {
    return (
      <SecuritySolutionPageWrapper>
        <HeaderPage border title={i18n.PAGE_TITLE} />
        <AlertsPageUserUnauthenticated />
      </SecuritySolutionPageWrapper>
    );
  }

  if (noIndex) {
    return (
      <SecuritySolutionPageWrapper>
        <HeaderPage border title={i18n.PAGE_TITLE} />
        <AlertsPageNoIndex
          needsSignalsIndex={signalIndexNeedsInit}
          needsListsIndex={needsListsConfiguration}
        />
      </SecuritySolutionPageWrapper>
    );
  }

  return (
    <>
      <NoApiIntegrationKeyCallOut />
      <NeedAdminForUpdateRulesCallOut />
      <MissingPrivilegesCallOut />
      {privilegesRequired ? (
        <NoPrivileges
          pageName={i18n.PAGE_TITLE.toLowerCase()}
          docLinkSelector={(docLinks: DocLinks) => docLinks.siem.privileges}
        />
      ) : (
        <AlertsPageDataViewWrapper />
      )}
    </>
  );
});

AlertsPage.displayName = 'AlertsPage';
