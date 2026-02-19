import React, { Component } from "react"
import PropTypes from "prop-types"
import { BrowserRouter as Router, Switch } from "react-router-dom"
import { connect } from "react-redux"

// Import Routes
import { authProtectedRoutes, publicRoutes } from "./routes/"
import AppRoute from "./routes/route"

// layouts
import VerticalLayout from "./components/VerticalLayout/"
import HorizontalLayout from "./components/HorizontalLayout/"
import NonAuthLayout from "./components/NonAuthLayout"

// Import scss
import "./assets/scss/theme.scss"

// Import Firebase Configuration file
// import { initFirebaseBackend } from "./helpers/firebase_helper"

// Import fackbackend Configuration file
import fakeBackend from "./helpers/AuthType/fakeBackend"
import urlSocket from "pages/Component/urlSocket"
// Activating fake backend
fakeBackend()

// Activating fake firebase
// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_APIKEY,
//   authDomain: process.env.REACT_APP_AUTHDOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASEURL,
//   projectId: process.env.REACT_APP_PROJECTID,
//   storageBucket: process.env.REACT_APP_STORAGEBUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
//   appId: process.env.REACT_APP_APPID,
//   measurementId: process.env.REACT_APP_MEASUREMENTID,
// };

// init firebase backend
// initFirebaseBackend(firebaseConfig);

class FakeApp extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
    this.getLayout = this.getLayout.bind(this)
    this.test_api()

  }


  test_api =() => {
    console.log('test_api called...')
    try {
      urlSocket.post('/test_api',{ mode: 'no-cors' })
          .then((response) => {
              let datas = response.data
              console.log('detailes88', datas)
              //this.setState({ componentList: data, dataloaded: true })
              if (datas === 'ok') {
                  this.macAddressFind()
                  // this.handle_sync_inspect_res()
              }
              else {
                  console.log('first', 'first')
                  this.notsynMacAddress()
              }
          })
          .catch((error) => {
              console.log(error)
              this.notsynMacAddress()
          })
  } catch (error) {
      console.log("----", error)
  }
  }
  
  
  notsynMacAddress = (second) => {
    try {
        urlSocket.post('/notsync_mac_address', { mode: 'no-cors' })
            .then((response) => {
                let data = response.data
                console.log('detailes', data)
                this.setState({ station_name: data[0].station_name})
                sessionStorage.removeItem("stationInfo")
                sessionStorage.setItem("stationInfo", JSON.stringify(data))
                this.setState({show_app: true})
            })
            .catch((error) => {
                console.log(error)
            })
    } catch (error) {
        console.log("----", error)
    }
  }
  
  macAddressFind = () => {
    try {
        urlSocket.post('/mac_address',
            { mode: 'no-cors' })
            .then((response) => {
                let data = response.data
                console.log('detailes', data)
                this.setState({ station_name: data[0].station_name})
                sessionStorage.removeItem("stationInfo")
                sessionStorage.setItem("stationInfo", JSON.stringify(data))
                sessionStorage.setItem('showSidebar', false)

                this.setState({show_app: true})

            })
            .catch((error) => {
                console.log(error)
            })
    } catch (error) {
        console.log("----", error)
    }
  }
  

  /**
   * Returns the layout
   */
  getLayout = () => {
    let layoutCls = VerticalLayout

    switch (this.props.layout.layoutType) {
      case "horizontal":
        layoutCls = HorizontalLayout
        break
      default:
        layoutCls = VerticalLayout
        break
    }
    return layoutCls
  }

  render() {
    const Layout = this.getLayout()

    return (
      <React.Fragment>
        {
          this.state.show_app &&
          <Router>
            <Switch>
              {publicRoutes.map((route, idx) => (
                <AppRoute
                  path={route.path}
                  layout={NonAuthLayout}
                  component={route.component}
                  key={idx}
                  isAuthProtected={false}
                />
              ))}

              {authProtectedRoutes.map((route, idx) => (
                <AppRoute
                  path={route.path}
                  layout={Layout}
                  component={route.component}
                  key={idx}
                  isAuthProtected={true}
                  exact
                />
              ))}
            </Switch>
          </Router>
        }

      </React.Fragment>
    )
  }
}

const mapStateToProps = state => {
  return {
    layout: state.Layout,
  }
}

FakeApp.propTypes = {
  layout: PropTypes.object,
}

export default connect(mapStateToProps, null)(FakeApp)
