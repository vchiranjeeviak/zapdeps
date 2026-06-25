import { Hono } from 'hono'
import deployments from './routes/deployments/index.js'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/deployments', deployments)

export default app
