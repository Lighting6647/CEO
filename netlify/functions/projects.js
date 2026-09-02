import { getDatabase } from '@netlify/database'

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}

const SEED_PROJECTS = [
  ['UI/UX Design', 'ออกแบบหน้าตา Gantt Chart', 'Done', '-', 'Low'],
  ['Backend & DB', 'เขียน Notification Engine', 'In Progress', '-', 'Medium'],
  ['Frontend Dev', 'เตรียมประกอบร่าง UI', 'Blocked', 'Backend API', 'High'],
  ['QA & Testing', 'เตรียมเขียน Automated Test', 'Pending', 'Frontend & Backend', 'Medium'],
  ['Growth & Mkt', 'ร่างแคมเปญโฆษณา B2B', 'In Progress', '-', 'Low'],
]

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: JSON_HEADERS,
})

async function ensureProjectsTable(db) {
  await db.query('BEGIN')

  try {
    // Prevent concurrent cold starts from seeding the table more than once.
    await db.query('SELECT pg_advisory_xact_lock($1)', [20260814])
    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        task VARCHAR(255),
        status VARCHAR(50),
        blocked_by VARCHAR(255),
        risk VARCHAR(50)
      )
    `)

    const { rows } = await db.query('SELECT EXISTS (SELECT 1 FROM projects) AS has_projects')

    if (!rows[0].has_projects) {
      for (const project of SEED_PROJECTS) {
        await db.query(
          `INSERT INTO projects (name, task, status, blocked_by, risk)
           VALUES ($1, $2, $3, $4, $5)`,
          project,
        )
      }
    }

    await db.query('COMMIT')
  } catch (error) {
    await db.query('ROLLBACK')
    throw error
  }
}

export default async (request) => {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'GET' },
    })
  }

  try {
    const db = await getDatabase()
    await ensureProjectsTable(db)

    const { rows } = await db.query(`
      SELECT id, name, task, status, blocked_by AS "blockedBy", risk
      FROM projects
      ORDER BY id ASC
    `)

    return jsonResponse(rows)
  } catch (error) {
    console.error('Unable to load projects', error)
    return jsonResponse({ error: 'Unable to load projects' }, 500)
  }
}

export const config = {
  path: '/api/projects',
}
