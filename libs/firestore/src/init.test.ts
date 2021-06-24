jest.mock("./emulator");
jest.mock("./server");
jest.mock("./mock");

import { init } from '.';
import { init as init_debug } from './emulator';
import { init as init_server } from './server';
import { init as init_mock } from './mock';

import data from './mock.data.json';
import { isMockedDb } from './types';

describe('We choose the right instance of firestore', () => {


  beforeEach(() => {
    // ensure we don't leak configuration each test
    //jest.resetModules()
    process.env = {};
  })
  it('chooses right on the server', async () => {
    process.env["GAE_ENV"] = "someval";
    await init({project: "utilities"});
    expect(init_server).toBeCalled();
  })

  it ('chooses right when emulator is running', async () => {
    process.env.FIRESTORE_EMULATOR_PORT = '1234';
    await init({project: "utilities"}); // TODO: move project into env variable (?)
    expect(init_debug).toBeCalled();
  })

  it ('chooses right when service account is available', async () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'somepath';
    await init({project: "utilities"});
    expect(init_server).toBeCalled();
  })

  it("chooses the right when offline-only data provided", async () => {
    // no matter what other options there are, we only choose mock
    process.env.GAE_ENV = 'true';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'true';
    process.env.FIRESTORE_EMULATOR_PORT = 'true';
    // with mocked data
    await init(data);
    expect(init_mock).toBeCalled();
  })

  it ('can differentiate mocked data', () => {
    if (!isMockedDb(data)) {
      throw new Error('isMocked failed');
    }
    if (isMockedDb({ project: 'somevalue' })) {
      throw new Error('isMocked failed');
    }
  })

})



