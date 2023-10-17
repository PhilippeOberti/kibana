/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui';
import { css } from '@emotion/react';
import { useExpandableFlyoutContext } from '@kbn/expandable-flyout';
import { ALERT_REASON } from '@kbn/rule-data-utils';
import { FormattedMessage } from '@kbn/i18n-react';
import { i18n } from '@kbn/i18n';
import { getField } from '../../shared/utils';
import { AlertReasonPreviewPanel, PreviewPanelKey } from '../../preview';
import {
  REASON_DETAILS_PREVIEW_BUTTON_TEST_ID,
  REASON_DETAILS_TEST_ID,
  REASON_TITLE_TEST_ID,
} from './test_ids';
import { useBasicDataFromDetailsData } from '../../../../timelines/components/side_panel/event_details/helpers';
import { useRightPanelContext } from '../context';
import { defaultRowRenderers } from '../../../../timelines/components/timeline/body/renderers';
import { getRowRenderer } from '../../../../timelines/components/timeline/body/renderers/get_row_renderer';

/**
 * Displays the information provided by the rowRenderer. Supports multiple types of documents.
 */
export const Reason: FC = () => {
  const [showEllipsis, setShowEllipsis] = useState(false);
  const rowRendererElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rowRendererElement) return;

    const { clientHeight, scrollHeight } = rowRendererElement.current!;
    if (scrollHeight > clientHeight) {
      setShowEllipsis(true);
    }
  }, [rowRendererElement]);

  const {
    eventId,
    indexName,
    scopeId,
    dataAsNestedObject,
    dataFormattedForFieldBrowser,
    getFieldsData,
  } = useRightPanelContext();
  const { isAlert } = useBasicDataFromDetailsData(dataFormattedForFieldBrowser);
  const alertReason = getField(getFieldsData(ALERT_REASON));

  const { openPreviewPanel } = useExpandableFlyoutContext();
  const openRulePreview = useCallback(() => {
    openPreviewPanel({
      id: PreviewPanelKey,
      path: { tab: AlertReasonPreviewPanel },
      params: {
        id: eventId,
        indexName,
        scopeId,
        banner: {
          title: (
            <FormattedMessage
              id="xpack.securitySolution.flyout.right.about.reason.alertReasonPreviewTitle"
              defaultMessage="Preview alert reason"
            />
          ),
          backgroundColor: 'warning',
          textColor: 'warning',
        },
      },
    });
  }, [eventId, openPreviewPanel, indexName, scopeId]);

  const viewPreview = useMemo(
    () => (
      <EuiFlexItem grow={false}>
        <EuiButtonEmpty
          size="s"
          iconType="expand"
          onClick={openRulePreview}
          iconSide="right"
          data-test-subj={REASON_DETAILS_PREVIEW_BUTTON_TEST_ID}
          aria-label={i18n.translate(
            'xpack.securitySolution.flyout.right.about.reason.alertReasonButtonAriaLabel',
            {
              defaultMessage: 'Show full reason',
            }
          )}
          disabled={!alertReason}
        >
          <FormattedMessage
            id="xpack.securitySolution.flyout.right.about.reason.alertReasonButtonLabel"
            defaultMessage="Show full reason"
          />
        </EuiButtonEmpty>
      </EuiFlexItem>
    ),
    [alertReason, openRulePreview]
  );

  const renderer = useMemo(
    () =>
      dataAsNestedObject != null
        ? getRowRenderer({ data: dataAsNestedObject, rowRenderers: defaultRowRenderers })
        : null,
    [dataAsNestedObject]
  );

  const alertReasonText =
    alertReason && renderer ? (
      renderer.renderRow({
        contextId: 'event-details',
        data: dataAsNestedObject,
        isDraggable: false,
        scopeId: 'global',
      })
    ) : (
      <FormattedMessage
        id="xpack.securitySolution.flyout.right.about.reason.noReasonDescription"
        defaultMessage="There's no source event information for this alert."
      />
    );

  return (
    <EuiFlexGroup
      direction="column"
      gutterSize="s"
      css={css`
        position: relative;
      `}
    >
      <EuiFlexItem data-test-subj={REASON_TITLE_TEST_ID}>
        <EuiTitle size="xxs">
          <h5>
            {isAlert ? (
              <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                <EuiFlexItem>
                  <h5>
                    <FormattedMessage
                      id="xpack.securitySolution.flyout.right.about.reason.alertReasonTitle"
                      defaultMessage="Alert reason"
                    />
                  </h5>
                </EuiFlexItem>
                {viewPreview}
              </EuiFlexGroup>
            ) : (
              <p>
                <FormattedMessage
                  id="xpack.securitySolution.flyout.right.about.reason.documentReasonTitle"
                  defaultMessage="Document reason"
                />
              </p>
            )}
          </h5>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem data-test-subj={REASON_DETAILS_TEST_ID}>
        <div
          ref={rowRendererElement}
          css={css`
            max-height: 48px; // this correspond to the height of the rule description section showing 3 lines of text
            overflow: hidden;
          `}
        >
          {isAlert ? alertReasonText : '-'}
        </div>
      </EuiFlexItem>
      <p
        css={css`
          position: absolute;
          bottom: 0;
          right: 0;
        `}
      >
        {showEllipsis && '...'}
      </p>
    </EuiFlexGroup>
  );
};

Reason.displayName = 'Reason';
