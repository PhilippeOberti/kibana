/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import * as stories from './index.stories';
import { composeStories } from '@storybook/react';

const { CreatingInApmFromService } = composeStories(stories);

describe('ErrorCountRuleType', () => {
  it('renders', async () => {
    render(<CreatingInApmFromService />);

    expect(await screen.findByText('Service')).toBeInTheDocument();
  });
});
