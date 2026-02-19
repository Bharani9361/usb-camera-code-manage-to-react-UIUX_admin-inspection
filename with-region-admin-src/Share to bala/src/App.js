// import React from "react";
// import CameraView from "CameraView";

// function App() {
//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Stage Camera</h1>

//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fill, 5cm)",
//           gap: "20px"
//         }}
//       >
//         <CameraView port={0} />

//         <CameraView port={1} />
//         <CameraView port={2} />
//         <CameraView port={3} />
//         <CameraView port={4} />
//       </div>
//     </div>
//   );
// }

// export default App;

// import React from "react";
// import CameraView from "CameraView";

// function App() {
//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Stage Camera (port 3)</h1>

//       <div
//         style={{
//           display: "grid",
//           // gridTemplateColumns: "repeat(3, 1fr)",
//           gridTemplateColumns: "repeat(3, 3fr)",

//           gap: "2px"
//         }}

//       >
//         <CameraView port={0} />
//         <CameraView port={1} />
//         <CameraView port={2} />
//         <CameraView port={3} />
//         <CameraView port={4} />
//       </div>
//     </div>
//   );
// }

// export default App;

// // import React from "react";
// // import CameraView from "CameraView";

// // function App() {
// //   return (
// //     <div style={{ padding: 20 }}>
// //       <h1>Stage Camera (port 3)</h1>
// //       <CameraView port={0} />
// //       <CameraView port={0} />

// //       <CameraView port={0} />

// //       <CameraView port={0} />

// //       <CameraView port={0} />

// //       v
// //       <CameraView port={1} />
// //       <CameraView port={2} />
// //       <CameraView port={3} />
// //       <CameraView port={4} />
// //     </div>
// //   );
// // }

// // export default App;

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
// import "./assets/scss/theme.scss"

// Import Firebase Configuration file
// import { initFirebaseBackend } from "./helpers/firebase_helper"

// Import fackbackend Configuration file
import fakeBackend from "./helpers/AuthType/fakeBackend"

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
    this.state = {}
    this.getLayout = this.getLayout.bind(this)
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
