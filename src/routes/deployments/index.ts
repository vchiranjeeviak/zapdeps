import { Hono } from 'hono'
import { listDeployments, getDeployment } from './handler.js'

const deployments = new Hono()

deployments.get('/', listDeployments)
deployments.get('/:id', getDeployment)

export default deployments
