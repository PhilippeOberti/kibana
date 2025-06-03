/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiThemeComputed } from '@elastic/eui';
import { useEuiTheme } from '@elastic/eui';
import type { Severity } from '@kbn/securitysolution-io-ts-alerting-types';
import { useMemo } from 'react';

export const getRiskSeverityColors = (euiTheme: EuiThemeComputed) => ({
  low: euiTheme.colors.severity.neutral,
  medium: euiTheme.colors.severity.warning,
  high: euiTheme.colors.severity.risk,
  critical: euiTheme.colors.severity.danger,
});

export const useRiskSeverityColors = (): Record<Severity, string> => {
  const { euiTheme } = useEuiTheme();

  return useMemo(() => getRiskSeverityColors(euiTheme), [euiTheme]);
};
