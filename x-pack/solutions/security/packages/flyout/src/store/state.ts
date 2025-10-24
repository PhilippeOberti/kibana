/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FlyoutPanelProps } from '../..';

export interface PanelsState {
  /**
   * Panel to render in the child section
   */
  child: FlyoutPanelProps | undefined;
  /**
   * Panel to render in the main section
   */
  main: FlyoutPanelProps | undefined;
}

export const initialPanelsState: FlyoutPanels = {
  child: undefined,
  main: undefined,
};

export interface UiState {
  /**
   * Push vs overlay information
   */
  pushVsOverlay: 'push' | 'overlay';
}

export const initialUiState: UiState = {
  pushVsOverlay: 'overlay',
};

export interface State {
  /**
   * All panels related information
   */
  panels: PanelsState;
  /**
   * All ui related information
   */
  ui: UiState;
}

export const initialState: State = {
  panels: initialPanelsState,
  ui: initialUiState,
};
