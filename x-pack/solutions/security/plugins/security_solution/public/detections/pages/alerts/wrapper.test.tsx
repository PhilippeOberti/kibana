/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ALERTS_PAGE_LOADING_TEST_ID, AlertsPageWrapper } from './wrapper';
import { useUserData } from '../../components/user_info';
import { useListsConfig } from '../../containers/detection_engine/lists/use_lists_config';
import { useSignalHelpers } from '../../../sourcerer/containers/use_signal_helpers';
import { TestProviders } from '../../../common/mock';
import { USER_UNAUTHENTICATED_TEST_ID } from './alerts_page_user_unauthenticated';
import { NO_INDEX_TEST_ID } from './alerts_page_no_index';
import { NO_INTEGRATION_CALLOUT_TEST_ID } from '../../components/callouts/no_api_integration_key_callout';
import { NEED_ADMIN_CALLOUT_TEST_ID } from '../../components/callouts/need_admin_for_update_rules_callout';

jest.mock('../../components/user_info');
jest.mock('../../containers/detection_engine/lists/use_lists_config');
jest.mock('../../../sourcerer/containers/use_signal_helpers');

describe('<AlertsPageWrapper />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('showing loading spinner', () => {
    it('should render a loading spinner if userInfoLoading is true', () => {
      (useUserData as jest.Mock).mockReturnValue([{ loading: true }]);
      (useListsConfig as jest.Mock).mockReturnValue({ loading: false });
      (useSignalHelpers as jest.Mock).mockReturnValue({});

      const { getByTestId } = render(
        <TestProviders>
          <AlertsPageWrapper />
        </TestProviders>
      );

      expect(getByTestId(ALERTS_PAGE_LOADING_TEST_ID)).toBeInTheDocument();
    });

    it('should render a loading spinner if listsConfigLoading is true', () => {
      (useUserData as jest.Mock).mockReturnValue([{ loading: false }]);
      (useListsConfig as jest.Mock).mockReturnValue({ loading: true });
      (useSignalHelpers as jest.Mock).mockReturnValue({});

      const { getByTestId } = render(
        <TestProviders>
          <AlertsPageWrapper />
        </TestProviders>
      );

      expect(getByTestId(ALERTS_PAGE_LOADING_TEST_ID)).toBeInTheDocument();
    });
  });

  describe('showing user not authenticated', () => {
    it('should render a loading spinner if listsConfigLoading is true', () => {
      (useUserData as jest.Mock).mockReturnValue([{ isAuthenticated: false }]);
      (useListsConfig as jest.Mock).mockReturnValue({});
      (useSignalHelpers as jest.Mock).mockReturnValue({});

      const { getByTestId, queryByTestId } = render(
        <TestProviders>
          <AlertsPageWrapper />
        </TestProviders>
      );

      expect(queryByTestId(ALERTS_PAGE_LOADING_TEST_ID)).not.toBeInTheDocument();
      expect(getByTestId(USER_UNAUTHENTICATED_TEST_ID)).toBeInTheDocument();
    });
  });

  describe('showing no index', () => {
    it('should render a loading spinner if signalIndexNeedsInit is true', () => {
      (useUserData as jest.Mock).mockReturnValue([{}]);
      (useListsConfig as jest.Mock).mockReturnValue({});
      (useSignalHelpers as jest.Mock).mockReturnValue({ signalIndexNeedsInit: true });

      const { getByTestId, queryByTestId } = render(
        <TestProviders>
          <AlertsPageWrapper />
        </TestProviders>
      );

      expect(queryByTestId(ALERTS_PAGE_LOADING_TEST_ID)).not.toBeInTheDocument();
      expect(queryByTestId(USER_UNAUTHENTICATED_TEST_ID)).not.toBeInTheDocument();
      expect(getByTestId(NO_INDEX_TEST_ID)).toBeInTheDocument();
    });

    it('should render a loading spinner if needsListsConfiguration is true', () => {
      (useUserData as jest.Mock).mockReturnValue([{}]);
      (useListsConfig as jest.Mock).mockReturnValue({ needsConfiguration: true });
      (useSignalHelpers as jest.Mock).mockReturnValue({});

      const { getByTestId, queryByTestId } = render(
        <TestProviders>
          <AlertsPageWrapper />
        </TestProviders>
      );

      expect(queryByTestId(ALERTS_PAGE_LOADING_TEST_ID)).not.toBeInTheDocument();
      expect(queryByTestId(USER_UNAUTHENTICATED_TEST_ID)).not.toBeInTheDocument();
      expect(getByTestId(NO_INDEX_TEST_ID)).toBeInTheDocument();
    });
  });

  describe('showing callouts', () => {
    it('should render NoApiIntegrationKeyCallOut', () => {
      (useUserData as jest.Mock).mockReturnValue([
        {
          loading: false,
          isAuthenticated: true,
          canUserREAD: true,
          hasIndexRead: true,
          hasEncryptionKey: false,
        },
      ]);
      (useListsConfig as jest.Mock).mockReturnValue({
        loading: false,
        needsConfiguration: false,
      });
      (useSignalHelpers as jest.Mock).mockReturnValue({
        signalIndexNeedsInit: false,
      });

      const { getByTestId } = render(
        <TestProviders>
          <AlertsPageWrapper />
        </TestProviders>
      );

      expect(getByTestId(NO_INTEGRATION_CALLOUT_TEST_ID)).toBeInTheDocument();
    });

    it('should render NeedAdminForUpdateRulesCallOut', () => {
      (useUserData as jest.Mock).mockReturnValue([
        {
          loading: false,
          isAuthenticated: true,
          canUserREAD: true,
          hasIndexRead: true,
          signalIndexMappingOutdated: true,
          hasIndexManage: false,
        },
      ]);
      (useListsConfig as jest.Mock).mockReturnValue({
        loading: false,
        needsConfiguration: false,
      });
      (useSignalHelpers as jest.Mock).mockReturnValue({
        signalIndexNeedsInit: false,
      });

      const { getByTestId } = render(
        <TestProviders>
          <AlertsPageWrapper />
        </TestProviders>
      );

      expect(getByTestId(`callout-${NEED_ADMIN_CALLOUT_TEST_ID}`)).toBeInTheDocument();
    });
  });
});
