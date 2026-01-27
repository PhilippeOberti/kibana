/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { RenderHookResult } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import type { UseExpandSectionParams } from './use_expand_section';
import { useExpandSection } from './use_expand_section';
import { useKibana } from '@kbn/kibana-react-plugin/public';

jest.mock('@kbn/kibana-react-plugin/public');

describe('useExpandSection', () => {
  let hookResult: RenderHookResult<boolean, UseExpandSectionParams>;

  it('should return default value if nothing in localStorage', () => {
    (useKibana as jest.Mock).mockReturnValue({
      services: {
        storage: {
          get: () => undefined,
        },
      },
    });

    const initialProps: UseExpandSectionParams = {
      title: 'test',
      defaultValue: true,
    };

    hookResult = renderHook((props: UseExpandSectionParams) => useExpandSection(props), {
      initialProps,
    });

    expect(hookResult.result.current).toBe(true);
  });

  it(`should return default value if localStorage doesn't have the correct key`, () => {
    (useKibana as jest.Mock).mockReturnValue({
      services: {
        storage: {
          get: () => ({ other: false }),
        },
      },
    });
    const initialProps: UseExpandSectionParams = {
      title: 'test',
      defaultValue: true,
    };

    hookResult = renderHook((props: UseExpandSectionParams) => useExpandSection(props), {
      initialProps,
    });

    expect(hookResult.result.current).toBe(true);
  });

  it('should return value from local storage', () => {
    (useKibana as jest.Mock).mockReturnValue({
      services: {
        storage: {
          get: () => ({ test: false }),
        },
      },
    });
    const initialProps: UseExpandSectionParams = {
      title: 'test',
      defaultValue: true,
    };

    hookResult = renderHook((props: UseExpandSectionParams) => useExpandSection(props), {
      initialProps,
    });

    expect(hookResult.result.current).toBe(false);
  });

  it('should check against lowercase values', () => {
    (useKibana as jest.Mock).mockReturnValue({
      services: {
        storage: {
          get: () => ({ test: false }),
        },
      },
    });
    const initialProps: UseExpandSectionParams = {
      title: 'Test',
      defaultValue: true,
    };

    hookResult = renderHook((props: UseExpandSectionParams) => useExpandSection(props), {
      initialProps,
    });

    expect(hookResult.result.current).toBe(false);
  });
});
