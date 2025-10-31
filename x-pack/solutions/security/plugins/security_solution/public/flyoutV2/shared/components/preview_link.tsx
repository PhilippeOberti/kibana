/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { FC } from 'react';
import React, { useCallback, useMemo } from 'react';
import { EuiLink } from '@elastic/eui';
import { useFlyoutApi, useFlyoutState } from '@kbn/flyout';
import { FLYOUT_PREVIEW_LINK_TEST_ID } from './test_ids';
import { getPreviewPanelParams } from '../utils/link_utils';

interface PreviewLinkProps {
  /**
   * Field name
   */
  field: string;
  /**
   * Value to display in EuiLink
   */
  value: string;
  /**
   * Scope id to use for the preview panel
   */
  scopeId: string;
  /**
   * Rule id to use for the preview panel
   */
  ruleId?: string;
  /**
   * Optional data-test-subj value
   */
  ['data-test-subj']?: string;
  /**
   * React components to render, if none provided, the value will be rendered
   */
  children?: React.ReactNode;
  /**
   * The indexName to be passed to the flyout preview panel
   * when clicking on "Source event" id
   */
  ancestorsIndexName?: string;
}

/**
 * Renders a link that opens a preview panel
 * If the field is not previewable, the link will not be rendered
 */
export const PreviewLink: FC<PreviewLinkProps> = ({
  field,
  value,
  scopeId,
  ruleId,
  children,
  ancestorsIndexName,
  'data-test-subj': dataTestSubj = FLYOUT_PREVIEW_LINK_TEST_ID,
}) => {
  const { openChildPanel, openFlyout } = useFlyoutApi();
  const panels = useFlyoutState();

  const previewParams = useMemo(
    () =>
      getPreviewPanelParams({
        value,
        field,
        scopeId,
        ruleId,
        ancestorsIndexName,
      }),
    [value, field, scopeId, ruleId, ancestorsIndexName]
  );

  const onClick = useCallback(() => {
    if (previewParams) {
      if (panels.child !== undefined) {
        openFlyout(
          {
            main: panels.child,
            child: {
              id: previewParams.id,
              params: previewParams.params,
            },
          },
          { mainSize: 's', childSize: 's' }
        );
      } else {
        openChildPanel(
          {
            id: previewParams.id,
            params: previewParams.params,
          },
          's'
        );
      }
    }
  }, [openChildPanel, openFlyout, panels.child, previewParams]);

  return previewParams ? (
    <EuiLink onClick={onClick} data-test-subj={dataTestSubj}>
      {children ?? value}
    </EuiLink>
  ) : (
    <>{children ?? value}</>
  );
};
