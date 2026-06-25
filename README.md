# zapdeps

A lightweight REST API built with [Hono](https://hono.dev) and TypeScript.

## Prerequisites

### To run with npm
- [nvm](https://github.com/nvm-sh/nvm) — Node version manager
- Node.js v24.18.0 (installed via nvm)

### To run with Docker
- [Docker](https://www.docker.com/products/docker-desktop)

---

## Running with npm

**1. Install the correct Node version:**
```bash
nvm install   # reads .nvmrc automatically
nvm use
```

**2. Install dependencies:**
```bash
npm install
```

**3. Start the dev server** (hot reload):
```bash
npm run dev
```

**4. Or build and run for production:**
```bash
npm run build
npm start
```

The server starts at `http://localhost:3000`.

---

## Running with Docker

**1. Build the image:**
```bash
docker build -t zapdeps .
```

**2. Run the container:**
```bash
docker run -p 3000:3000 zapdeps
```

The server starts at `http://localhost:3000`.

To run in the background:
```bash
docker run -d -p 3000:3000 --name zapdeps zapdeps
```

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/deployments` | List all deployments (supports filtering) |
| GET | `/deployments/:id` | Get a deployment by ID |

### Filtering

`GET /deployments` accepts optional query parameters to filter results:

| Parameter | Type | Allowed values |
|-----------|------|----------------|
| `status` | string | `running`, `success`, `failed` |
| `service` | string | Any service name |

Both filters are optional and can be combined.

### Example requests

```bash
# Health check
curl http://localhost:3000/health

# All deployments
curl http://localhost:3000/deployments

# Filter by status
curl http://localhost:3000/deployments?status=failed

# Filter by service
curl http://localhost:3000/deployments?service=auth-service

# Filter by both
curl "http://localhost:3000/deployments?status=failed&service=auth-service"

# Get by ID
curl http://localhost:3000/deployments/deploy_001
```

### Responses

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `400` | Invalid query parameter value |
| `404` | No matching deployments / ID not found |
| `500` | Server error |
