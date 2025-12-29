/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import type { EcsSecurityExtension as Ecs } from '@kbn/securitysolution-ecs';
import { InvestigateThresholdRuleAlertInDiscoverWithESQLAction } from './investigate_threshold_rule_alert_in_discover_with_esql_action';
import { InvestigateNewTermsRuleAlertInDiscoverAction } from './investigate_new_terms_rule_alert_in_discover_action';
import { InvestigateGenericAlertInDiscoverWithESQLAction } from './investigate_generic_alert_in_discover_with_esql_action';
import { InvestigateGenericAlertInDiscoverAction } from './investigate_generic_alert_in_discover_action';
import { InvestigateThresholdRuleAlertInDiscoverAction } from './investigate_threshold_rule_alert_in_discover_action';
import {
  isEqlAlert,
  isEsqlAlert,
  isMlAlert,
  isNewTermsAlert,
  isSuppressedAlert,
  isThresholdAlert,
} from '../actions';
import { InvestigateNewTermsRuleAlertInDiscoverWithESQLAction } from './investigate_new_terms_rule_alert_in_discover_with_esql_action';

interface InvestigateInDiscoverActionProps {
  /**
   *
   */
  ecsData?: Ecs | null;
  /**
   *
   */
  esql: boolean;
}

/**
 *
 */
export const InvestigateInDiscoverAction = memo(
  ({ ecsData, esql }: InvestigateInDiscoverActionProps) => {
    if (!ecsData) {
      return null;
    }

    if (isThresholdAlert(ecsData)) {
      return esql ? (
        <InvestigateThresholdRuleAlertInDiscoverAction ecsData={ecsData} />
      ) : (
        <InvestigateThresholdRuleAlertInDiscoverWithESQLAction ecsData={ecsData} />
      );
    } else if (isNewTermsAlert(ecsData)) {
      return esql ? (
        <InvestigateNewTermsRuleAlertInDiscoverAction ecsData={ecsData} />
      ) : (
        <InvestigateNewTermsRuleAlertInDiscoverWithESQLAction ecsData={ecsData} />
      );
    } else if (
      isSuppressedAlert(ecsData) &&
      !isEqlAlert(ecsData) &&
      !isEsqlAlert(ecsData) &&
      !isMlAlert(ecsData)
    ) {
      console.log('Suppressed alert - special handling can be implemented here');
    } else {
      return esql ? (
        <InvestigateGenericAlertInDiscoverAction ecsData={ecsData} />
      ) : (
        <InvestigateGenericAlertInDiscoverWithESQLAction ecsData={ecsData} />
      );
    }
  }
);

InvestigateInDiscoverAction.displayName = 'InvestigateInDiscoverAction';
