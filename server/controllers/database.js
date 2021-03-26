import sqlite3 from 'sqlite3'
import fs from 'fs'
import path, { resolve } from 'path'
import { addWeeks, eachDayOfInterval, lightFormat, parseJSON } from 'date-fns'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function handleDBInit(req, res, dbIsOpen) {

    function createDB() {
        const db = new sqlite3.Database(path.resolve(__dirname, '../db/bitmedia.db'), 
        (err) => { 
            if (err) { 
                console.log('DB ERR:', err) 
                return res.status(400).json('Error initializing DB.') 
            }})

        db.serialize(() => {
            console.log('Creating tables...')
            db.run("PRAGMA journal_mode = WAL")
            db.run("PRAGMA synchronous = NORMAL")
            db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, first_name TEXT COLLATE NOCASE, last_name TEXT, email TEXT, gender TEXT, ip_address TEXT)")
            db.run("CREATE TABLE IF NOT EXISTS users_statistic (user_id INTEGER, date TEXT, page_views INTEGER, clicks INTEGER, FOREIGN KEY(user_id) REFERENCES users(id) )")
        })
        return db
    }

    function readFiles() {
        console.log('Reading file data...')
        const userData = fs.readFileSync(path.resolve(__dirname, '../db/users.json'))
        if (!userData) return res.status(400).json('Unable to read users data.')
        const users = JSON.parse(userData)

        const statsData = fs.readFileSync(path.resolve(__dirname, '../db/users_statistic.json'))
        if (!statsData) {
            console.log('Read err', err)
            return res.status(400).json('Unable to read stats data.')
        }
        const stats = JSON.parse(statsData)

        return [users, stats]
    }

    function fillDB(users, stats, db) {
        try {
            db.run("BEGIN", ()=>{
                for(let i=0; i<users.length; i++) {
                    db.run("INSERT INTO users(id, first_name, last_name, email, gender, ip_address) VALUES (?,?,?,?,?,?)", Object.values(users[i]))
                }
                db.run("COMMIT;")
            })
            
            
            db.run("BEGIN", ()=>{
                for(let i=0; i<stats.length; i++) {
                    db.run("INSERT INTO users_statistic(user_id, date, page_views, clicks) VALUES (?,?,?,?)", Object.values(stats[i]))
                }
                db.run("COMMIT;", () => {console.log('2nd table finished')})
            })


        } catch {() => res.status(400).json('Unable to populate the DB.')} 
        return true
    }

    if (!dbIsOpen) {

        console.log('Initializing DB...')
        
        const db = createDB()
        const [users, stats] = readFiles()
        fillDB(users, stats, db) && res.status(200).json("{'Success':'DB CREATED'}")
         
    } else {
        res.status(200).json("{'Success':'DB OPEN'}")
    }
}

