/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RenderHookResult } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import type { UseAssistantParams, UseAssistantResult } from './use_assistant';
import { useAssistant } from './use_assistant';
import { useAssistantOverlay } from '@kbn/elastic-assistant';
import { useAssistantAvailability } from '../../../../assistant/use_assistant_availability';

const renderUseAssistant = () =>
  renderHook((props: UseAssistantParams) => useAssistant(props), {
    initialProps: { dataFormattedForFieldBrowser, isAlert },
  });

describe('useAssistant', () => {
  let hookResult: RenderHookResult<UseAssistantResult, UseAssistantParams>;

  it(`should return showAssistant true and a value for promptContextId`, () => {
    jest.mocked(useAssistantAvailability).mockReturnValue({
      hasAssistantPrivilege: true,
      hasConnectorsAllPrivilege: true,
      hasConnectorsReadPrivilege: true,
      hasUpdateAIAssistantAnonymization: true,
      hasManageGlobalKnowledgeBase: true,
      isAssistantEnabled: true,
    });
    jest
      .mocked(useAssistantOverlay)
      .mockReturnValue({ showAssistantOverlay: jest.fn, promptContextId: '123' });

    hookResult = renderUseAssistant();

    expect(hookResult.result.current.showAssistant).toEqual(true);
    expect(hookResult.result.current.promptContextId).toEqual('123');
  });
});
