import { jest } from '@jest/globals';
import { log } from '@thecointech/logging';

export const mockLog = () => {
    const logStatements: string[] = [];
    log.warn = jest.fn<(...args: any[]) => boolean>().mockImplementation((args) => {
      logStatements.push(args);
      return false;
    });
    log.info = jest.fn<(...args: any[]) => boolean>().mockImplementation((args) => {
      logStatements.push(args);
      return false;
    });
    return logStatements;
  }