/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { act, render, fireEvent } from '@testing-library/react';
import type { DataTableRecord } from '@kbn/discover-utils';
import { __IntlProvider as IntlProvider } from '@kbn/i18n-react';
import { Router } from '@kbn/shared-ux-router';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import {
  INSIGHTS_SECTION_TEST_ID,
  INSIGHTS_SECTION_TITLE,
  InsightsSection,
} from './insights_section';
import { useExpandSection } from '../../shared/hooks/use_expand_section';
import { useKibana } from '../../../common/lib/kibana';

jest.mock('../../shared/hooks/use_expand_section', () => ({
  useExpandSection: jest.fn(),
}));

jest.mock('../../../common/lib/kibana', () => ({
  useKibana: jest.fn(),
}));

// Mock CorrelationsOverview to expose a button that triggers onShowCorrelationsDetails
jest.mock('./correlations_overview', () => ({
  CorrelationsOverview: ({
    onShowCorrelationsDetails,
  }: {
    onShowCorrelationsDetails: () => void;
  }) => (
    <button
      type="button"
      data-test-subj="correlationsOverviewMock"
      onClick={onShowCorrelationsDetails}
    >
      {'Show correlations'}
    </button>
  ),
}));

jest.mock('./threat_intelligence_overview', () => ({
  ThreatIntelligenceOverview: () => <div data-test-subj="threatIntelligenceOverviewMock" />,
}));

jest.mock('./prevalence_overview', () => ({
  PrevalenceOverview: () => <div data-test-subj="prevalenceOverviewMock" />,
}));

jest.mock('../../../detection_engine/rule_management/logic/use_rule_with_fallback', () => ({
  useRuleWithFallback: jest.fn().mockReturnValue({ rule: null, loading: false, error: null }),
}));

const createMockHit = (flattened: DataTableRecord['flattened']): DataTableRecord =>
  ({
    id: '1',
    raw: { _id: '1', _index: 'test' },
    flattened,
    isAnchor: false,
  } as DataTableRecord);

const mockHit = createMockHit({ 'event.kind': 'signal' });

describe('InsightsSection', () => {
  const mockUseExpandSection = jest.mocked(useExpandSection);
  const mockUseKibana = jest.mocked(useKibana);
  const store = createStore(() => ({}));
  const history = createMemoryHistory();
  const mockOpenSystemFlyout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseKibana.mockReturnValue({
      services: {
        overlays: {
          openSystemFlyout: mockOpenSystemFlyout,
        },
        uiActions: {
          getTriggerCompatibleActions: jest.fn().mockResolvedValue([]),
        },
      },
    } as unknown as ReturnType<typeof useKibana>);
  });

  it('renders the Insights expandable section', () => {
    mockUseExpandSection.mockReturnValue(true);

    const { getByTestId } = render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <Router history={history}>
            <InsightsSection hit={mockHit} />
          </Router>
        </Provider>
      </IntlProvider>
    );

    expect(getByTestId(`${INSIGHTS_SECTION_TEST_ID}Header`)).toHaveTextContent(
      INSIGHTS_SECTION_TITLE
    );
  });

  it('renders the component collapsed if value is false in local storage', async () => {
    mockUseExpandSection.mockReturnValue(false);

    const { getByTestId } = render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <Router history={history}>
            <InsightsSection hit={mockHit} />
          </Router>
        </Provider>
      </IntlProvider>
    );

    await act(async () => {
      expect(getByTestId(`${INSIGHTS_SECTION_TEST_ID}Content`)).not.toBeVisible();
    });
  });

  it('renders the component expanded if value is true in local storage', async () => {
    mockUseExpandSection.mockReturnValue(true);

    const { getByTestId } = render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <Router history={history}>
            <InsightsSection hit={mockHit} />
          </Router>
        </Provider>
      </IntlProvider>
    );

    await act(async () => {
      expect(getByTestId(`${INSIGHTS_SECTION_TEST_ID}Content`)).toBeVisible();
    });
  });

  it('calls overlays.openSystemFlyout when onShowCorrelationsDetails is triggered', () => {
    mockUseExpandSection.mockReturnValue(true);

    const { getByTestId } = render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <Router history={history}>
            <InsightsSection hit={mockHit} />
          </Router>
        </Provider>
      </IntlProvider>
    );

    fireEvent.click(getByTestId('correlationsOverviewMock'));

    expect(mockOpenSystemFlyout).toHaveBeenCalledTimes(1);
  });
});
