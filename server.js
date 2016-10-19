var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var config = require('./config');
var User = require('./models/user');

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('dev'));

var apiRoutes = express.Router();

mongoose.connect(config.database);
app.set('superSecret', config.secret);

apiRoutes.get('/', (req, res) => {
  res.status(200).json({message: 'Hello World API content!'});
});

apiRoutes.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) throw err;

    res.status(200).json({users});
  });
});

apiRoutes.post('/authenticate', (req, res) => {
  User.findOne({name: req.body.name}, (err, user) => {
    if (err) throw err;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication failed. User not found'
      });
    } else if (user) {
      if (user.password !== req.body.password) {
        res.status(401).json({
          success: false,
          message: "Authentication failed. Wrong password"
        });
      } else if (user.password === req.body.password) {
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 60 * 60 * 24
        });

        res.status(200).json({
          success: true,
          message: 'Authenticated',
          token: token
        });
      }
    }
  });
});

app.use('/api', apiRoutes);

app.get('/', function(req, res) {
  res.send('Hello World at http://localhost:' + port + '/api');
});

app.get('/setup', function(req, res) {
  var user = new User({
    name: 'Kevin Win',
    password: 'password',
    admin: true
  });

  user.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.status(200).json({success: true});
  });
});

app.listen(port);

console.log('magic happen at port:' + port);
