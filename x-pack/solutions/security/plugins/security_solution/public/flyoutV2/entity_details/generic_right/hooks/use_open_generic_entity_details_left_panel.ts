/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useHasMisconfigurations } from '@kbn/cloud-security-posture/src/hooks/use_has_misconfigurations';
import { useHasVulnerabilities } from '@kbn/cloud-security-posture/src/hooks/use_has_vulnerabilities';
import { useFlyoutApi } from '@kbn/flyout';
import type { EntityDetailsPath } from '../../shared/components/left_panel/left_panel_header';
import { useGlobalTime } from '../../../../common/containers/use_global_time';
import { useNonClosedAlerts } from '../../../../cloud_security_posture/hooks/use_non_closed_alerts';
import { DETECTION_RESPONSE_ALERTS_BY_STATUS_ID } from '../../../../overview/components/detection_response/alerts_by_status/types';
import { GenericEntityDetailsPanelKeyV2 } from '../../generic_details_left';

import { type UseGetGenericEntityParams } from './use_get_generic_entity';

export const useOpenGenericEntityDetailsLeftPanel = (
  params: {
    insightsField: string;
    insightsValue: string;
    scopeId: string;
  } & UseGetGenericEntityParams
) => {
  const { insightsField, insightsValue, entityDocId, entityId, scopeId } = params;
  const { openChildPanel } = useFlyoutApi();
  const { hasMisconfigurationFindings } = useHasMisconfigurations(insightsField, insightsValue);
  const { hasVulnerabilitiesFindings } = useHasVulnerabilities(insightsField, insightsValue);
  const { to, from } = useGlobalTime();
  const { hasNonClosedAlerts } = useNonClosedAlerts({
    field: insightsField as 'related.entity',
    value: insightsValue,
    to,
    from,
    queryId: `${DETECTION_RESPONSE_ALERTS_BY_STATUS_ID}-generic-entity-alerts`,
  });

  const openGenericEntityDetails = (path: EntityDetailsPath) => {
    openChildPanel({
      id: GenericEntityDetailsPanelKeyV2,
      params: {
        entityDocId,
        entityId,
        field: insightsField,
        value: insightsValue,
        scopeId,
        isRiskScoreExist: false,
        hasMisconfigurationFindings,
        hasVulnerabilitiesFindings,
        hasNonClosedAlerts,
        path,
      },
    });
  };

  return {
    openGenericEntityDetails,
  };
};
