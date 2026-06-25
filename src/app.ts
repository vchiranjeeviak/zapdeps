import { Hono } from 'hono'
import { logger } from 'hono/logger'
import deployments from './routes/deployments/index.js'

const app = new Hono()

app.use('*', logger())

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/deployments', deployments)

export default app
