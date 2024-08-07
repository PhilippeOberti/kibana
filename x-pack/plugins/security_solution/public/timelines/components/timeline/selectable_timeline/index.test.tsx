/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiSelectableProps } from '@elastic/eui';
import React from 'react';
import type { ShallowWrapper } from 'enzyme';
import { shallow, mount } from 'enzyme';

import { SortFieldTimelineEnum, TimelineTypeEnum } from '../../../../../common/api/timeline';
import { SelectableTimeline, ORIGINAL_PAGE_SIZE } from '.';
import { Direction } from '../../../../../common/search_strategy';

const mockFetchAllTimeline = jest.fn();
jest.mock('../../../containers/all', () => {
  return {
    useGetAllTimeline: jest.fn(() => ({
      fetchAllTimeline: mockFetchAllTimeline,
      timelines: [],
    })),
  };
});
describe('SelectableTimeline', () => {
  const props = {
    hideUntitled: false,
    getSelectableOptions: jest.fn().mockReturnValue([]),
    onClosePopover: jest.fn(),
    onTimelineChange: jest.fn(),
    timelineType: TimelineTypeEnum.default,
  };

  describe('should render', () => {
    let wrapper: ShallowWrapper;

    describe('timeline', () => {
      beforeAll(() => {
        wrapper = shallow(<SelectableTimeline {...props} />);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      test('render placeholder', () => {
        const searchProps: EuiSelectableProps['searchProps'] = wrapper
          .find('[data-test-subj="selectable-input"]')
          .prop('searchProps');
        expect(searchProps?.placeholder).toEqual('e.g. Timeline name or description');
      });
    });

    describe('timeline template', () => {
      const templateTimelineProps = { ...props, timelineType: TimelineTypeEnum.template };
      beforeAll(() => {
        wrapper = shallow(<SelectableTimeline {...templateTimelineProps} />);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      test('render placeholder', () => {
        const searchProps: EuiSelectableProps['searchProps'] = wrapper
          .find('[data-test-subj="selectable-input"]')
          .prop('searchProps');
        expect(searchProps?.placeholder).toEqual('e.g. Timeline template name or description');
      });
    });
  });

  describe('fetchAllTimeline', () => {
    const args = {
      pageInfo: {
        pageIndex: 1,
        pageSize: ORIGINAL_PAGE_SIZE,
      },
      search: '',
      sort: {
        sortField: SortFieldTimelineEnum.updated,
        sortOrder: Direction.desc,
      },
      status: null,
      onlyUserFavorite: false,
      timelineType: TimelineTypeEnum.default,
    };
    beforeAll(() => {
      mount(<SelectableTimeline {...props} />);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    test('should be called with correct args', () => {
      expect(mockFetchAllTimeline).toBeCalledWith(args);
    });
  });
});
