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
import { buildFrameworkRequest, getNotesPaginated } from '../../utils/common';
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
          request: { query: getNotesPaginated },
        },
        version: '2023-10-31',
      },
      async (context, request, response) => {
        try {
          const queryParams = request.query;
          const frameworkRequest = await buildFrameworkRequest(context, security, request);
          const alertIds = queryParams.alertIds ?? null;
          console.log('alertIds:', alertIds);
          if (alertIds != null) {
            console.log('alerts not null');
            if (Array.isArray(alertIds)) {
              console.log('alerts is array');
              const alertIdSearchString = alertIds?.join(' | ');
              const options = {
                type: noteSavedObjectType,
                search: alertIdSearchString,
              };
              const res = await getAllSavedNote(frameworkRequest, options);
              console.log('res', res);
              // return response.ok({ body: res ?? {} });
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
            } else {
              console.log('alerts is not array');
              const options = {
                type: noteSavedObjectType,
                search: alertIds,
              };
              const res = await getAllSavedNote(frameworkRequest, options);
              console.log('res', res);
              // return response.ok({ body: res ?? {} });
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
            }
          } else {
            console.log('alerts is null');
            const perPage = queryParams?.perPage ? parseInt(queryParams.perPage, 10) : 10;
            const page = queryParams?.page ? parseInt(queryParams.page, 10) : 1;
            const search = queryParams?.search;
            const sortField = queryParams?.sortField;
            const sortOrder = queryParams?.sortOrder;
            const filter = queryParams?.filter;
            const options = {
              type: noteSavedObjectType,
              perPage,
              page,
              search,
              sortField,
              sortOrder,
              filter,
            };
            console.log(options);
            const res = await getAllSavedNote(frameworkRequest, options);
            // return response.ok({ body: res ?? {} });
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
          }
        } catch (err) {
          console.log('err:', err);
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

// export const getNotesByDocumentIdRoute = (
//   router: SecuritySolutionPluginRouter,
//   _: ConfigType,
//   security: SetupPlugins['security']
// ) => {
//   router.versioned
//     .get({
//       path: NOTE_URL,
//       options: {
//         tags: ['access:securitySolution'],
//       },
//       access: 'public',
//     })
//     .addVersion(
//       {
//         validate: {
//           request: { query: escapeHatch },
//         },
//         version: '2023-10-31',
//       },
//       async (context, request, response) => {
//         const customHttpRequestError = (message: string) =>
//           new CustomHttpRequestError(message, 400);
//         try {
//           const frameworkRequest = await buildFrameworkRequest(context, security, request);
//           const documentId = request.query?.documentId ?? null;
//           console.group('getNotesByDocumentIdRoute');
//           console.log('documentId:', documentId);
//           const options = {
//             type: noteSavedObjectType,
//             search: documentId,
//           };
//           const res = await getAllSavedNote(frameworkRequest, options);
//           console.log('res', res);
//
//           const normalizedRes = {
//             entities: {
//               notes: res.notes.reduce(
//                 (obj, item) => Object.assign(obj, { [item.noteId]: item }),
//                 {}
//               ),
//             },
//             result: res.notes.map((note) => note.noteId),
//           };
//           console.log('normalizedRes', normalizedRes);
//           console.groupEnd();
//
//           return response.ok({
//             body: res
//               ? {
//                 totalCount: res.totalCount,
//                 notes: normalizedRes,
//               }
//               : {},
//           });
//         } catch (err) {
//           const error = transformError(err);
//           const siemResponse = buildSiemResponse(response);
//
//           return siemResponse.error({
//             body: error.message,
//             statusCode: error.statusCode,
//           });
//         }
//       }
//     );
// };
