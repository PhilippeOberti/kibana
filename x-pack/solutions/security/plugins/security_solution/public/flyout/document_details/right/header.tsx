/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiFlyoutHeader } from '@elastic/eui';
import { EuiSpacer, EuiTab } from '@elastic/eui';
import type { FC } from 'react';
import React, { memo } from 'react';
import type { RightPanelPaths } from '.';
import type { RightPanelTabType } from './tabs';
import { FlyoutHeader, FlyoutHeaderTabs } from '@kbn/flyout-ui';
import { AlertHeaderTitle } from './components/alert_header_title';
import { EventHeaderTitle } from './components/event_header_title';
import type { GetFieldsData } from '../shared/hooks/use_get_fields_data';
import type { BrowserFields, TimelineEventsDetailsItem } from '@kbn/timelines-plugin/common';
import { useBasicDataFromDetailsData } from '../shared/hooks/use_basic_data_from_details_data';

export interface PanelHeaderProps extends React.ComponentProps<typeof EuiFlyoutHeader> {
  dataFormattedForFieldBrowser: TimelineEventsDetailsItem[];
  getFieldsData: GetFieldsData;
  scopeId: string;
  isRulePreview: boolean;
  eventId: string;
  indexName: string;
  refetchFlyoutData: () => Promise<void>;
  browserFields: BrowserFields;
  /**
   * Id of the tab selected in the parent component to display its content
   */
  selectedTabId: RightPanelPaths;
  /**
   * Callback to set the selected tab id in the parent component
   * @param selected
   */
  setSelectedTabId: (selected: RightPanelPaths) => void;
  /**
   * Tabs to display in the header
   */
  tabs: RightPanelTabType[];
}

export const PanelHeader: FC<PanelHeaderProps> = memo(
  ({
    dataFormattedForFieldBrowser,
    getFieldsData,
    scopeId,
    isRulePreview,
    eventId,
    indexName,
    refetchFlyoutData,
    browserFields,
    selectedTabId,
    setSelectedTabId,
    tabs,
    ...flyoutHeaderProps
  }) => {
    const { isAlert } = useBasicDataFromDetailsData(dataFormattedForFieldBrowser);
    const onSelectedTabChanged = (id: RightPanelPaths) => setSelectedTabId(id);

    const renderTabs = tabs.map((tab, index) =>
      isAlert && tab.id === 'overview' ? (
        <EuiTab
          onClick={() => onSelectedTabChanged(tab.id)}
          isSelected={tab.id === selectedTabId}
          key={index}
          data-test-subj={tab['data-test-subj']}
        >
          {tab.name}
        </EuiTab>
      ) : (
        <EuiTab
          onClick={() => onSelectedTabChanged(tab.id)}
          isSelected={tab.id === selectedTabId}
          key={index}
          data-test-subj={tab['data-test-subj']}
        >
          {tab.name}
        </EuiTab>
      )
    );

    return (
      <FlyoutHeader {...flyoutHeaderProps}>
        {isAlert ? (
          <AlertHeaderTitle
            eventId={eventId}
            dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
            scopeId={scopeId}
            isRulePreview={isRulePreview}
            refetchFlyoutData={refetchFlyoutData}
            getFieldsData={getFieldsData}
            browserFields={browserFields}
          />
        ) : (
          <EventHeaderTitle
            dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
            getFieldsData={getFieldsData}
          />
        )}
        <EuiSpacer size="m" />
        <FlyoutHeaderTabs>{renderTabs}</FlyoutHeaderTabs>
      </FlyoutHeader>
    );
  }
);

PanelHeader.displayName = 'PanelHeader';
