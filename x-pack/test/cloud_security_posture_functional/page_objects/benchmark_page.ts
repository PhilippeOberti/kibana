/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import {
  ELASTIC_HTTP_VERSION_HEADER,
  X_ELASTIC_INTERNAL_ORIGIN_REQUEST,
} from '@kbn/core-http-common';
import type { FtrProviderContext } from '../ftr_provider_context';

export const CSP_BECNHMARK_TABLE = 'csp_benchmarks_table';

export function BenchmarkPagePageProvider({ getService, getPageObjects }: FtrProviderContext) {
  const testSubjects = getService('testSubjects');
  const PageObjects = getPageObjects(['common', 'header']);
  const retry = getService('retry');
  const supertest = getService('supertest');
  const log = getService('log');

  /**
   * required before indexing findings
   */
  const waitForPluginInitialized = (): Promise<void> =>
    retry.try(async () => {
      log.debug('Check CSP plugin is initialized');
      const response = await supertest
        .get('/internal/cloud_security_posture/status?check=init')
        .set(ELASTIC_HTTP_VERSION_HEADER, '1')
        .set(X_ELASTIC_INTERNAL_ORIGIN_REQUEST, 'kibana')
        .expect(200);
      expect(response.body).to.eql({ isPluginInitialized: true });
      log.debug('CSP plugin is initialized');
    });

  const benchmarkPage = {
    doesBenchmarkTableExists: async () => {
      return await testSubjects.find('csp_benchmarks_table');
    },

    getBenchmarkTableRows: async () => {
      const benchmarkTable = await testSubjects.find(CSP_BECNHMARK_TABLE);
      return await benchmarkTable.findAllByXpath(`//tbody//tr`);
    },

    getCellData: async (row: any, cellDataTestSubj: string) => {
      const cell = await row.findByTestSubject(cellDataTestSubj);
      return await cell.getVisibleText();
    },

    getEvaluatedCellData: async (row: any) => {
      return await benchmarkPage.getCellData(row, 'benchmark-table-column-evaluated');
    },

    getComplianceCellData: async (row: any) => {
      return await benchmarkPage.getCellData(row, 'benchmark-table-column-compliance');
    },

    getCisNameCellData: async (row: any) => {
      return await benchmarkPage.getCellData(row, 'benchmark-table-column-cis-name');
    },
  };

  const navigateToBenchnmarkPage = async (space?: string) => {
    const options = space
      ? {
          basePath: `/s/${space}`,
          shouldUseHashForSubUrl: false,
        }
      : {
          shouldUseHashForSubUrl: false,
        };

    await PageObjects.common.navigateToUrl(
      'securitySolution', // Defined in Security Solution plugin
      `cloud_security_posture/benchmarks/`,
      options
    );
    await PageObjects.header.waitUntilLoadingHasFinished();
  };

  return {
    waitForPluginInitialized,
    navigateToBenchnmarkPage,
    benchmarkPage,
  };
}
