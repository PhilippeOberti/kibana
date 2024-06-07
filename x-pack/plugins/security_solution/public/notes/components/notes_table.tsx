/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useState } from 'react';
import type { Criteria, DefaultItemAction, EuiBasicTableColumn } from '@elastic/eui';
import { EuiText } from '@elastic/eui';
import { EuiBasicTable } from '@elastic/eui';
import { EuiEmptyPrompt, EuiLoadingElastic } from '@elastic/eui';
import { useDispatch, useSelector } from 'react-redux';
import type { EuiTableSelectionType } from '@elastic/eui/src/components/basic_table/table_types';
import { appActions, appSelectors } from '../../common/store/app';
import type { Note } from '../../common/lib/note';

const columns: Array<EuiBasicTableColumn<Note>> = [
  {
    field: 'created',
    name: 'Last Edited',
  },
  {
    field: 'createdBy',
    name: 'Created by',
  },
  {
    field: 'eventId',
    name: 'Document id',
  },
  {
    field: 'timelineId',
    name: 'Timeline id',
  },
  {
    field: 'note',
    name: 'Note',
  },
];

/**
 *
 */
export const NotesTable = () => {
  const dispatch = useDispatch();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [selectedItems, setSelectedItems] = useState<Note[]>([]);
  const selection: EuiTableSelectionType<Note> = {
    onSelectionChange: (selectedItems: Note[]) => {
      console.log('setting selectedItems', selectedItems);
      setSelectedItems(selectedItems);
    },
  };

  const onTableChange = ({ page }: Criteria<Note>) => {
    if (page) {
      const { index, size } = page;
      setPageIndex(index);
      setPageSize(size);
    }
  };

  const findNotes = (n: Note[], pageIdx: number, pageSz: number) => {
    let pageOfItems;

    if (!pageIdx && !pageSz) {
      pageOfItems = n;
    } else {
      const startIndex = pageIdx * pageSz;
      pageOfItems = n.slice(startIndex, Math.min(startIndex + pageSz, n.length));
    }

    return {
      pageOfItems,
      totalItemCount: n.length,
    };
  };

  const deleteNote = useCallback(
    (note: Note) => dispatch(appActions.deleteNoteRequest({ note })),
    [dispatch]
  );

  const fetchLoading = useSelector((state) => appSelectors.selectLoadingFetchByDocument(state));
  const fetchError = useSelector((state) => appSelectors.selectErrorFetchByDocument(state));

  const notesById: { [id: string]: Note } = useSelector((state) => appSelectors.selectById(state));
  const allIds: string[] = useSelector((state) => appSelectors.selectAllIds(state));
  const notes: Note[] = allIds?.map((noteId) => notesById[noteId]) ?? [];

  const { pageOfItems, totalItemCount } = findNotes(notes, pageIndex, pageSize);

  const resultsCount =
    pageSize === 0 ? (
      <strong>{'All'}</strong>
    ) : (
      <>
        <strong>
          {pageSize * pageIndex + 1}-{pageSize * pageIndex + pageSize}
        </strong>{' '}
        of {totalItemCount}
      </>
    );

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount,
    pageSizeOptions: [10, 0],
  };

  const actions: Array<DefaultItemAction<Note>> = [
    {
      name: 'Delete',
      description: 'Delete this note',
      color: 'primary',
      icon: 'trash',
      type: 'icon',
      onClick: (note: Note) => deleteNote(note),
    },
  ];
  const columnWithActions = [
    ...columns,
    {
      name: 'actions',
      actions,
    },
  ];

  if (fetchLoading) {
    return <EuiLoadingElastic size="xxl" />;
  }

  if (fetchError) {
    return (
      <EuiEmptyPrompt
        iconType="error"
        color="danger"
        title={<h2>{'Unable to load your notes'}</h2>}
        body={<p>{'No can do'}</p>}
      />
    );
  }

  if (notes.length === 0) {
    return (
      <EuiEmptyPrompt
        iconType="editorStrike"
        title={<h2>{'No notes'}</h2>}
        body={<p>{'Add a note to get started'}</p>}
      />
    );
  }

  console.log('selectedItems', selectedItems);
  console.log('pageOfItems', pageOfItems);

  return (
    <>
      <EuiText size="xs">
        Showing {resultsCount} <strong>Notes</strong>
      </EuiText>
      <EuiBasicTable
        items={pageOfItems}
        pagination={pagination}
        tableCaption="Demo of EuiBasicTable"
        rowHeader="firstName"
        columns={columnWithActions}
        onChange={onTableChange}
        selection={selection}
      />
    </>
  );
};

NotesTable.displayName = 'NotesTable';
