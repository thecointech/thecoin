import fs from 'fs'
import { emailCacheFile } from '../src/devlive.ts'

if (fs.existsSync(emailCacheFile)) {
  fs.unlinkSync(emailCacheFile)
}
