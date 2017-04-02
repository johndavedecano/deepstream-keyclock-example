# deepstream-keyclock-example

HTTP Authentication example using keycloak and deepstreamIO

## Requirements

1. Keycloak Server - Usually served at http://localhost:8080
2. Deepstream Server - Usually served at http://localhost:6020

## Installation

1. On your deepsteam's config.yml use HTTP authentication.

```
#Authentication
auth:
  # type: none
  type: http
  options:
    # a post request will be send to this url on every incoming connection
    endpointUrl: http://{local-ip-address}:3000/authenticate
    # any of these will be treated as access granted
    permittedStatusCodes: [ 200 ]
    # if the webhook didn't respond after this amount of milliseconds, the connection will be rejected
    requestTimeout: 2000
```

2. Login to your deepstream.io using an admin account and create a realm by exporting realm.json.
3. On your project directory run npm install then npm run start. Visit http://localhost:3000
4. Your application is now secured with keycloak and using deepstream as the socket server.

You can use https://github.com/johndavedecano/deeptream-docker-compose
