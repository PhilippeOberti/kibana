/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import indexDetailFixture from './fixtures/index_detail.json';
import indexDetailAdvancedFixture from './fixtures/index_detail_advanced.json';

export default function ({ getService }) {
  const supertest = getService('supertest');
  const esArchiver = getService('esArchiver');

  describe('index detail', () => {
    const archive =
      'x-pack/platform/test/fixtures/es_archives/monitoring/singlecluster_three_nodes_shard_relocation';
    const timeRange = {
      min: '2017-10-05T20:31:48.000Z',
      max: '2017-10-05T20:35:12.000Z',
    };

    before('load archive', () => {
      return esArchiver.load(archive);
    });

    after('unload archive', () => {
      return esArchiver.unload(archive);
    });

    it('should summarize index with chart metrics data for the non-advanced view', async () => {
      const { body } = await supertest
        .post(
          '/api/monitoring/v1/clusters/YCxj-RAgSZCP6GuOQ8M1EQ/elasticsearch/indices/avocado-tweets-2017.10.02'
        )
        .set('kbn-xsrf', 'xxx')
        .send({
          timeRange,
          is_advanced: false,
        })
        .expect(200);

      expect(body).to.eql(indexDetailFixture);
    });

    it('should summarize index with chart metrics data for the advanced view', async () => {
      const { body } = await supertest
        .post(
          '/api/monitoring/v1/clusters/YCxj-RAgSZCP6GuOQ8M1EQ/elasticsearch/indices/avocado-tweets-2017.10.02'
        )
        .set('kbn-xsrf', 'xxx')
        .send({
          timeRange,
          is_advanced: true,
        })
        .expect(200);

      expect(body).to.eql(indexDetailAdvancedFixture);
    });
  });
}
