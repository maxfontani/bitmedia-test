import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { handleDBInit, handleDBStats, handleDBProfile } from './controllers/database.js'
import sqlite3 from 'sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let dbIsOpen = false
const db = new sqlite3.Database(path.resolve(__dirname, './db/bitmedia.db'), sqlite3.OPEN_READWRITE, (err) => {
  dbIsOpen = !Boolean(err)
  if (dbIsOpen) {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name ='users'", (err, row) => {
      if (err || !row) {
        dbIsOpen = false
      } else {
        dbIsOpen = true
      }
    })
  }
})

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 4000;

const app = express()

app.use(cors())
app.options('*', cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())


// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

// Answer API requests.
app.get('/api', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from the custom server!"}');
})

//Initialiize DB
app.get('/api/dbinit', (req, res) => handleDBInit(req, res, dbIsOpen))

//Get total clicks & views user stats. REQ BODY FORMAT {page: <number>, amount: <number>}
app.post('/api/dbstats', (req, res) => handleDBStats(req, res, db))

//Get profile clicks & views data. REQ BODY FORMAT {dateFrom: <Date>, dateTo: <Date>}
app.post('/api/dbprofile', (req, res) => handleDBProfile(req, res, db))

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
})

app.listen(PORT, function () {
  console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
})