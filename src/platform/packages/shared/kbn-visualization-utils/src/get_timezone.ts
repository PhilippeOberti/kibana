/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import moment from 'moment';
import type { IUiSettingsClient } from '@kbn/core/public';

/**
 * Get timeZone from uiSettings
 */
export function getTimeZone(uiSettings: IUiSettingsClient) {
  const timeZone = uiSettings.get('dateFormat:tz');
  return moment.tz.zone(timeZone)?.name ?? moment.tz.guess(true);
}
