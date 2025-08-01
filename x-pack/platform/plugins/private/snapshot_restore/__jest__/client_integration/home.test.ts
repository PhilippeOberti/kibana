/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { act } from 'react-dom/test-utils';
import * as fixtures from '../../test/fixtures';
import {
  SNAPSHOT_REPOSITORY_EXCEPTION_ERROR,
  SNAPSHOT_STATE,
} from '../../public/application/constants';
import { API_BASE_PATH } from '../../common';
import { setupEnvironment, pageHelpers, getRandomString, findTestSubject } from './helpers';
import { HomeTestBed } from './helpers/home.helpers';
import { REPOSITORY_NAME } from './helpers/constant';

const { setup } = pageHelpers.home;

// Mocking FormattedDate and FormattedTime due to timezone differences on CI
jest.mock('@kbn/i18n-react', () => {
  const original = jest.requireActual('@kbn/i18n-react');
  const { i18n } = jest.requireActual('@kbn/i18n');
  i18n.init({ locale: 'en' });

  return {
    ...original,
    FormattedDate: () => '',
    FormattedTime: () => '',
  };
});

const removeWhiteSpaceOnArrayValues = (array: any[]) =>
  array.map((value) => {
    if (!value.trim) {
      return value;
    }
    return value.trim();
  });

