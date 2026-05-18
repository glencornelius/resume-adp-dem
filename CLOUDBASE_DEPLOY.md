# Tencent CloudBase / Webify Deployment

This project should be deployed as a normal dynamic Next.js application.

Do not enable static export and do not add `output: "export"`.

## Deployment Settings

Install command:

```bash
npm install
```

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

Root directory:

```text
./
```

Port:

```text
3000
```

Node.js version:

```text
22 or 20
```

## Environment Variables

`NEXT_PUBLIC_ADP_API_URL` can be left empty. When it is empty, ADP-DEM runs in offline demo mode.

## Public Assets

The ADP-DEM public data and assets are stored under:

```text
public/adp-dem/data
public/adp-dem/assets
```

These directories are served by Next.js from the public folder and should be included in the deployment.

## Optional Dockerfile

If CloudBase / Webify asks for a Dockerfile, use the `Dockerfile` in this repository.
