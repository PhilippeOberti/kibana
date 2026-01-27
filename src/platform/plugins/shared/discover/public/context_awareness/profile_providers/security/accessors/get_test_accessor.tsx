/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import type { SecuritySolutionTestFeature } from '@kbn/discover-shared-plugin/public';

export const createTestAccessor = async (testFeature?: SecuritySolutionTestFeature) => {
  if (!testFeature) return undefined;
  const testGetter = await testFeature.getComponent();
  function getTest(fieldName: string) {
    const Test = testGetter();
    if (!Test) return undefined;
    return React.memo(function SecuritySolutionTest() {
      return <Test />;
    });
  }

  return getTest;
};
