import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { } from "../../store/actions";

import { Link } from "react-router-dom";

//i18n
import { withTranslation } from "react-i18next";
import SidebarContent from "./SidebarContent";

import logoLightPng from "../../assets/images/logo-light.png";
import logoLightSvg from "../../assets/images/logo-light.svg";
// import logo from "../../assets/images/logo.svg";
// import logoDark from "../../assets/images/logo-dark.png";
import logoDark from "../../assets/images/aioptix_Logo.png";
import logo from "../../assets/images/favicon.png";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }



  render() {

    const currentPath = this.props.location.pathname;

    // Routes where the sidebar should be completely hidden

    // Routes where the sidebar should be visible but disabled
    const disableSidebarRoutes = ["/adminAccTesting", '/modelAccuracyTesting', '/profile-ratio-handler', '/modelCreation', '/profile-ratio-handler-stg'];

    // const shouldHideSidebar = hideSidebarRoutes.includes(currentPath);
    const shouldDisableSidebar = disableSidebarRoutes.includes(currentPath);
    return (
      <React.Fragment>
        <div className="vertical-menu" style={{ background: 'white' }}>
          <div className="navbar-brand-box bg-white" style={{ borderRight: '1px solid lightgrey' }}>
            {!shouldDisableSidebar ? (
              <>
                {/* Active (Clickable) Logo - Dark Theme */}
                <Link to="/" className="logo logo-dark">
                  <span className="logo-sm">
                    <img src={logo} alt="" height="24" />
                  </span>
                  <span className="logo-lg">
                    <img src={logoDark} alt="" height="60" />
                  </span>
                </Link>

                {/* Active (Clickable) Logo - Light Theme */}
                <Link to="/" className="logo logo-light">
                  <span className="logo-sm">
                    <img src={logo} alt="" height="24" />
                  </span>
                  <span className="logo-lg">
                    <img src={logoDark} alt="" height="60" />
                  </span>
                </Link>
              </>
            ) : (
              <>
                {/* Disabled Logo - Dark Theme */}
                <span
                  className="logo logo-dark"
                  style={{ pointerEvents: "none", }}
                >
                  <span className="logo-sm">
                    <img src={logo} alt="" height="24" />
                  </span>
                  <span className="logo-lg">
                    <img src={logoDark} alt="" height="60" />
                  </span>
                </span>

                {/* Disabled Logo - Light Theme */}
                <span
                  className="logo logo-light"
                  style={{ pointerEvents: "none", }}
                >
                  <span className="logo-sm">
                    <img src={logo} alt="" height="24" />
                  </span>
                  <span className="logo-lg">
                    <img src={logoDark} alt="" height="60" />
                  </span>
                </span>
              </>
            )}

            {/* <Link to="/" className="logo logo-dark">
              <span className="logo-sm">
                <img src={logo} alt="" height="22" />
              </span>
              <span className="logo-lg">
                <img src={logoDark} alt="" height="17" />
              </span>
            </Link>

            <Link to="/" className="logo logo-light">
              <span className="logo-sm">
                <img src={logo} alt="" height="18" />
              </span>
              <span className="logo-lg">
                <img src={logoDark} alt="" height="30" />
              </span>
            </Link> */}

            {/* <Link to="/" className="logo logo-light">
              <span className="logo-sm">
                <span className="fw-bold" style={{ color: 'black', fontSize: '16px' }}>VI</span>
              </span>
              <span className="logo-lg">
                <span className="fw-bold" style={{ color: 'black', fontSize: '16px' }}>VISION INSPECTION</span>
              </span>
            </Link> */}
          </div>
          {/* <div className="navbar-brand-box">
            <Link to="/" className="logo logo-dark">
              <span className="logo-sm">
                <img src={logo} alt="" height="22" />
              </span>
              <span className="logo-lg">
                <img src={logoDark} alt="" height="17" />
              </span>
            </Link>

            <Link to="/" className="logo logo-light">
              <span className="logo-sm">
                <img src={logoLightSvg} alt="" height="22" />
              </span>
              <span className="logo-lg">
                <img src={logoLightPng} alt="" height="19" />
              </span>
            </Link>
          </div> */}
          <div data-simplebar>
            {this.props.type !== "condensed" ? <SidebarContent /> : <SidebarContent />}
          </div>
          <div className="sidebar-background"></div>
        </div>
      </React.Fragment>
    );
  }
}

Sidebar.propTypes = {
  type: PropTypes.string,
  location: PropTypes.object,
};

const mapStateToProps = state => {
  return {
    layout: state.Layout,
  };
};
export default connect(
  mapStateToProps,
  {}
)(withRouter(withTranslation()(Sidebar)));
