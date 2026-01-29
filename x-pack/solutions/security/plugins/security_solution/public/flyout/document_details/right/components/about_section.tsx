/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo } from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import { i18n } from '@kbn/i18n';
import type { TimelineEventsDetailsItem } from '@kbn/timelines-plugin/common';
import type { EcsSecurityExtension as Ecs } from '@kbn/securitysolution-ecs';
import { isEmpty } from 'lodash';
import { useExpandableFlyoutApi } from '@kbn/expandable-flyout';
import { AlertDescription, MitreAttack, Reason } from '@kbn/security-solution-flyout';
import {
  buildDataTableRecord,
  type DataTableRecord,
  type EsHitRecord,
  getFieldValue,
} from '@kbn/discover-utils';
import { ExpandableSection } from '@kbn/flyout-ui';
import { useBasicDataFromDetailsData } from '../../shared/hooks/use_basic_data_from_details_data';
import { useExpandSection } from '../../../shared/hooks/use_expand_section';
import { useKibana } from '../../../../common/lib/kibana';
import { useUserPrivileges } from '../../../../common/components/user_privileges';
import { RULE_PREVIEW_BANNER, RulePreviewPanelKey } from '../../../rule_details/right';
import { DocumentDetailsAlertReasonPanelKey } from '../../shared/constants/panel_keys';
import { DocumentEventTypes } from '../../../../common/lib/telemetry';
import { ABOUT_SECTION_TEST_ID } from './test_ids';
import { EventKind } from '../../shared/constants/event_kinds';
import type { GetFieldsData } from '../../shared/hooks/use_get_fields_data';
import type { SearchHit } from '../../../../../common/search_strategy';
import { isEcsAllowedValue } from '../utils/event_utils';
import { EventCategoryDescription } from './event_category_description';
import { EventKindDescription } from './event_kind_description';
import { EventRenderer } from './event_renderer';
import { AlertStatus } from './alert_status';
import { FLYOUT_STORAGE_KEYS } from '../../shared/constants/local_storage';

const KEY = 'about';

export interface AboutSectionProps {
  getFieldsData: GetFieldsData;
  dataFormattedForFieldBrowser: TimelineEventsDetailsItem[];
  scopeId: string;
  isRulePreview: boolean;
  searchHit: SearchHit;
  dataAsNestedObject: Ecs;
  eventId: string;
  indexName: string;
}

/**
 * Most top section of the overview tab.
 * For alerts (event.kind is signal), it contains the description, reason and mitre attack information.
 * For generic events (event.kind is event), it shows the event category description and event renderer.
 * For all other events, it shows the event kind description, a list of event categories and event renderer.
 */
export const AboutSection = memo<AboutSectionProps>(
  ({
    getFieldsData,
    dataFormattedForFieldBrowser,
    scopeId,
    isRulePreview,
    searchHit,
    dataAsNestedObject,
    eventId,
    indexName,
  }) => {
    const hit: DataTableRecord = useMemo(
      () => buildDataTableRecord(searchHit as EsHitRecord),
      [searchHit]
    );

    const eventKind = useMemo(() => getFieldValue(hit, 'event.kind') as string, [hit]);
    const eventKindInECS = eventKind && isEcsAllowedValue('event.kind', eventKind);

    const { telemetry } = useKibana().services;
    const { rulesPrivileges } = useUserPrivileges();
    const { openPreviewPanel } = useExpandableFlyoutApi();
    const { ruleId, ruleName } = useBasicDataFromDetailsData(dataFormattedForFieldBrowser);

    const expanded = useExpandSection({
      storageKey: FLYOUT_STORAGE_KEYS.OVERVIEW_TAB_EXPANDED_SECTIONS,
      title: KEY,
      defaultValue: true,
    });

    const ruleSummaryDisabled =
      isEmpty(ruleName) || isEmpty(ruleId) || isRulePreview || !rulesPrivileges?.read;

    const openRulePreview = useCallback(() => {
      openPreviewPanel({
        id: RulePreviewPanelKey,
        params: {
          ruleId,
          banner: RULE_PREVIEW_BANNER,
          isPreviewMode: true,
        },
      });
      telemetry.reportEvent(DocumentEventTypes.DetailsFlyoutOpened, {
        location: scopeId,
        panel: 'preview',
      });
    }, [openPreviewPanel, scopeId, ruleId, telemetry]);

    const alertReasonBanner = useMemo(
      () => ({
        title: i18n.translate(
          'xpack.securitySolution.flyout.right.about.reason.alertReasonPreviewTitle',
          { defaultMessage: 'Preview alert reason' }
        ),
        backgroundColor: 'warning',
        textColor: 'warning',
      }),
      []
    );

    const openReason = useCallback(() => {
      openPreviewPanel({
        id: DocumentDetailsAlertReasonPanelKey,
        params: {
          id: eventId,
          indexName,
          scopeId,
          banner: alertReasonBanner,
        },
      });
      telemetry.reportEvent(DocumentEventTypes.DetailsFlyoutOpened, {
        location: scopeId,
        panel: 'preview',
      });
    }, [openPreviewPanel, eventId, indexName, scopeId, alertReasonBanner, telemetry]);

    const content =
      eventKind === EventKind.signal ? (
        <>
          <AlertDescription
            hit={hit}
            onShowRuleSummary={openRulePreview}
            ruleSummaryDisabled={ruleSummaryDisabled}
          />
          <Reason hit={hit} onOpenReason={openReason} />
          <MitreAttack hit={hit} />
          <AlertStatus getFieldsData={getFieldsData} />
        </>
      ) : (
        <>
          {eventKindInECS &&
            (eventKind === 'event' ? (
              <EventCategoryDescription getFieldsData={getFieldsData} />
            ) : (
              <EventKindDescription eventKind={eventKind} getFieldsData={getFieldsData} />
            ))}
          <EventRenderer dataAsNestedObject={dataAsNestedObject} scopeId={scopeId} />
        </>
      );

    return (
      <ExpandableSection
        expanded={expanded}
        title={
          <FormattedMessage
            id="xpack.securitySolution.flyout.right.about.sectionTitle"
            defaultMessage="About"
          />
        }
        localStorageKey={FLYOUT_STORAGE_KEYS.OVERVIEW_TAB_EXPANDED_SECTIONS}
        sectionId={KEY}
        gutterSize="s"
        data-test-subj={ABOUT_SECTION_TEST_ID}
      >
        {content}
      </ExpandableSection>
    );
  }
);

AboutSection.displayName = 'AboutSection';
