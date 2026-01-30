import { type NextFunction, type Request, type Response } from "express";
import { log, LoggerContext } from "@thecointech/logging";
import crypto from "node:crypto";

// Report any/all errors to the authorities!
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof Error) {
    log.error(err, `Internal Error`);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
  next();
}

// Bundle log messages per-request
export function requestIdMiddleware(_req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', requestId);
  LoggerContext.run(() => {
    new LoggerContext({ RequestId: requestId });
    next();
  });
}

export function requestTimerMiddleware(_req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log.info(`Request took ${duration}ms`);
  });
  next();
}