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
import { AnalyzerPreviewContainer } from './analyzer_preview_container';
import { SessionPreviewContainer } from './session_preview_container';
import { ExpandableSection } from '@kbn/flyout-ui';
import { VISUALIZATIONS_TEST_ID } from './test_ids';
import { GraphPreviewContainer } from './graph_preview_container';
import type { GetFieldsData } from '../../shared/hooks/use_get_fields_data';
import type { TimelineEventsDetailsItem } from '@kbn/timelines-plugin/common';
import type { EcsSecurityExtension as Ecs } from '@kbn/securitysolution-ecs';
import { useGraphPreview } from '../../shared/hooks/use_graph_preview';
import { FLYOUT_STORAGE_KEYS } from '../../shared/constants/local_storage';

const KEY = 'visualizations';

export interface VisualizationsSectionProps {
  dataAsNestedObject: Ecs;
  getFieldsData: GetFieldsData;
  dataFormattedForFieldBrowser: TimelineEventsDetailsItem[];
  eventId: string;
  indexName: string;
  scopeId: string;
  isRulePreview: boolean;
  isPreviewMode: boolean;
}

/**
 * Visualizations section in overview. It contains analyzer preview and session view preview.
 */
export const VisualizationsSection = memo<VisualizationsSectionProps>(
  ({
    dataAsNestedObject,
    getFieldsData,
    dataFormattedForFieldBrowser,
    eventId,
    indexName,
    scopeId,
    isRulePreview,
    isPreviewMode,
  }) => {
    const expanded = useExpandSection({
      storageKey: FLYOUT_STORAGE_KEYS.OVERVIEW_TAB_EXPANDED_SECTIONS,
      title: KEY,
      defaultValue: false,
    });

    // Decide whether to show the graph preview or not
    const { shouldShowGraph } = useGraphPreview({
      getFieldsData,
      ecsData: dataAsNestedObject,
      dataFormattedForFieldBrowser,
    });

    return (
      <ExpandableSection
        expanded={expanded}
        title={
          <FormattedMessage
            id="xpack.securitySolution.flyout.right.visualizations.sectionTitle"
            defaultMessage="Visualizations"
          />
        }
        localStorageKey={FLYOUT_STORAGE_KEYS.OVERVIEW_TAB_EXPANDED_SECTIONS}
        sectionId={KEY}
        data-test-subj={VISUALIZATIONS_TEST_ID}
      >
        <SessionPreviewContainer
          eventId={eventId}
          indexName={indexName}
          scopeId={scopeId}
          getFieldsData={getFieldsData}
          isRulePreview={isRulePreview}
          isPreviewMode={isPreviewMode}
          dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
        />
        <EuiSpacer />
        <AnalyzerPreviewContainer
          eventId={eventId}
          dataAsNestedObject={dataAsNestedObject}
          isRulePreview={isRulePreview}
          indexName={indexName}
          scopeId={scopeId}
          isPreviewMode={isPreviewMode}
          getFieldsData={getFieldsData}
          dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
        />
        {shouldShowGraph && (
          <>
            <EuiSpacer />
            <GraphPreviewContainer
              eventId={eventId}
              dataAsNestedObject={dataAsNestedObject}
              getFieldsData={getFieldsData}
              indexName={indexName}
              scopeId={scopeId}
              isRulePreview={isRulePreview}
              isPreviewMode={isPreviewMode}
              dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
            />
          </>
        )}
      </ExpandableSection>
    );
  }
);

VisualizationsSection.displayName = 'VisualizationsSection';
