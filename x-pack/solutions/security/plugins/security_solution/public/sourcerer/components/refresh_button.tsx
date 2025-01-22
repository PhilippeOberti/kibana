/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { EuiButton } from '@elastic/eui';
import React, { useCallback } from 'react';
import css from '@emotion/react';
import { RELOAD_PAGE_TITLE } from './translations';

export const RefreshButton = React.memo(() => {
  const onPageRefresh = useCallback(() => {
    document.location.reload();
  }, []);
  return (
    <EuiButton
      onClick={onPageRefresh}
      data-test-subj="page-refresh"
      css={css`
        float: right;
      `}
    >
      {RELOAD_PAGE_TITLE}
    </EuiButton>
  );
});

RefreshButton.displayName = 'RefreshButton';
