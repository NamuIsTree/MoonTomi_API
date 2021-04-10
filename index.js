const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 8080;
const api_config = require('./api-config.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
	host: api_config.host,
	user: api_config.root,
	password: api_config.password,
	database: api_config.database
});
connection.connect();

const secret = api_config.secret;

app.use(cors());

app.post('/api/get/albums/all', function(req, res) {
	var qstr = 'select * from albums';
	connection.query(qstr, function(err, rows, cols) {
		if (err) throw err;
		res.json(rows);
	});
});

app.post('/api/get/albums', function(req, res) {
	var qstr = 'select * from albums where isOpen=1';
	connection.query(qstr, function(err, rows, cols) {
		if (err) throw err;
		res.json(rows);
	});
});

app.post('/api/get/comments/all', function(req, res) {
	var qstr = 'select * from comments';
	connection.query(qstr, function(err, rows, cols) {
		if (err) throw err;
		res.json(rows);
	});
});

app.post('/api/get/reviews', function(req, res) {
	var qstr = 'select * from review';
	connection.query(qstr, function(err, rows, cols) {
		if (err) throw err;
		res.json(rows);
	});
});

app.post('/api/change/album', function(req, res) {
	const id = req.body.id;
	const rating = req.body.rating;
	var qstr = 'update albums set isOpen=1, rating=' + rating + ' where id='+id;
	console.log(qstr);
	connection.query(qstr, function(err, rows, cols) {
		if (err) throw err;
	});
});

app.post('/api/change/comment', function(req, res) {
	const id = req.body.id;
	const star = req.body.star;
	const best1 = req.body.best1;
	const best2 = req.body.best2;
	const best3 = req.body.best3;
	const comment = req.body.comment;

	const qstr = 'update comments set star='+star+', best1='+best1+', best2='+best2+
		     ', best3='+best3+', comment=\''+comment+'\' where id='+id;

	connection.query(qstr, function(err, rows, cols) {
		if (err) throw err;
	});
});

app.post('/api/check/password', function(req, res) {
	const password = crypto.createHmac('sha256', secret).update(req.body.password).digest('hex');
	res.send(password);
});

app.post('/api/upload/review', function(req, res) {
	obj = {};
	obj.text = req.body.text;
	obj.tracklist = req.body.tracklist;
	obj.title = req.body.title;
	obj.rating = req.body.rating;
	obj.album_year = req.body.album_year;
	obj.album_month = req.body.album_month;
	obj.album_day = req.body.album_day;
	obj.artist = req.body.artist;
	obj.date = req.body.date;
	obj.best1 = req.body.best1;
	obj.best2 = req.body.best2;
	obj.best3 = req.body.best3;
	obj.genre = req.body.genre;
	obj.comment = req.body.comment;
	obj.youtube = req.body.youtube;

	connection.query("INSERT INTO review SET ?", obj, function(err, rows, cols) {
		if (err) throw err;
	});
});

app.post('/api/upload/comment', function(req, res) {
	obj = {};
	obj.nickname = req.body.nickname;
	obj.album_id = req.body.album_id;
	obj.star = req.body.star;
	obj.best1 = req.body.best1;
	obj.best2 = req.body.best2;
	obj.best3 = req.body.best3;
	obj.comment = req.body.comment;
	obj.password = crypto.createHmac('sha256', secret).update(req.body.password).digest('hex');
	obj.isOpen = req.body.isOpen;
	
	connection.query("INSERT INTO comments SET ?", obj, function(err, rows, cols) {
		if (err) throw err;
	});
});

app.post('/api/upload/album', function(req, res) {
	obj = {};
	obj.name = req.body.name;
	obj.artist = req.body.artist;
	obj.nation = req.body.nation;
	obj.volume = req.body.volume;
	obj.genre = req.body.genre;
	obj.year = req.body.year;
	obj.isOpen = req.body.isOpen;
	obj.list = req.body.list;

	res.send(obj);

	connection.query("INSERT INTO albums SET ?", obj, function(err, rows, cols) {
		if (err) throw err;
	});
});

app.listen(port, () => console.log('API running...'));
