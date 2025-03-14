// This file is not intended to be used, but
// defines the common interface to be implemented
// by the platform-specific implementations

import { NodeInit } from './index_node';
import { EmulatorInit } from './index_emulator';
import { MockedInit } from './index_mocked';

export * from './types';
export * from './store';
// We need to export these two as classes, not types
// to keep typescript happy.  The actual implementations
// exported are not defined by this file, but the platforms
export { FieldValue, Timestamp } from '@google-cloud/firestore';

export type InitParams = MockedInit|EmulatorInit|NodeInit;

// Define type of init function here, all versions must comply to this.
export async function init(_params?: InitParams) { return false; }
