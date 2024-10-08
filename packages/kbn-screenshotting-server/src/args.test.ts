/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import os from 'os';
import { args } from './args';

// Since chromium v111 headless mode in arm based macs is not working with `--disable-gpu`
// This is a known issue: headless uses swiftshader by default and swiftshader's support for WebGL is currently disabled on Arm pending the resolution of https://issuetracker.google.com/issues/165000222.
//  As a workaround, we pass --enable-gpu to stop forcing swiftshader, see https://issues.chromium.org/issues/40256775#comment4
describe('headless webgl arm mac workaround', () => {
  const originalPlatform = process.platform;
  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });

  const simulateEnv = (platform: string, arch: string) => {
    Object.defineProperty(process, 'platform', { value: platform });
    jest.spyOn(os, 'arch').mockReturnValue(arch);
  };

  test('disables gpu for non arm mac', () => {
    simulateEnv('darwin', 'x64');

    const flags = args({
      userDataDir: '/',
      proxy: { enabled: false },
    });
    expect(flags.includes(`--disable-gpu`)).toBe(true);
  });

  test("doesn't disable gpu when on an arm mac, adds --enable-gpu", () => {
    simulateEnv('darwin', 'arm64');

    const flags = args({
      userDataDir: '/',
      proxy: { enabled: false },
    });

    expect(flags.includes(`--disable-gpu`)).toBe(false);
    expect(flags.includes(`--enable-gpu`)).toBe(true);
  });
});
