/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { Client } from '@elastic/elasticsearch';
import { EntityFields, ESDocumentWithOperation } from '@kbn/apm-synthtrace-client';
import { pipeline, Readable, Transform } from 'stream';
import { SynthtraceEsClient, SynthtraceEsClientOptions } from '../shared/base_client';
import { getDedotTransform } from '../shared/get_dedot_transform';
import { getSerializeTransform } from '../shared/get_serialize_transform';
import { Logger } from '../utils/create_logger';

export type EntitiesSynthtraceEsClientOptions = Omit<SynthtraceEsClientOptions, 'pipeline'>;

interface Pipeline {
  includeSerialization?: boolean;
}

export class EntitiesSynthtraceEsClient extends SynthtraceEsClient<EntityFields> {
  constructor(
    options: {
      client: Client;
      logger: Logger;
      pipeline?: Pipeline;
    } & EntitiesSynthtraceEsClientOptions
  ) {
    super({
      ...options,
      pipeline: entitiesPipeline({
        includeSerialization: options.pipeline?.includeSerialization,
      }),
    });
    this.indices = ['.entities.v1.latest.builtin*'];
  }
}

function entitiesPipeline({ includeSerialization }: Pipeline = { includeSerialization: true }) {
  return (base: Readable) => {
    const serializationTransform = includeSerialization ? [getSerializeTransform()] : [];

    return pipeline(
      base,
      // @ts-expect-error Some weird stuff here with the type definition for pipeline. We have tests!
      ...serializationTransform,
      lastSeenTimestampTransform(),
      getRoutingTransform(),
      getDedotTransform(),
      (err: unknown) => {
        if (err) {
          throw err;
        }
      }
    );
  };
}

function lastSeenTimestampTransform() {
  return new Transform({
    objectMode: true,
    transform(document: ESDocumentWithOperation<EntityFields>, encoding, callback) {
      const timestamp = document['@timestamp'];
      if (timestamp) {
        const isoString = new Date(timestamp).toISOString();
        document['entity.last_seen_timestamp'] = isoString;
        document['event.ingested'] = isoString;
        delete document['@timestamp'];
      }
      callback(null, document);
    },
  });
}

function getRoutingTransform() {
  return new Transform({
    objectMode: true,
    transform(document: ESDocumentWithOperation<EntityFields>, encoding, callback) {
      const definitionId: string | undefined = document['entity.definition_id'];
      if (definitionId === undefined) {
        throw new Error(`entity.definition_id was not defined: ${JSON.stringify(document)}`);
      }
      document._action = {
        index: {
          _index: `.entities.v1.latest.${definitionId}`.toLocaleLowerCase(),
          _id: document['entity.id'],
        },
      };

      callback(null, document);
    },
  });
}
