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
import { Alert, Button, Spinner } from "reactstrap"
import { adminUrl,sub_domain } from "context/urls"
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

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      stationCreated: false,

      show_app: false,
      station_name: null,

      isRetrying: false,
      isMismatchUrl: true,
    }
    this.getLayout = this.getLayout.bind(this)

    // this.checkStationInfoAvailability();

  }

  componentDidMount() {
    this.checkStationInfoAvailability();
  }


  checkAdminserverAvailability = () => {
    sessionStorage.setItem('showSidebar', false)
    console.log('checkAdminserverAvailability')
    this.macAddressFind()
  }

  checkSubdomainAvailability = () => {
    const hostname = window.location.hostname;
    const hostnameParts = hostname.split('.');

    const currentSubdomain = hostname.includes('localhost') && hostnameParts.length === 2
      ? hostnameParts[0]
      : hostnameParts.length > 2
        ? hostnameParts[0]
        : null;

    console.log('Subdomain:', currentSubdomain);
    if (currentSubdomain !== sub_domain || currentSubdomain === null) {
      console.warn('Blocked API call: invalid subdomain ->', currentSubdomain);
      return false
    }
    else{
      return true
    }
  }

  checkStationInfoAvailability = (second) => {
    try {
      this.setState({ isLoading: true });
      
      const isSubdomainValid = this.checkSubdomainAvailability();
      if (!isSubdomainValid) {
        this.setState({ isMismatchUrl: false,isLoading: false });
        return;
      }
      else{
        urlSocket.post('/getstationInfo', { mode: 'no-cors' })
        .then((response) => {
          let datas = response.data;

           console.log('68 datas :: ', datas)
          if (datas.length > 0) {
           console.log('detailes88', datas)
            this.setState({ station_name: datas[0].station_name })
            sessionStorage.removeItem("stationInfo")
            sessionStorage.setItem("stationInfo", JSON.stringify(datas))
            this.setState({ show_app: true, isLoading: false, stationCreated: true });
          }
          else {
            this.checkAdminserverAvailability()
          }

        })
        .catch((error) => {
          console.log(error)
          this.notsynMacAddress()
        })
      }

      //  actuall functioanilty before error handling
      // urlSocket.post('/getstationInfo', { mode: 'no-cors' })
      //   .then((response) => {
      //     let datas = response.data;

      //     // console.log('68 datas :: ', datas)
      //     if (datas.length > 0) {
      //       // console.log('detailes88', datas)
      //       this.setState({ station_name: datas[0].station_name })
      //       sessionStorage.removeItem("stationInfo")
      //       sessionStorage.setItem("stationInfo", JSON.stringify(datas))
      //       this.setState({ show_app: true, isLoading: false, stationCreated: true });
      //     }
      //     else {
      //       this.checkAdminserverAvailability()
      //     }

      //   })
      //   .catch((error) => {
      //     console.log(error)
      //     this.notsynMacAddress()
      //   })
    } catch (error) {
      console.log('error', error)
    }
  }




  notsynMacAddress = (second) => {
    try {
      const isSubdomainValid = this.checkSubdomainAvailability();
      if (!isSubdomainValid) {
        this.setState({ isMismatchUrl: false, isLoading: false });
        return;
      }
      else {
        urlSocket.post('/notsync_mac_address', { mode: 'no-cors' })
          .then((response) => {
            let data = response.data
            console.log('detailes', data)
            this.setState({ station_name: data[0].station_name })
            sessionStorage.removeItem("stationInfo")
            sessionStorage.setItem("stationInfo", JSON.stringify(data))
            this.setState({ show_app: true })
          })
          .catch((error) => {
            console.log(error)
          })
      }

    } catch (error) {
      console.log("----", error)
    }
  }

  macAddressFind = async () => {
    try {
       const isSubdomainValid = this.checkSubdomainAvailability();
      if (!isSubdomainValid) {
        this.setState({ isMismatchUrl: false, isLoading: false });
        return;
      }
      else {
        const response = await urlSocket.post('/mac_address', { mode: 'no-cors' });
        let data = response.data;
        if (data.error) {
          console.log('/mac_address error', data);
          this.setState({ show_app: false, isLoading: false, stationCreated: false });
        } else {
          console.log('detailes', data)
          this.setState({ station_name: data[0].station_name })
          sessionStorage.removeItem("stationInfo")
          sessionStorage.setItem("stationInfo", JSON.stringify(data))
          sessionStorage.setItem('showSidebar', false)

          this.setState({ show_app: true, isLoading: false, stationCreated: true });

        }
      }

      // // 
      //   urlSocket.post('/mac_address',
      //       { mode: 'no-cors' })
      //       .then((response) => {
      //           let data = response.data
      //           console.log('detailes', data)
      //           this.setState({ station_name: data[0].station_name})
      //           sessionStorage.removeItem("stationInfo")
      //           sessionStorage.setItem("stationInfo", JSON.stringify(data))
      //           sessionStorage.setItem('showSidebar', false)

      //           this.setState({show_app: true})

      //       })
      //       .catch((error) => {
      //           console.log(error)
      //       })
      //   // 
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

  handleGoToAdmin = () => {
    sessionStorage.clear();
    // window.open("https://localhost:3004/", "_blank");
    window.location.href = adminUrl;
  }

  render() {
    const Layout = this.getLayout()

    return (
      <React.Fragment>
        {this.state.isLoading ?
          (<div className="d-flex flex-column align-items-center justify-content-center text-center p-4" style={{ minHeight: '100vh' }}>
            <Spinner color="primary" className="mb-3" />
            <h5 className="mt-1">
              <strong>Loading station details...</strong>
            </h5>
          </div>)
          : this.state.stationCreated ?
            (<Router>
              <Switch>
                {publicRoutes.map((route, idx) => (
                  <AppRoute
                    path={route.path}
                    layout={Layout}
                    // layout={NonAuthLayout}
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
            </Router>)
            : 
            !this.state.isMismatchUrl ? 
            (<div className="d-flex flex-column align-items-center justify-content-center text-center p-4" style={{ minHeight: '100vh' }}>
                <Alert color="warning" className="d-flex align-items-center justify-content-center">
                  <i className="bx bxs-error me-2 fs-4"></i>
                  <strong>Please check the URL</strong>
                </Alert>
                <p className="mb-4 fw-bold">
                  To continue using the inspection app, please enter the correct URL.
                </p>
              </div>
            ):
            (<div className="d-flex flex-column align-items-center justify-content-center text-center p-4" style={{ minHeight: '100vh' }}>
                <Alert color="warning" className="d-flex align-items-center justify-content-center">
                  <i className="bx bxs-error me-2 fs-4"></i>
                  <strong>Station Not Created</strong>
                </Alert>
                <p className="mb-4 fw-bold">
                  To continue using the inspection app, please set up the station from the admin side.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <Button color="primary" 
                    onClick={this.handleGoToAdmin}
                  >
                    <i className="mdi mdi-arrow-right-bold-circle me-2"></i>
                    Go to Admin Side
                  </Button>
                </div>
              </div>
            )
        }
        {/* {
          this.state.show_app ?
            <Router>
              <Switch>
                {publicRoutes.map((route, idx) => (
                  <AppRoute
                    path={route.path}
                    layout={Layout}
                    // layout={NonAuthLayout}
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
            :
            <div className="d-flex flex-column align-items-center justify-content-center text-center p-4" style={{ minHeight: '100vh' }}>
              <Alert color="warning" className="d-flex align-items-center">
                <i className="bx bxs-error me-2 fs-4"></i>
                <strong>Station Not Created</strong>
              </Alert>
              <p className="mb-4">
                To continue using the inspection app, please set up the station from the admin side.
              </p>
              <div className="d-flex gap-3">
                <Button color="primary"
                // onClick={this.handleGoToAdmin}
                >
                  <i className="mdi mdi-arrow-right-bold-circle me-2"></i>
                  Go to Admin Side
                </Button>
                <Button color="secondary"
                  onClick={this.checkStationInfoAvailability} 
                  disabled={this.state.isRetrying}
                >
                  {this.state.isRetrying ? (
                    <>
                      <Spinner size="sm" /> Checking...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-refresh me-2"></i>
                      Retry
                    </>
                  )}
                </Button>
              </div>
            </div>
        } */}

      </React.Fragment>
    )
  }
}

const mapStateToProps = state => {
  return {
    layout: state.Layout,
  }
}

App.propTypes = {
  layout: PropTypes.object,
}

export default connect(mapStateToProps, null)(App)
