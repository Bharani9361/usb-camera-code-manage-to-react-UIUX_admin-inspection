import PropTypes from "prop-types";
import React, { Component } from "react";
import "react-drawer/lib/react-drawer.css";
import Swal from 'sweetalert2';
import { connect } from "react-redux";
import { Row, Col, Label,Button, Spinner } from "reactstrap";

import { Link } from "react-router-dom";
import urlSocket from '../../pages/Component/urlSocket'


// import axios from "axios";
// // Reactstrap
// import { Dropdown, DropdownToggle, DropdownMenu } from "reactstrap";

// // Import menuDropdown
// import LanguageDropdown from "../CommonForBoth/TopbarDropdown/LanguageDropdown";
// import NotificationDropdown from "../CommonForBoth/TopbarDropdown/NotificationDropdown";
// import ProfileMenu from "../CommonForBoth/TopbarDropdown/ProfileMenu";

// import megamenuImg from "../../assets/images/megamenu-img.png";

// // import images
// import github from "../../assets/images/brands/github.png";
// import bitbucket from "../../assets/images/brands/bitbucket.png";
// import dribbble from "../../assets/images/brands/dribbble.png";
// import dropbox from "../../assets/images/brands/dropbox.png";
// import mail_chimp from "../../assets/images/brands/mail_chimp.png";
// import slack from "../../assets/images/brands/slack.png";

import logo from "../../assets/images/logo.svg";
import logoLightSvg from "../../assets/images/logo-light.svg";

//i18n
import { withTranslation } from "react-i18next";

