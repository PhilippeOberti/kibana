/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { useCallback } from 'react';
import { useFlyoutApi } from '@kbn/flyout';
import { EntityType } from '../../../../../common/search_strategy';
import type { EntityDetailsPath } from '../../shared/components/left_panel/left_panel_header';
import { useKibana } from '../../../../common/lib/kibana';
import { EntityEventTypes } from '../../../../common/lib/telemetry';
import { ServiceDetailsPanelKeyV2 } from '../../service_details_left';
import { useIsExperimentalFeatureEnabled } from '../../../../common/hooks/use_experimental_features';
import { ServicePanelKeyV2 } from '../../shared/constants';

interface UseNavigateToServiceDetailsParams {
  serviceName: string;
  email?: string[];
  scopeId: string;
  contextID: string;
  isRiskScoreExist: boolean;
  isPreviewMode?: boolean;
}

interface UseNavigateToServiceDetailsResult {
  /**
   * Opens the service details panel
   */
  openDetailsPanel: (path: EntityDetailsPath) => void;
  /**
   * Whether the link is enabled
   */
  isLinkEnabled: boolean;
}

export const useNavigateToServiceDetails = ({
  serviceName,
  scopeId,
  contextID,
  isRiskScoreExist,
  isPreviewMode,
}: UseNavigateToServiceDetailsParams): UseNavigateToServiceDetailsResult => {
  const { telemetry } = useKibana().services;
  const { openFlyout, openChildPanel } = useFlyoutApi();
  const isNewNavigationEnabled = !useIsExperimentalFeatureEnabled(
    'newExpandableFlyoutNavigationDisabled'
  );

  const isLinkEnabled = !isPreviewMode || (isNewNavigationEnabled && isPreviewMode);

  const openDetailsPanel = useCallback(
    (path: EntityDetailsPath) => {
      telemetry.reportEvent(EntityEventTypes.RiskInputsExpandedFlyoutOpened, {
        entity: EntityType.service,
      });

      const left = {
        id: ServiceDetailsPanelKeyV2,
        params: {
          isRiskScoreExist,
          scopeId,
          service: {
            name: serviceName,
          },
          path,
        },
      };

      const right = {
        id: ServicePanelKeyV2,
        params: {
          contextID,
          serviceName,
          scopeId,
        },
      };

      // When new navigation is enabled, navigation in preview is enabled and open a new flyout
      if (isNewNavigationEnabled && isPreviewMode) {
        openFlyout({
          main: right,
          child: left,
        });
      } else if (!isPreviewMode) {
        // When not in preview mode, open left panel as usual
        openChildPanel(left);
      }
    },
    [
      contextID,
      isNewNavigationEnabled,
      isPreviewMode,
      isRiskScoreExist,
      openFlyout,
      openChildPanel,
      scopeId,
      serviceName,
      telemetry,
    ]
  );

  return { openDetailsPanel, isLinkEnabled };
};
