# js-serverless-gateway-cloudflare-worker
javascript serverless deploy on cloudflare worker as api gateway

# JS Serverless Gateway - Cloudflare Worker

## Overview
This project is a **serverless API gateway** deployed on **Cloudflare Workers**. It forwards requests to a list of backup API services and automatically checks the health of each API before forwarding the request.

## Features
- Acts as an API gateway for multiple backup services.
- Automatically checks API health (`/api/v1/health/check`).
- Forwards incoming requests to the first available API.
- Supports request methods, headers, and body forwarding.
- Serverless deployment on Cloudflare Workers.

## Setup & Installation

### 1. Install Dependencies
```sh
npm install
```

### 2. Configure Environment Variables
Create a `.dev.vars` file to store API backup service URLs:
```
API_ARR=["https://api1.example.com", "https://api2.example.com"]
```

### 3. Run Locally
```sh
npm run dev
```

### 4. Deploy to Cloudflare Workers
```sh
wrangler deploy
```

## How It Works
1. The worker reads the `API_ARR` environment variable, which contains an array of API backup URLs.
2. When a request is received, it checks the health of each API by making a `HEAD` request to `/api/v1/health/check`.
3. If an API is available, it forwards the request to that API, preserving headers, body, and query parameters.
4. If no APIs are available, it returns a `503 Service Unavailable` response.

## Example Request & Response
**Request:**
```sh
curl -X GET "https://your-cloudflare-worker.example.workers.dev/api/data"
```

**Response (if API is available):**
```json
{
  "data": "your response from backend API"
}
```

**Response (if all APIs are down):**
```json
{
  "statusCode": 503,
  "messageEn": "Service Unavailable",
  "messageTh": "ไม่สามารถเชื่อมต่อ server ได้"
}
```

## License
MIT


