/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { DataTableRecord } from '@kbn/discover-utils';
import { EuiPanel } from '@elastic/eui';
import { NOTES_DETAILS_TEST_ID } from './test_ids';
import type { TimelineModel } from '../..';
import { Flyouts } from '../../flyout/document_details/shared/constants/flyouts';
import { timelineSelectors } from '../../timelines/store';
import { TimelineId } from '../../../common/types';
import { AttachToActiveTimeline } from '../../flyout/document_details/left/components/attach_to_active_timeline';
import { pinEvent } from '../../timelines/store/actions';
import type { State } from '../../common/store';
import { TimelineStatusEnum } from '../../../common/api/timeline';
import { useWhichFlyout } from '../../flyout/document_details/shared/hooks/use_which_flyout';
import {
  FETCH_NOTES_ERROR,
  NO_NOTES,
  NotesDetailsContent,
} from './components/notes_details_content';

export { FETCH_NOTES_ERROR, NO_NOTES };

export interface NotesDetailsProps {
  /**
   * Document record used to fetch and associate notes and to derive the document type.
   */
  hit: DataTableRecord;
}

/**
 * List all the notes for a document id and allows to create new notes associated with that document.
 * Displayed in the document details expandable flyout left section.
 */
export const NotesDetails = memo(({ hit }: NotesDetailsProps) => {
  const dispatch = useDispatch();
  const eventId = hit.raw._id ?? '';

  const [attachToTimeline, setAttachToTimeline] = useState<boolean>(true);

  const isTimelineFlyout = useWhichFlyout() === Flyouts.timeline;

  const timeline: TimelineModel = useSelector((state: State) =>
    timelineSelectors.selectTimelineById(state, TimelineId.active)
  );
  const timelineSavedObjectId = useMemo(
    () => timeline.savedObjectId ?? '',
    [timeline.savedObjectId]
  );
  const isTimelineSaved: boolean = useMemo(
    () => timeline.status === TimelineStatusEnum.active,
    [timeline.status]
  );

  const onNoteAddInTimeline = useCallback(() => {
    const isEventPinned = eventId ? timeline?.pinnedEventIds[eventId] === true : false;
    if (!isEventPinned && eventId && timelineSavedObjectId) {
      dispatch(
        pinEvent({
          id: TimelineId.active,
          eventId,
        })
      );
    }
  }, [dispatch, eventId, timelineSavedObjectId, timeline.pinnedEventIds]);

  const timelineConfig = isTimelineFlyout
    ? {
        timelineSavedObjectId,
        isTimelineSaved,
        onNoteAddInTimeline,
        attachToTimeline,
        setAttachToTimeline,
        attachToTimelineElement: (
          <AttachToActiveTimeline
            setAttachToTimeline={setAttachToTimeline}
            isCheckboxDisabled={!isTimelineSaved}
          />
        ),
      }
    : undefined;

  return (
    <EuiPanel data-test-subj={NOTES_DETAILS_TEST_ID} hasBorder={false} hasShadow={false}>
      <NotesDetailsContent hit={hit} timelineConfig={timelineConfig} />
    </EuiPanel>
  );
});

NotesDetails.displayName = 'NotesDetails';
