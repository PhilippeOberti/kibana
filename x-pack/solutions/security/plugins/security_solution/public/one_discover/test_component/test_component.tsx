/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { OverviewTab } from '../../flyout/document_details/right/tabs/overview_tab'; // import type { SecuritySolutionTestFeature } from '@kbn/discover-shared-plugin/public';
import { DocumentDetailsProvider } from '../../flyout/document_details/shared/context';

export const getTestComponent /* : SecuritySolutionTestGetter*/ = ({
  id,
  indexName,
  scopeId,
}: {
  id: string;
  indexName: string;
  scopeId: string;
}) => {
  return (
    <DocumentDetailsProvider id={id} indexName={indexName} scopeId={scopeId}>
      <OverviewTab />
    </DocumentDetailsProvider>
  );
  // };
};
