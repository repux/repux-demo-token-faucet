
# RepuX DemoToken faucet

## Config

Create config.js file in config folder.

## Build

```bash
npm install
npm run build
```

## Run

### Backend

node src/backend/server.js  

### Frontend

All fronted files are located in dist/ folder.

## Test request

```bash
curl -v -X POST http://127.0.0.1:3000/issue-demo-token --header "Content-Type: application/json" -d '{"recipientAddress":"0x08AB86b24ae7F375aE962D134eA32178aBbEF04a" }'
```

## Developent

Frontend gets configuration from .env file during build process.

If you need to run httpS server for dist/ project you can install http-server

```bash
npm install -g http-server
```

go to dist/ folder and run with certs:

```bash
http-server --ssl --key ./../ssl/cert.key --cert ./../ssl/cert.pem
```