/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { css } from '@emotion/react';
import { EuiFlexGroup, EuiFlexItem, useEuiTheme } from '@elastic/eui';
import { LAST_SYNCED } from './translations';
import { FormattedRelativePreferenceDate } from '../../../../common/components/formatted_date';
import type { Integration } from './types';

export interface IntegrationProps {
  /**
   *
   */
  integration: Integration;
}

/**
 *
 */
export const IntegrationBadge = memo(({ integration }: IntegrationProps) => {
  const { euiTheme } = useEuiTheme();
  return (
    <EuiFlexGroup
      gutterSize="s"
      css={css`
        padding: ${euiTheme.size.s};
        border: ${euiTheme.border.thin};
        border-radius: ${euiTheme.size.s};
      `}
    >
      <EuiFlexItem>{integration.logo}</EuiFlexItem>
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem>{integration.name}</EuiFlexItem>
        <EuiFlexItem
          css={css`
            color: ${euiTheme.colors.textSubdued};
          `}
        >
          <p>
            {LAST_SYNCED}
            <FormattedRelativePreferenceDate value={integration.lastSynced} />
          </p>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexGroup>
  );
});

IntegrationBadge.displayName = 'IntegrationBadge';
