/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useMemo } from 'react';
import { EuiFlyout } from '@elastic/eui';
import { MainSection } from './components/main';
import { ChildSection } from './components/child';
import { useFlyoutApi } from './hooks/use_flyout_api';
import { useSections } from './hooks/use_sections';
import { selectPanels, selectPushVsOverlay, useSelector } from './store/redux';
import type { FlyoutPanelProps, Panel } from './types';

export interface FlyoutProps {
  /**
   * List of all registered panels available for render
   */
  registeredPanels: Panel[];
}

export const Flyout: React.FC<FlyoutProps> = React.memo(({ registeredPanels }) => {
  const { main, child } = useSelector(selectPanels);

  const { closeMainPanel, closeChildPanel } = useFlyoutApi();

  // for flyout where the push vs overlay option is disable in the UI we fall back to overlay mode
  const type = useSelector(selectPushVsOverlay);

  // retrieves the sections to be displayed
  const { mainSection, childSection } = useSections({
    registeredPanels,
  });

  // calculates what needs to be rendered
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
    console.log('activate main flyout');
  }, []);

  const childFlyoutOnActive = useCallback(() => {
    console.log('activate child flyout');
  }, []);

  const mainFlyoutOnClose = useCallback(() => {
    console.log('close main flyout');
    closeMainPanel();
  }, [closeMainPanel]);

  const childFlyoutOnClose = useCallback(() => {
    console.log('close child flyout');
    closeChildPanel();
  }, [closeChildPanel]);

  return (
    <>
      {showMain && (
        <EuiFlyout
          id="mainFlyout"
          session="start"
          aria-labelledby="flyoutTitle"
          type={type}
          ownFocus={false}
          pushAnimation={true}
          onActive={mainFlyoutOnActive}
          onClose={mainFlyoutOnClose}
          size="s"
        >
          <MainSection component={mainComponent as React.ReactElement} />
          {showChild && (
            <EuiFlyout
              id="childFlyout"
              aria-labelledby="childFlyoutTitle"
              onActive={childFlyoutOnActive}
              onClose={childFlyoutOnClose}
              size="m"
            >
              <ChildSection component={childComponent as React.ReactElement} />
            </EuiFlyout>
          )}
        </EuiFlyout>
      )}
    </>
  );
});

Flyout.displayName = 'Flyout';
