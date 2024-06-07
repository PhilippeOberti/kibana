/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { EuiTabs, EuiTab, EuiSpacer } from '@elastic/eui';

import { noop } from 'lodash/fp';
import type { TimelineTypeLiteralWithNull } from '../../../../common/api/timeline';
import { TimelineType } from '../../../../common/api/timeline';
import { SecurityPageName } from '../../../app/types';
import { getTimelineTabsUrl, useFormatUrl } from '../../../common/components/link_to';
import * as i18n from './translations';
import type { TimelineTab } from './types';
import { TimelineTabsStyle } from './types';
import { useKibana } from '../../../common/lib/kibana';

export interface UseTimelineTypesResult {
  timelineType: TimelineTypeLiteralWithNull | 'note';
  timelineTabs: JSX.Element;
  timelineFilters: JSX.Element;
}

export const useTimelineTypes = (): UseTimelineTypesResult => {
  const { formatUrl, search: urlSearch } = useFormatUrl(SecurityPageName.timelines);
  const { navigateToUrl } = useKibana().services.application;
  const { tabName } = useParams<{ pageName: SecurityPageName; tabName: string }>();
  const [timelineType, setTimelineTypes] = useState<TimelineTypeLiteralWithNull | 'note'>(
    tabName === TimelineType.default || tabName === TimelineType.template || tabName === 'note'
      ? tabName
      : TimelineType.default
  );

  const timelineUrl = formatUrl(getTimelineTabsUrl(TimelineType.default, urlSearch));
  // console.log('timelineUrl', timelineUrl);
  const templateUrl = formatUrl(getTimelineTabsUrl(TimelineType.template, urlSearch));
  // console.log('templateUrl', templateUrl);
  const noteUrl = formatUrl(getTimelineTabsUrl('note', urlSearch));
  // console.log('noteUrl', noteUrl);

  const goToTimeline = useCallback(
    (ev) => {
      ev.preventDefault();
      navigateToUrl(timelineUrl);
    },
    [navigateToUrl, timelineUrl]
  );

  const goToTemplateTimeline = useCallback(
    (ev) => {
      ev.preventDefault();
      navigateToUrl(templateUrl);
    },
    [navigateToUrl, templateUrl]
  );

  const goToNote = useCallback(
    (ev) => {
      ev.preventDefault();
      navigateToUrl(noteUrl);
    },
    [navigateToUrl, noteUrl]
  );

  const getFilterOrTabs: (timelineTabsStyle: TimelineTabsStyle) => TimelineTab[] = useCallback(
    (timelineTabsStyle: TimelineTabsStyle) => [
      {
        id: TimelineType.default,
        name: i18n.TAB_TIMELINES,
        href: timelineUrl,
        disabled: false,

        onClick: timelineTabsStyle === TimelineTabsStyle.tab ? goToTimeline : noop,
      },
      {
        id: TimelineType.template,
        name: i18n.TAB_TEMPLATES,
        href: templateUrl,
        disabled: false,

        onClick: timelineTabsStyle === TimelineTabsStyle.tab ? goToTemplateTimeline : noop,
      },
      {
        id: 'note',
        name: i18n.TAB_NOTES,
        href: noteUrl,
        disabled: false,

        onClick: timelineTabsStyle === TimelineTabsStyle.tab ? goToNote : noop,
      },
    ],
    [timelineUrl, goToTimeline, templateUrl, goToTemplateTimeline, noteUrl, goToNote]
  );

  const onFilterClicked = useCallback(
    (tabId) => {
      setTimelineTypes((prevTimelineTypes) => {
        if (prevTimelineTypes !== tabId) {
          setTimelineTypes(tabId);
        }
        return prevTimelineTypes;
      });
    },
    [setTimelineTypes]
  );

  const timelineTabs = useMemo(() => {
    return (
      <>
        <EuiTabs data-test-subj="open-timeline-subtabs">
          {getFilterOrTabs(TimelineTabsStyle.tab).map((tab: TimelineTab) => (
            <EuiTab
              data-test-subj={`timeline-${TimelineTabsStyle.tab}-${tab.id}`}
              isSelected={tab.id === tabName}
              disabled={tab.disabled}
              key={`timeline-${TimelineTabsStyle.tab}-${tab.id}`}
              href={tab.href}
              onClick={(ev) => {
                tab.onClick(ev);
                onFilterClicked(tab.id);
              }}
            >
              {tab.name}
            </EuiTab>
          ))}
        </EuiTabs>
        <EuiSpacer size="m" />
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabName]);

  const timelineFilters = useMemo(() => {
    return (
      <EuiTabs>
        {getFilterOrTabs(TimelineTabsStyle.filter).map((tab: TimelineTab) => (
          <EuiTab
            data-test-subj={`open-timeline-modal-body-${TimelineTabsStyle.filter}-${tab.id}`}
            isSelected={tab.id === timelineType}
            key={`timeline-${TimelineTabsStyle.filter}-${tab.id}`}
            onClick={(ev: { preventDefault: () => void }) => {
              tab.onClick(ev);
              onFilterClicked(tab.id);
            }}
          >
            {tab.name}
          </EuiTab>
        ))}
      </EuiTabs>
    );
  }, [timelineType, getFilterOrTabs, onFilterClicked]);

  return {
    timelineType,
    timelineTabs,
    timelineFilters,
  };
};
