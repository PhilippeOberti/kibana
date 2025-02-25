/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback } from 'react';
import { EuiButtonEmpty } from '@elastic/eui';
import { ADD_INTEGRATION } from './translations';

/**
 *
 */
export const AddIntegration = memo(() => {
  const addIntegration = useCallback(() => window.alert('Adding integration'), []);

  return (
    <EuiButtonEmpty onClick={addIntegration} iconType="plusInCircle">
      {ADD_INTEGRATION}
    </EuiButtonEmpty>
  );
});

AddIntegration.displayName = 'AddIntegration';
