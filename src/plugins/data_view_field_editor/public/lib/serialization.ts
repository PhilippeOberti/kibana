/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { monaco } from '@kbn/monaco';
import { DataViewField, DataView, RuntimeType } from '../shared_imports';
import type { Field, RuntimeFieldPainlessError } from '../types';

export const deserializeField = (dataView: DataView, field?: DataViewField): Field | undefined => {
  if (field === undefined) {
    return undefined;
  }

  const primitiveType = field?.esTypes ? (field.esTypes[0] as RuntimeType) : ('keyword' as const);
  const editType = field.runtimeField?.type === 'composite' ? 'composite' : primitiveType;

  return {
    name: field.name,
    type: editType,
    script: field.runtimeField ? field.runtimeField.script : undefined,
    customLabel: field.customLabel,
    customDescription: field.customDescription,
    popularity: field.count,
    format: dataView.getFormatterForFieldNoDefault(field.name)?.toJSON(),
    fields: field.runtimeField?.fields,
  };
};

export const painlessErrorToMonacoMarker = (
  { reason }: RuntimeFieldPainlessError,
  startPosition: monaco.Position
): monaco.editor.IMarkerData | undefined => {
  return {
    startLineNumber: startPosition.lineNumber,
    startColumn: startPosition.column,
    endLineNumber: startPosition.lineNumber,
    // Ideally we'd want the endColumn to be the end of the error but
    // ES does not return that info. There is an issue to track the enhancement:
    // https://github.com/elastic/elasticsearch/issues/78072
    endColumn: startPosition.column + 1,
    message: reason,
    severity: monaco.MarkerSeverity.Error,
  };
};
