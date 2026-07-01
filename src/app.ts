import { Hono } from 'hono'
import { logger } from 'hono/logger'
import deployments from './routes/deployments/index.js'
import metrics from './routes/metrics/index.js'

const app = new Hono()

app.use('*', logger())

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/deployments', deployments)
app.route('/metrics', metrics)

export default app
