/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render } from '@testing-library/react';
import type { Alert } from '@kbn/alerting-types';
import { ActionsCell } from './actions_cell';
import { useExpandableFlyoutApi } from '@kbn/expandable-flyout';
import { ROW_ACTION_FLYOUT_ICON_TEST_ID } from './open_flyout_row_control_column';
import { useAssistant } from '../../../hooks/alert_summary/use_assistant';

jest.mock('@kbn/expandable-flyout');
jest.mock('../../../hooks/alert_summary/use_assistant');

describe('ActionsCell', () => {
  it('should render icons', () => {
    (useExpandableFlyoutApi as jest.Mock).mockReturnValue({
      openFlyout: jest.fn(),
    });
    (useAssistant as jest.Mock).mockReturnValue({
      showAssistant: true,
      showAssistantOverlay: jest.fn(),
    });

    const alert: Alert = {
      _id: '_id',
      _index: '_index',
    };

    const { getByTestId } = render(<ActionsCell alert={alert} />);

    expect(getByTestId(ROW_ACTION_FLYOUT_ICON_TEST_ID)).toBeInTheDocument();
    expect(getByTestId('newChatByTitle')).toBeInTheDocument();
  });
});
