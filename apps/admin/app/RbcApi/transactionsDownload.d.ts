import { Page } from "puppeteer";

export function downloadTxCsv(page: Page): Promise<string>