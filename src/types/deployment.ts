export type DeploymentStatus = 'running' | 'success' | 'failed'

export type Deployment = {
  id: string
  service: string
  status: DeploymentStatus
  duration: number
  timestamp: string
  commit_sha: string
}
