/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { transformError } from '@kbn/securitysolution-es-utils';
import type { SecuritySolutionPluginRouter } from '../../../../types';
import { NOTE_URL } from '../../../../../common/constants';

import type { ConfigType } from '../../../..';
import type { SetupPlugins } from '../../../../plugin';

import { buildSiemResponse } from '../../../detection_engine/routes/utils';

import { CustomHttpRequestError } from '../../../../utils/custom_http_request_error';
import { buildFrameworkRequest, escapeHatch } from '../../utils/common';
import { getAllSavedNote } from '../../saved_object/notes';
import { noteSavedObjectType } from '../../saved_object_mappings/notes';

export const getNotesByDocumentIdsRoute = (
  router: SecuritySolutionPluginRouter,
  _: ConfigType,
  security: SetupPlugins['security']
) => {
  router.versioned
    .get({
      path: NOTE_URL,
      options: {
        tags: ['access:securitySolution'],
      },
      access: 'public',
    })
    .addVersion(
      {
        validate: {
          request: { query: escapeHatch },
        },
        version: '2023-10-31',
      },
      async (context, request, response) => {
        const customHttpRequestError = (message: string) =>
          new CustomHttpRequestError(message, 400);
        try {
          const frameworkRequest = await buildFrameworkRequest(context, security, request);
          const alertIds = request.query?.alertIds ?? null;
          console.group('getNotesByDocumentIdsRoute');
          console.log('alertIds:', alertIds);
          // const pageSize = queryParams?.page_size ? parseInt(queryParams.page_size, 10) : null;
          // const pageIndex = queryParams?.page_index ? parseInt(queryParams.page_index, 10) : null;
          // const search = queryParams?.search ?? null;
          // const sortField = queryParams?.sort_field ?? null;
          // const sortOrder = queryParams?.sort_order ?? null;
          const alertIdSearchString = alertIds?.join(' | ');
          const options = {
            type: noteSavedObjectType,
            search: alertIdSearchString,
          };
          const res = await getAllSavedNote(frameworkRequest, options);

          console.log('res', res);
          console.groupEnd();

          return response.ok({ body: res ?? {} });
        } catch (err) {
          const error = transformError(err);
          const siemResponse = buildSiemResponse(response);

          return siemResponse.error({
            body: error.message,
            statusCode: error.statusCode,
          });
        }
      }
    );
};

export const getNotesByDocumentIdRoute = (
  router: SecuritySolutionPluginRouter,
  _: ConfigType,
  security: SetupPlugins['security']
) => {
  router.versioned
    .get({
      path: NOTE_URL,
      options: {
        tags: ['access:securitySolution'],
      },
      access: 'public',
    })
    .addVersion(
      {
        validate: {
          request: { query: escapeHatch },
        },
        version: '2023-10-31',
      },
      async (context, request, response) => {
        const customHttpRequestError = (message: string) =>
          new CustomHttpRequestError(message, 400);
        try {
          const frameworkRequest = await buildFrameworkRequest(context, security, request);
          const documentId = request.query?.documentId ?? null;
          console.group('getNotesByDocumentIdRoute');
          console.log('documentId:', documentId);
          const options = {
            type: noteSavedObjectType,
            search: documentId,
          };
          const res = await getAllSavedNote(frameworkRequest, options);
          console.log('res', res);

          const normalizedRes = {
            entities: {
              notes: res.notes.reduce(
                (obj, item) => Object.assign(obj, { [item.noteId]: item }),
                {}
              ),
            },
            result: res.notes.map((note) => note.noteId),
          };
          console.log('normalizedRes', normalizedRes);
          console.groupEnd();

          return response.ok({
            body: res
              ? {
                  totalCount: res.totalCount,
                  notes: normalizedRes,
                }
              : {},
          });
        } catch (err) {
          const error = transformError(err);
          const siemResponse = buildSiemResponse(response);

          return siemResponse.error({
            body: error.message,
            statusCode: error.statusCode,
          });
        }
      }
    );
};
