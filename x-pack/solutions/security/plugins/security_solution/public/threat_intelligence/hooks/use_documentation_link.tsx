/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { DocLinks } from '@kbn/doc-links';
import { useKibana } from '../../common/lib/kibana';

const useKibanaDocumentationLinks = (): DocLinks => useKibana().services.docLinks.links;

export const useTIDocumentationLink = (): string =>
  useKibanaDocumentationLinks().securitySolution.threatIntelInt;
