/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { LoadActionPerfOptions } from '@kbn/es-archiver';
import { INTERNAL_ROUTES } from '@kbn/reporting-common';
import type { JobParamsCSV } from '@kbn/reporting-export-types-csv-common';
import type { JobParamsPDFV2 } from '@kbn/reporting-export-types-pdf-common';
import type { JobParamsPNGV2 } from '@kbn/reporting-export-types-png-common';
import {
  REPORTING_DATA_STREAM_WILDCARD,
  REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY,
} from '@kbn/reporting-server';
import rison from '@kbn/rison';
import { ALERTING_CASES_SAVED_OBJECT_INDEX } from '@kbn/core-saved-objects-server';
import { RruleSchedule } from '@kbn/task-manager-plugin/server';
import { FtrProviderContext } from '../ftr_provider_context';

function removeWhitespace(str: string) {
  return str.replace(/\s/g, '');
}

export function createScenarios({ getService }: Pick<FtrProviderContext, 'getService'>) {
  const security = getService('security');
  const esArchiver = getService('esArchiver');
  const log = getService('log');
  const esSupertest = getService('esSupertest');
  const kibanaServer = getService('kibanaServer');
  const supertest = getService('supertest');
  const supertestWithoutAuth = getService('supertestWithoutAuth');
  const retry = getService('retry');

  const ecommerceSOPath = 'x-pack/test/functional/fixtures/kbn_archiver/reporting/ecommerce.json';
  const logsSOPath = 'x-pack/test/functional/fixtures/kbn_archiver/reporting/logs';

  const DATA_ANALYST_USERNAME = 'data_analyst';
  const DATA_ANALYST_PASSWORD = 'data_analyst-password';
  const REPORTING_USER_USERNAME = 'reporting_user';
  const REPORTING_USER_PASSWORD = 'reporting_user-password';
  const REPORTING_ROLE = 'test_reporting_user';
  const MANAGE_REPORTING_USER_USERNAME = 'manage_reporting_user';
  const MANAGE_REPORTING_USER_PASSWORD = 'manage_reporting_user-password';
  const MANAGE_REPORTING_ROLE = 'manage_reporting_role';

  const logTaskManagerHealth = async () => {
    // Check task manager health for analyzing test failures. See https://github.com/elastic/kibana/issues/114946
    const tmHealth = await supertest.get(`/api/task_manager/_health`);
    const driftValues = tmHealth.body?.stats?.runtime?.value;

    log.info(`Task Manager status: "${tmHealth.body?.status}"`);
    log.info(`Task Manager overall drift rankings: "${JSON.stringify(driftValues?.drift)}"`);
    log.info(
      `Task Manager drift rankings for "report:execute": "${JSON.stringify(
        driftValues?.drift_by_type?.['report:execute']
      )}"`
    );
  };

  const initEcommerce = async (
    performance: LoadActionPerfOptions = {
      batchSize: 300,
      concurrency: 1,
    }
  ) => {
    await esArchiver.load('x-pack/platform/test/fixtures/es_archives/reporting/ecommerce', {
      performance,
    });
    await kibanaServer.importExport.load(ecommerceSOPath);
  };
  const teardownEcommerce = async () => {
    await esArchiver.unload('x-pack/platform/test/fixtures/es_archives/reporting/ecommerce');
    await kibanaServer.importExport.unload(ecommerceSOPath);
  };

  const initLogs = async () => {
    await esArchiver.load('x-pack/platform/test/fixtures/es_archives/logstash_functional');
    await kibanaServer.importExport.load(logsSOPath);
  };
  const teardownLogs = async () => {
    await kibanaServer.importExport.unload(logsSOPath);
    await esArchiver.unload('x-pack/platform/test/fixtures/es_archives/logstash_functional');
  };

  const createDataAnalystRole = async () => {
    await security.role.create('data_analyst', {
      metadata: {},
      elasticsearch: {
        cluster: [],
        indices: [
          {
            names: ['ecommerce'],
            privileges: ['read', 'view_index_metadata'],
            allow_restricted_indices: false,
          },
        ],
        run_as: [],
      },
      kibana: [{ base: ['read'], feature: {}, spaces: ['*'] }],
    });
  };

  const createTestReportingUserRole = async () => {
    await security.role.create(REPORTING_ROLE, {
      metadata: {},
      elasticsearch: {
        cluster: [],
        indices: [
          {
            names: ['ecommerce'],
            privileges: ['read', 'view_index_metadata'],
            allow_restricted_indices: false,
          },
        ],
        run_as: [],
      },
      kibana: [
        {
          base: [],
          feature: {
            dashboard: ['minimal_read', 'download_csv_report', 'generate_report'],
            discover: ['minimal_read', 'generate_report'],
            canvas: ['minimal_read', 'generate_report'],
            visualize: ['minimal_read', 'generate_report'],
          },
          spaces: ['*'],
        },
      ],
    });
  };

  const createManageReportingUserRole = async () => {
    await security.role.create(MANAGE_REPORTING_ROLE, {
      metadata: {},
      elasticsearch: {
        cluster: [],
        indices: [
          {
            names: ['ecommerce'],
            privileges: ['read', 'view_index_metadata'],
            allow_restricted_indices: false,
          },
        ],
        run_as: [],
      },
      kibana: [
        {
          base: [],
          feature: {
            manageReporting: ['all'],
            dashboard: ['minimal_read', 'download_csv_report', 'generate_report'],
            discover: ['minimal_read', 'generate_report'],
            canvas: ['minimal_read', 'generate_report'],
            visualize: ['minimal_read', 'generate_report'],
          },
          spaces: ['*'],
        },
      ],
    });
  };

  const createDataAnalyst = async () => {
    await security.user.create('data_analyst', {
      password: 'data_analyst-password',
      roles: ['data_analyst'],
      full_name: 'Data Analyst User',
    });
  };

  const createManageReportingUser = async () => {
    await security.user.create(MANAGE_REPORTING_USER_USERNAME, {
      password: MANAGE_REPORTING_USER_PASSWORD,
      roles: [MANAGE_REPORTING_ROLE],
      full_name: 'Manage Reporting User',
    });
  };

  const createTestReportingUser = async () => {
    await security.user.create(REPORTING_USER_USERNAME, {
      password: REPORTING_USER_PASSWORD,
      roles: [REPORTING_ROLE],
      full_name: 'Reporting User',
    });
  };

  const generatePdf = async (
    username: string,
    password: string,
    job: JobParamsPDFV2,
    spaceId: string = 'default'
  ) => {
    const jobParams = rison.encode(job);
    const spacePrefix = spaceId !== 'default' ? `/s/${spaceId}` : '';
    return await supertestWithoutAuth
      .post(`${spacePrefix}/api/reporting/generate/printablePdfV2`)
      .auth(username, password)
      .set('kbn-xsrf', 'xxx')
      .send({ jobParams });
  };
  const schedulePdf = async (
    username: string,
    password: string,
    job: JobParamsPDFV2,
    schedule: RruleSchedule = { rrule: { freq: 1, interval: 1, tzid: 'UTC' } },
    startedAt?: string
  ) => {
    const jobParams = rison.encode(job);
    const scheduleToUse = startedAt
      ? { rrule: { ...schedule.rrule, dtstart: startedAt } }
      : schedule;
    return await supertestWithoutAuth
      .post(`/internal/reporting/schedule/printablePdfV2`)
      .auth(username, password)
      .set('kbn-xsrf', 'xxx')
      .send({ jobParams, schedule: scheduleToUse });
  };
  const generatePng = async (
    username: string,
    password: string,
    job: JobParamsPNGV2,
    spaceId: string = 'default'
  ) => {
    const jobParams = rison.encode(job);
    const spacePrefix = spaceId !== 'default' ? `/s/${spaceId}` : '';
    return await supertestWithoutAuth
      .post(`${spacePrefix}/api/reporting/generate/pngV2`)
      .auth(username, password)
      .set('kbn-xsrf', 'xxx')
      .send({ jobParams });
  };
  const schedulePng = async (
    username: string,
    password: string,
    job: JobParamsPNGV2,
    schedule: RruleSchedule = { rrule: { freq: 1, interval: 1, tzid: 'UTC' } },
    startedAt?: string
  ) => {
    const jobParams = rison.encode(job);
    const scheduleToUse = startedAt
      ? { rrule: { ...schedule.rrule, dtstart: startedAt } }
      : schedule;
    return await supertestWithoutAuth
      .post(`/internal/reporting/schedule/pngV2`)
      .auth(username, password)
      .set('kbn-xsrf', 'xxx')
      .send({ jobParams, schedule: scheduleToUse });
  };
  const generateCsv = async (
    job: JobParamsCSV,
    username = 'elastic',
    password = process.env.TEST_KIBANA_PASS || 'changeme',
    spaceId: string = 'default'
  ) => {
    const jobParams = rison.encode(job);
    const spacePrefix = spaceId !== 'default' ? `/s/${spaceId}` : '';
    return await supertestWithoutAuth
      .post(`${spacePrefix}/api/reporting/generate/csv_searchsource`)
      .auth(username, password)
      .set('kbn-xsrf', 'xxx')
      .send({ jobParams });
  };
  const scheduleCsv = async (
    job: JobParamsCSV,
    username = 'elastic',
    password = process.env.TEST_KIBANA_PASS || 'changeme',
    schedule: RruleSchedule = { rrule: { freq: 1, interval: 1, tzid: 'UTC' } },
    startedAt?: string
  ) => {
    const jobParams = rison.encode(job);
    const scheduleToUse = startedAt
      ? { rrule: { ...schedule.rrule, dtstart: startedAt } }
      : schedule;
    return await supertestWithoutAuth
      .post(`/internal/reporting/schedule/csv_searchsource`)
      .auth(username, password)
      .set('kbn-xsrf', 'xxx')
      .send({ jobParams, schedule: scheduleToUse });
  };

  const listScheduledReports = async (
    username = 'elastic',
    password = process.env.TEST_KIBANA_PASS || 'changeme'
  ) => {
    const res = await supertestWithoutAuth
      .get(INTERNAL_ROUTES.SCHEDULED.LIST)
      .auth(username, password)
      .set('kbn-xsrf', 'xxx');

    return res.body;
  };

  const disableScheduledReports = async (
    ids: string[],
    username = 'elastic',
    password = process.env.TEST_KIBANA_PASS || 'changeme'
  ) => {
    const { body } = await supertestWithoutAuth
      .patch(INTERNAL_ROUTES.SCHEDULED.BULK_DISABLE)
      .auth(username, password)
      .set('kbn-xsrf', 'xxx')
      .send({ ids })
      .expect(200);
    return body;
  };

  const postJob = async (
    apiPath: string,
    username = 'elastic',
    password = process.env.TEST_KIBANA_PASS || 'changeme'
  ): Promise<string> => {
    log.debug(`ReportingAPI.postJob(${apiPath})`);
    const { body } = await supertestWithoutAuth
      .post(removeWhitespace(apiPath))
      .auth(username, password)
      .set('kbn-xsrf', 'xxx')
      .expect(200);
    return body.path;
  };

  const postJobJSON = async (apiPath: string, jobJSON: object = {}): Promise<string> => {
    log.debug(`ReportingAPI.postJobJSON((${apiPath}): ${JSON.stringify(jobJSON)})`);
    const { body } = await supertest.post(apiPath).set('kbn-xsrf', 'xxx').send(jobJSON).expect(200);
    return body.path;
  };

  const getCompletedJobOutput = async (downloadReportPath: string) => {
    const response = await supertest.get(downloadReportPath);
    return response.text as unknown;
  };

  const getJobErrorCode = async (
    id: string,
    username = 'elastic',
    password = process.env.TEST_KIBANA_PASS || 'changeme'
  ): Promise<undefined | string> => {
    const {
      body: [job],
    } = await supertestWithoutAuth
      .get(`${INTERNAL_ROUTES.JOBS.LIST}?page=0&ids=${id}`)
      .auth(username, password)
      .set('kbn-xsrf', 'xxx')
      .expect(200);
    return job?.output?.error_code;
  };

  const listReports = async (
    username = 'elastic',
    password = process.env.TEST_KIBANA_PASS || 'changeme',
    spaceId: string = 'default'
  ) => {
    const spacePrefix = spaceId !== 'default' ? `/s/${spaceId}` : '';
    return await supertestWithoutAuth
      .get(`${spacePrefix}${INTERNAL_ROUTES.JOBS.LIST}?page=0`)
      .auth(username, password)
      .set('kbn-xsrf', 'xxx')
      .send()
      .expect(200);
  };

  const deleteAllReports = async () => {
    log.debug('ReportingAPI.deleteAllReports');

    // ignores 409 errs and keeps retrying
    await retry.tryForTime(5000, async () => {
      await esSupertest
        .post(`/${REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY}/_delete_by_query`)
        .send({ query: { match_all: {} } })
        .expect(200);
    });
  };

  const checkIlmMigrationStatus = async (username: string, password: string) => {
    log.debug('ReportingAPI.checkIlmMigrationStatus');
    const { body } = await supertestWithoutAuth
      .get(INTERNAL_ROUTES.MIGRATE.GET_ILM_POLICY_STATUS)
      .auth(username, password)
      .set('kbn-xsrf', 'xxx')
      .expect(200);
    return body.status;
  };

  const migrateReportingIndices = async (username: string, password: string) => {
    log.debug('ReportingAPI.migrateReportingIndices');
    try {
      await supertestWithoutAuth
        .put(INTERNAL_ROUTES.MIGRATE.MIGRATE_ILM_POLICY)
        .auth(username, password)
        .set('kbn-xsrf', 'xxx')
        .expect(200);
    } catch (err) {
      log.error(`Could not migrate Reporting indices!`);
      log.error(err);
      throw err;
    }
  };

  const makeAllReportingIndicesUnmanaged = async () => {
    log.debug('ReportingAPI.makeAllReportingIndicesUnmanaged');
    const settings = {
      'index.lifecycle.name': null,
    };
    await esSupertest
      .put(`/${REPORTING_DATA_STREAM_WILDCARD}/_settings`)
      .send({
        settings,
      })
      .expect(200);
  };

  const getScheduledReports = async (id: string) => {
    return await esSupertest.get(
      `/${ALERTING_CASES_SAVED_OBJECT_INDEX}/_doc/scheduled_report:${id}`
    );
  };

  const deleteScheduledReports = async (ids: string[]) => {
    return await Promise.all(
      ids.map((id) =>
        esSupertest.delete(`/${ALERTING_CASES_SAVED_OBJECT_INDEX}/_doc/scheduled_report:${id}`)
      )
    );
  };

  const getTask = async (taskId: string) => {
    return await esSupertest.get(`/.kibana_task_manager/_doc/task:${taskId}`);
  };

  const deleteTasks = async (ids: string[]) => {
    return await Promise.all(
      ids.map((id) => esSupertest.delete(`/.kibana_task_manager/_doc/task:${id}`))
    );
  };

  return {
    logTaskManagerHealth,
    initEcommerce,
    teardownEcommerce,
    initLogs,
    teardownLogs,
    DATA_ANALYST_USERNAME,
    DATA_ANALYST_PASSWORD,
    REPORTING_USER_USERNAME,
    REPORTING_USER_PASSWORD,
    REPORTING_ROLE,
    MANAGE_REPORTING_USER_USERNAME,
    MANAGE_REPORTING_USER_PASSWORD,
    MANAGE_REPORTING_ROLE,
    createDataAnalystRole,
    createDataAnalyst,
    createTestReportingUserRole,
    createTestReportingUser,
    createManageReportingUserRole,
    createManageReportingUser,
    generatePdf,
    generatePng,
    generateCsv,
    schedulePdf,
    schedulePng,
    scheduleCsv,
    listReports,
    postJob,
    postJobJSON,
    getCompletedJobOutput,
    deleteAllReports,
    checkIlmMigrationStatus,
    migrateReportingIndices,
    makeAllReportingIndicesUnmanaged,
    getJobErrorCode,
    getScheduledReports,
    deleteScheduledReports,
    getTask,
    deleteTasks,
    listScheduledReports,
    disableScheduledReports,
  };
}