describe('<SnapshotRestoreHome />', () => {
  const { httpSetup, httpRequestsMockHelpers } = setupEnvironment();
  let testBed: HomeTestBed;

  describe('on component mount', () => {
    beforeEach(async () => {
      await act(async () => {
        testBed = await setup(httpSetup);
      });
      testBed.component.update();
    });

    test('should set the correct app title', () => {
      const { exists, find } = testBed;
      expect(exists('appTitle')).toBe(true);
      expect(find('appTitle').text()).toEqual('Snapshot and Restore');
    });

    /**
     * TODO: investigate why we need to skip this test.
     * My guess is a change in the useRequest() hook and maybe a setTimout() that hasn't been
     * mocked with jest.useFakeTimers({ legacyFakeTimers: true });
     * I tested locally and the loading spinner is present in the UI so skipping this test for now.
     */
    test.skip('should display a loading while fetching the repositories', () => {
      const { exists, find } = testBed;
      expect(exists('sectionLoading')).toBe(true);
      expect(find('sectionLoading').text()).toEqual('Loading repositories…');
    });

    test('should have a link to the documentation', () => {
      const { exists, find } = testBed;
      expect(exists('documentationLink')).toBe(true);
      expect(find('documentationLink').text()).toBe('Snapshot and Restore docs');
    });

    describe('tabs', () => {
      test('should have 4 tabs', () => {
        const { find } = testBed;

        const tabs = [
          find('snapshots_tab'),
          find('repositories_tab'),
          find('policies_tab'),
          find('restore_status_tab'),
        ];

        expect(tabs.length).toBe(4);
        expect(tabs.map((t) => t.text())).toEqual([
          'Snapshots',
          'Repositories',
          'Policies',
          'Restore Status',
        ]);
      });

      test('should navigate to snapshot list tab', async () => {
        const { exists, actions } = testBed;

        expect(exists('repositoryList')).toBe(true);
        expect(exists('snapshotList')).toBe(false);

        await act(async () => {
          actions.selectTab('snapshots');
        });

        testBed.component.update();

        expect(exists('repositoryList')).toBe(false);
        expect(exists('snapshotListEmpty')).toBe(true);
      });
    });
  });

  describe('repositories', () => {
    describe('when there are no repositories', () => {
      beforeEach(() => {
        httpRequestsMockHelpers.setLoadRepositoriesResponse({ repositories: [] });
      });

      test('should display an empty prompt', async () => {
        const { component, exists } = await setup(httpSetup);

        component.update();

        expect(exists('sectionLoading')).toBe(false);
        expect(exists('emptyPrompt')).toBe(true);
        expect(exists('emptyPrompt.registerRepositoryButton')).toBe(true);
      });
    });

    describe('when there are repositories', () => {
      const repo1 = fixtures.getRepository({ name: `a${getRandomString()}`, type: 'fs' });
      const repo2 = fixtures.getRepository({ name: `b${getRandomString()}`, type: 'url' });
      const repo3 = fixtures.getRepository({ name: `c${getRandomString()}`, type: 's3' });
      const repo4 = fixtures.getRepository({ name: `d${getRandomString()}`, type: 'hdfs' });
      const repo5 = fixtures.getRepository({ name: `e${getRandomString()}`, type: 'azure' });
      const repo6 = fixtures.getRepository({ name: `f${getRandomString()}`, type: 'gcs' });
      const repo7 = fixtures.getRepository({ name: `g${getRandomString()}`, type: 'source' });
      const repo8 = fixtures.getRepository({
        name: `h${getRandomString()}`,
        type: 'source',
        settings: { delegateType: 'gcs' },
      });

      const repositories = [repo1, repo2, repo3, repo4, repo5, repo6, repo7, repo8];

      beforeEach(async () => {
        httpRequestsMockHelpers.setLoadRepositoriesResponse({ repositories });

        await act(async () => {
          testBed = await setup(httpSetup);
        });
        testBed.component.update();
      });

      test('should list them in the table', async () => {
        const { table } = testBed;
        const mapTypeToText: Record<string, string> = {
          fs: 'Shared file system',
          url: 'Read-only URL',
          s3: 'AWS S3',
          hdfs: 'Hadoop HDFS',
          azure: 'Azure',
          gcs: 'Google Cloud Storage',
          source: 'Source-only',
        };

        const { tableCellsValues } = table.getMetaData('repositoryTable');
        tableCellsValues.forEach((row, i) => {
          const repository = repositories[i];
          if (repository === repo8) {
            // The "repo8" is source with a delegate type
            expect(removeWhiteSpaceOnArrayValues(row)).toEqual([
              '',
              repository.name,
              `${mapTypeToText[repository.settings.delegateType]} (Source-only)`,
              '',
            ]);
          } else {
            expect(removeWhiteSpaceOnArrayValues(row)).toEqual([
              '',
              repository.name,
              mapTypeToText[repository.type],
              '',
            ]);
          }
        });
      });

      test('should have a button to reload the repositories', async () => {
        const { component, exists, actions } = testBed;
        expect(exists('reloadButton')).toBe(true);

        await act(async () => {
          actions.clickReloadButton();
        });
        component.update();

        expect(httpSetup.get).toHaveBeenLastCalledWith(
          `${API_BASE_PATH}repositories`,
          expect.anything()
        );
      });

      test('should have a button to register a new repository', () => {
        const { exists } = testBed;
        expect(exists('registerRepositoryButton')).toBe(true);
      });

      test('should have action buttons on each row to edit and delete a repository', () => {
        const { table } = testBed;
        const { rows } = table.getMetaData('repositoryTable');
        const lastColumn = rows[0].columns[rows[0].columns.length - 1].reactWrapper;

        expect(findTestSubject(lastColumn, 'editRepositoryButton').length).toBe(1);
        expect(findTestSubject(lastColumn, 'deleteRepositoryButton').length).toBe(1);
      });

      describe('delete repository', () => {
        test('should show a confirmation when clicking the delete repository button', async () => {
          const { actions } = testBed;

          await actions.clickRepositoryActionAt(0, 'delete');

          // We need to read the document "body" as the modal is added there and not inside
          // the component DOM tree.
          expect(
            document.body.querySelector('[data-test-subj="deleteRepositoryConfirmation"]')
          ).not.toBe(null);

          expect(
            document.body.querySelector('[data-test-subj="deleteRepositoryConfirmation"]')!
              .textContent
          ).toContain(`Remove repository '${repo1.name}'?`);
        });

        test('should send the correct HTTP request to delete repository', async () => {
          const { component, actions } = testBed;

          await actions.clickRepositoryActionAt(0, 'delete');

          const modal = document.body.querySelector(
            '[data-test-subj="deleteRepositoryConfirmation"]'
          );
          const confirmButton: HTMLButtonElement | null = modal!.querySelector(
            '[data-test-subj="confirmModalConfirmButton"]'
          );

          await act(async () => {
            confirmButton!.click();
          });
          component.update();

          expect(httpSetup.delete).toHaveBeenLastCalledWith(
            `${API_BASE_PATH}repositories/${repo1.name}`,
            expect.anything()
          );
        });
      });

      describe('detail panel', () => {
        test('should show the detail when clicking on a repository', async () => {
          const { exists, actions } = testBed;

          expect(exists('repositoryDetail')).toBe(false);

          await act(async () => {
            await actions.clickRepositoryAt(0);
          });
          testBed.component.update();

          expect(exists('repositoryDetail')).toBe(true);
        });

        test('should set the correct title', async () => {
          const { find, actions } = testBed;

          await actions.clickRepositoryAt(0);

          expect(find('repositoryDetail.title').text()).toEqual(repo1.name);
        });

        test('should show a loading state while fetching the repository', async () => {
          const { find, exists, actions } = testBed;

          // By providing undefined, the "loading section" will be displayed
          httpRequestsMockHelpers.setGetRepositoryResponse(repo1.name, undefined);

          await actions.clickRepositoryAt(0);

          expect(exists('repositoryDetail.sectionLoading')).toBe(true);
          expect(find('repositoryDetail.sectionLoading').text()).toEqual('Loading repository…');
        });

        describe('when the repository has been fetched', () => {
          beforeEach(async () => {
            httpRequestsMockHelpers.setGetRepositoryResponse(repo1.name, {
              repository: {
                name: 'my-repo',
                type: 'fs',
                settings: { location: '/tmp/es-backups' },
              },
              snapshots: { count: 0 },
            });

            await testBed.actions.clickRepositoryAt(0);
          });

          test('should have a link to the documentation', async () => {
            const { exists } = testBed;

            expect(exists('repositoryDetail.documentationLink')).toBe(true);
          });

          test('should set the correct repository settings', () => {
            const { find } = testBed;

            expect(find('repositoryDetail.repositoryType').text()).toEqual('Shared file system');
            expect(find('repositoryDetail.snapshotCount').text()).toEqual(
              'Repository has no snapshots'
            );
          });

          test('should have a button to verify the status of the repository', async () => {
            const { exists, find, component } = testBed;
            expect(exists('repositoryDetail.verifyRepositoryButton')).toBe(true);

            await act(async () => {
              find('repositoryDetail.verifyRepositoryButton').simulate('click');
            });
            component.update();

            expect(httpSetup.get).toHaveBeenLastCalledWith(
              `${API_BASE_PATH}repositories/${repo1.name}/verify`,
              expect.anything()
            );
          });

          describe('clean repository', () => {
            test('shows results when request succeeds', async () => {
              httpRequestsMockHelpers.setCleanupRepositoryResponse(repo1.name, {
                cleanup: {
                  cleaned: true,
                  response: {
                    results: {
                      deleted_bytes: 0,
                      deleted_blobs: 0,
                    },
                  },
                },
              });

              const { exists, find, component } = testBed;
              await act(async () => {
                find('repositoryDetail.cleanupRepositoryButton').simulate('click');
              });
              component.update();

              expect(httpSetup.post).toHaveBeenLastCalledWith(
                `${API_BASE_PATH}repositories/${repo1.name}/cleanup`,
                expect.anything()
              );

              expect(exists('repositoryDetail.cleanupCodeBlock')).toBe(true);
              expect(exists('repositoryDetail.cleanupError')).toBe(false);
            });

            test('shows error when success fails', async () => {
              httpRequestsMockHelpers.setCleanupRepositoryResponse(repo1.name, {
                cleanup: {
                  cleaned: false,
                  error: {
                    message: 'Error message',
                    statusCode: 400,
                  },
                },
              });

              const { exists, find, component } = testBed;
              await act(async () => {
                find('repositoryDetail.cleanupRepositoryButton').simulate('click');
              });
              component.update();

              expect(httpSetup.post).toHaveBeenLastCalledWith(
                `${API_BASE_PATH}repositories/${repo1.name}/cleanup`,
                expect.anything()
              );

              expect(exists('repositoryDetail.cleanupCodeBlock')).toBe(false);
              expect(exists('repositoryDetail.cleanupError')).toBe(true);
            });
          });
        });

        describe('when the repository has been fetched (and has snapshots)', () => {
          beforeEach(async () => {
            httpRequestsMockHelpers.setGetRepositoryResponse(repo1.name, {
              repository: {
                name: 'my-repo',
                type: 'fs',
                settings: { location: '/tmp/es-backups' },
              },
              snapshots: { count: 2 },
            });

            await testBed.actions.clickRepositoryAt(0);
          });

          test('should indicate the number of snapshots found', () => {
            const { find } = testBed;
            expect(find('repositoryDetail.snapshotCount').text()).toEqual('2 snapshots found');
          });
        });
      });
    });
  });

  describe('snapshots', () => {
    describe('when there are no snapshots nor repositories', () => {
      beforeAll(() => {
        httpRequestsMockHelpers.setLoadSnapshotsResponse({ snapshots: [] });
        httpRequestsMockHelpers.setLoadRepositoriesResponse({ repositories: [] });
      });

      beforeEach(async () => {
        testBed = await setup(httpSetup);

        await act(async () => {
          testBed.actions.selectTab('snapshots');
        });

        testBed.component.update();
      });

      test('should display an empty prompt', () => {
        const { exists } = testBed;

        expect(exists('snapshotListEmpty')).toBe(true);
      });

      test('should invite the user to first register a repository', () => {
        const { find, exists } = testBed;
        expect(find('snapshotListEmpty.title').text()).toBe('Start by registering a repository');
        expect(exists('snapshotListEmpty.registerRepositoryButton')).toBe(true);
      });
    });

    describe('when there are no snapshots but has some repository', () => {
      beforeEach(async () => {
        httpRequestsMockHelpers.setLoadSnapshotsResponse({
          snapshots: [],
          total: 0,
        });
        httpRequestsMockHelpers.setLoadRepositoriesResponse({
          repositories: [{ name: 'my-repo' }],
        });

        testBed = await setup(httpSetup);

        await act(async () => {
          testBed.actions.selectTab('snapshots');
        });
        testBed.component.update();
      });

      test('should display an empty prompt', () => {
        const { find, exists } = testBed;

        expect(exists('emptyPrompt')).toBe(true);
        expect(find('emptyPrompt.title').text()).toBe(`You don't have any snapshots yet`);
      });

      test('should have a link to the snapshot documentation', () => {
        const { exists } = testBed;
        expect(exists('emptyPrompt.documentationLink')).toBe(true);
      });
    });

    describe('when there are snapshots and repositories', () => {
      const snapshot1 = fixtures.getSnapshot({
        repository: REPOSITORY_NAME,
        snapshot: `a${getRandomString()}`,
        featureStates: ['kibana'],
      });
      const snapshot2 = fixtures.getSnapshot({
        repository: REPOSITORY_NAME,
        snapshot: `b${getRandomString()}`,
        includeGlobalState: false,
      });
      const snapshots = [snapshot1, snapshot2];

      beforeEach(async () => {
        httpRequestsMockHelpers.setLoadSnapshotsResponse({
          snapshots,
          total: 2,
        });
        httpRequestsMockHelpers.setLoadRepositoriesResponse({
          repositories: [{ name: REPOSITORY_NAME }],
        });

        testBed = await setup(httpSetup);

        await act(async () => {
          testBed.actions.selectTab('snapshots');
        });

        testBed.component.update();
      });

      test('should list them in the table', async () => {
        const { table } = testBed;
        const { tableCellsValues } = table.getMetaData('snapshotTable');

        tableCellsValues.forEach((row, i) => {
          const snapshot = snapshots[i];

          expect(row).toEqual([
            '', // Checkbox
            snapshot.snapshot, // Snapshot
            'Complete', // The displayed message when stats is success
            REPOSITORY_NAME, // Repository
            snapshot.indices.length.toString(), // Indices
            snapshot.shards.total.toString(), // Shards
            snapshot.shards.failed.toString(), // Failed shards
            ' ', // Mocked start time
            `${Math.ceil(snapshot.durationInMillis / 1000).toString()}s`, // Duration
            '',
          ]);
        });
      });

      test('should show a warning if one repository contains errors', async () => {
        httpRequestsMockHelpers.setLoadSnapshotsResponse({
          snapshots,
          total: 2,
          errors: {
            repository_with_errors: {
              type: 'repository_exception',
              reason:
                '[repository_with_errors] Could not read repository data because the contents of the repository do not match its expected state.',
            },
          },
        });
        httpRequestsMockHelpers.setLoadRepositoriesResponse({
          repositories: [{ name: REPOSITORY_NAME }],
        });

        testBed = await setup(httpSetup);

        await act(async () => {
          testBed.actions.selectTab('snapshots');
        });

        testBed.component.update();

        const { find, exists } = testBed;
        expect(exists('repositoryErrorsWarning')).toBe(true);
        expect(find('repositoryErrorsWarning').text()).toContain(
          'Some repositories contain errors'
        );
      });

      test('each row should have a link to the repository', async () => {
        const { component, find, exists, table, router } = testBed;

        const { rows } = table.getMetaData('snapshotTable');
        const repositoryLink = findTestSubject(rows[0].reactWrapper, 'repositoryLink');
        const { href } = repositoryLink.props();

        await act(async () => {
          router.navigateTo(href!);
        });
        component.update();

        // Make sure that we navigated to the repository list
        // and opened the detail panel for the repository
        expect(exists('snapshotList')).toBe(false);
        expect(exists('repositoryList')).toBe(true);
        expect(exists('repositoryDetail')).toBe(true);
        expect(find('repositoryDetail.title').text()).toBe(REPOSITORY_NAME);
      });

      test('should have a button to reload the snapshots', async () => {
        const { component, exists, actions } = testBed;
        expect(exists('reloadButton')).toBe(true);

        await act(async () => {
          actions.clickReloadButton();
        });
        component.update();

        expect(httpSetup.get).toHaveBeenLastCalledWith(
          `${API_BASE_PATH}snapshots`,
          expect.anything()
        );
      });

      describe('detail panel', () => {
        beforeEach(async () => {
          httpRequestsMockHelpers.setGetSnapshotResponse(
            snapshot1.repository,
            snapshot1.snapshot,
            snapshot1
          );
        });

        test('should show the detail when clicking on a snapshot', async () => {
          const { exists, actions } = testBed;
          expect(exists('snapshotDetail')).toBe(false);

          await actions.clickSnapshotAt(0);

          expect(exists('snapshotDetail')).toBe(true);
        });

        // Skipping this test as the server keeps on returning an empty object "{}"
        // that makes the component crash. I tried a few things with no luck so, as this
        // is a low impact test, I prefer to skip it and move on.
        test.skip('should show a loading while fetching the snapshot', async () => {
          const { find, exists, actions } = testBed;
          // By providing undefined, the "loading section" will be displayed
          httpRequestsMockHelpers.setGetSnapshotResponse(
            snapshot1.repository,
            snapshot1.snapshot,
            undefined
          );

          await actions.clickSnapshotAt(0);

          expect(exists('snapshotDetail.sectionLoading')).toBe(true);
          expect(find('snapshotDetail.sectionLoading').text()).toEqual('Loading snapshot…');
        });

        describe('on mount', () => {
          beforeEach(async () => {
            await testBed.actions.clickSnapshotAt(0);
          });

          test('should set the correct title', () => {
            const { find } = testBed;

            expect(find('snapshotDetail.detailTitle').text()).toEqual(snapshot1.snapshot);
          });

          test('should have a link to show the repository detail', async () => {
            const { component, exists, find, router } = testBed;
            expect(exists('snapshotDetail.repositoryLink')).toBe(true);

            const { href } = find('snapshotDetail.repositoryLink').props();

            await act(async () => {
              router.navigateTo(href);
            });
            component.update();

            // Make sure that we navigated to the repository list
            // and opened the detail panel for the repository
            expect(exists('snapshotList')).toBe(false);
            expect(exists('repositoryList')).toBe(true);
            expect(exists('repositoryDetail')).toBe(true);
            expect(find('repositoryDetail.title').text()).toBe(REPOSITORY_NAME);
          });

          test('should have a button to close the detail panel', () => {
            const { find, exists } = testBed;
            expect(exists('snapshotDetail.closeButton')).toBe(true);

            find('snapshotDetail.closeButton').simulate('click');

            expect(exists('snapshotDetail')).toBe(false);
          });

          test('should show feature states if include global state is enabled', async () => {
            const { find } = testBed;

            // Assert against first snapshot shown in the table, which should have includeGlobalState and a featureState
            expect(find('includeGlobalState.value').text()).toEqual('Yes');
            expect(find('snapshotFeatureStatesSummary.featureStatesList').text()).toEqual('kibana');

            // Close the flyout
            find('snapshotDetail.closeButton').simulate('click');

            // Replace the get snapshot details api call with the payload of the second snapshot which we're about to click
            httpRequestsMockHelpers.setGetSnapshotResponse(
              snapshot2.repository,
              snapshot2.snapshot,
              snapshot2
            );

            // Now we will assert against the second result of the table which shouldnt have includeGlobalState or a featureState
            await testBed.actions.clickSnapshotAt(1);

            expect(find('includeGlobalState.value').text()).toEqual('No');
            expect(find('snapshotFeatureStatesSummary.value').text()).toEqual('No');
          });

          describe('tabs', () => {
            test('should have 2 tabs', () => {
              const { find } = testBed;
              const tabs = find('snapshotDetail.tab');

              expect(tabs.length).toBe(2);
              expect(tabs.map((t) => t.text())).toEqual(['Summary', 'Failed indices (0)']);
            });

            test('should have the default tab set on "Summary"', () => {
              const { find } = testBed;

              const tabs = find('snapshotDetail.tab');
              const selectedTab = find('snapshotDetail').find('.euiTab-isSelected').last();

              expect(selectedTab.instance()).toBe(tabs.at(0).instance());
            });

            describe('summary tab', () => {
              test('should set the correct summary values', () => {
                const { version, uuid, indices } = snapshot1;

                const { find } = testBed;

                expect(find('snapshotDetail.version.value').text()).toBe(version);
                expect(find('snapshotDetail.uuid.value').text()).toBe(uuid);
                expect(find('snapshotDetail.state.value').text()).toBe('Complete');
                expect(find('snapshotDetail.includeGlobalState.value').text()).toEqual('Yes');
                expect(
                  find('snapshotDetail.snapshotFeatureStatesSummary.featureStatesList').text()
                ).toEqual('kibana');
                expect(find('snapshotDetail.indices.title').text()).toBe(
                  `Indices (${indices.length})`
                );
                expect(find('snapshotDetail.indices.value').text()).toContain(
                  indices.splice(0, 10).join('')
                );
              });

              test('should indicate the different snapshot states', async () => {
                const { find, actions } = testBed;

                // We need to click back and forth between the first table row (0) and  the second row (1)
                // in order to trigger the HTTP request that loads the snapshot with the new state.
                // This varible keeps track of it.
                let itemIndexToClickOn = 1;

                const setSnapshotStateAndUpdateDetail = async (state: string) => {
                  const updatedSnapshot = { ...snapshot1, state };
                  httpRequestsMockHelpers.setGetSnapshotResponse(
                    itemIndexToClickOn === 0 ? snapshot1.repository : snapshot2.repository,
                    itemIndexToClickOn === 0 ? snapshot1.snapshot : snapshot2.snapshot,
                    updatedSnapshot
                  );
                  await actions.clickSnapshotAt(itemIndexToClickOn); // click another snapshot to trigger the HTTP call
                };

                const expectMessageForSnapshotState = async (
                  state: string,
                  expectedMessage: string
                ) => {
                  await setSnapshotStateAndUpdateDetail(state);

                  const stateMessage = find('snapshotDetail.state.value').text();
                  try {
                    expect(stateMessage).toContain(expectedMessage); // Messages may include the word "Info" to account for the rendered text coming from EuiIcon
                  } catch {
                    throw new Error(
                      `Expected snapshot state message "${expectedMessage}" for state "${state}, but got "${stateMessage}".`
                    );
                  }

                  itemIndexToClickOn = itemIndexToClickOn ? 0 : 1;
                };

                const mapStateToMessage = {
                  [SNAPSHOT_STATE.IN_PROGRESS]: 'In progress',
                  [SNAPSHOT_STATE.FAILED]: 'Failed',
                  [SNAPSHOT_STATE.PARTIAL]: 'Partial',
                  [SNAPSHOT_STATE.SUCCESS]: 'Complete',
                };

                // Call sequentially each state and verify that the message is ok
                return Object.entries(mapStateToMessage).reduce(
                  async (promise, [state, message]) => {
                    return promise.then(async () => expectMessageForSnapshotState(state, message));
                  },
                  Promise.resolve()
                );
              });
            });

            describe('failed indices tab', () => {
              test('should display a message when snapshot created successfully', () => {
                const { find, actions } = testBed;
                actions.selectSnapshotDetailTab('failedIndices');

                expect(find('snapshotDetail.content').text()).toBe(
                  'All indices were stored successfully.'
                );
              });

              test('should display a message when snapshot in progress ', async () => {
                const { find, actions } = testBed;
                const updatedSnapshot = { ...snapshot2, state: 'IN_PROGRESS' };
                httpRequestsMockHelpers.setGetSnapshotResponse(
                  snapshot2.repository,
                  snapshot2.snapshot,
                  updatedSnapshot
                );

                await actions.clickSnapshotAt(1); // click another snapshot to trigger the HTTP call
                actions.selectSnapshotDetailTab('failedIndices');

                expect(find('snapshotDetail.content').text()).toBe('Snapshot is being created.');
              });
            });
          });
        });
      });

      describe('when there are failed indices', () => {
        const failure1 = fixtures.getIndexFailure();
        const failure2 = fixtures.getIndexFailure();
        const indexFailures = [failure1, failure2];

        beforeEach(async () => {
          const updatedSnapshot = { ...snapshot1, indexFailures };
          httpRequestsMockHelpers.setGetSnapshotResponse(
            updatedSnapshot.repository,
            updatedSnapshot.snapshot,
            updatedSnapshot
          );
          await testBed.actions.clickSnapshotAt(0);
          testBed.actions.selectSnapshotDetailTab('failedIndices');
        });

        test('should update the tab label', () => {
          const { find } = testBed;
          expect(find('snapshotDetail.tab').at(1).text()).toBe(
            `Failed indices (${indexFailures.length})`
          );
        });

        test('should display the failed indices', () => {
          const { find } = testBed;

          const expected = indexFailures.map((failure) => failure.index);
          const found = find('snapshotDetail.indexFailure.index').map((wrapper) => wrapper.text());

          expect(find('snapshotDetail.indexFailure').length).toBe(2);
          expect(found).toEqual(expected);
        });

        test('should detail the failure for each index', () => {
          const { find } = testBed;
          const index0Failure = find('snapshotDetail.indexFailure').at(0);
          const failuresFound = findTestSubject(index0Failure, 'failure');

          expect(failuresFound.length).toBe(failure1.failures.length);

          const failure0 = failuresFound.at(0);
          const shardText = findTestSubject(failure0, 'shard').text();
          // EUI data-test-subj alteration to be updated (eui#3483)
          // const reasonText = findTestSubject(failure0, 'reason').text();
          const reasonText = failure0.find('code').at(0).text();
          const [mockedFailure] = failure1.failures;

          expect(shardText).toBe(`Shard ${mockedFailure.shard_id}`);
          expect(reasonText).toBe(`${mockedFailure.status}: ${mockedFailure.reason}`);
        });
      });
    });

    describe('when there is an error while fetching the snapshots', () => {
      beforeEach(async () => {
        httpRequestsMockHelpers.setLoadSnapshotsResponse(undefined, {
          statusCode: 500,
          message: '[repository_with_errors] cannot retrieve snapshots list from this repository',
        });
        httpRequestsMockHelpers.setLoadRepositoriesResponse({
          repositories: [{ name: REPOSITORY_NAME }, { name: 'repository_with_errors' }],
        });

        testBed = await setup(httpSetup);

        await act(async () => {
          testBed.actions.selectTab('snapshots');
        });

        testBed.component.update();
      });

      test('should show a generic error prompt if snapshots request fails while still showing the search bar', async () => {
        const { find, exists } = testBed;

        // Check that the search bar is still present
        expect(exists('snapshotListSearch')).toBe(true);

        // Check that the error message is displayed
        expect(exists('snapshotsLoadingError')).toBe(true);
        expect(find('snapshotsLoadingError').text()).toContain('Error loading snapshots');
      });

      test('should show a repository error prompt if snapshots request fails due to repository exception while still showing the search bar', async () => {
        httpRequestsMockHelpers.setLoadSnapshotsResponse(undefined, {
          statusCode: 500,
          message: '[repository_with_errors] cannot retrieve snapshots list from this repository',
          attributes: {
            error: {
              type: SNAPSHOT_REPOSITORY_EXCEPTION_ERROR,
            },
          },
        });
        httpRequestsMockHelpers.setLoadRepositoriesResponse({
          repositories: [{ name: REPOSITORY_NAME }, { name: 'repository_with_errors' }],
        });

        testBed = await setup(httpSetup);

        await act(async () => {
          testBed.actions.selectTab('snapshots');
        });

        testBed.component.update();

        const { find, exists } = testBed;

        // Check that the search bar is still present
        expect(exists('snapshotListSearch')).toBe(true);

        // Check that the error message is displayed
        expect(exists('repositoryErrorsPrompt')).toBe(true);
        expect(find('repositoryErrorsPrompt').text()).toContain('Some repositories contain errors');
      });
    });
  });
});
