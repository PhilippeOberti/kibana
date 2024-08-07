/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ResponseActionsClient } from '../lib/types';
import { responseActionsClientMock } from '../mocks';
import { CrowdstrikeActionsClient } from './crowdstrike_actions_client';
import { getActionDetailsById as _getActionDetailsById } from '../../action_details_by_id';
import { ResponseActionsNotSupportedError } from '../errors';
import type { CrowdstrikeActionsClientOptionsMock } from './mocks';
import { CrowdstrikeMock } from './mocks';

import {
  ENDPOINT_ACTION_RESPONSES_INDEX,
  ENDPOINT_ACTIONS_INDEX,
} from '../../../../../../common/endpoint/constants';
import { SUB_ACTION } from '@kbn/stack-connectors-plugin/common/crowdstrike/constants';
import type { NormalizedExternalConnectorClient } from '../../..';

jest.mock('../../action_details_by_id', () => {
  const originalMod = jest.requireActual('../../action_details_by_id');

  return {
    ...originalMod,
    getActionDetailsById: jest.fn(originalMod.getActionDetailsById),
  };
});

const getActionDetailsByIdMock = _getActionDetailsById as jest.Mock;

describe('CrowdstrikeActionsClient class', () => {
  let classConstructorOptions: CrowdstrikeActionsClientOptionsMock;
  let crowdstrikeActionsClient: ResponseActionsClient;
  let connectorActionsMock: NormalizedExternalConnectorClient;

  const createCrowdstrikeIsolationOptions = (
    overrides: Omit<
      Parameters<typeof responseActionsClientMock.createIsolateOptions>[0],
      'agent_type'
    > = {}
  ) => responseActionsClientMock.createIsolateOptions({ ...overrides, agent_type: 'crowdstrike' });

  beforeEach(() => {
    classConstructorOptions = CrowdstrikeMock.createConstructorOptions();
    connectorActionsMock = classConstructorOptions.connectorActions;
    crowdstrikeActionsClient = new CrowdstrikeActionsClient(classConstructorOptions);
    classConstructorOptions.esClient.search.mockResolvedValueOnce(
      CrowdstrikeMock.createEventSearchResponse()
    );
  });

  it.each([
    'killProcess',
    'suspendProcess',
    'runningProcesses',
    'getFile',
    'execute',
    'upload',
  ] as Array<keyof ResponseActionsClient>)(
    'should throw an un-supported error for %s',
    async (methodName) => {
      // @ts-expect-error Purposely passing in empty object for options
      await expect(crowdstrikeActionsClient[methodName]({})).rejects.toBeInstanceOf(
        ResponseActionsNotSupportedError
      );
    }
  );

  it('should error if multiple agent ids are received', async () => {
    const payload = createCrowdstrikeIsolationOptions();
    payload.endpoint_ids.push('second-host-id');

    await expect(crowdstrikeActionsClient.isolate(payload)).rejects.toMatchObject({
      message: `[body.endpoint_ids]: Multiple agents IDs not currently supported for Crowdstrike`,
      statusCode: 400,
    });
  });

  it('should save response with error in case of actionResponse containing errors', async () => {
    // mock execute of CS action to return error
    const actionResponse = {
      data: {
        errors: [{ message: 'error message' }],
      },
    };
    (connectorActionsMock.execute as jest.Mock).mockResolvedValueOnce(actionResponse);

    await crowdstrikeActionsClient.isolate(
      createCrowdstrikeIsolationOptions({ actionId: '123-345-567' })
    );
    expect(classConstructorOptions.esClient.index.mock.calls[1][0]).toEqual({
      document: {
        '@timestamp': expect.any(String),
        agent: { id: ['1-2-3'] },
        EndpointActions: {
          action_id: expect.any(String),
          completed_at: expect.any(String),
          started_at: expect.any(String),
          data: {
            command: 'isolate',
            comment: 'test comment',
            hosts: {
              '1-2-3': {
                name: 'Crowdstrike-1460',
              },
            },
          },
          input_type: 'crowdstrike',
        },
        error: {
          code: '500',
          message: 'Crowdstrike action failed: error message',
        },
        meta: undefined,
      },
      index: ENDPOINT_ACTION_RESPONSES_INDEX,
      refresh: 'wait_for',
    });
  });

  describe(`#isolate()`, () => {
    it('should send action to Crowdstrike', async () => {
      await crowdstrikeActionsClient.isolate(
        createCrowdstrikeIsolationOptions({ actionId: '123-345-456' })
      );

      expect(connectorActionsMock.execute as jest.Mock).toHaveBeenCalledWith({
        params: {
          subAction: SUB_ACTION.HOST_ACTIONS,
          subActionParams: {
            actionParameters: {
              comment:
                'Action triggered from Elastic Security by user [foo] for action [isolate (action id: 123-345-456)]: test comment',
            },
            command: 'contain',
            ids: ['1-2-3'],
          },
        },
      });
    });

    it('should write action request to endpoint indexes', async () => {
      await crowdstrikeActionsClient.isolate(createCrowdstrikeIsolationOptions());

      expect(classConstructorOptions.esClient.index).toHaveBeenCalledTimes(2);
      expect(classConstructorOptions.esClient.index.mock.calls[0][0]).toEqual({
        document: {
          '@timestamp': expect.any(String),
          EndpointActions: {
            action_id: expect.any(String),
            data: {
              command: 'isolate',
              comment: 'test comment',
              parameters: undefined,
              hosts: {
                '1-2-3': {
                  name: 'Crowdstrike-1460',
                },
              },
            },
            expiration: expect.any(String),
            input_type: 'crowdstrike',
            type: 'INPUT_ACTION',
          },
          agent: { id: ['1-2-3'] },
          meta: {
            hostName: 'Crowdstrike-1460',
          },
          user: { id: 'foo' },
        },
        index: ENDPOINT_ACTIONS_INDEX,
        refresh: 'wait_for',
      });
      expect(classConstructorOptions.esClient.index.mock.calls[1][0]).toEqual({
        document: {
          '@timestamp': expect.any(String),
          agent: { id: ['1-2-3'] },
          EndpointActions: {
            action_id: expect.any(String),
            completed_at: expect.any(String),
            started_at: expect.any(String),
            data: {
              command: 'isolate',
              comment: 'test comment',
              hosts: {
                '1-2-3': {
                  name: 'Crowdstrike-1460',
                },
                parameters: undefined,
              },
            },
            input_type: 'crowdstrike',
            error: undefined,
            meta: undefined,
          },
        },
        index: ENDPOINT_ACTION_RESPONSES_INDEX,
        refresh: 'wait_for',
      });
    });

    it('should return action details', async () => {
      await crowdstrikeActionsClient.isolate(createCrowdstrikeIsolationOptions());

      expect(getActionDetailsByIdMock).toHaveBeenCalled();
    });

    it('should update cases', async () => {
      await crowdstrikeActionsClient.isolate(
        createCrowdstrikeIsolationOptions({
          case_ids: ['case-1'],
        })
      );

      expect(classConstructorOptions.casesClient?.attachments.bulkCreate).toHaveBeenCalled();
    });
  });

  describe('#release()', () => {
    it('should send action to Crowdstrike', async () => {
      await crowdstrikeActionsClient.release(
        createCrowdstrikeIsolationOptions({ actionId: '123-345-456' })
      );

      expect(connectorActionsMock.execute as jest.Mock).toHaveBeenCalledWith({
        params: {
          subAction: SUB_ACTION.HOST_ACTIONS,
          subActionParams: {
            command: 'lift_containment',
            ids: ['1-2-3'],
            comment:
              'Action triggered from Elastic Security by user [foo] for action [unisolate (action id: 123-345-456)]: test comment',
          },
        },
      });
    });

    it('should write action request to endpoint indexes', async () => {
      await crowdstrikeActionsClient.release(createCrowdstrikeIsolationOptions());

      expect(classConstructorOptions.esClient.index).toHaveBeenCalledTimes(2);
      expect(classConstructorOptions.esClient.index.mock.calls[0][0]).toEqual({
        document: {
          '@timestamp': expect.any(String),
          EndpointActions: {
            action_id: expect.any(String),
            data: {
              command: 'unisolate',
              comment: 'test comment',
              parameters: undefined,
              hosts: {
                '1-2-3': {
                  name: 'Crowdstrike-1460',
                },
              },
            },
            expiration: expect.any(String),
            input_type: 'crowdstrike',
            type: 'INPUT_ACTION',
          },
          agent: { id: ['1-2-3'] },
          meta: {
            hostName: 'Crowdstrike-1460',
          },
          user: { id: 'foo' },
        },
        index: ENDPOINT_ACTIONS_INDEX,
        refresh: 'wait_for',
      });
      expect(classConstructorOptions.esClient.index.mock.calls[1][0]).toEqual({
        document: {
          '@timestamp': expect.any(String),
          agent: { id: ['1-2-3'] },
          EndpointActions: {
            action_id: expect.any(String),
            completed_at: expect.any(String),
            started_at: expect.any(String),
            data: {
              command: 'unisolate',
              comment: 'test comment',
              hosts: {
                '1-2-3': {
                  name: 'Crowdstrike-1460',
                },
              },
              parameters: undefined,
            },
            input_type: 'crowdstrike',
          },
          error: undefined,
          meta: undefined,
        },
        index: ENDPOINT_ACTION_RESPONSES_INDEX,
        refresh: 'wait_for',
      });
    });

    it('should return action details', async () => {
      await crowdstrikeActionsClient.release(createCrowdstrikeIsolationOptions());

      expect(getActionDetailsByIdMock).toHaveBeenCalled();
    });

    it('should update cases', async () => {
      await crowdstrikeActionsClient.release(
        createCrowdstrikeIsolationOptions({
          case_ids: ['case-1'],
        })
      );

      expect(classConstructorOptions.casesClient?.attachments.bulkCreate).toHaveBeenCalled();
    });
  });
});
