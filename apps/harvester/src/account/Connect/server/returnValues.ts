import { ServerResponse } from "http";
import { readFileSync } from "fs";

export function ok(res: ServerResponse, msg = 'OK') {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(msg);
}

export function okHtml(res: ServerResponse, html: string) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html);
}

export function okFile(res: ServerResponse, absPath: string) {
  const html = readFileSync(absPath, 'utf8');
  okHtml(res, html);
}

export function bad(res: ServerResponse, code = 400, msg = 'Bad Request') {
  res.statusCode = code;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(msg);
}
