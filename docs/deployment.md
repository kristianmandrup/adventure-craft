# Deployment Guide

This guide covers deploying Adventure Craft to Google Cloud Run.

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
- A Google Cloud project with billing enabled
- Your `GEMINI_API_KEY` ready

## Project Configuration

### Procfile

The project includes a `Procfile` for Cloud Run:

```
web: node server.js
```

This tells Cloud Run to start the Node.js server.

### Server Configuration

The `server.js` file serves the production build:

```javascript
const port = process.env.PORT || 8080;
```

Cloud Run automatically sets the `PORT` environment variable.

## Build Steps

### 1. Build the Production Bundle

```bash
npm run build
```

This creates optimized files in `dist/`:

- `index.html` — Entry point
- `assets/` — JS, CSS, and other assets
- Vendor chunk for Three.js dependencies

### 2. Verify Locally

Test the production server:

```bash
npm start
```

Visit `http://localhost:8080` to verify.

## Cloud Run Deployment

### Option 1: Deploy from Source

The simplest approach — Cloud Run builds from source:

```bash
gcloud run deploy adventure-craft \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your-key-here
```

### Option 2: Deploy with Container

Build and push a container:

```bash
# Build container
gcloud builds submit --tag gcr.io/YOUR_PROJECT/adventure-craft

# Deploy
gcloud run deploy adventure-craft \
  --image gcr.io/YOUR_PROJECT/adventure-craft \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your-key-here
```

## Environment Variables

| Variable         | Required | Description                     |
| ---------------- | -------- | ------------------------------- |
| `GEMINI_API_KEY` | Yes      | Your Google Gemini API key      |
| `PORT`           | Auto     | Set by Cloud Run (default 8080) |

### Setting Environment Variables

```bash
# During deploy
--set-env-vars GEMINI_API_KEY=your-key

# Update existing service
gcloud run services update adventure-craft \
  --set-env-vars GEMINI_API_KEY=new-key
```

## Dockerfile (Optional)

If you prefer a custom Dockerfile:

```dockerfile
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/
COPY server.js ./

# Set port
ENV PORT=8080
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
```

Build with:

```bash
docker build -t adventure-craft .
docker run -p 8080:8080 -e GEMINI_API_KEY=your-key adventure-craft
```

## Cloud Build Configuration

For CI/CD, create `cloudbuild.yaml`:

```yaml
steps:
  # Install dependencies
  - name: "node:20"
    entrypoint: "npm"
    args: ["ci"]

  # Build
  - name: "node:20"
    entrypoint: "npm"
    args: ["run", "build"]

  # Deploy
  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    entrypoint: "gcloud"
    args:
      - "run"
      - "deploy"
      - "adventure-craft"
      - "--source=."
      - "--region=us-central1"
      - "--allow-unauthenticated"

substitutions:
  _REGION: us-central1

options:
  logging: CLOUD_LOGGING_ONLY
```

Trigger on push:

```bash
gcloud builds triggers create github \
  --repo-name=adventure-craft \
  --branch-pattern=main \
  --build-config=cloudbuild.yaml
```

## Troubleshooting

### Container Failed to Start

1. Check logs: `gcloud run logs read adventure-craft`
2. Ensure `dist/` directory exists in container
3. Verify `server.js` uses `process.env.PORT`

### API Key Errors

1. Verify environment variable is set:
   ```bash
   gcloud run services describe adventure-craft --format='value(spec.template.spec.containers[0].env)'
   ```
2. Check the key is valid in [Google AI Studio](https://aistudio.google.com/)

### 404 on Assets

1. Check that `vite build` ran successfully
2. Verify `dist/` contains `index.html` and `assets/`
3. Check `server.js` mime type handling

### CORS Issues

The production server doesn't set CORS headers by default. If calling from another domain, add:

```javascript
res.setHeader("Access-Control-Allow-Origin", "*");
```

## Performance Optimization

### Memory Settings

For complex worlds, increase memory:

```bash
gcloud run deploy adventure-craft \
  --memory 1Gi \
  --cpu 2
```

### Cold Start Optimization

- Keep the container warm with Cloud Scheduler
- Use minimum instances: `--min-instances 1`

### CDN for Assets

Consider using Cloud CDN for static assets:

1. Create a load balancer
2. Enable Cloud CDN
3. Set cache headers in `server.js`

## Monitoring

### View Logs

```bash
gcloud run logs read adventure-craft --tail 100
```

### Set Up Alerts

```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --condition-display-name="High Error Rate" \
  --condition-filter='resource.type="cloud_run_revision"'
```

## Cost Considerations

Cloud Run charges based on:

- CPU/memory allocation
- Request count
- Network egress

Tips:

- Set `--max-instances` to limit costs
- Use `--cpu-throttling` for lower costs when idle
- AI API calls have separate costs (Gemini pricing)
