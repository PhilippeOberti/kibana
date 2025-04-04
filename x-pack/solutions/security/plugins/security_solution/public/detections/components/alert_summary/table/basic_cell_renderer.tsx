/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import type { JsonValue } from '@kbn/utility-types';
import { getOrEmptyTagFromValue } from '../../../../common/components/empty_value';

export interface BasicCellRendererProps {
  /**
   *
   */
  values: string | JsonValue[];
}

/**
 * Component used in the AI for SOC alert summary table.
 * It renders all the values currently as simply as possible (see code comments below).
 */
export const BasicCellRenderer = memo(({ values }: BasicCellRendererProps) => {
  const displayValue: string | null = useMemo(() => {
    // Displays string as is.
    // Joins values of array with more than one element.
    // Returns null if the value is null.
    // Return the string of the value otherwise.
    if (typeof values === 'string') {
      return values;
    } else if (Array.isArray(values)) {
      if (values.length > 1) {
        return values.join(', ');
      } else {
        const value: JsonValue = values[0];
        if (typeof value === 'string') {
          return value;
        } else if (value == null) {
          return null;
        } else {
          return value.toString();
        }
      }
    } else {
      return null;
    }
  }, [values]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      {getOrEmptyTagFromValue(displayValue)}
    </div>
  );
});

BasicCellRenderer.displayName = 'BasicCellRenderer';
