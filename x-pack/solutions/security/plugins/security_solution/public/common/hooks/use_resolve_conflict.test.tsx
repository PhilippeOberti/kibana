/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { useLocation } from 'react-router-dom';
import { renderHook } from '@testing-library/react';
import { useDeepEqualSelector } from './use_selector';
import { useKibana } from '../lib/kibana';
import { useResolveConflict } from './use_resolve_conflict';

jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');

  return {
    ...original,
    useLocation: jest.fn(),
  };
});
jest.mock('../lib/kibana');
jest.mock('./use_selector');
jest.mock('../../timelines/store', () => ({
  timelineSelectors: {
    getTimelineByIdSelector: () => jest.fn(),
  },
}));

describe('useResolveConflict', () => {
  const mockGetLegacyUrlConflict = jest.fn().mockReturnValue('Test!');
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock rison format in actual url
    (useLocation as jest.Mock).mockReturnValue({
      pathname: 'my/cool/path',
      search: 'timeline=(activeTab:query,id:%2704e8ffb0-2c2a-11ec-949c-39005af91f70%27,isOpen:!t)',
    });
    (useKibana as jest.Mock).mockReturnValue({
      services: {
        spaces: {
          ui: {
            components: {
              getLegacyUrlConflict: mockGetLegacyUrlConflict,
            },
          },
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resolve object is not provided', () => {
    it('should not show the conflict message', async () => {
      (useDeepEqualSelector as jest.Mock).mockImplementation(() => ({
        savedObjectId: 'current-saved-object-id',
        activeTab: 'some-tab',
        show: false,
      }));
      const { result } = renderHook(() => useResolveConflict());
      expect(mockGetLegacyUrlConflict).not.toHaveBeenCalled();
      expect(result.current).toEqual(null);
    });
  });

  describe('outcome is exactMatch', () => {
    it('should not show the conflict message', async () => {
      (useDeepEqualSelector as jest.Mock).mockImplementation(() => ({
        resolveTimelineConfig: {
          outcome: 'exactMatch',
        },
        savedObjectId: 'current-saved-object-id',
        activeTab: 'some-tab',
        show: false,
      }));
      const { result } = renderHook(() => useResolveConflict());
      expect(mockGetLegacyUrlConflict).not.toHaveBeenCalled();
      expect(result.current).toEqual(null);
    });
  });

  describe('outcome is aliasMatch', () => {
    it('should not show the conflict message', async () => {
      (useDeepEqualSelector as jest.Mock).mockImplementation(() => ({
        resolveTimelineConfig: {
          outcome: 'aliasMatch',
          alias_target_id: 'new-id',
        },
      }));
      const { result } = renderHook(() => useResolveConflict());
      expect(mockGetLegacyUrlConflict).not.toHaveBeenCalled();
      expect(result.current).toEqual(null);
    });
  });

  describe('outcome is conflict', () => {
    const mockTextContent = 'I am the visible conflict message';
    it('should show the conflict message', async () => {
      (useDeepEqualSelector as jest.Mock).mockImplementation(() => ({
        resolveTimelineConfig: {
          outcome: 'conflict',
          alias_target_id: 'new-id',
        },
      }));
      mockGetLegacyUrlConflict.mockImplementation(() => mockTextContent);
      const { result } = renderHook(() => useResolveConflict());
      expect(mockGetLegacyUrlConflict).toHaveBeenCalledWith({
        objectNoun: 'timeline',
        currentObjectId: '04e8ffb0-2c2a-11ec-949c-39005af91f70',
        otherObjectId: 'new-id',
        otherObjectPath:
          'my/cool/path?timeline=%28activeTab%3Aquery%2Cid%3Anew-id%2CisOpen%3A%21t%29',
      });
      expect(result.current).toMatchInlineSnapshot(`
        <React.Fragment>
          I am the visible conflict message
          <EuiSpacer />
        </React.Fragment>
      `);
    });

    describe('rison is unable to be decoded', () => {
      it('should use timeline values from redux to create the otherObjectPath', async () => {
        (useLocation as jest.Mock).mockReturnValue({
          pathname: 'my/cool/path',
          search: '?foo=bar',
        });
        (useDeepEqualSelector as jest.Mock).mockImplementation(() => ({
          resolveTimelineConfig: {
            outcome: 'conflict',
            alias_target_id: 'new-id',
          },
          savedObjectId: 'current-saved-object-id',
          activeTab: 'some-tab',
          show: false,
        }));
        mockGetLegacyUrlConflict.mockImplementation(() => mockTextContent);
        renderHook(() => useResolveConflict());
        const { result } = renderHook(() => useResolveConflict());
        expect(mockGetLegacyUrlConflict).toHaveBeenCalledWith({
          objectNoun: 'timeline',
          currentObjectId: 'current-saved-object-id',
          otherObjectId: 'new-id',
          otherObjectPath:
            'my/cool/path?foo=bar&timeline=%28activeTab%3Asome-tab%2Cid%3Anew-id%2CisOpen%3A%21f%29',
        });
        expect(result.current).toMatchInlineSnapshot(`
          <React.Fragment>
            I am the visible conflict message
            <EuiSpacer />
          </React.Fragment>
        `);
      });
    });
  });
});
