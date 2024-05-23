/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Action, Middleware } from 'redux';
import type { CoreStart } from '@kbn/core/public';

import type { NormalizedEntities, NormalizedEntity } from '../../../common/store/app/model';
import { appActions } from '../../../common/store/app';
import type { State } from '../../../common/store/types';
import type { Note } from '../../../common/lib/note';
import {
  deleteNote,
  fetchNotesByDocumentId,
  getNotesByIds,
  persistNote,
} from '../../containers/notes/api';

export const displayUnassociatedNotesMiddleware: (kibana: CoreStart) => Middleware<{}, State> =
  (kibana: CoreStart) => (store) => (next) => async (action: Action) => {
    // perform the action
    const ret = next(action);

    if (action.type === appActions.setEventIdsToFetchNotesFor.type) {
      const eventIds = action.payload.eventIds;
      store.dispatch(appActions.setNonTimelineEventNotesLoading({ isLoading: true }));

      try {
        const response = await getNotesByIds(eventIds);
        const notes: Note[] = response.notes;
        store.dispatch(appActions.serverReturnedNonAssociatedNotes({ notes }));
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
      store.dispatch(appActions.setNonTimelineEventNotesLoading({ isLoading: false }));
    }

    if (action.type === appActions.fetchNotesByDocumentRequest.type) {
      const documentId = action.payload.documentId;

      try {
        const response = await fetchNotesByDocumentId(documentId);
        const data: NormalizedEntities<Note> = response.notes;
        store.dispatch(appActions.fetchNotesByDocumentSuccess({ documentId, data }));
      } catch (error) {
        store.dispatch(appActions.fetchNotesByDocumentFailure());
        console.error(`middleware - error fetching notes for documentId ${documentId}`, error);
      }
    }

    if (action.type === appActions.createNoteForDocumentRequest.type) {
      const { documentId, note } = action.payload;

      try {
        const response = await persistNote({ note });
        const data: NormalizedEntity<Note> = response.notes;
        store.dispatch(appActions.createNoteForDocumentSuccess({ documentId, data }));
      } catch (error) {
        store.dispatch(appActions.createNoteForDocumentFailure());
        console.error(`middleware - error creating new note for documentId ${documentId}`, error);
      }
    }

    if (action.type === appActions.createNoteForTimelineRequest.type) {
      const { savedObjectId, note } = action.payload;

      try {
        const response = await persistNote({ note });
        const data: NormalizedEntity<Note> = response.notes;
        store.dispatch(appActions.createNoteForTimelineSuccess({ savedObjectId, data }));
      } catch (error) {
        store.dispatch(appActions.createNoteForTimelineFailure());
        console.error(
          `middleware - error creating new note for savedObjectId ${savedObjectId}`,
          error
        );
      }
    }

    if (action.type === appActions.createNoteForDocumentAndTimelineRequest.type) {
      const { documentId, savedObjectId, note } = action.payload;

      try {
        const response = await persistNote({ note });
        const data: NormalizedEntity<Note> = response.notes;
        store.dispatch(
          appActions.createNoteForDocumentAndTimelineSuccess({ documentId, savedObjectId, data })
        );
      } catch (error) {
        store.dispatch(appActions.createNoteForDocumentAndTimelineFailure());
        console.error(
          `middleware - error creating new note for documentId ${documentId} and savedObjectId ${savedObjectId}`,
          error
        );
      }
    }

    if (action.type === appActions.deleteNoteRequest.type) {
      const { noteId, eventId, timelineId } = action.payload.note;

      try {
        await deleteNote(noteId);
        store.dispatch(
          appActions.deleteNoteSuccess({
            noteId,
            documentId: eventId,
            savedObjectId: timelineId,
          })
        );
      } catch (error) {
        store.dispatch(appActions.deleteNoteFailure({ noteId }));
        console.error(`middleware - error delete note ${noteId}`, error);
      }
    }

    return ret;
  };
