jest.mock("./emulator");
jest.mock("./server");

import { init, isMockedDb } from '.';
import { init as init_debug } from './emulator';
import { init as init_server } from './server';

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

  it("throws if we supply mocked data here", async () => {
    // no matter what other options there are, we only choose mock
    process.env.GAE_ENV = 'true';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'true';
    process.env.FIRESTORE_EMULATOR_PORT = 'true';
    await expect(init({})).rejects.toThrow();
  })
})

it ('can differentiate mocked data', () => {
  if (!isMockedDb({})) {
    throw new Error('isMocked failed');
  }
  if (isMockedDb({ project: 'somevalue' })) {
    throw new Error('isMocked failed');
  }
})


