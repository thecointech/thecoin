jest.mock("./debug");
jest.mock("./server");

import { init } from '.';
import { init as init_debug } from './debug';
import { init as init_server } from './server';

it("chooses the right init pathway", async () => {
  await init({project: "utilities"});
  expect(init_debug).toBeCalled();

  process.env["GAE_ENV"] = "someval";
  await init({project: "utilities"});
  expect(init_server).toBeCalled();

  //expect(GetFirestore()).toBeTruthy();
})

