/* eslint-disable jest/no-jasmine-globals */
/* eslint-disable no-undef */
import detox from 'detox';
import { detox as config } from '../package.json';
import adapter from 'detox/runners/jest/adapter';
import specReporter from 'detox/runners/jest/specReporter';

// Set the default timeout
jest.setTimeout(120000);

jasmine.getEnv().addReporter(adapter);

// This takes care of generating status logs on a per-spec basis. By default, jest only reports at file-level.
// This is strictly optional.
jasmine.getEnv().addReporter(specReporter);

beforeAll(async () => {
  await detox.init(config, { launchApp: false });
  await device.launchApp({ permissions: { camera: 'YES' } });
}, 300000);

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
  await detox.cleanup();
});
