/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback, useMemo } from 'react';
import {
  closeChildPanelAction,
  closeMainPanelAction,
  closePanelsAction,
  openChildPanelAction,
  openMainPanelAction,
  openPanelsAction,
} from '../store/actions';
import { useDispatch } from '../store/redux';
import type { FlyoutApi, FlyoutPanelProps } from '../types';

export type { FlyoutApi };

/**
 * This hook allows you to interact with the flyout, open panels and previews etc.
 */
export const useFlyoutApi = () => {
  const dispatch = useDispatch();

  const openPanels = useCallback(
    ({ main, child }: { main?: FlyoutPanelProps; child?: FlyoutPanelProps }) =>
      dispatch(openPanelsAction({ main, child })),
    [dispatch]
  );

  const openMainPanel = useCallback(
    (panel: FlyoutPanelProps) => dispatch(openMainPanelAction({ main: panel })),
    [dispatch]
  );

  const openChildPanel = useCallback(
    (panel: FlyoutPanelProps) => dispatch(openChildPanelAction({ child: panel })),
    [dispatch]
  );

  const closeMainPanel = useCallback(() => dispatch(closeMainPanelAction()), [dispatch]);

  const closeChildPanel = useCallback(() => dispatch(closeChildPanelAction()), [dispatch]);

  const closePanels = useCallback(() => dispatch(closePanelsAction()), [dispatch]);

  const api: FlyoutApi = useMemo(
    () => ({
      openFlyout: openPanels,
      openMainPanel,
      openChildPanel,
      closeMainPanel,
      closeChildPanel,
      closeFlyout: closePanels,
    }),
    [openPanels, openMainPanel, openChildPanel, closeMainPanel, closeChildPanel, closePanels]
  );

  return api;
};
