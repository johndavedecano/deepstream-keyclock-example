var hogan = require('hogan-express');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser')
var app = express();
var request = require('superagent');
var config = require('./keycloak.json');
var path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Register JS files
app.use('/js/keycloak', express.static(path.join(__dirname, 'node_modules/keycloak-js/dist')));
app.use('/js/keycloak/keycloak.json', express.static(path.join(__dirname, 'keycloak.json')));

// Register '.mustache' extension with The Mustache Express
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '/view'));
app.engine('html', hogan);

// A normal un-protected public URL.

app.get('/', function (req, res) {
  res.render('index');
});

/**
 * Authentication user access_tokens validity.
 * Requires access_token token.
 */
app.post('/authenticate', function (req, res) {

  var requestUrl = config['auth-server-url'] + '/realms/' + config['realm'] + '/protocol/openid-connect/userinfo';
  var requestData = {
    grant_type: 'password',
    client_id: config['resource'],
    client_secret: config['credentials']['secret'],
    client_assertion_type: 'jwt-bearer'
  };

  return request
    .get(requestUrl)
    .type('form')
    .set('Authorization', 'Bearer ' + req.body.authData.access_token)
    .send(requestData)
    .then((response) => {
      const user = JSON.parse(response.text);
      res
        .json({
          username: user.sub,
          clientData: user,
          serverData: {
            client_role: JSON.parse(user.role),
            realm_role: JSON.parse(user.realm_role)
          }
        });
    }, (response) => {
      res
        .status(response.status)
        .json({
          status: response.status,
          success: false,
          results: response.text,
        });
    });
});

/**
 * Login to keycloak using username and password.
 * Return 403 status response when not authorized.
 * Returns 200 including other crentials that are necessary for authentication.
 */
app.post('/login', function (req, res) {
  
  var requestUrl = config['auth-server-url'] + '/realms/' + config['realm'] + '/protocol/openid-connect/token';
  var requestData = {
    grant_type: 'password',
    client_id: config['resource'],
    client_secret: config['crentials']['secret'],
    client_assertion_type: 'jwt-bearer',
    username: req.body.username,
    password: req.body.password
  };

  return request
    .post(requestUrl)
    .type('form')
    .send(requestData)
    .then((response) => {
      res
        .json({
          status: response.status,
          success: true,
          results: JSON.parse(response.text),
        });
    }, (response) => {
      console.log(response);
      res
        .status(response.status)
        .json({
          status: response.status,
          success: false,
          results: 'Invalid username or password',
        });
    });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});