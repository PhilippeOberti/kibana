/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { FtrProviderContext } from '../../../ftr_provider_context';

export default function ({ getService, loadTestFile }: FtrProviderContext) {
  const browser = getService('browser');
  const config = getService('config');
  const esNode = config.get('esTestCluster.ccs')
    ? getService('remoteEsArchiver' as 'esArchiver')
    : getService('esArchiver');

  async function loadLogstash() {
    await browser.setWindowSize(1200, 900);
    await esNode.loadIfNeeded(
      'src/platform/test/functional/fixtures/es_archiver/logstash_functional'
    );
  }

  async function unloadLogstash() {
    await esNode.unload('src/platform/test/functional/fixtures/es_archiver/logstash_functional');
  }

  describe('dashboard app - group 3', function () {
    before(loadLogstash);
    after(unloadLogstash);

    if (config.get('esTestCluster.ccs')) {
      loadTestFile(require.resolve('./dashboard_time_picker'));
    } else {
      loadTestFile(require.resolve('./dashboard_time_picker'));
      loadTestFile(require.resolve('./bwc_urls'));
      loadTestFile(require.resolve('./dashboard_state'));
    }
  });
}
