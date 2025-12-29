/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import moment from 'moment';
import type { EcsSecurityExtension as Ecs } from '@kbn/securitysolution-ecs';
import { ALERT_RULE_PARAMETERS } from '@kbn/rule-data-utils';
import type { DiscoverAppLocatorParams } from '@kbn/discover-plugin/common';
import { DISCOVER_APP_LOCATOR } from '@kbn/deeplinks-analytics';
import type { Query, TimeRange } from '@kbn/es-query';
import type { DataViewSpec } from '@kbn/data-views-plugin/common';
import { useKibana } from '../../../../common/lib/kibana';
import {
  ALERT_NEW_TERMS,
  ALERT_ORIGINAL_TIME,
  ALERT_RULE_INDICES,
} from '../../../../../common/field_maps/field_names';
import { InvestigateAlertInDiscoverAction } from './investigate_alert_in_discover_action';
import { useRuleAlert } from './use_rule_alert';
import { getField } from '../../../../helpers';

const TEST_ID = 'send-new-terms-rule-alert-to-discover';

interface InvestigateNewTermsRuleAlertInDiscoverActionProps {
  /**
   *
   */
  ecsData: Ecs;
}

/**
 *
 */
export const InvestigateNewTermsRuleAlertInDiscoverAction = memo(
  ({ ecsData }: InvestigateNewTermsRuleAlertInDiscoverActionProps) => {
    const {
      services: { share },
    } = useKibana();
    const discoverLocator = share?.url.locators.get<DiscoverAppLocatorParams>(DISCOVER_APP_LOCATOR);

    const { data } = useRuleAlert({ ecsData });

    if (!data) return;

    // create dataViewSpec to pass list of indices to discover
    const indexNames: string[] =
      getField(data, ALERT_RULE_INDICES) ?? data.signal?.rule?.index ?? [];
    const dataViewSpec: DataViewSpec = {
      title: indexNames.join(','),
      timeFieldName: '@timestamp',
    };

    const newTermsFields: string[] =
      getField(data, `${ALERT_RULE_PARAMETERS}.new_terms_fields`) ?? [];

    // construct query to pass filters to discover
    const from = getField(data, ALERT_ORIGINAL_TIME);
    const to = moment().toISOString();
    const timeRange: TimeRange = {
      from,
      to,
      mode: 'absolute',
    };

    // construct query to pass filters to discover
    const newTermsField = Array.isArray(newTermsFields) ? newTermsFields[0] : newTermsFields;
    const newTermsValues = getField(data, ALERT_NEW_TERMS);
    const newTermsValue = Array.isArray(newTermsValues) ? newTermsValues[0] : newTermsValues;
    const query: Query = {
      query: `${newTermsField}:${newTermsValue}`,
      language: 'kuery',
    };

    const url =
      discoverLocator?.getRedirectUrl({
        dataViewSpec,
        timeRange,
        query,
      }) || '';

    if (!url) return;

    return <InvestigateAlertInDiscoverAction data-test-subj={TEST_ID} esql={false} url={url} />;
  }
);

InvestigateNewTermsRuleAlertInDiscoverAction.displayName =
  'InvestigateNewTermsRuleAlertInDiscoverAction';
