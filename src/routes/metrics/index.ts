import { Hono } from 'hono'
import { getMetrics } from './handler.js'

const metrics = new Hono()

metrics.get('/', getMetrics)

export default metrics
