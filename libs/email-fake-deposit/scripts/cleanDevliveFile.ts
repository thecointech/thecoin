import fs from 'fs'
import { emailCacheFile } from '../src/devlive.ts'

fs.unlinkSync(emailCacheFile)
