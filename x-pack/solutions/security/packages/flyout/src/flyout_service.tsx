/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { EuiFlyout } from '@elastic/eui';
import type { OverlayRef } from '@kbn/core-mount-utils-browser';
import type { OverlayStart } from '@kbn/core-overlays-browser';
import { useFlyoutApi } from './hooks/use_flyout_api';
import { useSections } from './hooks/use_sections';
import {
  selectChildSize,
  selectHasChildBackground,
  selectMainSize,
  selectPanels,
  selectPushVsOverlay,
  selectSession,
  useSelector,
} from './store/redux';
import type { FlyoutPanelProps, Panel } from './types';
import { SettingsMenu } from './components/settings_menu';
import { MainSection } from './components/main';
import { ChildSection } from './components/child';

export interface FlyoutProps {
  /**
   *
   */
  overlays: OverlayStart;
  /**
   * List of all registered panels available for render
   */
  registeredPanels: Panel[];
}

export const Flyout: React.FC<FlyoutProps> = React.memo(({ overlays, registeredPanels }) => {
  const flyoutRef = useRef<OverlayRef | null>(null);

  const { main, child } = useSelector(selectPanels);

  const { closeFlyout, closeChildPanel } = useFlyoutApi();

  const type = useSelector(selectPushVsOverlay);

  const mainSize = useSelector(selectMainSize);
  const childSize = useSelector(selectChildSize);

  const hasChildBackground = useSelector(selectHasChildBackground);
  const session = useSelector(selectSession);

  const { mainSection, childSection } = useSections({
    registeredPanels,
  });

  const showMain = useMemo(() => mainSection != null && main != null, [mainSection, main]);
  const showChild = useMemo(() => childSection != null && child != null, [childSection, child]);

  const mainComponent = useMemo(
    () => (mainSection ? mainSection.component({ ...(main as FlyoutPanelProps) }) : null),
    [mainSection, main]
  );
  const childComponent = useMemo(
    () => (childSection ? childSection.component({ ...(child as FlyoutPanelProps) }) : null),
    [childSection, child]
  );

  const mainFlyoutOnActive = useCallback(() => {
    console.log('activate main flyout with overlays');
  }, []);

  const childFlyoutOnActive = useCallback(() => {
    console.log('activate child flyout with overlays');
  }, []);

  const mainFlyoutOnClose = useCallback(() => {
    console.log('close main flyout with overlays');
    flyoutRef.current = null;
    closeFlyout();
  }, [closeFlyout]);

  const childFlyoutOnClose = useCallback(() => {
    console.log('close child flyout with overlays');
    closeChildPanel();
  }, [closeChildPanel]);

  const flyoutContent = useMemo(
    () => (
      <>
        <SettingsMenu />
        <MainSection component={mainComponent as React.ReactElement} />
        {showChild && (
          <EuiFlyout
            aria-label="Child flyout"
            flyoutMenuProps={{
              title: `${child.id} - Child`,
            }}
            onActive={childFlyoutOnActive}
            onClose={childFlyoutOnClose}
            hasChildBackground={hasChildBackground}
            size={childSize}
          >
            <ChildSection component={childComponent as React.ReactElement} />
          </EuiFlyout>
        )}
      </>
    ),
    [
      child?.id,
      childComponent,
      childFlyoutOnActive,
      childFlyoutOnClose,
      childSize,
      hasChildBackground,
      mainComponent,
      showChild,
    ]
  );

  useEffect(() => {
    if (showMain) {
      console.log('show main flyout with overlays');
      flyoutRef.current = overlays.openSystemFlyout(<>{flyoutContent}</>, {
        title: `${main?.id} - Main`,
        type,
        ownFocus: false,
        size: mainSize,
        onActive: mainFlyoutOnActive,
        onClose: mainFlyoutOnClose,
      });
    }
  }, [
    flyoutContent,
    main?.id,
    mainFlyoutOnActive,
    mainFlyoutOnClose,
    mainSize,
    overlays,
    showMain,
    type,
  ]);

  return null;
});

Flyout.displayName = 'Flyout';
