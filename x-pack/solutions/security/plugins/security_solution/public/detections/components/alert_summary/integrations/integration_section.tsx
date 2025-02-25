/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { AddIntegration } from './add_integration';
import { IntegrationBadge } from './integration_badge';
import { mock } from './mock';

/**
 *
 */
export const IntegrationSection = memo(() => {
  const data = mock;
  return (
    <EuiFlexGroup gutterSize="s" alignItems="center">
      {data.map((integration) => (
        <EuiFlexItem grow={false}>
          <IntegrationBadge integration={integration} />
        </EuiFlexItem>
      ))}
      <EuiFlexItem grow={false}>
        <AddIntegration />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
});

IntegrationSection.displayName = 'IntegrationSection';
