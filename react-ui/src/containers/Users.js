import React, { useEffect, useState } from 'react'
import UsersTable from '../components/table/UsersTable'
import Profile from './Profile'
import {
    useRouteMatch,
    Route,
    Link,
    Switch
  } from "react-router-dom"

import '../styles/users.scss'

export default function Users() {

  const MAX_NAV_PAGES = 5
  const MAX_USERS = 1000
  let { url } = useRouteMatch()
  const [tableData, setTableData] = useState([])
  const [navPage, setNavPage] = useState(1)
  const [rowClicked, setRowClicked] = useState({})
  const [paginationParams, setPaginationParams] = useState({page: 1, amount: 20})

  
  useEffect(() => {
      fetch('/api/dbstats', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paginationParams)
      })
      .then(res => res.json())
      .then(userData => {
        setTableData(userData)})
  }, [paginationParams])

  return (
    <div className="users">
      <div className="header-wide">
        <div className="header-users">
          <p className="logo">AppCo</p>
          <div className="header-path">
            <Link className="link-large" to="/">Home</Link>
            &nbsp;&gt;&nbsp;
            <Link to="/users" className="link-medium">Users Statistics</Link>
            <Route exact path={`${url}/:userId`}>
              &nbsp;&gt;&nbsp;
              <p className="link-medium">{(rowClicked.first_name && rowClicked.first_name.concat(' ', rowClicked.last_name)) || "User"}</p>
            </Route>
          </div>
        </div>
      </div>
      <Switch>
        <Route exact path={`${url}`}>  
        <div className="page-nav-wide">      
          <div className="page-nav">
            <div className="page-nav-left">
              <span>
                Page&nbsp;
                <strong>
                  {paginationParams.page}
                </strong>&nbsp;
              </span>
              <span>
                | Go&nbsp;to&nbsp;page:&nbsp;
                <input
                  type="number"
                  defaultValue="1"
                  min="1"
                  max={MAX_USERS / 10}
                  onChange={e => {
                    const page = e.target.value ? Number(e.target.value) : 0
                    page && setPaginationParams({...paginationParams, page})
                  }}
                />
              </span>
            </div>
            <div className="page-nav-right">
              Users per page:&nbsp;
              <select
                value={paginationParams.amount}
                onChange={e => {
                  setPaginationParams(Object.assign({...paginationParams}, {amount: Number(e.target.value)}))
                }}
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
          </div>
            {tableData.length 
              ? <UsersTable data={tableData} setRowClicked={setRowClicked} />
              : <p>Loading...</p>
            }
          <div className="page-icons">
            <button 
              id="btn-decr"
              onClick={() => setPaginationParams(prevState => {
                if (!((prevState.page - 1) % MAX_NAV_PAGES)) setNavPage(prevState => prevState - MAX_NAV_PAGES)  
                return {...prevState, page: --prevState.page}}
              )}
              disabled={paginationParams.page === 1}>
            </button>

            {[navPage, ...Array(MAX_NAV_PAGES-1).keys()].map((val, index) => (
              <button
                key={index}
                active={(navPage+index === paginationParams.page).toString()}
                onClick={() => setPaginationParams({...paginationParams, page: navPage+index})}>
                  {navPage+index}
              </button>
            ))}

            <button
              id="btn-incr" 
              onClick={() => setPaginationParams(prevState => {
                if (!(prevState.page % MAX_NAV_PAGES)) setNavPage(prevState => prevState + MAX_NAV_PAGES)
                return {...prevState, page: ++prevState.page}}
              )}
              disabled={(MAX_USERS - (paginationParams.amount * paginationParams.page)) <= 0}>
            </button>
          </div>
        </Route>

        <Route exact path={`${url}/:userId`}>
          <Profile userInfo={rowClicked} />
        </Route>

      </Switch>
      <div className="footer-wide">
        <div className="footer-users">
          <p className="logo">AppCo</p>
          <p>All rights reserved by ThemeTags</p>
          <p>Copyrights © 2019.</p>
        </div>
      </div>
    </div>
  )
}