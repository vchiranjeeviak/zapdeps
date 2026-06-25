import type { Context } from 'hono'
import { deployments } from '../../seed.js'

const VALID_STATUSES = ['running', 'success', 'failed']

export function listDeployments(c: Context) {
  let data: typeof deployments

  try {
    data = deployments
  } catch {
    return c.json({ error: 'Failed to read deployments' }, 500)
  }

  if (!Array.isArray(data)) {
    return c.json({ error: 'Deployments data is corrupted' }, 500)
  }

  const status = c.req.query('status')
  const service = c.req.query('service')

  if (status && !VALID_STATUSES.includes(status)) {
    return c.json({ error: `Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}` }, 400)
  }

  let result = data
  if (status) result = result.filter((d) => d.status === status)
  if (service) result = result.filter((d) => d.service === service)

  if (result.length === 0) {
    return c.json({ message: 'No deployments found' }, 404)
  }

  return c.json(result, 200)
}

export function getDeployment(c: Context) {
  const id = c.req.param('id')

  if (!id || id.trim() === '') {
    return c.json({ error: 'Deployment ID is required' }, 400)
  }

  let data: typeof deployments

  try {
    data = deployments
  } catch {
    return c.json({ error: 'Failed to read deployments' }, 500)
  }

  if (!Array.isArray(data)) {
    return c.json({ error: 'Deployments data is corrupted' }, 500)
  }

  const deployment = data.find((d) => d.id === id)

  if (!deployment) {
    return c.json({ error: `Deployment with ID '${id}' not found` }, 404)
  }

  return c.json(deployment, 200)
}
