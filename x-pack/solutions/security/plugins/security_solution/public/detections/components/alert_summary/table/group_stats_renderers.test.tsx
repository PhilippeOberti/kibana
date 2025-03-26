/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { groupStatsRenderer } from './group_stats_renderers';

describe('groupStatsRenderer', () => {
  it('should return array of badges for signal.rule.id field', () => {
    const badges = groupStatsRenderer('signal.rule.id', {
      key: '',
      severitiesSubAggregation: { buckets: [{ key: 'medium', doc_count: 10 }] },
      doc_count: 10,
    });

    expect(badges.length).toBe(2);
    expect(
      badges.find(
        (badge) => badge.title === 'Severity:' && badge.component != null && badge.badge == null
      )
    ).toBeTruthy();
    expect(
      badges.find(
        (badge) =>
          badge.title === 'Alerts:' &&
          badge.component == null &&
          badge.badge != null &&
          badge.badge.value === 10
      )
    ).toBeTruthy();
  });

  it('should return array of badges for kibana.alert.severity field', () => {
    const badges = groupStatsRenderer('kibana.alert.severity', {
      key: '',
      doc_count: 2,
    });

    expect(badges.length).toBe(1);
    expect(
      badges.find(
        (badge) =>
          badge.title === 'Alerts:' &&
          badge.component == null &&
          badge.badge != null &&
          badge.badge.value === 2
      )
    ).toBeTruthy();
  });

  it('should return array of badges for kibana.alert.rule.name field', () => {
    const badges = groupStatsRenderer('kibana.alert.rule.name', {
      key: '',
      severitiesSubAggregation: { buckets: [{ key: 'medium', doc_count: 10 }] },
      doc_count: 1,
    });

    expect(badges.length).toBe(2);
    expect(
      badges.find(
        (badge) => badge.title === 'Severity:' && badge.component != null && badge.badge == null
      )
    ).toBeTruthy();
    expect(
      badges.find(
        (badge) =>
          badge.title === 'Alerts:' &&
          badge.component == null &&
          badge.badge != null &&
          badge.badge.value === 1
      )
    ).toBeTruthy();
  });

  it('should return default badges if the field specific does not exist', () => {
    const badges = groupStatsRenderer('process.name', {
      key: '',
      severitiesSubAggregation: { buckets: [{ key: 'medium', doc_count: 10 }] },
      doc_count: 11,
    });

    expect(badges.length).toBe(2);
    expect(
      badges.find(
        (badge) => badge.title === 'Severity:' && badge.component != null && badge.badge == null
      )
    ).toBeTruthy();
    expect(
      badges.find(
        (badge) => badge.title === 'Alerts:' && badge.component == null && badge.badge?.value === 11
      )
    ).toBeTruthy();
  });
});
