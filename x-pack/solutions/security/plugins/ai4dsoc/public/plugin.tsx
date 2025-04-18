/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { Suspense } from 'react';
import type { CoreSetup, CoreStart, Plugin, PluginInitializerContext } from '@kbn/core/public';
import { KibanaContextProvider } from '@kbn/kibana-react-plugin/public';
import { Storage } from '@kbn/kibana-utils-plugin/public';
import { __IntlProvider as IntlProvider } from '@kbn/i18n-react';
import {
  AI4DSOCClientPluginSetup,
  AI4DSOCClientPluginSetupDeps,
  AI4DSOCClientPluginStart,
  AI4DSOCClientPluginStartDeps,
  Services,
  UIConfigType,
} from './types';
import { ExperimentalFeaturesService } from './common/experimental_features_service';
import {
  type ExperimentalFeatures,
  parseExperimentalConfigValue,
} from '../common/experimental_features';

export const createApp = (services: Services) => () =>
  (
    <IntlProvider>
      <KibanaContextProvider services={services}>
        <Suspense fallback={<div />}>
          <div>{'hello'}</div>
        </Suspense>
      </KibanaContextProvider>
    </IntlProvider>
  );

export class AI4DSOCPlugin
  implements
    Plugin<
      AI4DSOCClientPluginSetup,
      AI4DSOCClientPluginStart,
      AI4DSOCClientPluginSetupDeps,
      AI4DSOCClientPluginStartDeps
    >
{
  private config: UIConfigType;
  private experimentalFeatures: ExperimentalFeatures;

  constructor(private readonly initializerContext: PluginInitializerContext) {
    this.config = this.initializerContext.config.get<UIConfigType>();

    this.experimentalFeatures = parseExperimentalConfigValue(
      this.config.enableExperimental || []
    )?.features;
  }

  public setup(
    _core: CoreSetup<AI4DSOCClientPluginStartDeps, AI4DSOCClientPluginStart>,
    plugins: AI4DSOCClientPluginSetupDeps
  ): AI4DSOCClientPluginSetup {
    // Return methods that should be available to other plugins
    return {};
  }

  public start(core: CoreStart, plugins: AI4DSOCClientPluginStartDeps): AI4DSOCClientPluginStart {
    ExperimentalFeaturesService.init({ experimentalFeatures: this.experimentalFeatures });

    const localPluginServices = {
      storage: new Storage(localStorage),
    };

    const services: Services = {
      ...localPluginServices,
      ...core,
      ...plugins,
    };

    return {
      getComponent: createApp(services),
    };
  }

  public stop() {}
}
