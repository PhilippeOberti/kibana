/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { Logger } from '@kbn/core/server';
import { eqlSearchStrategyProvider } from './eql_search_strategy';
import { SearchStrategyDependencies } from '../../types';
import { EqlSearchStrategyRequest } from '../../../../common';
import { firstValueFrom } from 'rxjs';
import { getMockSearchConfig } from '../../../../config.mock';

const getMockEqlResponse = () => ({
  body: {
    id: 'my-search-id',
    is_partial: false,
    is_running: false,
    took: 162,
    timed_out: false,
    hits: {
      total: {
        value: 1,
        relation: 'eq',
      },
      sequences: [],
    },
  },
  meta: {},
  statusCode: 200,
});

describe('EQL search strategy', () => {
  let mockLogger: Logger;
  const mockSearchConfig = getMockSearchConfig({});

  beforeEach(() => {
    mockLogger = { debug: jest.fn() } as unknown as Logger;
  });

  describe('strategy interface', () => {
    it('returns a strategy with a `search` function', async () => {
      const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
      expect(typeof eqlSearch.search).toBe('function');
    });

    it('returns a strategy with a `cancel` function', async () => {
      const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
      expect(typeof eqlSearch.cancel).toBe('function');
    });
  });

  describe('search()', () => {
    let mockEqlSearch: jest.Mock;
    let mockEqlGet: jest.Mock;
    let mockEqlDelete: jest.Mock;
    let mockDeps: SearchStrategyDependencies;
    let params: Required<EqlSearchStrategyRequest>['params'];
    let options: Required<EqlSearchStrategyRequest>['options'];

    beforeEach(() => {
      mockEqlSearch = jest.fn().mockResolvedValueOnce(getMockEqlResponse());
      mockEqlGet = jest.fn().mockResolvedValueOnce(getMockEqlResponse());
      mockEqlDelete = jest.fn();

      mockDeps = {
        uiSettingsClient: {
          get: jest.fn(),
        },
        esClient: {
          asCurrentUser: {
            eql: {
              get: mockEqlGet,
              search: mockEqlSearch,
              delete: mockEqlDelete,
            },
          },
        },
      } as unknown as SearchStrategyDependencies;
      params = {
        index: 'logstash-*',
        query: 'process where 1 == 1',
      };
      options = { ignore: [400] };
    });

    describe('async functionality', () => {
      it('performs an eql client search with params when no ID is provided', async () => {
        const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        await eqlSearch.search({ options, params }, {}, mockDeps).toPromise();
        const [[request, requestOptions]] = mockEqlSearch.mock.calls;

        expect(request).toEqual({
          query: 'process where 1 == 1',
          ignore_unavailable: true,
          index: 'logstash-*',
          keep_alive: '60000ms',
          max_concurrent_shard_requests: undefined,
          wait_for_completion_timeout: '100ms',
        });
        expect(requestOptions).toEqual({ ignore: [400], meta: true, signal: undefined });
      });

      it('retrieves the current request if an id is provided', async () => {
        const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        await eqlSearch.search({ id: 'my-search-id' }, {}, mockDeps).toPromise();
        const [[requestParams]] = mockEqlGet.mock.calls;

        expect(mockEqlSearch).not.toHaveBeenCalled();
        expect(requestParams).toEqual({
          id: 'my-search-id',
          keep_alive: '60000ms',
          wait_for_completion_timeout: '100ms',
        });
      });

      it('emits an error if the client throws', async () => {
        expect.assertions(1);
        mockEqlSearch.mockReset().mockRejectedValueOnce(new Error('client error'));
        const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        eqlSearch.search({ options, params }, {}, mockDeps).subscribe(
          () => {},
          (err) => {
            expect(err).toEqual(new Error('client error'));
          }
        );
      });
    });

    it('should delete when aborted', async () => {
      const response = getMockEqlResponse();
      mockEqlSearch.mockReset().mockResolvedValueOnce({
        ...response,
        body: {
          ...response.body,
          is_running: true,
        },
      });
      const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
      const abortController = new AbortController();
      const abortSignal = abortController.signal;

      // Abort after an incomplete first response is returned
      setTimeout(() => abortController.abort(), 100);

      let err: any;
      try {
        await eqlSearch.search({ options, params }, { abortSignal }, mockDeps).toPromise();
      } catch (e) {
        err = e;
      }

      expect(mockEqlSearch).toBeCalled();
      expect(err).not.toBeUndefined();
      expect(mockEqlDelete).toBeCalled();
    });

    describe('arguments', () => {
      it('sends along async search options', async () => {
        const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        await eqlSearch.search({ options, params }, {}, mockDeps).toPromise();
        const [[request]] = mockEqlSearch.mock.calls;

        expect(request).toEqual(
          expect.objectContaining({
            wait_for_completion_timeout: '100ms',
          })
        );
      });

      it('sends along default search parameters', async () => {
        const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        await eqlSearch.search({ options, params }, {}, mockDeps).toPromise();
        const [[request]] = mockEqlSearch.mock.calls;

        expect(request).toEqual(
          expect.objectContaining({
            ignore_unavailable: true,
          })
        );
      });

      it('allows search parameters to be overridden', async () => {
        const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        await eqlSearch
          .search(
            {
              options,
              params: {
                ...params,
                wait_for_completion_timeout: '5ms',
                keep_on_completion: false,
              },
            },
            {},
            mockDeps
          )
          .toPromise();
        const [[request]] = mockEqlSearch.mock.calls;

        expect(request).toEqual(
          expect.objectContaining({
            wait_for_completion_timeout: '5ms',
            keep_on_completion: false,
          })
        );
      });

      it('allows search options to be overridden', async () => {
        const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        await eqlSearch
          .search(
            {
              options: { ...options, maxRetries: 2, ignore: [300] },
              params,
            },
            {},
            mockDeps
          )
          .toPromise();
        const [[, requestOptions]] = mockEqlSearch.mock.calls;

        expect(requestOptions).toEqual(
          expect.objectContaining({
            maxRetries: 2,
            ignore: [300],
          })
        );
      });

      it('passes (deprecated) transport options for an existing request', async () => {
        const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        await eqlSearch
          .search({ id: 'my-search-id', options: { ignore: [400] } }, {}, mockDeps)
          .toPromise();
        const [[, requestOptions]] = mockEqlGet.mock.calls;

        expect(mockEqlSearch).not.toHaveBeenCalled();
        expect(requestOptions).toEqual(expect.objectContaining({ ignore: [400] }));
      });

      it('passes abort signal', async () => {
        const eqlSearch = eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        const eql: EqlSearchStrategyRequest = { id: 'my-search-id' };
        const abortController = new AbortController();
        await firstValueFrom(
          eqlSearch.search(eql, { abortSignal: abortController.signal }, mockDeps)
        );
        const [[_params, requestOptions]] = mockEqlGet.mock.calls;

        expect(requestOptions).toEqual({ meta: true, signal: expect.any(AbortSignal) });
      });

      it('passes transport options for search with id', async () => {
        const eqlSearch = eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        const eql: EqlSearchStrategyRequest = { id: 'my-search-id' };
        await firstValueFrom(
          eqlSearch.search(eql, { transport: { maxResponseSize: 13131313 } }, mockDeps)
        );
        const [[_params, requestOptions]] = mockEqlGet.mock.calls;

        expect(requestOptions).toEqual({
          maxResponseSize: 13131313,
          meta: true,
          signal: undefined,
        });
      });

      it('passes transport options for search without id', async () => {
        const eqlSearch = eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        // @ts-expect-error missing required `query`
        const eql: EqlSearchStrategyRequest = { params: { index: 'all' } };
        await firstValueFrom(eqlSearch.search(eql, { transport: { ignore: [400] } }, mockDeps));
        const [[_params, requestOptions]] = mockEqlSearch.mock.calls;

        expect(requestOptions).toEqual({ ignore: [400], meta: true, signal: undefined });
      });

      describe('EQL-specific arguments', () => {
        it('passes along a timestamp_field argument', async () => {
          const eqlSearch = eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
          const request: EqlSearchStrategyRequest = {
            // @ts-expect-error missing required `query`
            params: { index: 'all', timestamp_field: 'timestamp' },
          };

          await firstValueFrom(eqlSearch.search(request, {}, mockDeps));
          const [[actualParams]] = mockEqlSearch.mock.calls;

          expect(actualParams).toEqual(expect.objectContaining({ timestamp_field: 'timestamp' }));
        });

        it('passes along an event_category_field argument', async () => {
          const eqlSearch = eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
          const request: EqlSearchStrategyRequest = {
            // @ts-expect-error missing required `query`
            params: { index: 'all', event_category_field: 'event_category' },
          };

          await firstValueFrom(eqlSearch.search(request, {}, mockDeps));
          const [[actualParams]] = mockEqlSearch.mock.calls;

          expect(actualParams).toEqual(
            expect.objectContaining({ event_category_field: 'event_category' })
          );
        });

        it('passes along a tiebreaker_field argument', async () => {
          const eqlSearch = eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
          const request: EqlSearchStrategyRequest = {
            // @ts-expect-error missing required `query`
            params: { index: 'all', tiebreaker_field: 'event_category' },
          };

          await firstValueFrom(eqlSearch.search(request, {}, mockDeps));
          const [[actualParams]] = mockEqlSearch.mock.calls;

          expect(actualParams).toEqual(
            expect.objectContaining({ tiebreaker_field: 'event_category' })
          );
        });
      });
    });

    describe('response', () => {
      it('contains a rawResponse field containing the full search response', async () => {
        const eqlSearch = await eqlSearchStrategyProvider(mockSearchConfig, mockLogger);
        const response = await eqlSearch
          .search({ id: 'my-search-id', options: { ignore: [400] } }, {}, mockDeps)
          .toPromise();

        expect(response).toEqual(
          expect.objectContaining({
            rawResponse: expect.objectContaining(getMockEqlResponse().body),
          })
        );
      });
    });
  });
});
