/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer } from '@elastic/eui';
import { ALERT_WORKFLOW_ASSIGNEE_IDS } from '@kbn/rule-data-utils';
import { FormattedMessage } from '@kbn/i18n-react';
import { Notes } from './notes';
import { useRuleDetailsLink } from '../../shared/hooks/use_rule_details_link';
import { DocumentStatus } from './status';
import { DocumentSeverity } from './severity';
import { RiskScore } from './risk_score';
import { useRefetchByScope } from '../hooks/use_refetch_by_scope';
import { useBasicDataFromDetailsData } from '../../shared/hooks/use_basic_data_from_details_data';
import type { GetFieldsData } from '../../shared/hooks/use_get_fields_data';
import type { TimelineEventsDetailsItem } from '@kbn/timelines-plugin/common';
import type { BrowserFields } from '@kbn/timelines-plugin/common';
import { PreferenceFormattedDate } from '../../../../common/components/formatted_date';
import {
  ALERT_SUMMARY_PANEL_TEST_ID,
  ASSIGNEES_TITLE_TEST_ID,
  FLYOUT_ALERT_HEADER_TITLE_TEST_ID,
  RISK_SCORE_TITLE_TEST_ID,
} from './test_ids';
import { Assignees } from './assignees';
import { FlyoutTitle, AlertHeaderBlock } from '@kbn/flyout-ui';
import { getAlertTitle } from '../../shared/utils';

// minWidth for each block, allows to switch for a 1 row 4 blocks to 2 rows with 2 block each
const blockStyles = {
  minWidth: 280,
};

export interface AlertHeaderTitleProps {
  eventId: string;
  dataFormattedForFieldBrowser: TimelineEventsDetailsItem[];
  scopeId: string;
  isRulePreview: boolean;
  refetchFlyoutData: () => Promise<void>;
  getFieldsData: GetFieldsData;
  browserFields: BrowserFields;
}

/**
 * Alert details flyout right section header
 */
export const AlertHeaderTitle = memo<AlertHeaderTitleProps>(
  ({
    eventId,
    dataFormattedForFieldBrowser,
    scopeId,
    isRulePreview,
    refetchFlyoutData,
    getFieldsData,
    browserFields,
  }) => {
    const { ruleName, timestamp, ruleId } =
      useBasicDataFromDetailsData(dataFormattedForFieldBrowser);
  const title = useMemo(() => getAlertTitle({ ruleName }), [ruleName]);
  const href = useRuleDetailsLink({ ruleId: !isRulePreview ? ruleId : null });
  const ruleTitle = useMemo(
    () =>
      href ? (
        <EuiLink href={href} target="_blank" external={false}>
          <FlyoutTitle
            title={title}
            iconType={'warning'}
            isLink
            data-test-subj={FLYOUT_ALERT_HEADER_TITLE_TEST_ID}
          />
        </EuiLink>
      ) : (
        <FlyoutTitle
          title={title}
          iconType={'warning'}
          data-test-subj={FLYOUT_ALERT_HEADER_TITLE_TEST_ID}
        />
      ),
    [title, href]
  );

  const { refetch } = useRefetchByScope({ scopeId });
  const alertAssignees = useMemo(
    () => (getFieldsData(ALERT_WORKFLOW_ASSIGNEE_IDS) as string[]) ?? [],
    [getFieldsData]
  );
  const onAssigneesUpdated = useCallback(() => {
    refetch();
    refetchFlyoutData();
  }, [refetch, refetchFlyoutData]);

  const riskScore = useMemo(
    () => (
      <AlertHeaderBlock
        hasBorder
        title={
          <FormattedMessage
            id="xpack.securitySolution.flyout.right.header.riskScoreTitle"
            defaultMessage="Risk score"
          />
        }
        data-test-subj={RISK_SCORE_TITLE_TEST_ID}
      >
        <RiskScore getFieldsData={getFieldsData} />
      </AlertHeaderBlock>
    ),
    [getFieldsData]
  );

  const assignees = useMemo(
    () => (
      <AlertHeaderBlock
        hasBorder
        title={
          <FormattedMessage
            id="xpack.securitySolution.flyout.right.header.assignedTitle"
            defaultMessage="Assignees"
          />
        }
        data-test-subj={ASSIGNEES_TITLE_TEST_ID}
      >
        <Assignees
          eventId={eventId}
          assignedUserIds={alertAssignees}
          onAssigneesUpdated={onAssigneesUpdated}
          showAssignees={!isRulePreview}
        />
      </AlertHeaderBlock>
    ),
    [alertAssignees, eventId, isRulePreview, onAssigneesUpdated]
  );

  return (
    <>
      <DocumentSeverity getFieldsData={getFieldsData} />
      <EuiSpacer size="m" />
      {timestamp && <PreferenceFormattedDate value={new Date(timestamp)} />}
      <EuiSpacer size="xs" />
      {ruleTitle}
      <EuiSpacer size="m" />
      <EuiFlexGroup
        direction="row"
        gutterSize="s"
        responsive={false}
        wrap
        data-test-subj={ALERT_SUMMARY_PANEL_TEST_ID}
      >
        <EuiFlexItem css={blockStyles}>
          <EuiFlexGroup direction="row" gutterSize="s" responsive={false}>
            <EuiFlexItem>
              <DocumentStatus
                eventId={eventId}
                browserFields={browserFields}
                dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
                scopeId={scopeId}
                isRulePreview={isRulePreview}
              />
            </EuiFlexItem>
            <EuiFlexItem>{riskScore}</EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem css={blockStyles}>
          <EuiFlexGroup direction="row" gutterSize="s" responsive={false}>
            <EuiFlexItem>{assignees}</EuiFlexItem>
            <EuiFlexItem>
              <Notes eventId={eventId} isRulePreview={isRulePreview} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
  }
);

AlertHeaderTitle.displayName = 'AlertHeaderTitle';
