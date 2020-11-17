const express = require('express')
const app = express()
const bodyParser = require('body-parser');
var pg = require('pg');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const Pool = pg.Pool;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Reality5!',
    port: 5432
})

// GET student - returns a list of all students
app.get('/students', (req, res) => {
    pool.query('SELECT * FROM students', (error, results) => { 
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

// GET students/:studentId - returns details of a specific student by student id
app.get('/students/:studentId', (req, res) => {
    pool.query('SELECT * FROM students WHERE studentid = $1', [req.params.studentId], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

// GET student?search= - returns a list of students filtered on name matching the given query
app.get('/search', (req, res) => {
    let str = '%' + decodeURIComponent(req.query.name) + '%';
    pool.query('SELECT * FROM students WHERE lower(name) LIKE lower($1)', [str], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

// GET grades/:studentId - returns all grades for a given student by student id
app.get('/grades/:studentId', (req, res) => {
    pool.query('SELECT * FROM grade WHERE studentid = $1', [req.params.studentId], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

// POST grade - records a new grade, returns success status in JSON response and stores the new grade in the database
app.post('/grades', (req, res) => {
    let result;
    if (req.body.studentid && req.body.grade) {
        pool.query('INSERT INTO grade (studentid, grade) VALUES ($1, $2)', [req.body.studentid, req.body.grade], (error, results) => {
            if (error) {
                throw error
            }
        })
        result = {
            "status": "Success",
            "message": "The grade was successfully added"
        }
        res.status(201).send(result)
    } else {
        result = {
            "status": "Failed",
            "message": "The grade was not added"
        }
        res.status(400).send(result)
    }
})

// POST register - creates a new user, returns success status in JSON response and stores the new user in the database
app.post('/register', (req, res) => {
    let result;
    if (req.body.name) {
        pool.query('INSERT INTO students (name) VALUES ($1)', [req.body.name], (error, results) => {
            if (error) {
                throw error
            }
        })
        result = {
            "status": "Success",
            "message": "The student was successfully registered"
        }
        res.status(201).send(result)
    } else {
        result = {
            "status": "Failed",
            "message": "The student was not registered"
        }
        res.status(400).send(result)
    }
})

const port = 3000
app.listen(port, 
    () => console.log(`Example app listening at http://localhost:${port}`))