import type { Context } from 'hono'
import { deployments } from '../../seed.js'
import type { Deployment } from '../../types/deployment.js'

type TimeUnit = 'min' | 'hour' | 'day' | 'week' | 'mon'

const TIME_RANGE_REGEX = /^(\d+)(min|hour|day|week|mon)$/

const MS_PER_UNIT: Record<TimeUnit, number> = {
  min:  60 * 1000,
  hour: 60 * 60 * 1000,
  day:  24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  mon:  30 * 24 * 60 * 60 * 1000,
}

function getDeploymentFrequency(serviceDeployments: Deployment[], amount: number): number {
  return parseFloat((serviceDeployments.length / amount).toFixed(2))
}

function getFailureRate(serviceDeployments: Deployment[]): number {
  if (serviceDeployments.length === 0) return 0
  const failures = serviceDeployments.filter((d) => d.status === 'failed').length
  return parseFloat(((failures / serviceDeployments.length) * 100).toFixed(2))
}

function getP95Duration(serviceDeployments: Deployment[]): number {
  if (serviceDeployments.length === 0) return 0
  const sorted = [...serviceDeployments].sort((a, b) => a.duration - b.duration)
  const cutoff = Math.ceil(sorted.length * 0.95)
  const bottom95 = sorted.slice(0, cutoff)
  const avg = bottom95.reduce((sum, d) => sum + d.duration, 0) / bottom95.length
  return parseFloat(avg.toFixed(2))
}

export function getMetrics(c: Context) {
  const timeRange = c.req.query('time_range')

  if (!timeRange) {
    return c.json({ error: 'Query parameter time_range is required. Format: <number><unit> (e.g. 30min, 2hour, 7day, 2week, 1mon)' }, 400)
  }

  const match = timeRange.match(TIME_RANGE_REGEX)

  if (!match) {
    return c.json({ error: `Invalid time_range '${timeRange}'. Format: <number><unit> where unit is one of: min, hour, day, week, mon. Example: 30min, 2hour, 7day` }, 400)
  }

  const amount = parseInt(match[1], 10)
  const unit = match[2] as TimeUnit

  if (amount <= 0) {
    return c.json({ error: 'time_range amount must be greater than 0' }, 400)
  }

  let data: Deployment[]

  try {
    data = deployments
  } catch {
    return c.json({ error: 'Failed to read deployments' }, 500)
  }

  if (!Array.isArray(data)) {
    return c.json({ error: 'Deployments data is corrupted' }, 500)
  }

  const cutoff = Date.now() - amount * MS_PER_UNIT[unit]
  const filtered = data.filter((deployment) => new Date(deployment.timestamp).getTime() >= cutoff)

  const grouped = filtered.reduce<Record<string, Deployment[]>>((acc, deployment) => {
    acc[deployment.service] = acc[deployment.service] ?? []
    acc[deployment.service].push(deployment)
    return acc
  }, {})

  const metrics = Object.entries(grouped).map(([service, serviceDeployments]) => ({
    service,
    deployment_frequency: getDeploymentFrequency(serviceDeployments, amount),
    failure_rate: getFailureRate(serviceDeployments),
    p95_duration: getP95Duration(serviceDeployments),
  }))

  return c.json({
    time_range: timeRange,
    from: new Date(cutoff).toISOString(),
    to: new Date().toISOString(),
    metrics,
  }, 200)
}
