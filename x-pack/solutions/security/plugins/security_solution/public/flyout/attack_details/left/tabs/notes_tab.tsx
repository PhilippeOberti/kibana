/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import { buildDataTableRecord, type EsHitRecord } from '@kbn/discover-utils';
import { NotesDetailsContent } from '../../../../flyout_v2/notes/components/notes_details_content';
import { useAttackDetailsContext } from '../../context';

/**
 * Notes tab content for the Attack Details flyout left panel.
 */
export const NotesTab = memo(() => {
  const { searchHit } = useAttackDetailsContext();
  const hit = useMemo(() => buildDataTableRecord(searchHit as unknown as EsHitRecord), [searchHit]);

  return <NotesDetailsContent hit={hit} />;
});

NotesTab.displayName = 'NotesTab';
