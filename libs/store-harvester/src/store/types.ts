// Database configuration types
export interface DatabaseConfig<Shape extends {}, Stored extends {}=Shape, InShape=Shape> {
  rootFolder: string;
  dbname: string;
  key: string;
  transformIn: (data: InShape, last?: Stored) => Stored;
  transformOut: (data: Stored) => Shape;
}

// Error types
export interface PouchError extends Error {
  status: number;
  name: string;
  message: string;
}

export const isPouchError = (err: unknown): err is PouchError => {
  return err instanceof Error && 'status' in err;
};
