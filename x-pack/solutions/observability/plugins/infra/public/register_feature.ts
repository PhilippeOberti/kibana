/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import type { HomePublicPluginSetup } from '@kbn/home-plugin/public';

export const registerFeatures = (homePlugin: HomePublicPluginSetup) => {
  homePlugin.featureCatalogue.register({
    id: 'metrics',
    title: i18n.translate('xpack.infra.registerFeatures.infraOpsTitle', {
      defaultMessage: 'Metrics',
    }),
    description: i18n.translate('xpack.infra.registerFeatures.infraOpsDescription', {
      defaultMessage:
        'Explore infrastructure metrics and logs for common servers, containers, and services.',
    }),
    icon: 'metricsApp',
    path: `/app/metrics`,
    showOnHomePage: false,
    category: 'data',
  });
};
