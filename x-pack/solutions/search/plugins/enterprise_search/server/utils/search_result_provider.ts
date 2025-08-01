/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { takeUntil, of, map } from 'rxjs';

import { GlobalSearchResultProvider } from '@kbn/global-search-plugin/server';
import { ConnectorServerSideDefinition } from '@kbn/search-connectors';

import { ConfigType } from '..';
import { ENTERPRISE_SEARCH_DATA_PLUGIN } from '../../common/constants';

type ServiceDefinition =
  | ConnectorServerSideDefinition
  | {
      iconPath?: string;
      isNative?: boolean;
      keywords: string[];
      name: string;
      serviceType: string;
      url?: string;
    };

export function toSearchResult({
  iconPath,
  name,
  score,
  serviceType,
  url,
}: {
  iconPath?: string;
  name: string;
  score: number;
  serviceType: string;
  url?: string;
}) {
  const newUrl = `${ENTERPRISE_SEARCH_DATA_PLUGIN.URL}/connectors/select_connector`;

  return {
    icon: iconPath || 'logoElasticsearch',
    id: serviceType,
    score,
    title: name,
    type: 'Elasticsearch',
    url: {
      path: url ?? newUrl,
      prependBasePath: true,
    },
  };
}

export function getSearchResultProvider(
  config: ConfigType,
  connectorTypes: ConnectorServerSideDefinition[]
): GlobalSearchResultProvider {
  return {
    find: ({ term, types, tags }, { aborted$, maxResults }, { core: { capabilities } }) => {
      if (
        tags ||
        (types && !(types.includes('integration') || types.includes('enterprise search')))
      ) {
        return of([]);
      }

      return capabilities.pipe(
        takeUntil(aborted$),
        map((caps) => {
          if (!caps.catalogue.enterpriseSearch) {
            return [];
          }
          const services: ServiceDefinition[] = [...(config.hasConnectors ? connectorTypes : [])];
          const result = services
            .map((service) => {
              const { iconPath, name, keywords, serviceType } = service;
              const url = 'url' in service ? service.url : undefined;
              let score = 0;
              const searchTerm = (term || '').toLowerCase();
              const searchName = name.toLowerCase();
              if (!searchTerm) {
                score = 80;
              } else if (searchName === searchTerm) {
                score = 100;
              } else if (searchName.startsWith(searchTerm)) {
                score = 90;
              } else if (searchName.includes(searchTerm)) {
                score = 75;
              } else if (serviceType === searchTerm) {
                score = 65;
              } else if (keywords.some((keyword) => keyword.includes(searchTerm))) {
                score = 50;
              }
              return toSearchResult({
                iconPath,
                name,
                score,
                serviceType,
                url,
              });
            })
            .filter(({ score }) => score > 0)
            .slice(0, maxResults);

          return result;
        })
      );
    },
    getSearchableTypes: () => ['enterprise search', 'integration'],
    id: 'enterpriseSearch',
  };
}
