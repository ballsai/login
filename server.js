const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

var connection = mysql.createConnection({
	host     : 'remotemysql.com',
	user     : 'JlUEGCGX5t',
	password : '0jgrTD7txc',
	database : 'JlUEGCGX5t'
});

connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
   
    console.log('Connected to the MySQL server.');
});

var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/index', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/api/index', function(request, response) {
	const username = request.body.username;
	const password = hashPassword(request.body.password);
	if (username && password) {
		connection.query('SELECT * FROM user  WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if ( results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/');
			} else {
                response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});

app.post('/api/register', function(request, response) {
    const users = {
        username : request.body.username,
        password : hashPassword(request.body.password)

    }
    if (users.username && users.password) {
        connection.query("INSERT INTO user SET ?",users, function (error, results, fields) {
            if (error) {
                response.send('There are some errors with query');
            }else{
                //response.send('user registered sucessfully');
                response.redirect('/');
            }		
            response.end();
        });
    } else {
    response.send('Please enter Username and Password!');
    response.end();
    }
});

app.get('/', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome, ' + request.session.username + '!');
	} else {
		response.redirect('/index');
	}
	response.end();
});

function hashPassword(password, salt){
    const hash = crypto.createHash('sha256');
    hash.update(password+salt)
    return hash.digest('hex');
}

app.listen(3000);