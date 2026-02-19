// import urlSocket from "../helpers/urlSocket";
import urlSocket from "pages/AdminInspection/urlSocket"


const validateSession = (express_session, dbUrl) => {
    return new Promise((resolve, reject) => {
        try {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"))
            urlSocket.post('handle-session/validate-session', {
                encrypted_db_url: dbUrl ? dbUrl : authUser.db_info.encrypted_db_url,
                mode: dbUrl ? "1" : "0",
                express_session
            }).then((response) => {
                console.log(response, 'response', dbUrl)
                if (response.data.response_code === 500) {
                    if (response.data.data.length === 0) {
                        sessionStorage.clear()
                        localStorage.clear()
                    }
                    else {
                        if (response.data.authUserInfo && dbUrl) {
                            sessionStorage.setItem('authUser', JSON.stringify(response.data.authUserInfo))
                            sessionStorage.setItem('client_info', JSON.stringify(response.data.authUserInfo.client_info))
                            sessionStorage.setItem('db_info', JSON.stringify(response.data.authUserInfo.db_info))
                            sessionStorage.setItem('user_facilities', JSON.stringify(response.data.authUserInfo.facility_data))
                            sessionStorage.setItem('select_menu', "1")
                            resolve("authUser")
                        }
                        else {
                            resolve(true)

                        }

                    }
                }
                else {
                    reject(false)
                }
            })
        } catch (error) {
            reject(false)

        }
    })
}

export default validateSession