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
import { ExpandableSection } from '@kbn/flyout-ui';
import { HighlightedFields } from './highlighted_fields';
import { INVESTIGATION_SECTION_TEST_ID } from './test_ids';
import { InvestigationGuide } from './investigation_guide';
import { getField } from '../../shared/utils';
import { EventKind } from '../../shared/constants/event_kinds';
import type { GetFieldsData } from '../../shared/hooks/use_get_fields_data';
import type { TimelineEventsDetailsItem } from '@kbn/timelines-plugin/common';
import { FLYOUT_STORAGE_KEYS } from '../../shared/constants/local_storage';

const KEY = 'investigation';

export interface InvestigationSectionProps {
  dataFormattedForFieldBrowser: TimelineEventsDetailsItem[];
  getFieldsData: GetFieldsData;
  investigationFields: string[];
  scopeId: string;
  isRulePreview: boolean;
}

/**
 * Second section of the overview tab in details flyout.
 * It contains investigation guide (alerts only) and highlighted fields.
 */
export const InvestigationSection = memo<InvestigationSectionProps>(
  ({
    dataFormattedForFieldBrowser,
    getFieldsData,
    investigationFields,
    scopeId,
    isRulePreview,
  }) => {
    const eventKind = getField(getFieldsData('event.kind'));
    const ancestorIndex = getField(getFieldsData('signal.ancestors.index')) ?? '';

    const expanded = useExpandSection({
      storageKey: FLYOUT_STORAGE_KEYS.OVERVIEW_TAB_EXPANDED_SECTIONS,
      title: KEY,
      defaultValue: true,
    });

    return (
      <ExpandableSection
        expanded={expanded}
        title={
          <FormattedMessage
            id="xpack.securitySolution.flyout.right.investigation.sectionTitle"
            defaultMessage="Investigation"
          />
        }
        localStorageKey={FLYOUT_STORAGE_KEYS.OVERVIEW_TAB_EXPANDED_SECTIONS}
        sectionId={KEY}
        gutterSize="none"
        data-test-subj={INVESTIGATION_SECTION_TEST_ID}
      >
        {eventKind === EventKind.signal && (
          <>
            <InvestigationGuide
              dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
              isRulePreview={isRulePreview}
            />
            <EuiSpacer size="m" />
          </>
        )}
        <HighlightedFields
          dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
          investigationFields={investigationFields}
          scopeId={scopeId}
          showCellActions={true}
          showEditButton={true}
          ancestorsIndexName={ancestorIndex}
        />
      </ExpandableSection>
    );
  }
);

InvestigationSection.displayName = 'InvestigationSection';
