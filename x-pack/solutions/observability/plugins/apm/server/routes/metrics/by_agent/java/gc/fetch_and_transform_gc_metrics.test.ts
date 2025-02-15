/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { APMConfig } from '../../../../..';
import type { APMEventClient } from '../../../../../lib/helpers/create_es_client/create_apm_event_client';
import type { ChartBase } from '../../../types';

import { fetchAndTransformGcMetrics, TIME, RATE } from './fetch_and_transform_gc_metrics';

describe('fetchAndTransformGcMetrics', () => {
  describe('given "jvm.gc.time"', () => {
    it('converts the value to milliseconds', async () => {
      const chartBase = {} as unknown as ChartBase;
      const response = {
        hits: { total: { value: 1 } },
        aggregations: {
          per_pool: {
            buckets: [
              {
                key: 'Copy',
                doc_count: 30,
                timeseries: {
                  buckets: [
                    {
                      key_as_string: '2021-10-05T16:03:30.000Z',
                      key: 1633449810000,
                      doc_count: 1,
                      max: {
                        value: 23750,
                      },
                      derivative: {
                        value: 11,
                      },
                      value: {
                        value: 11,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      };
      const config = { 'xpack.gc.metricsInterval': 0 } as unknown as APMConfig;
      const apmEventClient = {
        search: () => Promise.resolve(response),
      } as unknown as APMEventClient;

      const { series } = await fetchAndTransformGcMetrics({
        chartBase,
        environment: 'test environment',
        rateOrTime: TIME,
        kuery: '',
        operationName: 'test operation name',
        config,
        apmEventClient,
        serviceName: 'test service name',
        start: 1633456140000,
        end: 1633457078105,
      });

      expect(series[0].data[0].y).toEqual(22000);
    });
  });

  describe('given "jvm.gc.rate"', () => {
    it('does not convert the value to milliseconds', async () => {
      const chartBase = {} as unknown as ChartBase;
      const response = {
        hits: {
          total: {
            value: 62,
          },
        },
        aggregations: {
          per_pool: {
            buckets: [
              {
                key: 'Copy',
                doc_count: 31,
                timeseries: {
                  buckets: [
                    {
                      key_as_string: '2021-10-05T18:01:30.000Z',
                      key: 1633456890000,
                      doc_count: 1,
                      max: {
                        value: 815,
                      },
                      derivative: {
                        value: 4,
                      },
                      value: {
                        value: 4,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      };
      const config = { 'xpack.gc.metricsInterval': 0 } as unknown as APMConfig;
      const apmEventClient = {
        search: () => Promise.resolve(response),
      } as unknown as APMEventClient;

      const { series } = await fetchAndTransformGcMetrics({
        chartBase,
        environment: 'test environment',
        rateOrTime: RATE,
        kuery: '',
        operationName: 'test operation name',
        config,
        apmEventClient,
        serviceName: 'test service name',
        start: 1633456140000,
        end: 1633457078105,
      });

      expect(series[0].data[0].y).toEqual(8);
    });
  });
});
