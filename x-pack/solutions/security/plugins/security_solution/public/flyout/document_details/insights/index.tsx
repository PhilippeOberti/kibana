/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { memo, useMemo, useState } from 'react';
import { PanelHeader } from './header';
import { PanelContent } from './content';
import * as tabs from './tabs';
import type { DocumentDetailsProps } from '../shared/types';

export type InsightsPanelPaths = 'entity' | 'threatIntelligence' | 'prevalence' | 'correlations';
export const InsightsPanelEntitiesTab: InsightsPanelPaths = 'entity';
export const InsightsPanelThreatIntelligenceTab: InsightsPanelPaths = 'threatIntelligence';
export const InsightsPanelPrevalenceTab: InsightsPanelPaths = 'prevalence';
export const LeftPanelCorrelationsTab: InsightsPanelPaths = 'correlations';

const tabsDisplayed = [
  tabs.entitiesTab,
  tabs.threatIntelligenceTab,
  tabs.prevalenceTab,
  tabs.correlationsTab,
];

export const InsightsPanel: FC<Partial<DocumentDetailsProps>> = memo(({ path }) => {
  const defaultSelectedTabId = useMemo(() => {
    const defaultTab = tabsDisplayed[0].id;
    if (!path) return defaultTab;
    return tabsDisplayed.map((tab) => tab.id).find((tabId) => tabId === path) ?? defaultTab;
  }, [path]);

  const [selectedTabId, setSelectedTabId] = useState(defaultSelectedTabId);

  return (
    <>
      <PanelHeader
        selectedTabId={selectedTabId}
        setSelectedTabId={setSelectedTabId}
        tabs={tabsDisplayed}
      />
      <PanelContent selectedTabId={selectedTabId} tabs={tabsDisplayed} />
    </>
  );
});

InsightsPanel.displayName = 'InsightsPanel';
