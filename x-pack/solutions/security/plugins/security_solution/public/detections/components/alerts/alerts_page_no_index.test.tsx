/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { AlertsPageNoIndex, NO_INDEX_TEST_ID } from './alerts_page_no_index';

jest.mock('../../../common/lib/kibana');

describe('AlertsPageNoIndex', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(
      <AlertsPageNoIndex needsSignalsIndex={true} needsListsIndex={true} />
    );

    expect(getByTestId(NO_INDEX_TEST_ID)).toHaveTextContent('Let’s set up your detection engine');
    expect(getByTestId(NO_INDEX_TEST_ID)).toHaveTextContent('View documentation');
  });

  it('should render needs index permissions message', () => {
    const { getByTestId } = render(
      <AlertsPageNoIndex needsSignalsIndex={true} needsListsIndex={true} />
    );

    expect(getByTestId(NO_INDEX_TEST_ID)).toHaveTextContent(
      'You need permissions for the signals and lists indices.'
    );
  });

  it('should render needs signal index message', () => {
    const { getByTestId } = render(
      <AlertsPageNoIndex needsSignalsIndex={true} needsListsIndex={false} />
    );

    expect(getByTestId(NO_INDEX_TEST_ID)).toHaveTextContent(
      'You need permissions for the signals index.'
    );
  });

  it('should render needs lists indexes message', () => {
    const { getByTestId } = render(
      <AlertsPageNoIndex needsSignalsIndex={false} needsListsIndex={true} />
    );

    expect(getByTestId(NO_INDEX_TEST_ID)).toHaveTextContent(
      'You need permissions for the lists indices.'
    );
  });

  it('should render empty message', () => {
    const { getByTestId } = render(
      <AlertsPageNoIndex needsSignalsIndex={false} needsListsIndex={false} />
    );

    expect(getByTestId(NO_INDEX_TEST_ID)).toHaveTextContent(
      'To use the detection engine, a user with the required cluster and index privileges must first access this page. For more help, contact your Elastic Stack administrator.'
    );
  });
});
