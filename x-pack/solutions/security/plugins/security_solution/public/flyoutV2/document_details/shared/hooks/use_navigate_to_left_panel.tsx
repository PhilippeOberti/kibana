/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback, useMemo } from 'react';
import type { FlyoutPanelProps } from '@kbn/flyout';
import { useFlyoutApi } from '@kbn/flyout';
import { DocumentEventTypes } from '../../../../common/lib/telemetry/types';
import { useKibana } from '../../../../common/lib/kibana';
import {
  DocumentDetailsLeftPanelKeyV2,
  DocumentDetailsRightPanelKeyV2,
} from '../constants/panel_keys';
import { useDocumentDetailsContext } from '../context';
import { useIsExperimentalFeatureEnabled } from '../../../../common/hooks/use_experimental_features';

export interface UseNavigateToLeftPanelParams {
  /**
   * The tab to navigate to
   */
  tab: string;
  /**
   * Optional sub tab to navigate to
   */
  subTab?: string;
}

export interface UseNavigateToLeftPanelResult {
  /**
   * Callback to open analyzer in visualize tab
   */
  navigateToLeftPanel: () => void;
  /**
   * Whether the button should be disabled
   */
  isEnabled: boolean;
}

/**
 * Hook that returns the a callback to navigate to the analyzer in the flyout
 */
export const useNavigateToLeftPanel = ({
  tab,
  subTab,
}: UseNavigateToLeftPanelParams): UseNavigateToLeftPanelResult => {
  const { telemetry } = useKibana().services;
  const { openFlyout, openChildPanel } = useFlyoutApi();
  const { eventId, indexName, scopeId, isPreviewMode } = useDocumentDetailsContext();

  const isNewNavigationEnabled = !useIsExperimentalFeatureEnabled(
    'newExpandableFlyoutNavigationDisabled'
  );

  const isEnabled = isNewNavigationEnabled || (!isNewNavigationEnabled && !isPreviewMode);

  const right: FlyoutPanelProps = useMemo(
    () => ({
      id: DocumentDetailsRightPanelKeyV2,
      params: {
        id: eventId,
        indexName,
        scopeId,
      },
    }),
    [eventId, indexName, scopeId]
  );

  const left: FlyoutPanelProps = useMemo(
    () => ({
      id: DocumentDetailsLeftPanelKeyV2,
      params: {
        id: eventId,
        indexName,
        scopeId,
      },
      path: {
        tab,
        subTab,
      },
    }),
    [eventId, indexName, scopeId, tab, subTab]
  );

  const navigateToLeftPanel = useCallback(() => {
    if (!isPreviewMode) {
      openChildPanel(left);
      telemetry.reportEvent(DocumentEventTypes.DetailsFlyoutTabClicked, {
        location: scopeId,
        panel: 'left',
        tabId: tab,
      });
    } else if (isNewNavigationEnabled && isPreviewMode) {
      openFlyout({
        main: right,
        child: left,
      });
      telemetry.reportEvent(DocumentEventTypes.DetailsFlyoutOpened, {
        location: scopeId,
        panel: 'left',
      });
    }
  }, [
    isPreviewMode,
    isNewNavigationEnabled,
    openChildPanel,
    left,
    telemetry,
    scopeId,
    tab,
    right,
    openFlyout,
  ]);

  return useMemo(() => ({ navigateToLeftPanel, isEnabled }), [navigateToLeftPanel, isEnabled]);
};
