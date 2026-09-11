import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')

const client = await pool.connect()
try {
  await client.query(sql)
  console.log('Schema applied.')
} finally {
  client.release()
  await pool.end()
}
