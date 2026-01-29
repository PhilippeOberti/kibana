/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { render } from '@testing-library/react';
import { AlertHeaderBlock } from './alert_header_block';

const title = <div>{'title'}</div>;
const children = <div data-test-subj={'CHILDREN_TEST_ID'}>{'children'}</div>;
const dataTestSubj = 'TITLE_TEST_ID';

describe('<AlertHeaderBlock />', () => {
  it('should render component', () => {
    const { getByTestId } = render(
      <AlertHeaderBlock title={title} data-test-subj={dataTestSubj}>
        {children}
      </AlertHeaderBlock>
    );

    expect(getByTestId('TITLE_TEST_ID')).toHaveTextContent('title');
    expect(getByTestId('CHILDREN_TEST_ID')).toBeInTheDocument();
  });
});
