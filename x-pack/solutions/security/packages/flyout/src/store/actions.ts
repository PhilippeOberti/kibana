/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { createAction } from '@reduxjs/toolkit';
import type { FlyoutPanelProps } from '../types';

export enum ActionType {
  openFlyout = 'open_flyout',
  openMainPanel = 'open_main_panel',
  openChildPanel = 'open_child_panel',
  closeMainPanel = 'close_main_panel',
  closeChildPanel = 'close_child_panel',
  closeFlyout = 'close_flyout',

  changePushVsOverlay = 'change_push_overlay',
}

export const openPanelsAction = createAction<{
  /**
   * Panel to render in the main section
   */
  main?: FlyoutPanelProps;
  /**
   * Panel to render in the child section
   */
  child?: FlyoutPanelProps;
}>(ActionType.openFlyout);

export const openMainPanelAction = createAction<{
  /**
   * Panel to render in the main section
   */
  main: FlyoutPanelProps;
}>(ActionType.openMainPanel);
export const openChildPanelAction = createAction<{
  /**
   * Panel to render in the child section
   */
  child: FlyoutPanelProps;
}>(ActionType.openChildPanel);

export const closePanelsAction = createAction(ActionType.closeFlyout);
export const closeMainPanelAction = createAction(ActionType.closeMainPanel);
export const closeChildPanelAction = createAction(ActionType.closeChildPanel);

export const changePushVsOverlayAction = createAction<{
  /**
   * Type of flyout to render, value and only be 'push' or 'overlay'
   */
  type: 'push' | 'overlay';
  /**
   * Used in the redux middleware to decide if the value needs to be saved to local storage.
   * This is used to avoid saving the value to local storage when the value is changed by code instead of by a user action.
   */
  savedToLocalStorage: boolean;
}>(ActionType.changePushVsOverlay);
