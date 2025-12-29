/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import type { EcsSecurityExtension as Ecs } from '@kbn/securitysolution-ecs';
import moment from 'moment';
import type { DiscoverAppLocatorParams } from '@kbn/discover-plugin/common';
import { DISCOVER_APP_LOCATOR } from '@kbn/deeplinks-analytics';
import type { Query, TimeRange } from '@kbn/es-query';
import type { DataViewSpec } from '@kbn/data-views-plugin/common';
import { useKibana } from '../../../../common/lib/kibana';
import { getField } from '../../../../helpers';
import { InvestigateAlertInDiscoverAction } from './investigate_alert_in_discover_action';
import { useRuleAlert } from './use_rule_alert';
import {
  ALERT_ORIGINAL_TIME,
  ALERT_RULE_INDICES,
  ALERT_THRESHOLD_RESULT,
} from '../../../../../common/field_maps/field_names';

const TEST_ID = 'send-threshold-rule-alert-to-discover';

interface InvestigateThresholdRuleAlertInDiscoverActionProps {
  /**
   *
   */
  ecsData: Ecs;
}

/**
 *
 */
export const InvestigateThresholdRuleAlertInDiscoverAction = memo(
  ({ ecsData }: InvestigateThresholdRuleAlertInDiscoverActionProps) => {
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

    const thresholdResult: {
      terms: {
        field: string[];
        value: string[];
      };
      from: string;
    } = getField(ecsData, ALERT_THRESHOLD_RESULT);

    // construct timeRange to pass from and to values to discover
    const originalTimeValue = getField(ecsData, ALERT_ORIGINAL_TIME);
    const normalizedOriginalTimeValue = Array.isArray(originalTimeValue)
      ? originalTimeValue[0]
      : originalTimeValue;
    const originalTime = moment(normalizedOriginalTimeValue);
    const from = Array.isArray(thresholdResult.from)
      ? thresholdResult.from[0]
      : thresholdResult.from;
    const to = originalTime.toISOString();
    const timeRange: TimeRange = {
      from,
      to,
      mode: 'absolute',
    };

    // construct query to pass filters to discover
    const thresholdResultField = Array.isArray(thresholdResult.terms.field)
      ? thresholdResult.terms.field[0]
      : thresholdResult.terms.field;
    const thresholdResultValue = Array.isArray(thresholdResult.terms.value)
      ? thresholdResult.terms.value[0]
      : thresholdResult.terms.value;
    const query: Query = {
      query: `${thresholdResultField}:${thresholdResultValue}`,
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

InvestigateThresholdRuleAlertInDiscoverAction.displayName =
  'InvestigateThresholdRuleAlertInDiscoverAction';