// Redux Store
import { toggleRightSidebar } from "../../store/actions";
import './SidebarContent.css'
import TopNavbar from "./TopNavbar";
import { toastWarning } from "pages/Component/ToastComponent";
import { adminUrl } from "context/urls";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearch: false,
      station_name: '',
      stationList: [],
      open: false,
      dataloaded: false,
      position: "right",

      IsSynching: false,
    };
    this.toggleMenu = this.toggleMenu.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
  }
  

  updateVersion = () => {
    const stationData = JSON.parse(sessionStorage.getItem("stationInfo")) || {};  
    console.log('stationData ', stationData, this.state.station_name)
    if(!this.state.station_name) {
      this.setState({ station_name: stationData[0].station_name})
    }
    else if (stationData && stationData[0].station_name !== this.state.station_name) {
      this.setState({ station_name: stationData[0].station_name });
    }
  };

  
  componentDidMount = () => {
    // this.handle_sync_inspect_res()
    // this.handle_sync_inspect_summary()
    // this.sync_stn_comp_info()
    this.updateVersion();
    window.addEventListener("storage", this.updateVersion);
  }

  // handle_sync_inspect_res = async() => {
  //   setInterval(() => {
  //     this.sync_inspect_result()
  //   }, 10000)
  // }

  handle_sync_inspect_summary = async() => {
    setInterval(() => { this.sync_inspect_summary() }, 5000)
  }

  notsynMacAddress = (second) => {
    try {
      urlSocket.post('/notsync_mac_address',
        { mode: 'no-cors' })
        .then((response) => {
          let data = response.data
          console.log('detailes', data)
          this.setState({ station_name: data[0].station_name })
          sessionStorage.removeItem("stationInfo")
          sessionStorage.setItem("stationInfo", JSON.stringify(data))
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
          this.setState({ station_name: data[0].station_name })
          sessionStorage.removeItem("stationInfo")
          sessionStorage.setItem("stationInfo", JSON.stringify(data))
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log("----", error)
    }
  }

  sync_inspect_summary = async() => {
    try {
      urlSocket.post('/sync_line_inspection_summary',
        { mode: 'no-cors' })
        .then((response) => {
          let data = response.data
          console.log('detailes', data)
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log("----", error)
    }
  }

  CheckAdminOnline = async() => {
    this.setState({ IsSynching: true });

    try {
      const payload = {}
      const response = await urlSocket.post('/test_api', payload, { mode: 'no-cors' });
      let datas = response.data
      if (datas === 'ok') {
        await this.sync_inspect_result();
      }
      else {
        toastWarning('Unable to Reach Admin', '');
        this.setState({ IsSynching: false })
      }
    } catch (error) {
      toastWarning('Unable to Reach Admin', '');
      this.setState({ IsSynching: false })
    }
    
  }

  sync_inspect_result = async () => {
    try {
      const response = await urlSocket.post('/sync_line_inspection_result', { mode: 'no-cors' })
      let data = response.data
      console.log('detailes', data)
      if (data.count > 0) {
        Swal.fire({
          icon: "success",
          title: data.count + " Documents synced with the Admin",
          showConfirmButton: false,
          timer: 2500
        });
      }
      else {
        Swal.fire({
          icon: "error",
          title: "All documents have already been synced. Please test the component and sync it accordingly.",
          showConfirmButton: false,
          timer: 2500
        });
      }
    } catch (error) {
      console.log("----", error)
    } finally {
      this.setState({ IsSynching: false });
    }
  }

  sync_stn_comp_info = () => {
    try {
      urlSocket.post('/sync_stn_comp_info',
        { mode: 'no-cors' })
        .then((response) => {
          let data = response.data
          console.log('detailes97', data)
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log("----", error)
    }
  }


  toggleMenu() {
    this.props.toggleMenuCallback();
  }

  /**
   * Toggles the sidebar
   */
  toggleRightbar() {
    this.props.toggleRightSidebar();
  }

  toggleFullscreen() {
    if (
      !document.fullscreenElement &&
      /* alternative standard method */ !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  // 
  adminlogin =() =>{
    console.log("admin buttion is working")  
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to logout from Inspection!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Log Out'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = adminUrl;
        sessionStorage.clear()
      }
    })
    
  }

  qclogin =() =>{
    console.log("QC buttion is working")  
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to logout from Inspection!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Log Out'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href="https://www.autolearn.in:9103/"
        sessionStorage.clear()
      }
    })
    
  }

  render() {
    var show_sidebar = sessionStorage.getItem('showSidebar');
    return (
      // <header id="page-topbar">
      //   <TopNavbar
      //       stationName={this.state.station_name}
      //       onToggleSidebar={this.toggleMenu}
      //       onSwitchToAdmin={this.adminlogin}
      //       onSyncResults={this.sync_inspect_result}
      //       onFullScreen={this.toggleFullscreen}
      //     />
      // </header>
      <React.Fragment>
        

        <header id="page-topbar">
          <div className="navbar-header">
            <div className="d-flex">
              <div className="navbar-brand-box d-lg-none d-md-block">
                <Link to="/" className="logo logo-dark">
                  <span className="logo-sm">
                    <img src={logo} alt="" height="22" />
                  </span>
                </Link>

                <Link to="/" className="logo logo-light">
                  <span className="logo-sm">
                    <img src={logoLightSvg} alt="" height="22" />
                  </span>
                </Link>
              </div>

              <button
                type="button"
                onClick={this.toggleMenu}
                className="btn btn-sm px-3 font-size-16 header-item"
                id="vertical-menu-btn"
              >
                <i className="fa fa-fw fa-bars"></i>
              </button>

              {/* <div className="app-search d-none d-lg-block"> */}
              <div className="app-search d-flex align-items-center">
                <div className="px-3 py-1 bg-light rounded text-dark fw-bold d-flex align-items-center m-0" style={{ position: "relative" }}>
                  Station Name : {this.state.station_name}
                </div>
                {/* <input
                    type="text"
                    className="form-control"
                    placeholder={this.props.t("Search") + "..."}
                  />
                  <span className="bx bx-search-alt"></span> */}
              </div>

              {/* <Dropdown
                className="dropdown-mega d-none d-lg-block ms-2"
                isOpen={this.state.megaMenuDrp}
                toggle={() => {
                  this.setState({ megaMenuDrp: !this.state.megaMenuDrp });
                }}
              >
                <DropdownToggle className="btn header-item" caret tag="button">
                  {" "}
                  {this.props.t("Mega Menu")}{" "}
                  <i className="mdi mdi-chevron-down"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-megamenu">
                  <Row>
                    <Col sm={8}>
                      <Row>
                        <Col md={4}>
                          <h5 className="font-size-14 mt-0">
                            {this.props.t("UI Components")}
                          </h5>
                          <ul className="list-unstyled megamenu-list">
                            <li>
                              <Link to="#">{this.props.t("Lightbox")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Range Slider")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Sweet Alert")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Rating")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Forms")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Tables")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Charts")}</Link>
                            </li>
                          </ul>
                        </Col>

                        <Col md={4}>
                          <h5 className="font-size-14 mt-0">
                            {this.props.t("Applications")}
                          </h5>
                          <ul className="list-unstyled megamenu-list">
                            <li>
                              <Link to="#">{this.props.t("Ecommerce")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Calendar")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Email")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Projects")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Tasks")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Contacts")}</Link>
                            </li>
                          </ul>
                        </Col>

                        <Col md={4}>
                          <h5 className="font-size-14 mt-0">
                            {this.props.t("Extra Pages")}
                          </h5>
                          <ul className="list-unstyled megamenu-list">
                            <li>
                              <Link to="#">
                                {this.props.t("Light Sidebar")}
                              </Link>
                            </li>
                            <li>
                              <Link to="#">
                                {this.props.t("Compact Sidebar")}
                              </Link>
                            </li>
                            <li>
                              <Link to="#">
                                {this.props.t("Horizontal layout")}
                              </Link>
                            </li>
                            <li>
                              <Link to="#"> {this.props.t("Maintenance")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Coming Soon")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Timeline")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("FAQs")}</Link>
                            </li>
                          </ul>
                        </Col>
                      </Row>
                    </Col>
                    <Col sm={4}>
                      <Row>
                        <Col sm={6}>
                          <h5 className="font-size-14 mt-0">
                            {this.props.t("UI Components")}
                          </h5>
                          <ul className="list-unstyled megamenu-list">
                            <li>
                              <Link to="#">{this.props.t("Lightbox")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Range Slider")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Sweet Alert")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Rating")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Forms")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Tables")}</Link>
                            </li>
                            <li>
                              <Link to="#">{this.props.t("Charts")}</Link>
                            </li>
                          </ul>
                        </Col>

                        <Col sm={5}>
                          <div>
                            <img
                              src={megamenuImg}
                              alt=""
                              className="img-fluid mx-auto d-block"
                            />
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </DropdownMenu>
              </Dropdown> */}
            </div>
            <div className="d-flex">
              <div className="dropdown d-inline-block d-lg-none ms-2">
                {/* <button
                  onClick={() => {
                    this.setState({ isSearch: !this.state.isSearch });
                  }}
                  type="button"
                  className="btn header-item noti-icon"
                  id="page-header-search-dropdown"
                >
                  <i className="mdi mdi-magnify"></i>
                </button> */}
                <div
                  className={
                    this.state.isSearch
                      ? "dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 show"
                      : "dropdown-menu dropdown-menu-lg dropdown-menu-end p-0"
                  }
                  aria-labelledby="page-header-search-dropdown"
                >
                  <form className="p-3">
                    <div className="form-group m-0">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search ..."
                          aria-label="Recipient's username"
                        />
                        <div className="input-group-append">
                          <button className="btn btn-primary" type="submit">
                            <i className="mdi mdi-magnify"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* <LanguageDropdown /> */}

              {/* <Dropdown
                className="d-none d-lg-inline-block ms-1"
                isOpen={this.state.socialDrp}
                toggle={() => {
                  this.setState({ socialDrp: !this.state.socialDrp });
                }}
              >
                <DropdownToggle
                  className="btn header-item noti-icon"
                  tag="button"
                >
                  <i className="bx bx-customize"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end">
                  <div className="px-lg-2">
                    <Row className="no-gutters">
                      <Col>
                        <Link className="dropdown-icon-item" to="#">
                          <img src={github} alt="Github" />
                          <span>GitHub</span>
                        </Link>
                      </Col>
                      <Col>
                        <Link className="dropdown-icon-item" to="#">
                          <img src={bitbucket} alt="bitbucket" />
                          <span>Bitbucket</span>
                        </Link>
                      </Col>
                      <Col>
                        <Link className="dropdown-icon-item" to="#">
                          <img src={dribbble} alt="dribbble" />
                          <span>Dribbble</span>
                        </Link>
                      </Col>
                    </Row>

                    <Row className="no-gutters">
                      <Col>
                        <Link className="dropdown-icon-item" to="#">
                          <img src={dropbox} alt="dropbox" />
                          <span>Dropbox</span>
                        </Link>
                      </Col>
                      <Col>
                        <Link className="dropdown-icon-item" to="#">
                          <img src={mail_chimp} alt="mail_chimp" />
                          <span>Mail Chimp</span>
                        </Link>
                      </Col>
                      <Col>
                        <Link className="dropdown-icon-item" to="#">
                          <img src={slack} alt="slack" />
                          <span>Slack</span>
                        </Link>
                      </Col>
                    </Row>
                  </div>
                </DropdownMenu>
              </Dropdown> */}

              <div className="dropdown  d-lg-inline-block ms-1">
                <Button
                  outline
                  size="sm"
                  className={
                    show_sidebar === 'false' ? "w-md" : "disableSidebar w-md"
                  }
                  color="primary" onClick={this.adminlogin}
                >
                  <i className="mdi mdi-account-cog-outline me-1"></i>
                  Admin
                </Button>
                <Button
                  outline
                  size="sm"
                  className={`mx-3 ${show_sidebar === 'false' ? "w-md" : "disableSidebar w-md"}`}
                  color="primary" onClick={() => { this.CheckAdminOnline() }}
                  disabled={this.state.IsSynching}
                >
                  {this.state.IsSynching ? 
                  <div className="d-flex align-items-center"><Spinner size="sm" className="me-2" /> Syncing Result</div>
                  :
                  <><i className="mdi mdi-sync me-1"></i>Result sync</>
                  }
                  
                </Button>
                {/* <Button 
                className={
                  show_sidebar === 'false' ? "mx-4" : "mx-4 disableSidebar"
                }
                color="primary" onClick={this.qclogin}
              >
                <span className="qcfhd">Quality Checking</span>
                <span className="qcsd" >QC</span>
              </Button> */}
                <button
                  type="button"
                  onClick={this.toggleFullscreen}
                  className="btn header-item noti-icon"
                  data-toggle="fullscreen"
                >
                  <i className="bx bx-fullscreen"></i>
                </button>
              </div>

              {/* <NotificationDropdown />
              <ProfileMenu /> */}

              {/* <div className="dropdown d-inline-block">
                <button
                  onClick={() => {
                    this.toggleRightbar();
                  }}
                  type="button"
                  className="btn header-item noti-icon right-bar-toggle"
                >
                  <i className="bx bx-cog bx-spin"></i>
                </button>
              </div> */}
            </div>
          </div>
        </header>
      </React.Fragment>
    );
  }
}

Header.propTypes = {
  t: PropTypes.any,
  toggleMenuCallback: PropTypes.any,
  showRightSidebar: PropTypes.any,
  toggleRightSidebar: PropTypes.func,
};

const mapStatetoProps = state => {
  const { layoutType, showRightSidebar } = state.Layout;
  return { layoutType, showRightSidebar };
};

export default connect(mapStatetoProps, { toggleRightSidebar })(
  withTranslation()(Header)
);
