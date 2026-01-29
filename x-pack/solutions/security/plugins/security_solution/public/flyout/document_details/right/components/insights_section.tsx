/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { EuiSpacer } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { useExpandSection } from '../../../shared/hooks/use_expand_section';
import { CorrelationsOverview } from './correlations_overview';
import { PrevalenceOverview } from './prevalence_overview';
import { ThreatIntelligenceOverview } from './threat_intelligence_overview';
import { INSIGHTS_TEST_ID } from './test_ids';
import { EntitiesOverview } from './entities_overview';
import { ExpandableSection } from '@kbn/flyout-ui';
import type { GetFieldsData } from '../../shared/hooks/use_get_fields_data';
import type { TimelineEventsDetailsItem } from '@kbn/timelines-plugin/common';
import type { BrowserFields } from '@kbn/timelines-plugin/common';
import type { EcsSecurityExtension as Ecs } from '@kbn/securitysolution-ecs';
import { getField } from '../../shared/utils';
import { EventKind } from '../../shared/constants/event_kinds';
import { FLYOUT_STORAGE_KEYS } from '../../shared/constants/local_storage';

const KEY = 'insights';

export interface InsightsSectionProps {
  getFieldsData: GetFieldsData;
  dataFormattedForFieldBrowser: TimelineEventsDetailsItem[];
  isPreviewMode: boolean;
  eventId: string;
  scopeId: string;
  dataAsNestedObject: Ecs;
  isRulePreview: boolean;
  investigationFields: string[];
  browserFields: BrowserFields;
}

/**
 * Insights section under overview tab. It contains entities, threat intelligence, prevalence and correlations.
 */
export const InsightsSection = memo<InsightsSectionProps>(
  ({
    getFieldsData,
    dataFormattedForFieldBrowser,
    isPreviewMode,
    eventId,
    scopeId,
    dataAsNestedObject,
    isRulePreview,
    investigationFields,
    browserFields,
  }) => {
    const eventKind = getField(getFieldsData('event.kind'));

    const expanded = useExpandSection({
      storageKey: FLYOUT_STORAGE_KEYS.OVERVIEW_TAB_EXPANDED_SECTIONS,
      title: KEY,
      defaultValue: false,
    });

    return (
      <ExpandableSection
        expanded={expanded}
        title={
          <FormattedMessage
            id="xpack.securitySolution.flyout.right.insights.sectionTitle"
            defaultMessage="Insights"
          />
        }
        localStorageKey={FLYOUT_STORAGE_KEYS.OVERVIEW_TAB_EXPANDED_SECTIONS}
        sectionId={KEY}
        data-test-subj={INSIGHTS_TEST_ID}
      >
        <EntitiesOverview
          getFieldsData={getFieldsData}
          isPreviewMode={isPreviewMode}
          scopeId={scopeId}
          browserFields={browserFields}
        />
        {eventKind === EventKind.signal && (
          <>
            <EuiSpacer size="s" />
            <ThreatIntelligenceOverview
              dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
              isPreviewMode={isPreviewMode}
            />
          </>
        )}
        <EuiSpacer size="s" />
        <CorrelationsOverview
          eventId={eventId}
          scopeId={scopeId}
          getFieldsData={getFieldsData}
          dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
          dataAsNestedObject={dataAsNestedObject}
          isRulePreview={isRulePreview}
          isPreviewMode={isPreviewMode}
        />
        <EuiSpacer size="s" />
        <PrevalenceOverview
          dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
          investigationFields={investigationFields}
          isPreviewMode={isPreviewMode}
        />
      </ExpandableSection>
    );
  }
);

InsightsSection.displayName = 'InsightsSection';
