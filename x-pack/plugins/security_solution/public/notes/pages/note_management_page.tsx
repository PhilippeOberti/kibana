/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NotesTable } from '../components/notes_table';
import { useAppToasts } from '../../common/hooks/use_app_toasts';
import { appActions, appSelectors } from '../../common/store/app';

export const NoteManagementPage = () => {
  const dispatch = useDispatch();
  const { addError: addErrorToast } = useAppToasts();

  const addError = useSelector((state) => appSelectors.selectErrorCreateForDocument(state));
  const deleteError = useSelector((state) => appSelectors.selectErrorDelete(state));

  useEffect(() => {
    if (addError) {
      addErrorToast(null, {
        title: 'Error adding note',
      });
    }
  }, [addErrorToast, addError]);

  useEffect(() => {
    if (deleteError) {
      addErrorToast(null, {
        title: 'Error deleting note',
      });
    }
  }, [addErrorToast, deleteError]);

  useEffect(() => dispatch(appActions.fetchAllNotesRequest()), [dispatch]);

  return (
    <>
      <NotesTable />
    </>
  );
};

NoteManagementPage.displayName = 'NoteManagementPage';
