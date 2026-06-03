import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'fancurva',
  password: process.env.DB_PASSWORD || 'fancurva_secret',
  database: process.env.DB_NAME || 'fancurva_dev',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Unexpected DB error', err)
})

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
}

export default pool
