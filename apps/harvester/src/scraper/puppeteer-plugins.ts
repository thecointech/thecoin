// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck - no types for these evations

// Workaround Webpack dynamic imports issue
// https://github.com/berstend/puppeteer-extra/issues/93

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import ChromeApp from 'puppeteer-extra-plugin-stealth/evasions/chrome.app/index.js';
import ChromeCsi from 'puppeteer-extra-plugin-stealth/evasions/chrome.csi/index.js';
import ChromeLoadTimes from 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes/index.js';
import ChromeRuntime from 'puppeteer-extra-plugin-stealth/evasions/chrome.runtime/index.js';
import DefaultArgs from 'puppeteer-extra-plugin-stealth/evasions/defaultArgs/index.js';
import IFrameContentWindow from 'puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow/index.js';
import MediaCodecs from 'puppeteer-extra-plugin-stealth/evasions/media.codecs/index.js';
import NavigatorHardwareConcurrency from 'puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency/index.js';
import NavigatorLanguages from 'puppeteer-extra-plugin-stealth/evasions/navigator.languages/index.js';
import Navigatorpermissions from 'puppeteer-extra-plugin-stealth/evasions/navigator.permissions/index.js';
import Navigatorplugins from 'puppeteer-extra-plugin-stealth/evasions/navigator.plugins/index.js';
import Navigatorwebdriver from 'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver/index.js';
import sourceurl from 'puppeteer-extra-plugin-stealth/evasions/sourceurl/index.js';
import useragentoverride from 'puppeteer-extra-plugin-stealth/evasions/user-agent-override/index.js';
import webglvendor from 'puppeteer-extra-plugin-stealth/evasions/webgl.vendor/index.js';
import windowouterdimension from 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions/index.js';

export const getPlugins = () => [
  StealthPlugin(),
  ChromeApp(),
  ChromeCsi(),
  ChromeLoadTimes(),
  ChromeRuntime(),
  DefaultArgs(),
  IFrameContentWindow(),
  MediaCodecs(),
  NavigatorHardwareConcurrency(),
  NavigatorLanguages(),
  Navigatorpermissions(),
  Navigatorplugins(),
  Navigatorwebdriver(),
  sourceurl(),
  useragentoverride(),
  webglvendor(),
  windowouterdimension(),
]