/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render } from '@testing-library/react';
import {
  AlertsPageUserUnauthenticated,
  USER_UNAUTHENTICATED_TEST_ID,
} from './alerts_page_user_unauthenticated';

jest.mock('../../../common/lib/kibana');

describe('AlertsPageUserUnauthenticated', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<AlertsPageUserUnauthenticated />);

    expect(getByTestId(USER_UNAUTHENTICATED_TEST_ID)).toBeInTheDocument();
  });
});
