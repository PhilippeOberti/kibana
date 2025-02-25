/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiHorizontalRule, EuiSpacer } from '@elastic/eui';
import { KPIsSection } from '../../components/alert_summary/kpis/kpis_section';
import { IntegrationSection } from '../../components/alert_summary/integrations/integration_section';
import { SearchBarSection } from '../../components/alert_summary/search_bar/search_bar_section';
import { TableSection } from '../../components/alert_summary/table/table_section';

/**
 *
 */
export const AlertSummaryPage = () => {
  return (
    <>
      <IntegrationSection />
      <EuiHorizontalRule />
      <SearchBarSection />
      <EuiSpacer />
      <KPIsSection />
      <EuiSpacer />
      <TableSection />
    </>
  );
};

AlertSummaryPage.displayName = 'AlertSummaryPage';
