import toastr from "toastr";

import React from 'react'
import PropTypes from 'prop-types'
import SweetAlert from "react-bootstrap-sweetalert"

export const toastSuccess = (message, title="", duration=3000) => {
    toastr.options.closeDuration = duration
    toastr.options.positionClass = "toast-bottom-right"
    toastr.success(message, title)
}

export const toastWarning = (message, title="", duration=3000) => {
    toastr.options.closeDuration = duration
    toastr.options.positionClass = "toast-bottom-right"
    toastr.warning(message, title)
}

export const toastError = (message, title="", duration=3000) => {
    toastr.options.closeDuration = duration
    toastr.options.positionClass = "toast-bottom-right"
    toastr.error(message, title)
}

const NotifyUser = ({ titleMsg="", message="", toggleNotify }) => {
  return (
      <SweetAlert
          title={titleMsg}
          warning
          onConfirm={toggleNotify}
      >
          <h5 style={{ fontWeight: 'bold'}}>{message}</h5>
      </SweetAlert>
  )
}

NotifyUser.propTypes = {
    titleMsg: PropTypes.any.isRequired,
    message: PropTypes.any.isRequired,
    toggleNotify: PropTypes.func.isRequired,
}

export default NotifyUser;

export const NotifyWithConfirm = ({ titleMsg = "", message = "", allow, close }) => {
    return (
        <SweetAlert
            title={titleMsg}
            warning
            showCancel
            confirmButtonText="Yes, delete it!"
            confirmBtnBsStyle="success"
            cancelBtnBsStyle="danger"
            onConfirm={allow}
            onCancel={close}
        >
            {`${message}`}
        </SweetAlert>
    )
}

NotifyWithConfirm.propTypes = {
    titleMsg: PropTypes.any.isRequired,
    message: PropTypes.any.isRequired,
    allow: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
}