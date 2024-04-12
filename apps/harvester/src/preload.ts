// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { connectRenderer } from "./scraper_bridge_renderer";

connectRenderer();