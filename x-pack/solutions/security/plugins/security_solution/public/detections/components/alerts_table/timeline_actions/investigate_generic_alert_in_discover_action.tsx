/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import type { EcsSecurityExtension as Ecs } from '@kbn/securitysolution-ecs';
import type { DiscoverAppLocatorParams } from '@kbn/discover-plugin/common';
import { DISCOVER_APP_LOCATOR } from '@kbn/deeplinks-analytics';
import type { Query, TimeRange } from '@kbn/es-query';
import { isEmpty } from 'lodash';
import type { DataViewSpec } from '@kbn/data-views-plugin/common';
import type { DataProvider } from '../../../../../common/types';
import { useSecurityDefaultPatterns } from '../../../../data_view_manager/hooks/use_security_default_patterns';
import { templateFields } from '../helpers';
import { useRuleTimelineTemplate } from './use_rule_timeline_template';
import { getField } from '../../../../helpers';
import { useKibana } from '../../../../common/lib/kibana';
import { determineToAndFrom } from '../actions';
import { InvestigateAlertInDiscoverAction } from './investigate_alert_in_discover_action';
import { ALERT_RULE_TIMELINE_ID } from '../../../../../common/field_maps/field_names';

const TEST_ID = 'send-generic-alert-to-discover';

/**
 * Convert a single provider to KQL. Returns empty string for invalid/disabled providers.
 */
function providerToKql(provider: DataProvider | undefined): string {
  if (!provider || provider.enabled === false) return '';

  // if provider already contains a raw kqlQuery, use it
  if (provider.kqlQuery && provider.kqlQuery.trim() !== '') {
    return `(${provider.kqlQuery.trim()})`;
  }

  const qm = provider.queryMatch;
  if (!qm || !qm.field || qm.value == null) return '';

  // quote string values; leave numbers/booleans unquoted
  const value =
    typeof qm.value === 'string' ? `"${qm.value.replace(/"/g, '\\"')}"` : String(qm.value);

  const base = `${qm.field}:${value}`;
  const andClauses = provider.and?.map(providerToKql).filter((s) => s && s.length > 0) ?? [];

  if (andClauses.length === 0) return base;
  return `(${[base, ...andClauses].join(' AND ')})`;
}

/**
 * Convert an array of dataProviders into a KQL expression.
 * Top-level providers are joined with " OR ".
 */
export function dataProvidersToKql(providers: DataProvider[] | undefined): string {
  if (!providers || providers.length === 0) return '';

  const clauses = providers.map(providerToKql).filter((s) => s && s.length > 0);

  return clauses.join(' OR ');
}

interface InvestigateGenericAlertInDiscoverActionProps {
  /**
   *
   */
  ecsData: Ecs;
}

/**
 *
 */
export const InvestigateGenericAlertInDiscoverAction = memo(
  ({ ecsData }: InvestigateGenericAlertInDiscoverActionProps) => {
    const {
      services: { share },
    } = useKibana();
    const discoverLocator = share?.url.locators.get<DiscoverAppLocatorParams>(DISCOVER_APP_LOCATOR);

    const ruleTimelineId = getField(ecsData, ALERT_RULE_TIMELINE_ID);
    const timelineTemplateId = !isEmpty(ruleTimelineId)
      ? Array.isArray(ruleTimelineId)
        ? ruleTimelineId[0]
        : ruleTimelineId
      : '';
    const { data: timelineTemplate } = useRuleTimelineTemplate({ timelineTemplateId });

    const { indexPatterns } = useSecurityDefaultPatterns();

    // construct query to pass filters to discover
    let query: Query;
    if (timelineTemplate != null && !isEmpty(timelineTemplate)) {
      query = {
        query: timelineTemplate.kqlQuery?.filterQuery?.kuery?.expression?.trim() || '',
        language: 'kuery',
      };
    } else {
      query = {
        query: `_id:${ecsData?._id}`,
        language: 'kuery',
      };
    }

    // construct filters to update the query to pass to discover
    if (timelineTemplate != null && !isEmpty(timelineTemplate)) {
      timelineTemplate.filters?.forEach((filter) => {
        if (
          filter?.meta?.type === 'phrase' &&
          filter.meta.key != null &&
          templateFields.includes(filter.meta.key)
        ) {
          const newValue = getField(ecsData, filter.meta.key);
          if (newValue.length) {
            query.query += ` AND ${filter.meta.key}:"${newValue[0]}"`;
          }
        } else {
          query.query += ` AND ${filter?.meta?.key}:"${filter.meta?.value}"`;
        }
      });
    }

    // construct dataProviders to update the query to pass to discover
    if (timelineTemplate != null && !isEmpty(timelineTemplate)) {
      const newValue = dataProvidersToKql(timelineTemplate.dataProviders || []);
      if (newValue.length) {
        query.query += ` AND (${newValue})`;
      }
      // timelineTemplate.dataProviders?.forEach((dataProvider) => {
      // const newDataProvider = reformatDataProviderWithNewValue(
      //   dataProvider,
      //   eventData,
      //   timelineType
      // );
      // if (newDataProvider.and != null && !isEmpty(newDataProvider.and)) {
      //   newDataProvider.and = newDataProvider.and.map((andDataProvider) =>
      //     reformatDataProviderWithNewValue(andDataProvider, eventData, timelineType)
      //   );
      // }
      // console.log('dataProvider', dataProvider);
      // });
    }

    // create dataViewSpec to pass list of indices to discover
    let dataViewSpec: DataViewSpec;
    if (timelineTemplate != null && !isEmpty(timelineTemplate)) {
      dataViewSpec = {
        title: timelineTemplate.indexNames?.join(','),
        timeFieldName: '@timestamp',
      };
    } else {
      dataViewSpec = {
        title: indexPatterns.join(','),
        timeFieldName: '@timestamp',
      };
    }

    // construct timeRange to pass from and to values to discover
    const { to, from } = determineToAndFrom({ ecs: ecsData });
    const timeRange: TimeRange = {
      from,
      to,
      mode: 'absolute',
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

InvestigateGenericAlertInDiscoverAction.displayName = 'InvestigateGenericAlertInDiscoverAction';
