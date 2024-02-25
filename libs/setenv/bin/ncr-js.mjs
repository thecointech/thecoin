// NodeCustomResolver

import { getConditions } from "./conditions.mjs";
import {existsSync} from 'fs'
import {basename, dirname, extname, join} from 'path'
import {fileURLToPath} from 'url'

/**
 * @param {string} specifier
 * @param {{
 *   conditions: string[],
 *   parentURL: string | undefined,
 * }} context
 * @param {Function} defaultResolve
 * @returns {Promise<{ url: string }>}
 */

// Inspired by https://stackoverflow.com/questions/74660824/nodejs-v19-drops-support-for-es-module-specifier-resolution-node-which-makes-i
const extensions = ['mjs', 'js', 'json']
const indexFiles = extensions.map(e => `index.${e}`)
const postfixes = extensions.map(e => `.${e}`).concat(indexFiles.map(p => `/${p}`))
const prefixes = ['/', './', '../']
const findPostfix = (specifier, context) =>
  (specifier.endsWith('/')
    ? indexFiles
    : postfixes
  ).find(p =>
    existsSync(specifier.startsWith('/')
      ? specifier + p
      : join(dirname(fileURLToPath(context.parentURL)), specifier + p)
    )
  )


export async function resolve(specifier, context, nextResolve)
{
  let postfix = prefixes.some(p => specifier.startsWith(p))
    && !extensions.includes(extname(basename(specifier)).toLowerCase())
    && findPostfix(specifier, context) || ''

  return nextResolve(specifier + postfix, {
    ...context,
    conditions: getConditions(context),
  }, nextResolve)
}
