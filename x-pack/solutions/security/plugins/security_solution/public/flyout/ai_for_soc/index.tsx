/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { useAIForSOCDetailsContext } from './context';
import { PREFIX } from '../shared/test_ids';
import { FlyoutBody } from '../shared/components/flyout_body';
import { FlyoutNavigation } from '../shared/components/flyout_navigation';
import type { AIForSOCDetailsProps } from './types';
import { PanelFooter } from './footer';
import { FlyoutHeader } from '../shared/components/flyout_header';

export const FLYOUT_BODY_TEST_ID = `${PREFIX}Body` as const;

/**
 * Panel to be displayed in the document details expandable flyout right section
 */
export const AIForSOCPanel: React.FC<Partial<AIForSOCDetailsProps>> = memo(() => {
  const { eventId, indexName } = useAIForSOCDetailsContext();

  return (
    <>
      <FlyoutNavigation flyoutIsExpandable={false} />
      <FlyoutHeader>
        <>{eventId}</>
      </FlyoutHeader>
      <FlyoutBody data-test-subj={FLYOUT_BODY_TEST_ID}>
        <>{indexName}</>
      </FlyoutBody>
      <PanelFooter />
    </>
  );
});
AIForSOCPanel.displayName = 'AIForSOCPanel';
