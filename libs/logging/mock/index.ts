import { jest } from '@jest/globals'
import { BunyanLogger } from '../src/logger';
import { createLoggerProxy } from '../src/loggerContext';

export { LoggerContext } from '../src/loggerContext'

// Global mock functions that can be accessed by tests
export const mockTrace = jest.fn();
export const mockDebug = jest.fn();
export const mockInfo = jest.fn();
export const mockWarn = jest.fn();
export const mockError = jest.fn();
export const mockFatal = jest.fn();

// Create a mock logger that satisfies the BunyanLogger interface
const createMockLogger = (): BunyanLogger => {
  const mockLogger = {
    addStream: jest.fn(),
    addSerializers: jest.fn(),
    level: jest.fn().mockReturnValue(30), // INFO level
    levels: jest.fn().mockReturnValue([]),
    trace: mockTrace,
    debug: mockDebug,
    info: mockInfo,
    warn: mockWarn,
    error: mockError,
    fatal: mockFatal,
    child: jest.fn().mockImplementation(() => createMockLogger()),
  } as any;

  return mockLogger;
};

// Create the base mock logger
const baseMockLogger = createMockLogger();

// Create the proxy logger (same as production but with mock base)
export const log: BunyanLogger = createLoggerProxy(baseMockLogger);

