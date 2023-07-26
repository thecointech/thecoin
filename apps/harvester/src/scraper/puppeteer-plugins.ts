// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck - no types for these evations

// Workaround Webpack dynamic imports issue
// https://github.com/berstend/puppeteer-extra/issues/93

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import ChromeApp from 'puppeteer-extra-plugin-stealth/evasions/chrome.app';
import ChromeCsi from 'puppeteer-extra-plugin-stealth/evasions/chrome.csi';
import ChromeLoadTimes from 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes';
import ChromeRuntime from 'puppeteer-extra-plugin-stealth/evasions/chrome.runtime';
import DefaultArgs from 'puppeteer-extra-plugin-stealth/evasions/defaultArgs';
import IFrameContentWindow from 'puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow';
import MediaCodecs from 'puppeteer-extra-plugin-stealth/evasions/media.codecs';
import NavigatorHardwareConcurrency from 'puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency';
import NavigatorLanguages from 'puppeteer-extra-plugin-stealth/evasions/navigator.languages';
import Navigatorpermissions from 'puppeteer-extra-plugin-stealth/evasions/navigator.permissions';
import Navigatorplugins from 'puppeteer-extra-plugin-stealth/evasions/navigator.plugins';
import Navigatorwebdriver from 'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver';
import sourceurl from 'puppeteer-extra-plugin-stealth/evasions/sourceurl';
import useragentoverride from 'puppeteer-extra-plugin-stealth/evasions/user-agent-override';
import webglvendor from 'puppeteer-extra-plugin-stealth/evasions/webgl.vendor';
import windowouterdimension from 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions';

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