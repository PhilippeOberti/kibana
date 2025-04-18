/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Redirect } from 'react-router-dom';
import { Route, Routes } from '@kbn/shared-ux-router';
import { ALERT_SUMMARY_PATH } from '@kbn/security-solution-plugin/common/constants';
import { AlertSummaryRoute } from '../pages/alert_summary';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

/** Props for the cloud security posture router component */
export interface AI4DSOCRouterRouterProps {
  securitySolutionContext?: SecuritySolutionContext;
}

export const AI4DSOCRouter = ({ securitySolutionContext }: AI4DSOCRouterRouterProps) => {
  const routerElement = (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path={ALERT_SUMMARY_PATH} exact component={AlertSummaryRoute} />

        <Route>
          <Redirect to={cloudPosturePages.dashboard.path} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );

  if (securitySolutionContext) {
    return (
      <SecuritySolutionContext.Provider value={securitySolutionContext}>
        {routerElement}
      </SecuritySolutionContext.Provider>
    );
  }

  return <>{routerElement}</>;
};

// Using a default export for usage with `React.lazy`
// eslint-disable-next-line import/no-default-export
export { AI4DSOCRouter as default };
