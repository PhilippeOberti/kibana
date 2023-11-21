/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { UrlObject } from 'url';
import Url from 'url';

import { encode } from '@kbn/rison';
import { NEW_FEATURES_TOUR_STORAGE_KEYS } from '@kbn/security-solution-plugin/common/constants';
import {
  LOADING_INDICATOR,
  LOADING_INDICATOR_HIDDEN,
} from '../../../security_solution_cypress/cypress/screens/security_header';

enum ROLES {
  elastic = 'elastic',
}

/**
 * cy.visit will default to the baseUrl which uses the default kibana test user
 * This function will override that functionality in cy.visit by building the baseUrl
 * directly from the environment variables set up in x-pack/test/security_solution_cypress/runner.ts
 *
 * @param role string role/user to log in with
 * @param route string route to visit
 */
const getUrlWithRoute = (role: ROLES, route: string) => {
  const url = Cypress.config().baseUrl;
  const kibana = new URL(String(url));
  const theUrl = `${Url.format({
    auth: `${role}:changeme`,
    username: role,
    password: 'changeme',
    protocol: kibana.protocol.replace(':', ''),
    hostname: kibana.hostname,
    port: kibana.port,
  } as UrlObject)}${route.startsWith('/') ? '' : '/'}${route}`;
  cy.log(`origin: ${theUrl}`);
  return theUrl;
};

const disableNewFeaturesTours = (window: Window) => {
  const tourStorageKeys = Object.values(NEW_FEATURES_TOUR_STORAGE_KEYS);
  const tourConfig = {
    isTourActive: false,
  };

  tourStorageKeys.forEach((key) => {
    window.localStorage.setItem(key, JSON.stringify(tourConfig));
  });
};

export const visit = (url: string, options: Partial<Cypress.VisitOptions> = {}, role?: ROLES) => {
  const timerangeConfig = {
    from: 1547914976217,
    fromStr: '2019-01-19T16:22:56.217Z',
    kind: 'relative',
    to: 1579537385745,
    toStr: 'now',
  };

  const timerange = encode({
    global: {
      linkTo: ['timeline'],
      timerange: timerangeConfig,
    },
    timeline: {
      linkTo: ['global'],
      timerange: timerangeConfig,
    },
  });

  cy.visit(role ? getUrlWithRoute(role, url) : url, {
    ...options,
    qs: {
      ...options.qs,
      timerange,
    },
    onBeforeLoad: (win) => {
      options.onBeforeLoad?.(win);

      disableNewFeaturesTours(win);
    },
  });
  waitForPageToBeLoaded();
};

export const waitForPageToBeLoaded = () => {
  cy.get(LOADING_INDICATOR_HIDDEN).should('exist');
  cy.get(LOADING_INDICATOR).should('not.exist');
};