export async function handleDBStats(req, res, db) {

    function getAsync(stmt, db) {
        return new Promise((resolve, reject) => {
            db.get(stmt, (err, row) => {
                if (err) reject("DB query error")
                resolve(row)
            })
        })
    }
    
    function getBatchAsync(sql, db) {
        let results = [];
        return sql.reduce((chain, stmt) => chain.then(result => {
            results.push(result)
            return getAsync(stmt, db)
        }), Promise.resolve())
        .then(lastResult => {
            results.push(lastResult)
            return results.slice(1)
        })
    }
    
    // The amount of users per page (FE) to fetch stats for (DEFAULT is 50)
    const USERS_AMOUNT = req.body.amount || 50
    // The page number required for table pagination on the FE
    const CURRENT_PAGE = req.body.page || 1
    let sql = []

    // Calculate the user id range based on the FE request (page/amount per page)
    const firstID = (CURRENT_PAGE - 1) * USERS_AMOUNT + 1
    const lastID = CURRENT_PAGE * USERS_AMOUNT
    
    for(let id = firstID; id <= lastID; id++) {
        sql.push(`SELECT SUM(clicks) FROM users_statistic WHERE user_id=${id}`)
        sql.push(`SELECT SUM(page_views) FROM users_statistic WHERE user_id=${id}`)
    }

    try {
        const totals = await getBatchAsync(sql, db)
        let stats = []

        if (totals[0]) {
            // Extract the meaningful values from the returned array of objects
            totals.forEach((obj, i) => {totals[i] = Object.values(obj)[0]})

            const user = {
                id: firstID - 1,
                total_clicks: 0,
                total_page_views: 0
            }
            // forming an array of individual user stats objects based on the bulk of DB returned data
            totals.forEach((val, index) => {
                if (index % 2) {
                    user.id = (index + 1) / 2 + firstID - 1
                    user.total_page_views = val
                    stats.push({...user})
                } else {
                    user.id = ++user.id
                    user.total_clicks = val
                }
            })
        } else {
            res.status(400).json("{'Fail':'DB EMPTY RESPONSE'}")
        }

        sql = []
        for(let id = firstID; id <= lastID; id++) {
            sql.push(`SELECT id, first_name, last_name, email, gender, ip_address FROM users WHERE id=${id}`)
        }

        const userInfo = await getBatchAsync(sql, db)
        const rowData = userInfo.map((user, i) => {return {...user, ...stats[i]}})

        res.status(200).json(rowData)
    } catch { err => {
        console.log(err)
        res.status(400).json("{'Fail':'DB ERROR'}")
    }}
}

export async function handleDBProfile(req, res, db) {
    
    function getAsync(stmt, db) {
        return new Promise((resolve, reject) => {
            db.get(stmt, (err, row) => {
                if (err) reject("DB query error")
                resolve(row)
            })
        })
    }
    
    function getBatchAsync(sql, db) {
        let results = [];
        return sql.reduce((chain, stmt) => chain.then(result => {
            results.push(result)
            return getAsync(stmt, db)
        }), Promise.resolve())
        .then(lastResult => {
            results.push(lastResult)
            return results.slice(1)
        })
    }

    function checkDateFrom(date) {
        if (date) {
            return parseJSON(date)
        }
        else {
            return new Date("2019-10-23").toISOString()
        }
    }

    function checkDateTo(date) {
        if (date) {
            return parseJSON(req.body.dateTo) 
        }
        else {
            return addWeeks(dateFrom, 1)
        }
    }
    
    //Read the id and time period from the request. Default dateFrom is 2019-10-23
    const id = req.body.id
    const dateFrom = checkDateFrom(req.body.dateFrom)
    const dateTo = checkDateTo(req.body.dateTo)

    if (!id || (typeof id !== 'number')) {
        res.status(400).json("{'Fail':'INVALID ID'}")
        throw('ERR: ID INVALID')
    }
  
    let sql = []

    try {
        const daysArrRaw = eachDayOfInterval({
            start: dateFrom,
            end: dateTo
        })

        const daysArrFormatted = daysArrRaw.map(rawDate => lightFormat(rawDate, 'yyyy-MM-dd'))

        for(let i=0; i < daysArrFormatted.length; i++) {
            sql.push(`SELECT page_views, clicks FROM users_statistic WHERE user_id=${id} AND date="${daysArrFormatted[i]}"`)
        }

        const totalsRaw = await getBatchAsync(sql, db)

        if (totalsRaw.length) {

            // map out the "undefined" DB responses and add the corresponding dates
            const totalsFormatted = totalsRaw.map((val, i) => 
                !val 
                ? {day: daysArrFormatted[i], page_views: 0, clicks: 0 } 
                : Object.assign({day: daysArrFormatted[i]}, {...val})
            )
            res.status(200).json(totalsFormatted)

        } else {
            res.status(400).json("{'Fail':'DB EMPTY RESPONSE'}")
        }
    } catch { err => {
        if (err === RangeError) res.status(400).json("{'Fail':'INVALID DATE RANGE'}")
        res.status(400).json("{'Fail':'DB ERROR'}")
    }}
}
