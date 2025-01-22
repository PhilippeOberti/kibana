/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import css from '@emotion/react';
import { EuiCodeBlock, EuiFlexGroup, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';

export const ResolverNoProcessEvents = () => (
  <EuiFlexGroup
    data-test-subj="resolver:no-process-events"
    direction="column"
    css={css`
      max-width: 600px;
      margin: 60px auto 0;
    `}
  >
    <EuiTitle>
      <h4>
        {i18n.translate('xpack.securitySolution.resolver.noProcessEvents.title', {
          defaultMessage: 'No Process Events Found',
        })}
      </h4>
    </EuiTitle>
    <EuiSpacer size="m" />
    <EuiText size="s">
      {i18n.translate('xpack.securitySolution.resolver.noProcessEvents.timeRange', {
        defaultMessage: `
            The Analyze Event tool creates graphs based on process events.
            If the analyzed event does not have an associated process in the current time range,
            or stored in Elasticsearch within any time range, a graph will not be created.
            You can check for associated processes by expanding your time range.
          `,
      })}
    </EuiText>
    <EuiSpacer size="m" />
    <EuiText size="s">
      {i18n.translate('xpack.securitySolution.resolver.noProcessEvents.dataView', {
        defaultMessage: `In case you selected a different data view,
          make sure your data view contains all of the indices that are stored in the source event at "{field}".`,
        values: { field: 'kibana.alert.rule.parameters.index' },
      })}
    </EuiText>
    <EuiSpacer size="m" />
    <EuiText size="s">
      {i18n.translate('xpack.securitySolution.resolver.noProcessEvents.eventCategory', {
        defaultMessage: `You may also add the below to your timeline query to check for process events.
            If none are listed, a graph cannot be created from events found in that query.`,
      })}
    </EuiText>
    <EuiSpacer size="m" />
    <EuiCodeBlock
      language="html"
      paddingSize="s"
      isCopyable
      css={css`
        align-self: flex-start;
        display: inline-block;
      `}
    >
      {'event.category: "process"'}
    </EuiCodeBlock>
  </EuiFlexGroup>
);
