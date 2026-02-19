import toastr from "toastr";

export const toastSuccess = (title, message) => {
    // title = "Success"
    toastr.options.closeDuration = 8000
    toastr.options.positionClass = "toast-bottom-right"
    toastr.success(message, title)
}

export const toastWarning = (title, message) => {
    // let title = "Failed"
    toastr.options.closeDuration = 8000
    toastr.options.positionClass = "toast-top-right"
    toastr.warning(message, title)
}

export const toastError = (title, message) => {
    // let title = "Failed"
    toastr.options.closeDuration = 8000
    toastr.options.positionClass = "toast-bottom-right"
    toastr.error(message, title)
}