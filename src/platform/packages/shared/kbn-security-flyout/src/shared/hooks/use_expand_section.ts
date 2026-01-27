/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { CoreStart } from '@kbn/core-lifecycle-browser';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import { FLYOUT_STORAGE_KEYS } from '../constants/local_storage';

export interface UseExpandSectionParams {
  /**
   * Title of the section
   */
  title: string;
  /**
   * Default value for the section
   */
  defaultValue: boolean;
}

/**
 * Hook to get the expanded state of a section from local storage.
 */
export const useExpandSection = ({ title, defaultValue }: UseExpandSectionParams): boolean => {
  // @ts-ignore
  const { storage } = useKibana<CoreStart>().services;

  const localStorage = storage.get(FLYOUT_STORAGE_KEYS.OVERVIEW_TAB_EXPANDED_SECTIONS);
  const key = title.toLowerCase();

  return localStorage && localStorage[key] !== undefined ? localStorage[key] : defaultValue;
};
