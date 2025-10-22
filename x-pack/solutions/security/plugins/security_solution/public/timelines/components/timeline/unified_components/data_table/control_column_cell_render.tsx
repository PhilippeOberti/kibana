/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { Actions } from '../../../../../common/components/header_actions';
import type { ActionProps } from '../../../../../../common/types';

const noOp = () => {};

export const TimelineControlColumnCellRender = memo(function TimelineControlColumnCellRender(
  props: ActionProps
) {
  return (
    <Actions
      ariaRowindex={props.rowIndex}
      columnValues="columnValues"
      disableExpandAction
      disablePinAction={props.disablePinAction}
      disableTimelineAction={false}
      ecsData={props.ecsData}
      eventId={props.eventId}
      eventIdToNoteIds={props.eventIdToNoteIds}
      isEventViewer={false}
      onEventDetailsPanelOpened={noOp}
      onRuleChange={noOp}
      refetch={props.refetch}
      showNotes={props.showNotes}
      timelineId={props.timelineId}
      toggleShowNotes={props.toggleShowNotes}
    />
  );
});
