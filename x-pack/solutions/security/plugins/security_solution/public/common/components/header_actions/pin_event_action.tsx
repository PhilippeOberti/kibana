/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo } from 'react';
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'lodash/fp';
import { selectIsPinnedEventInTimeline } from '../../../timelines/store/selectors';
import { EventsTdContent } from '../../../timelines/components/timeline/styles';
import type { TimelineType } from '../../../../common/api/timeline';
import { TimelineTypeEnum } from '../../../../common/api/timeline';
import { useUserPrivileges } from '../user_privileges';
import { DEFAULT_ACTION_BUTTON_WIDTH } from '.';
import type { State } from '../../store';
import { timelineActions } from '../../../timelines/store';
import * as i18n from './translations';

const eventHasNotes = (noteIds: string[]): boolean => !isEmpty(noteIds);

export interface PinEventActionProps {
  ariaRowindex: number;
  columnValues: string;
  eventId: string;
  eventIdToNoteIds: Readonly<Record<string, string[]>> | undefined;
  isAlert: boolean;
  noteIds: string[];
  timelineId: string;
  timelineType: TimelineType;
}

export const PinEventAction = memo(
  ({
    ariaRowindex,
    columnValues,
    eventId,
    eventIdToNoteIds,
    isAlert,
    noteIds,
    timelineId,
    timelineType,
  }: PinEventActionProps) => {
    const dispatch = useDispatch();

    const { timelinePrivileges } = useUserPrivileges();

    const isPinnedSelector = useMemo(() => selectIsPinnedEventInTimeline(), []);
    const isPinned = useSelector((state: State) => isPinnedSelector(state, timelineId, eventId));

    const tooltipContent = useMemo(() => {
      if (timelineType === TimelineTypeEnum.template) {
        return i18n.DISABLE_PIN(isAlert);
      } else if (eventHasNotes(noteIds)) {
        return i18n.PINNED_WITH_NOTES(isAlert);
      } else if (isPinned) {
        return i18n.PINNED(isAlert);
      } else {
        return i18n.UNPINNED(isAlert);
      }
    }, [timelineType, noteIds, isPinned, isAlert]);

    const handlePinClicked = useCallback(() => {
      const allowUnpinning = eventIdToNoteIds ? !eventHasNotes(eventIdToNoteIds[eventId]) : true;
      if (!allowUnpinning) {
        return;
      }
      if (isPinned) {
        dispatch(timelineActions.unPinEvent({ id: timelineId, eventId }));
      } else {
        dispatch(timelineActions.pinEvent({ id: timelineId, eventId }));
      }
    }, [eventIdToNoteIds, eventId, isPinned, dispatch, timelineId]);

    const ariaLabel = useMemo(() => {
      return timelineType === TimelineTypeEnum.template
        ? i18n.DISABLE_PIN(isAlert)
        : i18n.PIN_EVENT_FOR_ROW({ ariaRowindex, columnValues, isPinned });
    }, [ariaRowindex, columnValues, isAlert, isPinned, timelineType]);

    const isDisabled = useMemo(
      () =>
        !timelinePrivileges.crud ||
        timelineType === TimelineTypeEnum.template ||
        eventHasNotes(noteIds),
      [noteIds, timelinePrivileges.crud, timelineType]
    );

    return (
      <div key="timeline-action-pin-tool-tip">
        <EventsTdContent textAlign="center" width={DEFAULT_ACTION_BUTTON_WIDTH}>
          <EuiToolTip data-test-subj="timeline-action-pin-tool-tip" content={tooltipContent}>
            <EuiButtonIcon
              aria-label={ariaLabel}
              data-test-subj="pin"
              isDisabled={isDisabled}
              iconType={isPinned ? 'pinFilled' : 'pin'}
              onClick={handlePinClicked}
              size="s"
              color="text"
            />
          </EuiToolTip>
        </EventsTdContent>
      </div>
    );
  }
);

PinEventAction.displayName = 'PinEventAction';
