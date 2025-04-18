/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { PluginTemplateWrapper } from '@kbn/security-solution-plugin/public/common/components/plugin_template_wrapper';
import { SecurityPageName } from '@kbn/deeplinks-security';
import { SecurityRoutePageWrapper } from '@kbn/security-solution-plugin/public/common/components/security_route_page_wrapper';
import { AlertSummaryPage } from './alert_summary';

export const AlertSummaryRoute = () => (
  <PluginTemplateWrapper>
    <SecurityRoutePageWrapper pageName={SecurityPageName.alertSummary}>
      <AlertSummaryPage />
    </SecurityRoutePageWrapper>
  </PluginTemplateWrapper>
);
