/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { CoreStart } from '@kbn/core/public';
import { Storage } from '@kbn/kibana-utils-plugin/public';
import {
  SecuritySolutionPluginSetup,
  SecuritySolutionPluginStart,
} from '@kbn/security-solution-plugin/server/plugin_contract';

export interface UIConfigType {
  enableExperimental: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AI4DSOCClientPluginSetup {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AI4DSOCClientPluginStart {}

export interface AI4DSOCClientPluginSetupDeps {
  securitySolution: SecuritySolutionPluginSetup;
}

export interface AI4DSOCClientPluginStartDeps {
  securitySolution: SecuritySolutionPluginStart;
}

export interface Services extends CoreStart, AI4DSOCClientPluginStartDeps {
  storage: Storage;
}
