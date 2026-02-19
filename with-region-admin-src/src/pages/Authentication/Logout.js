import React, { Component } from "react"
import PropTypes from 'prop-types';
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"

import { logoutUser } from "../../store/actions"

class Logout extends Component {
  /**
   * Redirect to login
   */
  componentDidMount = () => {
    // emit the event
    this.props.logoutUser(this.props.history)
    localStorage.removeItem("authUser")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("client_info")
    localStorage.removeItem("db_info")
    localStorage.removeItem("express-session")
    localStorage.removeItem("i18nextLng")
    localStorage.removeItem("I18N_LANGUAGE")

    sessionStorage.removeItem("short_name")
    sessionStorage.removeItem("userData")
    sessionStorage.removeItem("authUser")
    sessionStorage.removeItem("db_info")
    sessionStorage.removeItem("client_info")
    sessionStorage.removeItem("select_menu")
  }

  render() {
    return <React.Fragment></React.Fragment>
  }
}

Logout.propTypes = {
  history: PropTypes.any,
  logoutUser: PropTypes.func
}

export default withRouter(connect(null, { logoutUser })(Logout))
