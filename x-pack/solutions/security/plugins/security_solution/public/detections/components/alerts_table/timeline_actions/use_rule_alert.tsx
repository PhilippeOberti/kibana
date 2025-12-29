/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EcsSecurityExtension as Ecs } from '@kbn/securitysolution-ecs';
import type { estypes } from '@elastic/elasticsearch';
import { useQuery } from '@kbn/react-query';
import { DETECTION_ENGINE_QUERY_SIGNALS_URL } from '../../../../../common/constants';
import { KibanaServices } from '../../../../common/lib/kibana';
import { buildAlertsQuery, formatAlertToEcsSignal } from '../../../../common/utils/alerts';

/**
 *
 */
const fetchAlert = async ({ id, signal }: { id: string; signal?: AbortSignal }) => {
  const response = await KibanaServices.get().http.fetch<
    estypes.SearchResponse<{ '@timestamp': string; [key: string]: unknown }>
  >(DETECTION_ENGINE_QUERY_SIGNALS_URL, {
    version: '2023-10-31',
    method: 'POST',
    body: JSON.stringify(buildAlertsQuery([id])),
    signal,
  });
  return (
    response?.hits.hits.reduce<Ecs[]>((acc, { _id, _index, _source = {} }) => {
      return [
        ...acc,
        {
          ...formatAlertToEcsSignal(_source),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          _id: _id!,
          _index,
          timestamp: _source['@timestamp'],
        },
      ];
    }, []) ?? []
  );
};

export interface UseThresholdRuleUrlPathParams {
  /**
   *
   */
  ecsData?: Ecs;
}

/**
 *
 */
export const useRuleAlert = ({ ecsData }: UseThresholdRuleUrlPathParams) => {
  const id = ecsData?._id ?? '';
  return useQuery(['fetch-alert', id], ({ signal }) => fetchAlert({ id, signal }), {
    select: (data) => data[0],
    onError: (error) => console.log(error),
  });
};
