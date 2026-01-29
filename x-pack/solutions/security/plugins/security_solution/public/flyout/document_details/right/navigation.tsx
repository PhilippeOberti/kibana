/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { memo, useCallback } from 'react';
import { useExpandableFlyoutApi } from '@kbn/expandable-flyout';
import { useKibana } from '../../../common/lib/kibana';
import { HeaderActions } from './components/header_actions';
import { FlyoutNavigation } from '../../shared/components/flyout_navigation';
import { DocumentDetailsLeftPanelKey } from '../shared/constants/panel_keys';
import type { TimelineEventsDetailsItem } from '@kbn/timelines-plugin/common';
import { DocumentEventTypes } from '../../../common/lib/telemetry';

interface PanelNavigationProps {
  dataFormattedForFieldBrowser: TimelineEventsDetailsItem[];
  eventId: string;
  indexName: string;
  scopeId: string;
  isRulePreview: boolean;
  /**
   * If true, the expand detail button will be displayed
   */
  flyoutIsExpandable: boolean;
}

export const PanelNavigation: FC<PanelNavigationProps> = memo(
  ({
    dataFormattedForFieldBrowser,
    eventId,
    indexName,
    scopeId,
    isRulePreview,
    flyoutIsExpandable,
  }) => {
    const { telemetry } = useKibana().services;
    const { openLeftPanel } = useExpandableFlyoutApi();

    const expandDetails = useCallback(() => {
      openLeftPanel({
        id: DocumentDetailsLeftPanelKey,
        params: {
          id: eventId,
          indexName,
          scopeId,
        },
      });
      telemetry.reportEvent(DocumentEventTypes.DetailsFlyoutOpened, {
        location: scopeId,
        panel: 'left',
      });
    }, [eventId, openLeftPanel, indexName, scopeId, telemetry]);

    return (
      <FlyoutNavigation
        flyoutIsExpandable={flyoutIsExpandable}
        expandDetails={expandDetails}
        actions={
          <HeaderActions
            dataFormattedForFieldBrowser={dataFormattedForFieldBrowser}
            eventId={eventId}
            indexName={indexName}
          />
        }
        isPreviewMode={false}
        isRulePreview={isRulePreview}
      />
    );
  }
);

PanelNavigation.displayName = 'PanelNavigation';
