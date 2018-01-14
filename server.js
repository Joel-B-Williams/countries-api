let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let pg = require('pg');
let app = express();
let cors = require('cors');

const PORT = process.env.PORT || 3001;

let pool = new pg.Pool({
	port: process.env.DB_PORT || 5432,
	password: process.env.DB_PW,
	database: process.env.DB,
	user: process.env.DB_USER || 'postgres',
	host: 'localhost',
	max: 10
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

// allow cross site resource gathering in header
// lets React call to DB through API
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.post('/api/new-country', function(req, res) {
	// console.log(req.body);
	var country_name = req.body.country_name;
	var continent_name = req.body.continent_name;

// note - typically db here is client
	pool.connect((err, db, done) => {
		if(err) {
			// 
			// return console.log('error: ' + err);
			return res.status(400).send(err);
		} else {
			db.query('INSERT INTO countries (country_name, continent_name) VALUES ($1, $2)', [country_name, continent_name], (err, table) => {
				done();
				if(err) {
					// return console.log('error: ' + err);
					return res.status(400).send(err);
				} else {
					console.log("Data Inserted");
					// db.end();
					// expecting to send JSON so format accordingly (in object)
					res.status(201).send({message: 'Data accepted'})
				}
			})
		}
	})
});

app.get('/api/countries', function(req, res) {
	pool.connect(function(err, db, done) {
		if(err) {
			return res.status(400).send(err);
		} else {
			db.query('SELECT * FROM countries', function(err, table) {
				done();
				if(err) {
					return res.status(400).send(err);
				} else {
					res.status(200).send(table.rows);
				}
			})
		}
	});
})

app.delete('/api/remove/:id', function(req, res) {
	var id = req.params.id;
	// console.log(id);
	pool.connect(function(err, db, done) {
		if(err) {
			console.log('err1', err)
			return res.status(400).send(err);
		} else {
			db.query('DELETE FROM countries WHERE id = $1', [id], function(err, result) {
				done();
					if(err) {
						console.log('err2', err)
						return res.status(400).send(err);
					} else {
						res.status(200).send({ message: 'Deletion successful' });
					}
			});
		}
	})
})

app.listen(PORT, ()=> console.log('Listening on port ' + PORT));