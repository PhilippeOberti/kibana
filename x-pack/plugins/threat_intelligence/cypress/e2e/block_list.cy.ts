/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  closeFlyout,
  navigateToThreatIntelligence,
  openFlyout,
  openFlyoutTakeAction,
  openIndicatorsTableMoreActions,
} from '../tasks/common';
import {
  fillBlocklistForm,
  openAddToBlockListFlyoutFromTable,
  openAddToBlocklistFromFlyout,
} from '../tasks/blocklist';
import { navigateToBlocklist } from '../tasks/common';
import { login, visit } from '../tasks/login';
import { esArchiverLoad, esArchiverUnload } from '../tasks/es_archiver';
import {
  BLOCK_LIST_VALUE_INPUT,
  FLYOUT_ADD_TO_BLOCK_LIST_ITEM,
  INDICATORS_TABLE_ADD_TO_BLOCK_LIST_BUTTON_ICON,
  SAVED_BLOCK_LIST_DESCRIPTION,
  SAVED_BLOCK_LIST_NAME,
} from '../screens/blocklist';

const THREAT_INTELLIGENCE = '/app/security/threat_intelligence/indicators';

const FIRST_BLOCK_LIST_NEW_NAME = 'first blocklist entry';
const FIRST_BLOCK_LIST_NEW_DESCRIPTION = 'the first description';
const SECOND_BLOCK_LIST_NEW_NAME = 'second blocklist entry';
const SECOND_BLOCK_LIST_NEW_DESCRIPTION = 'the second description';

describe('Block list with invalid indicators', () => {
  beforeEach(() => {
    esArchiverLoad('threat_intelligence/invalid_indicators_data');
    login();
    visit(THREAT_INTELLIGENCE);
  });

  afterEach(() => {
    esArchiverUnload('threat_intelligence/invalid_indicators_data');
  });

  it('should disabled blocklist in the indicators table context menu item and flyout context menu items', () => {
    // fourth indicator isn't a valid indicator for add to blocklist feature
    const thirdIndicatorId = 'qq3AKvjp1c/FBtEoh10Vt+PsT14=';
    openIndicatorsTableMoreActions(thirdIndicatorId);
    cy.get(INDICATORS_TABLE_ADD_TO_BLOCK_LIST_BUTTON_ICON).should('be.disabled');

    openFlyout(thirdIndicatorId);
    openFlyoutTakeAction();
    cy.get(FLYOUT_ADD_TO_BLOCK_LIST_ITEM).should('be.disabled');
  });
});

describe('Block list interactions', () => {
  beforeEach(() => {
    esArchiverLoad('threat_intelligence/indicators_data_short');
    login();
    visit(THREAT_INTELLIGENCE);
  });

  afterEach(() => {
    esArchiverUnload('threat_intelligence/indicators_data_short');
  });

  it.skip('should add to block list from the indicators table and from flyout', () => {
    // first indicator is a valid indicator for add to blocklist feature
    const firstIndicatorId = 'RP0HlUQkToBRTlZeGAItbyWMx1E=';
    const firstIndicatorFileHash =
      'd86e656455f985357df3063dff6637f7f3b95bb27d1769a6b88c7adecaf7763f';
    openIndicatorsTableMoreActions(firstIndicatorId);
    openAddToBlockListFlyoutFromTable();

    cy.get(BLOCK_LIST_VALUE_INPUT(firstIndicatorFileHash));

    fillBlocklistForm(FIRST_BLOCK_LIST_NEW_NAME, FIRST_BLOCK_LIST_NEW_DESCRIPTION);
    navigateToBlocklist();

    cy.get(SAVED_BLOCK_LIST_NAME).eq(0).should('have.text', FIRST_BLOCK_LIST_NEW_NAME);
    cy.get(SAVED_BLOCK_LIST_DESCRIPTION)
      .eq(0)
      .should('have.text', FIRST_BLOCK_LIST_NEW_DESCRIPTION);

    navigateToThreatIntelligence();

    // second indicator is a valid indicator for add to blocklist feature
    const secondIndicatorId = 'C4ObxkoTZzcjmk1jFwGlRadzMnA=';
    const secondIndicatorFileHash =
      'd3e2cf87eabf84ef929aaf8dad1431b3387f5a26de8ffb7a0c3c2a13f973c0ab';
    openFlyout(secondIndicatorId);
    openFlyoutTakeAction();
    openAddToBlocklistFromFlyout();

    cy.get(BLOCK_LIST_VALUE_INPUT(secondIndicatorFileHash));

    fillBlocklistForm(SECOND_BLOCK_LIST_NEW_NAME, SECOND_BLOCK_LIST_NEW_DESCRIPTION);
    closeFlyout();
    navigateToBlocklist();

    cy.get(SAVED_BLOCK_LIST_NAME).eq(0).should('have.text', SECOND_BLOCK_LIST_NEW_NAME);
    cy.get(SAVED_BLOCK_LIST_DESCRIPTION)
      .eq(0)
      .should('have.text', SECOND_BLOCK_LIST_NEW_DESCRIPTION);
  });
});
