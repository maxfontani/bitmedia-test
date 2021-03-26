import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Chart from '../components/chart/Chart'

import '../styles/profile.scss'

export default function Profile({ userInfo }) {

  useEffect(() => {
    onSubmit()
  }, [])
    
  let { userId } = useParams()
  // The default date relative to which statistics will be displayed 
  const DEFAULT_DATE_FROM = new Date("2019-10-23").toISOString()
  const DEFAULT_DATE_TO = new Date("2019-10-30").toISOString()

  const dbReqInitialParams = {id: 1, dateFrom: DEFAULT_DATE_FROM, dateTo: DEFAULT_DATE_TO}
  dbReqInitialParams.id = userInfo.id || Number(userId) || 1

  const [dbRequest, setDbRequest] = useState(dbReqInitialParams)
  const [chartDataRaw, setChartDataRaw] = useState([])

  let fullName = ""
  if (userInfo.first_name) fullName = userInfo.first_name + ' ' + userInfo.last_name
  
  function onSubmit() {
    console.log('onSUBMIT', dbRequest)
    if (dbRequest.dateFrom > dbRequest.dateTo) {
      alert("Improper date order")
    } else {
      fetch(process.env.REACT_APP_HOST + '/api/dbprofile', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbRequest)
      })
      .then(res => res.json())
      .then(chartDataRaw => {
        console.log('FET CHART DATA: ', chartDataRaw);
        setChartDataRaw(chartDataRaw)})
    }
}

  return (
    <div className="profile">
      <div className="profile-name">
        {{fullName} && <h2>{fullName}</h2>}
      </div>
      <div className="profile-input-wide">
        <div className="profile-input">
          <span>
            <label>From</label> 
            <input
              required
              id="date-from-input"
              type="date"
              min="2000-01-01" 
              max={new Date().toISOString().slice(0,10)}
              defaultValue="2019-10-23"
              onKeyDown={(e) => e.preventDefault()}
              onChange={e => {
                const newDateFrom = new Date(e.target.value).toISOString()
                console.log('CHANGE: ', newDateFrom);
                setDbRequest(prevState => {return {...prevState, dateFrom: newDateFrom }})
                }}
            />
          </span>
          <span>
            <label>To</label> 
            <input
              id="date-to-input"
              type="date"
              min="2000-01-01" 
              max={new Date().toISOString().slice(0,10)}
              defaultValue="2019-10-30"
              onKeyDown={(e) => e.preventDefault()}
              onChange={e => {
                const newDateTo = new Date(e.target.value).toISOString()
                console.log('CHANGE: ', newDateTo);
                setDbRequest(prevState => {return {...prevState, dateTo: newDateTo }})
                }}
            />
          </span>
          <button onClick={onSubmit}>
            Show
          </button>
        </div>
      </div>
      <div className="chart-wide">
        <div className="chart-content clicks">
          <Chart chartDataRaw={chartDataRaw} chartType={"clicks"} />
        </div>
      </div>
      <div className="chart-wide">
        <div className="chart-content views">
          <Chart chartDataRaw={chartDataRaw} chartType={"page_views"} />
        </div>
      </div>
    </div>
  )
}