import pg from 'pg'
import 'dotenv/config'

const { Pool, types } = pg

// pg returns NUMERIC (OID 1700) as strings by default to avoid float precision
// surprises; these are just prices/deposits for display and arithmetic here,
// so parse them as floats instead of scattering Number() across every caller.
types.setTypeParser(1700, (val) => parseFloat(val))

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
})

export function query(text, params) {
  return pool.query(text, params)
}
