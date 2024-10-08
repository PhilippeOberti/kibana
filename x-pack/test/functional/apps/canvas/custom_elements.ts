/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';

import { FtrProviderContext } from '../../ftr_provider_context';

export default function canvasCustomElementTest({
  getService,
  getPageObjects,
}: FtrProviderContext) {
  const testSubjects = getService('testSubjects');
  const browser = getService('browser');
  const retry = getService('retry');
  const { canvas } = getPageObjects(['canvas']);
  const find = getService('find');
  const kibanaServer = getService('kibanaServer');
  const archive = 'x-pack/test/functional/fixtures/kbn_archiver/canvas/default';

  describe('custom elements', function () {
    this.tags('skipFirefox');

    before(async () => {
      await kibanaServer.importExport.load(archive);
      // load test workpad
      await canvas.goToListingPage();
      await canvas.loadFirstWorkpad('Test Workpad');
    });

    after(async () => {
      await kibanaServer.importExport.unload(archive);
    });

    it('creates a custom element from an element when prompted', async () => {
      // find the first workpad element (a markdown element) and click it to select it
      await testSubjects.click('canvasWorkpadPage > canvasWorkpadPageElementContent', 20000);

      // click "Edit" menu
      await testSubjects.click('canvasWorkpadEditMenuButton', 20000);

      // click the "Save as new element" button
      await testSubjects.click('canvasWorkpadEditMenu__saveElementButton', 20000);

      // fill out the custom element form and submit it
      await canvas.fillOutCustomElementForm('My New Element', 'An excellent new element');

      // wait for the custom element success toast notif
      await testSubjects.exists('canvasCustomElementCreate-success', {
        timeout: 30000,
      });
    });

    it('adds the custom element to the workpad when prompted', async () => {
      // open the saved elements modal
      await canvas.openSavedElementsModal();

      // ensure the custom element is the one expected and click it to add to the workpad
      const customElement = await find.byCssSelector('.canvasElementCard__wrapper');
      const elementName = await customElement.findByCssSelector('.euiCard__title');

      expect(await elementName.getVisibleText()).to.contain('My New Element');
      await customElement.click();

      await retry.try(async () => {
        // ensure the new element is on the workpad
        const elements = await testSubjects.findAll(
          'canvasWorkpadPage > canvasWorkpadPageElementContent'
        );
        expect(elements).to.have.length(5);

        // ensure the new element has the expected content
        const newElem = elements[4];
        const md = await newElem.findByCssSelector('.canvasMarkdown');
        expect(await md.getVisibleText()).to.contain('Welcome to Canvas');

        // delete the element off the workpad
        await newElem.click();
        await browser.pressKeys(browser.keys.DELETE);

        // ensure the new element has been removed
        const elementsAgain = await testSubjects.findAll(
          'canvasWorkpadPage > canvasWorkpadPageElementContent'
        );
        expect(elementsAgain).to.have.length(4);
      });
    });

    it('saves custom element modifications', async () => {
      // open the saved elements modal
      await canvas.openSavedElementsModal();

      // ensure the correct amount of custom elements exist
      const customElements = await find.allByCssSelector('.canvasElementCard__wrapper');
      expect(customElements).to.have.length(1);

      // hover over the custom element to bring up the edit and delete icons
      const customElement = customElements[0];
      await customElement.moveMouseTo();

      // click the edit element button
      await testSubjects.click('canvasElementCard__editButton', 20000);

      // fill out the custom element form and submit it
      await canvas.fillOutCustomElementForm('My Edited New Element', 'An excellent edited element');

      // ensure the custom element in the modal shows the updated text
      await retry.try(async () => {
        const elementName = await find.byCssSelector('.canvasElementCard__wrapper .euiCard__title');

        expect(await elementName.getVisibleText()).to.contain('My Edited New Element');
      });

      // Close the modal
      await canvas.closeSavedElementsModal();
    });

    it('deletes custom element when prompted', async () => {
      // open the saved elements modal
      await canvas.openSavedElementsModal();

      // ensure the correct amount of custom elements exist
      const customElements = await find.allByCssSelector('.canvasElementCard__wrapper');
      expect(customElements).to.have.length(1);

      // hover over the custom element to bring up the edit and delete icons
      const customElement = customElements[0];
      await customElement.moveMouseTo();

      // click the delete element button
      await testSubjects.click('canvasElementCard__deleteButton', 20000);

      await testSubjects.click('confirmModalConfirmButton', 20000);

      // ensure the custom element was deleted
      await retry.try(async () => {
        const customElementsAgain = await find.allByCssSelector('.canvasElementCard__wrapper');
        expect(customElementsAgain).to.have.length(0);
      });

      // Close the modal
      await canvas.closeSavedElementsModal();
    });
  });
}
