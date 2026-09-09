# MiniStatus

> A lightweight infrastructure status page with a public status dashboard, an admin interface, Kubernetes deployment, GitOps delivery, and Prometheus/Grafana observability.

MiniStatus started as a small React + Express + PostgreSQL application and was extended into a complete DevOps/Kubernetes deployment project on an OpenStack Magnum cluster.

The project demonstrates the path from **application development → testing → containerization → CI/CD → Kubernetes → GitOps → observability**.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Application](#application)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [API](#api)
- [Testing](#testing)
- [Containerization](#containerization)
- [CI/CD](#cicd)
- [Kubernetes](#kubernetes)
- [GitOps with Argo CD](#gitops-with-argo-cd)
- [Ingress and TLS](#ingress-and-tls)
- [Monitoring and Observability](#monitoring-and-observability)
- [Prometheus Metrics](#prometheus-metrics)
- [Security](#security)
- [Design Decisions](#design-decisions)
- [Deployment Flow](#deployment-flow)
- [Operational Notes](#operational-notes)
- [Project Status](#project-status)
- [Future Improvements](#future-improvements)

---

## Overview

MiniStatus provides:

- A public status page for services.
- An admin dashboard for managing services and incidents.
- A REST API built with Node.js and Express.
- PostgreSQL persistence through Prisma.
- Container images for frontend and backend.
- Automated CI/CD with GitHub Actions.
- Kubernetes deployment on OpenStack Magnum.
- GitOps reconciliation with Argo CD.
- HTTPS ingress.
- Prometheus metrics and ServiceMonitor integration.
- Grafana dashboards for infrastructure and application observability.

The application intentionally remains simple: it is **not a microservices architecture**.

```text
                    ┌──────────────────────┐
                    │       Browser        │
                    └──────────┬───────────┘
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │ Kubernetes Ingress   │
                    │     NGINX / TLS      │
                    └──────────┬───────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
        ┌─────────────────┐       ┌─────────────────┐
        │ Frontend        │       │ Backend API     │
        │ React + Vite    │       │ Express + TS    │
        └─────────────────┘       └────────┬────────┘
                                           │ Prisma
                                           ▼
                                  ┌─────────────────┐
                                  │ PostgreSQL       │
                                  └─────────────────┘

                         Observability
                              │
                              ▼
                    ┌──────────────────────┐
                    │ Prometheus           │
                    │ ServiceMonitor       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Grafana              │
                    └──────────────────────┘
```

---

## Application

### Public status page

The public UI displays the current state of configured services and incidents.

Supported service states:

```text
OPERATIONAL
DEGRADED
PARTIAL_OUTAGE
MAJOR_OUTAGE
```

### Admin dashboard

The admin UI provides CRUD operations for:

- Services
- Incidents
- Service status
- Incident severity
- Incident lifecycle

Incident states:

```text
INVESTIGATING
IDENTIFIED
MONITORING
RESOLVED
```

When an incident is moved to `RESOLVED`, the backend automatically manages `resolvedAt`. If it is moved back to another state, the timestamp is cleared.

---

## Technology Stack

### Application

| Component | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Backend | Node.js + TypeScript |
| HTTP framework | Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Metrics | prom-client |

### DevOps / Infrastructure

| Component | Technology |
|---|---|
| Containers | Docker |
| CI/CD | GitHub Actions |
| Image registry | Docker Hub |
| Container orchestration | Kubernetes |
| Kubernetes platform | OpenStack Magnum |
| CNI | Cilium |
| Ingress | ingress-nginx |
| TLS | cert-manager / Let's Encrypt |
| GitOps | Argo CD |
| Monitoring | Prometheus |
| Visualization | Grafana |
| Kubernetes metrics stack | kube-prometheus-stack |
| Storage integration | Cinder CSI |

---

## Repository Structure

```text
ministatus/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── StatusPage.tsx
│   │   │   └── admin/
│   │   ├── components/
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── types/
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── services.ts
│   │   │   ├── incidents.ts
│   │   │   └── system.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── .env.example
│
├── k8s/
│   ├── ministatus/
│   │   ├── backend.yaml
│   │   ├── frontend.yaml
│   │   ├── ingress.yaml
│   │   ├── secret.yaml
│   │   ├── servicemonitor-backend.yaml
│   │   └── kustomization.yaml
│   └── monitoring/
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       ├── ci.yml
│       └── docker-release.yml
│
├── README.md
└── .gitignore
```

---

## Local Development

### Requirements

- Node.js 20+
- PostgreSQL 14+
- npm

The production CI pipeline uses Node.js 22.

### Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Example backend configuration:

```env
DATABASE_URL="postgresql://ministatus:ministatus@localhost:5432/ministatus?schema=public"
PORT=3000
NODE_ENV=development
APP_VERSION=0.1.0
CORS_ORIGIN=http://localhost:5173
```

Example frontend configuration:

```env
VITE_API_URL=http://localhost:3000
```

### Initialize the database

From `backend/`:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

The seed creates example services such as:

```text
Website
API
Database
Kubernetes
```

along with sample incidents.

### Run the backend

```bash
cd backend
npm run dev
```

Backend:

```text
http://localhost:3000
```

### Run the frontend

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Public status page:

```text
http://localhost:5173/
```

Admin dashboard:

```text
http://localhost:5173/admin
```

---

## Environment Variables

### Backend

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | HTTP port | `3000` |
| `NODE_ENV` | Runtime environment | `development` |
| `APP_VERSION` | Application/image version exposed by `/api/runtime` | — |
| `CORS_ORIGIN` | Allowed browser origin | `*` |

### Frontend

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

Secrets and environment-specific values should not be committed to Git.

---

## API

### System endpoints

```text
GET /api/health
GET /api/ready
GET /api/runtime
GET /metrics
```

### Services

```text
GET    /api/services
GET    /api/services/:id
POST   /api/services
PATCH  /api/services/:id
DELETE /api/services/:id
```

### Incidents

```text
GET    /api/incidents
GET    /api/incidents/:id
POST   /api/incidents
PATCH  /api/incidents/:id
DELETE /api/incidents/:id
```

### Error format

API errors use a consistent structure:

```json
{
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "Service not found"
  }
}
```

### Health endpoints

`/api/health` is a lightweight liveness endpoint. It checks that the application process is alive.

`/api/ready` checks PostgreSQL connectivity and is intended for Kubernetes readiness checks.

Example not-ready response:

```json
{
  "status": "not_ready",
  "database": "disconnected"
}
```

---

## Database Schema

### Service

```text
id
name
description
status
uptime
enabled
createdAt
updatedAt
```

Service status:

```text
OPERATIONAL
DEGRADED
PARTIAL_OUTAGE
MAJOR_OUTAGE
```

### Incident

```text
id
title
description
severity
status
createdAt
updatedAt
resolvedAt
```

Incident severity:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Incident status:

```text
INVESTIGATING
IDENTIFIED
MONITORING
RESOLVED
```

---

## Testing

Backend tests are run with:

```bash
cd backend
npm test
```

Tests cover:

- `/api/health`
- `/api/ready`
- `/api/runtime`
- Service CRUD
- Incident CRUD

CRUD tests require a reachable PostgreSQL database.

The CI pipeline runs the backend and frontend checks automatically on pull requests and pushes to `main`.

---

## Containerization

The backend is packaged as a multi-stage Docker image.

The production image:

- Uses Node.js 22.
- Installs production dependencies only.
- Generates Prisma client during the build.
- Runs as the non-root `node` user.
- Exposes port `3000`.
- Starts with the compiled application.

The frontend is built into a production container image suitable for Kubernetes deployment.

Images are published to Docker Hub using Git SHA-based tags.

Example image naming:

```text
21520623/ministatus-backend:<git-sha>
21520623/ministatus-frontend:<git-sha>
```

Using immutable Git SHA tags makes it possible to identify exactly which source revision is deployed.

---

## CI/CD

GitHub Actions is responsible for the application delivery pipeline.

### CI

The pipeline validates:

```text
Git push / Pull Request
        │
        ├── Backend CI
        │     ├── npm ci
        │     ├── Prisma
        │     ├── tests
        │     └── build
        │
        └── Frontend CI
              ├── npm ci
              └── build
```

### Container release

On the main branch, the release workflow:

1. Builds backend and frontend images.
2. Tags images with the Git SHA.
3. Saves build artifacts.
4. Runs Trivy vulnerability scanning.
5. Pushes images to Docker Hub.
6. Updates the Kubernetes Kustomize image references.
7. Commits the new image references back to `main`.

The Trivy scan is configured to fail the release for relevant `HIGH` and `CRITICAL` vulnerabilities according to the workflow configuration.

### GitOps separation

The important distinction is:

```text
Application source
        │
        ▼
GitHub Actions
        │
        ▼
Docker image
        │
        ▼
Kubernetes manifest updated in Git
        │
        ▼
Argo CD
        │
        ▼
Kubernetes cluster
```

Kubernetes state is therefore driven from Git rather than manually changing Deployments with `kubectl`.

---

## Kubernetes

The application is deployed to a Kubernetes cluster provisioned with OpenStack Magnum.

The cluster used during the project contained:

```text
1 control-plane node
2 worker nodes
```

The application namespace is:

```text
ministatus
```

The deployment contains separate frontend and backend workloads.

Conceptually:

```text
ministatus namespace

Frontend Deployment
    └── 2 replicas
         │
         ▼
Frontend Service

Backend Deployment
    └── 2 replicas
         │
         ▼
Backend Service :3000
         │
         ▼
PostgreSQL
```

The backend Service exposes a named `http` port so that the Prometheus `ServiceMonitor` can reference it.

### Kubernetes health probes

The backend provides endpoints suitable for:

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000

readinessProbe:
  httpGet:
    path: /api/ready
    port: 3000
```

### Configuration

Application configuration is injected through Kubernetes configuration/secret resources rather than hard-coded into the image.

The Git repository contains the Kubernetes manifests under:

```text
k8s/ministatus/
```

Kustomize is used to compose the application manifests.

---

## GitOps with Argo CD

Argo CD continuously watches the Git repository and the `k8s/ministatus` path.

The MiniStatus Argo CD application is configured for automated synchronization with:

```text
prune: true
selfHeal: true
CreateNamespace: true
```

This means:

- Git is the desired state.
- Argo CD detects manifest changes.
- Kubernetes is reconciled automatically.
- Resources removed from Git can be pruned.
- Manual drift can be corrected by self-healing.

### Important operational rule

Do **not** use commands such as:

```bash
kubectl set image deployment/...
```

as the normal deployment mechanism.

Such a change is outside the GitOps source of truth and can be reverted by Argo CD.

Instead:

```text
Change code
   ↓
Push to Git
   ↓
CI builds image
   ↓
GitOps manifest gets new SHA
   ↓
Argo CD syncs
   ↓
Kubernetes rollout
```

---

## Ingress and TLS

The application is exposed through Kubernetes Ingress.

The intended external routing model is:

```text
HTTPS request
      │
      ▼
Ingress
  ├── /    → frontend
  └── /api → backend
```

TLS certificates are managed with cert-manager and Let's Encrypt.

The deployed environment also includes a Grafana hostname:

```text
https://grafana.ducbao.space
```

The Grafana endpoint is served through ingress-nginx with a Let's Encrypt certificate.

---

## Monitoring and Observability

The cluster uses `kube-prometheus-stack`, providing:

- Prometheus
- Grafana
- Kubernetes metric collection
- Node metrics
- kube-state-metrics
- ServiceMonitor support

The monitoring stack is managed through Argo CD.

### Application monitoring

MiniStatus backend exposes:

```text
GET /metrics
```

The endpoint is implemented with `prom-client`.

The Kubernetes `ServiceMonitor` selects the backend Service:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ministatus-backend
  namespace: ministatus
  labels:
    release: monitoring
spec:
  selector:
    matchLabels:
      app: ministatus-backend
  namespaceSelector:
    matchNames:
      - ministatus
  endpoints:
    - port: http
      path: /metrics
      interval: 15s
```

This allows Prometheus to discover the backend automatically.

### Infrastructure monitoring

The monitoring stack also exposes Kubernetes/node metrics such as:

- CPU
- Memory
- Pod status
- Node status
- Container metrics
- Kubernetes object state

Grafana is used to visualize these metrics.

---

## Prometheus Metrics

MiniStatus exposes default Node.js/process metrics through `prom-client`.

Examples include metrics related to:

```text
process CPU
process memory
Node.js heap
event loop
file descriptors
```

Custom application metrics include:

```text
http_requests_total
http_request_duration_seconds
```

The custom metrics use:

```text
method
route
status_code
```

as labels.

Useful PromQL examples:

### Request rate

```promql
sum(
  rate(http_requests_total{namespace="ministatus"}[5m])
)
```

### 5xx rate

```promql
sum(
  rate(
    http_requests_total{
      namespace="ministatus",
      status_code=~"5.."
    }[5m]
  )
)
```

### P95 request latency

```promql
histogram_quantile(
  0.95,
  sum(
    rate(
      http_request_duration_seconds_bucket{
        namespace="ministatus"
      }[5m]
    )
  ) by (le)
)
```

### Backend CPU

```promql
sum(
  rate(
    process_cpu_seconds_total{
      namespace="ministatus"
    }[5m]
  )
)
```

### Backend resident memory

```promql
sum(
  process_resident_memory_bytes{
    namespace="ministatus"
  }
)
```

### Target health

```promql
up{namespace="ministatus"}
```

---

## Security

The project includes several security-oriented practices.

### Container security

- Production images use a non-root runtime user.
- Development dependencies are excluded from the production backend image.
- Trivy scans release images.
- Images are tagged with immutable Git SHAs.

### Application security

- Database credentials are provided through environment variables.
- Secrets are not intended to be stored directly in Git.
- Centralized error handling prevents stack traces from being exposed in production.
- CORS is configurable by environment.
- API configuration is not hard-coded into the backend.

### Kubernetes / infrastructure

The Kubernetes environment uses:

- Cilium networking.
- OpenStack Security Groups.
- ingress-nginx.
- TLS certificates through cert-manager.
- Kubernetes Secrets for sensitive configuration.

During deployment, east-west connectivity between Kubernetes nodes was found to depend on the OpenStack/Neutron Security Group configuration. The final design should restrict cluster networking to the required internal CIDRs rather than leaving broad allow-all rules in place.

---

## Design Decisions

### Layered backend

The backend follows:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Prisma
  ↓
PostgreSQL
```

Controllers remain thin while business logic lives in the service layer.

### Single Prisma client

A shared Prisma client is used rather than creating a new database client for every request.

### Centralized error handling

A custom error type and centralized Express middleware provide a consistent API error structure.

### Structured logs

Request logs are emitted as JSON to stdout.

This is intentional for containerized environments where the platform collects stdout/stderr.

### Graceful shutdown

The backend handles:

```text
SIGTERM
SIGINT
```

and shuts down the HTTP server and Prisma connection cleanly.

This is important for Kubernetes rolling updates and pod termination.

### Environment-driven configuration

Database credentials, ports, CORS configuration, application version, and frontend API configuration are controlled through environment variables.

The same container image can therefore be promoted between environments without rebuilding it for environment-specific configuration.

---

## Deployment Flow

The complete delivery path is:

```text
Developer
   │
   │ git push
   ▼
GitHub
   │
   ├───────────────┐
   │               │
   ▼               ▼
CI              Docker Build
tests/build        │
   │               ▼
   │           Trivy Scan
   │               │
   │               ▼
   │          Docker Hub
   │               │
   │               ▼
   │      Update Kustomize SHA
   │               │
   │               ▼
   └──────────► Git main
                   │
                   ▼
                Argo CD
                   │
                   ▼
              Kubernetes
                   │
          ┌────────┴────────┐
          ▼                 ▼
      Frontend           Backend
                            │
                            ▼
                       PostgreSQL

              ┌─────────────────────┐
              │     Prometheus      │
              └──────────┬──────────┘
                         │
                         ▼
                    ┌─────────┐
                    │ Grafana │
                    └─────────┘
```

This provides a clear separation between:

- Source control
- Continuous integration
- Image creation
- Image security scanning
- Container registry
- GitOps desired state
- Kubernetes reconciliation
- Monitoring

---

## Operational Notes

### GitOps commits can move `main`

The Docker release workflow updates the Kubernetes image tag and commits that change back to the repository.

As a result, a local checkout can become behind `origin/main` even immediately after a local commit.

Before pushing a new change, use:

```bash
git fetch origin main
git rebase origin/main
git push origin main
```

Avoid force-pushing over the shared `main` branch.

### Kubernetes state

For normal deployments, inspect:

```bash
kubectl get pods -n ministatus
kubectl get svc -n ministatus
kubectl get ingress -n ministatus
kubectl get servicemonitor -n ministatus
```

Check Argo CD:

```bash
kubectl get application ministatus -n argocd
```

### Application metrics

Verify the endpoint from inside the cluster or through an appropriate debugging path:

```bash
curl http://<backend-service>:3000/metrics
```

### Monitoring

In Grafana Explore, useful initial queries are:

```promql
up{namespace="ministatus"}
```

and:

```promql
http_requests_total{namespace="ministatus"}
```

---

## Project Status

### Completed

- [x] React/Vite frontend
- [x] Express/TypeScript backend
- [x] Prisma + PostgreSQL
- [x] Service and incident CRUD
- [x] Health and readiness endpoints
- [x] Runtime information endpoint
- [x] Automated backend tests
- [x] Dockerized backend/frontend
- [x] GitHub Actions CI
- [x] Docker image release pipeline
- [x] Trivy image scanning
- [x] Docker Hub image publishing
- [x] Kubernetes deployment
- [x] Multiple frontend/backend replicas
- [x] Kubernetes Services
- [x] Ingress
- [x] HTTPS/TLS
- [x] OpenStack Magnum deployment
- [x] Argo CD GitOps
- [x] Prometheus
- [x] Grafana
- [x] Kubernetes/node observability
- [x] Backend Prometheus metrics
- [x] ServiceMonitor integration
- [x] GitOps-based image updates
- [x] Graceful application shutdown
- [x] Non-root backend container
- [x] Security scanning

### Final state

MiniStatus is no longer only a small CRUD web application. It is a complete practical DevOps project demonstrating how an application can be:

```text
developed
   ↓
tested
   ↓
containerized
   ↓
scanned
   ↓
published
   ↓
deployed to Kubernetes
   ↓
managed through GitOps
   ↓
monitored with Prometheus/Grafana
```

---

## Future Improvements

The project is considered complete for its current scope. Possible future iterations include:

- Authentication and authorization for the admin dashboard.
- External PostgreSQL with managed backups.
- Persistent Prometheus/Grafana storage.
- Alertmanager notifications.
- SLO/SLI definitions and alert rules.
- Automated database migrations during deployment.
- Horizontal Pod Autoscaling.
- NetworkPolicies.
- External Secrets / Vault integration.
- More comprehensive integration tests.
- Automated end-to-end tests.
- Blue/green or canary deployments.
- Dependency update automation.
- SBOM generation and image signing.
- Separate staging and production environments.

These are intentionally outside the completed project scope.

---

## Final Architecture Summary

```text
                         Internet
                            │
                         HTTPS/TLS
                            │
                            ▼
                   ┌──────────────────┐
                   │  ingress-nginx    │
                   └────────┬─────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
          ┌─────────────┐       ┌─────────────┐
          │  Frontend   │       │   Backend   │
          │  2 replicas │       │  2 replicas │
          └─────────────┘       └──────┬──────┘
                                       │
                                    Prisma
                                       │
                                       ▼
                                ┌─────────────┐
                                │ PostgreSQL  │
                                └─────────────┘

                                       │
                                    /metrics
                                       │
                                       ▼
                                ┌─────────────┐
                                │ Prometheus  │
                                └──────┬──────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │   Grafana   │
                                └─────────────┘

GitHub
  │
  ▼
GitHub Actions
  │
  ├── CI
  ├── Docker build
  ├── Trivy scan
  ├── Docker Hub
  └── GitOps manifest update
          │
          ▼
       Argo CD
          │
          ▼
      Kubernetes
```

---

## License

Add the project's license here if/when one is chosen.
