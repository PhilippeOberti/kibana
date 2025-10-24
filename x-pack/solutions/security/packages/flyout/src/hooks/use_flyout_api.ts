/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { type CSSProperties, useCallback, useMemo } from 'react';
import type { EuiFlyoutSize } from '@elastic/eui/src/components/flyout/const';
import type { EuiFlyoutProps } from '@elastic/eui/src/components/flyout/flyout';
import {
  changeChildSizeAction,
  changeHasChildBackgroundAction,
  changeMainSizeAction,
  changeSession,
  closeChildPanelAction,
  closePanelsAction,
  openChildPanelAction,
  openMainPanelAction,
  openPanelsAction,
  resetSession,
} from '../store/actions';
import { useDispatch } from '../store/redux';
import type { FlyoutApi, FlyoutPanelProps } from '../types';

export type { FlyoutApi };

/**
 * This hook allows you to interact with the flyout, open panels and previews etc.
 */
export const useFlyoutApi = (): FlyoutApi => {
  const dispatch = useDispatch();

  const openPanels = useCallback(
    (
      { main, child }: { main?: FlyoutPanelProps; child?: FlyoutPanelProps },
      ui?: {
        mainSize: EuiFlyoutSize | CSSProperties['width'];
        childSize?: EuiFlyoutSize | CSSProperties['width'];
      },
      session: EuiFlyoutProps['session']
    ) => {
      if (session) {
        dispatch(changeSession({ session }));
      }
      dispatch(openPanelsAction({ main, child }));
      if (ui?.mainSize) {
        dispatch(changeMainSizeAction({ size: ui?.mainSize }));
      }
      if (ui?.childSize) {
        dispatch(changeChildSizeAction({ size: ui?.childSize }));
      }
    },
    [dispatch]
  );

  const openMainPanel = useCallback(
    (
      panel: FlyoutPanelProps,
      mainSize?: EuiFlyoutSize | CSSProperties['width'],
      session: EuiFlyoutProps['session']
    ) => {
      if (session) {
        dispatch(changeSession({ session }));
      }
      dispatch(openMainPanelAction({ main: panel }));
      if (mainSize) {
        dispatch(changeMainSizeAction({ size: mainSize }));
      }
    },
    [dispatch]
  );

  const openChildPanel = useCallback(
    (
      panel: FlyoutPanelProps,
      childSize?: EuiFlyoutSize | CSSProperties['width'],
      hasChildBackground?: boolean
    ) => {
      // dispatch(changeSession({ session: 'inherit' }));
      dispatch(openChildPanelAction({ child: panel }));
      if (childSize) {
        dispatch(changeChildSizeAction({ size: childSize }));
      }
      if (hasChildBackground) {
        dispatch(changeHasChildBackgroundAction({ hasChildBackground }));
      }
    },
    [dispatch]
  );

  const closeChildPanel = useCallback(() => dispatch(closeChildPanelAction()), [dispatch]);

  const closePanels = useCallback(() => {
    dispatch(closePanelsAction());
    dispatch(resetSession());
  }, [dispatch]);

  const api: FlyoutApi = useMemo(
    () => ({
      openFlyout: openPanels,
      openMainPanel,
      openChildPanel,
      closeChildPanel,
      closeFlyout: closePanels,
    }),
    [openPanels, openMainPanel, openChildPanel, closeChildPanel, closePanels]
  );

  return api;
};
