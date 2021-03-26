import React from 'react'
import Users from './Users'
import Tilt from 'react-tilt'
import mobile from '../images/mobile.svg'
import box1 from '../images/box1.svg'
import box2 from '../images/box2.svg'
import box3 from '../images/box3.svg'

import {
  Switch,
  Route,
  Link
} from "react-router-dom"

import '../styles/app.scss'

export default function App() {

  return (
    <div className="app" >
        <Switch>
          <Route path="/users">
            <Users />
            {/* <Link to="/"><h2>Back Home</h2></Link> */}
          </Route>
      
          <Route exact path="/">
            <header className="header">              
              <div className="header-content">
                <div className="header-text">
                  <p className="logo">AppCo</p>
                  <h2><b>Brainstorming</b> for desired perfect Usability</h2>
                  <p>Our design projects are fresh and simple and will benefit your business greatly. Learn more about our work!</p>
                  <Link to="/users">
                    <button>Users Statistics</button>
                </Link>
                </div>
                <div className="header-img">
                  <Tilt className="tilt" options={{ max : 25, scale : 1.03}}>
                    <img alt="" src={mobile} />
                  </Tilt>
                </div>
              </div>
            </header>
            <div className="app-body">
              <div className="app-body-text">
                <p>Why <b id="b1">small business owners</b><br/><b>love</b> AppCo?</p>
                <p>Our design projects are fresh and simple and will benefit your business greatly. Learn more about our work!</p>
              </div>
              <div className="app-body-boxes">
                <div className="box">
                  <img alt="" src={box1} />
                    <p>Clean Design</p>
                    <p>Increase sales by showing true dynamics of your website.</p>
                </div>
                <div className="box">
                  <img alt="" src={box2}></img>
                    <p>Secure Data</p>
                    <p>Build your online store’s trust using Social Proof & Urgency.</p>
                </div>
                <div className="box">
                  <img alt="" src={box3} />
                  <p>Retina Ready</p>
                  <p>Realize importance of social proof in customer’s purchase decision.</p>
                </div>
              </div>
            </div>
            <div className="sub">
                <input className="sub-input" placeholder="Enter your email"></input>
                <button>Subscribe</button>
              </div>
            <footer className="footer">
                <p className="logo">AppCo</p>
                <p>All rights reserved by ThemeTags</p>
                <p>Copyrights © 2019.</p>
            </footer>
          </Route>
        </Switch>
      
    </div>
  )
}

