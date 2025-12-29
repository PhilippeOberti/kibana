/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { EuiLink } from '@elastic/eui';
import {
  ACTION_INVESTIGATE_IN_DISCOVER,
  ACTION_INVESTIGATE_IN_DISCOVER_ARIA_LABEL,
  ACTION_INVESTIGATE_IN_DISCOVER_WITH_ESQL,
} from '../translations';
import { ActionIconItem } from '../../../../common/components/header_actions/action_icon_item';

// import { useKibana } from '../../../../common/lib/kibana';

interface InvestigateAlertInDiscoverActionProps {
  /**
   *
   */
  esql: boolean;
  /**
   *
   */
  // url: () => string | Promise<string>;
  url: string;
  /**
   *
   */
  ['data-test-subj']?: string;
}

/**
 *
 */
export const InvestigateAlertInDiscoverAction = memo(
  ({ esql, url, 'data-test-subj': dataTestSub }: InvestigateAlertInDiscoverActionProps) => (
    <EuiLink external={false} href={url} target={'_blank'}>
      <ActionIconItem
        ariaLabel={ACTION_INVESTIGATE_IN_DISCOVER_ARIA_LABEL}
        content={esql ? ACTION_INVESTIGATE_IN_DISCOVER_WITH_ESQL : ACTION_INVESTIGATE_IN_DISCOVER}
        dataTestSubj={dataTestSub}
        iconType="discoverApp"
      />
    </EuiLink>
  )
);

InvestigateAlertInDiscoverAction.displayName = 'InvestigateAlertInDiscoverAction';
