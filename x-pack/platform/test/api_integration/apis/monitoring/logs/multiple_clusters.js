/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import multipleClustersFixture from './fixtures/multiple_clusters.json';

export default function ({ getService }) {
  const supertest = getService('supertest');
  const esArchiver = getService('esArchiver');

  describe('multiple cluster', () => {
    const archive = 'x-pack/platform/test/fixtures/es_archives/monitoring/logs_multiple_clusters';
    const timeRange = {
      min: '2019-08-23T14:14:31.686Z',
      max: '2019-08-23T15:14:31.686Z',
    };
    const codePaths = ['logs'];

    before('load archive', () => {
      return esArchiver.load(archive);
    });

    after('unload archive', () => {
      return esArchiver.unload(archive);
    });

    it('should not find any logs for cluster B when the logs were sent to cluster A', async () => {
      const { body } = await supertest
        .post('/api/monitoring/v1/clusters/yrpCVAZcSYW68_pAYTeKuw')
        .set('kbn-xsrf', 'xxx')
        .send({ timeRange, codePaths })
        .expect(200);

      expect(body[0].elasticsearch.logs).to.eql(multipleClustersFixture);
    });
  });
}
