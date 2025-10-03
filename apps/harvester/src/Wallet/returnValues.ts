import { ServerResponse } from "http";

export function ok(res: ServerResponse, msg = 'OK') {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(msg);
}

export function bad(res: ServerResponse, code = 400, msg = 'Bad Request') {
  res.statusCode = code;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(msg);
}
