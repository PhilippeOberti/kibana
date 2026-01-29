/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { EuiHorizontalRule, EuiPanel } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import type { BrowserFields, TimelineEventsDetailsItem } from '@kbn/timelines-plugin/common';
import type { EcsSecurityExtension as Ecs } from '@kbn/securitysolution-ecs';
import type { SearchHit } from '../../../../../common/search_strategy';
import type { GetFieldsData } from '../../shared/hooks/use_get_fields_data';
import { ResponseSection } from '../components/response_section';
import { InvestigationSection } from '../components/investigation_section';
import { AboutSection } from '../components/about_section';
import { InsightsSection } from '../components/insights_section';
import { VisualizationsSection } from '../components/visualizations_section';

export interface OverviewTabProps {
  eventId: string;
  indexName: string;
  scopeId: string;
  getFieldsData: GetFieldsData;
  dataFormattedForFieldBrowser: TimelineEventsDetailsItem[];
  dataAsNestedObject: Ecs;
  searchHit: SearchHit;
  isRulePreview: boolean;
  isPreviewMode: boolean;
  investigationFields: string[];
  browserFields: BrowserFields;
}

/**
 * Overview view displayed in the document details expandable flyout right section
 */
export const OverviewTab = memo<OverviewTabProps>(
  ({
    eventId,
    indexName,
    scopeId,
    getFieldsData,
    dataFormattedForFieldBrowser,
    dataAsNestedObject,
    searchHit,
    isRulePreview,
    isPreviewMode,
    investigationFields,
    browserFields,
  }) => {
    return (
      <EuiPanel
        hasBorder={false}
        hasShadow={false}
        paddingSize="none"
        aria-label={i18n.translate(
          'xpack.securitySolution.flyout.right.overview.overviewContentAriaLabel',
          { defaultMessage: 'Overview' }
        )}
      >
        <AboutSection
          getFieldsData={getFieldsData}
          dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
          scopeId={scopeId}
          isRulePreview={isRulePreview}
          searchHit={searchHit}
          dataAsNestedObject={dataAsNestedObject}
          eventId={eventId}
          indexName={indexName}
        />
        <EuiHorizontalRule margin="m" />
        <InvestigationSection
          dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
          getFieldsData={getFieldsData}
          investigationFields={investigationFields}
          scopeId={scopeId}
          isRulePreview={isRulePreview}
        />
        <EuiHorizontalRule margin="m" />
        <VisualizationsSection
          dataAsNestedObject={dataAsNestedObject}
          getFieldsData={getFieldsData}
          dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
          eventId={eventId}
          indexName={indexName}
          scopeId={scopeId}
          isRulePreview={isRulePreview}
          isPreviewMode={isPreviewMode}
        />
        <EuiHorizontalRule margin="m" />
        <InsightsSection
          getFieldsData={getFieldsData}
          dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
          isPreviewMode={isPreviewMode}
          eventId={eventId}
          scopeId={scopeId}
          dataAsNestedObject={dataAsNestedObject}
          isRulePreview={isRulePreview}
          investigationFields={investigationFields}
          browserFields={browserFields}
        />
        <EuiHorizontalRule margin="m" />
        <ResponseSection isRulePreview={isRulePreview} getFieldsData={getFieldsData} />
      </EuiPanel>
    );
  }
);

OverviewTab.displayName = 'OverviewTab';
