/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { ManageIntegrationsCallout } from './manage_integrations_callout';
import { TestProviders } from '../../../../../../../common/mock/test_providers';
jest.mock('../../../../../../../common/lib/integrations/hooks/integration_context');
jest.mock('../../../../../../../common/hooks/use_add_integrations_url', () => ({
  useAddIntegrationsUrl: jest.fn().mockReturnValue({
    href: '/test-url',
    onClick: jest.fn(),
  }),
}));

describe('ManageIntegrationsCallout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when activeIntegrationsCount is 0', () => {
    const { queryByTestId } = render(<ManageIntegrationsCallout activeIntegrationsCount={0} />, {
      wrapper: TestProviders,
    });

    expect(queryByTestId('integrationsCompleteText')).not.toBeInTheDocument();
  });

  test('renders callout with correct message and link when there are active integrations', () => {
    const { getByText, getByTestId } = render(
      <ManageIntegrationsCallout activeIntegrationsCount={5} />,
      { wrapper: TestProviders }
    );

    expect(getByText('5 integrations have been added')).toBeInTheDocument();
    expect(getByTestId('manageIntegrationsLink')).toHaveTextContent('Manage integrations');
    expect(getByTestId('manageIntegrationsLink')).toHaveAttribute('href', '/test-url');
  });
});
