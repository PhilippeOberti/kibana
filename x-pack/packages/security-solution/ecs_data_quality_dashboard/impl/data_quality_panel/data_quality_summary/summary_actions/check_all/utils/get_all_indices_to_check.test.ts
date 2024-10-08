/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { getAllIndicesToCheck, getIndexToCheck } from './get_all_indices_to_check';

const patternIndexNames: Record<string, string[]> = {
  'packetbeat-*': [
    '.ds-packetbeat-8.6.1-2023.02.04-000001',
    '.ds-packetbeat-8.5.3-2023.02.04-000001',
  ],
  'auditbeat-*': [
    'auditbeat-7.17.9-2023.02.13-000001',
    'auditbeat-custom-index-1',
    '.ds-auditbeat-8.6.1-2023.02.13-000001',
  ],
  'logs-*': [
    '.ds-logs-endpoint.alerts-default-2023.02.24-000001',
    '.ds-logs-endpoint.events.process-default-2023.02.24-000001',
  ],
  'remote:*': [],
  '.alerts-security.alerts-default': ['.internal.alerts-security.alerts-default-000001'],
};

describe('getIndexToCheck', () => {
  test('it returns the expected `IndexToCheck`', () => {
    expect(
      getIndexToCheck({
        indexName: 'auditbeat-custom-index-1',
        pattern: 'auditbeat-*',
      })
    ).toEqual({
      indexName: 'auditbeat-custom-index-1',
      pattern: 'auditbeat-*',
    });
  });
});

describe('getAllIndicesToCheck', () => {
  test('it returns the sorted collection of `IndexToCheck`', () => {
    expect(getAllIndicesToCheck(patternIndexNames)).toEqual([
      {
        indexName: '.internal.alerts-security.alerts-default-000001',
        pattern: '.alerts-security.alerts-default',
      },
      {
        indexName: 'auditbeat-custom-index-1',
        pattern: 'auditbeat-*',
      },
      {
        indexName: 'auditbeat-7.17.9-2023.02.13-000001',
        pattern: 'auditbeat-*',
      },
      {
        indexName: '.ds-auditbeat-8.6.1-2023.02.13-000001',
        pattern: 'auditbeat-*',
      },
      {
        indexName: '.ds-logs-endpoint.events.process-default-2023.02.24-000001',
        pattern: 'logs-*',
      },
      {
        indexName: '.ds-logs-endpoint.alerts-default-2023.02.24-000001',
        pattern: 'logs-*',
      },
      {
        indexName: '.ds-packetbeat-8.6.1-2023.02.04-000001',
        pattern: 'packetbeat-*',
      },
      {
        indexName: '.ds-packetbeat-8.5.3-2023.02.04-000001',
        pattern: 'packetbeat-*',
      },
    ]);
  });
});
