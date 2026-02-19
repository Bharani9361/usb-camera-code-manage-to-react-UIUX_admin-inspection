import { createSlice } from '@reduxjs/toolkit';
// import urlSocket from '../../../helpers/urlSocket';
import urlSocket from 'pages/AdminInspection/urlSocket';
// import { setConfigInfo, setAuthUserInfo } from "Slice/manageSessionSlice";

var CryptoJS = require('crypto-js')

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        userInfo: JSON.parse(sessionStorage.getItem('authUser')),
        user_data: JSON.parse(sessionStorage.getItem('authUser'))?.user_data,
        loading: false,
        error: null,
        isAuthenticated: false,
        // db_info: {
        //     // encrypted_db_url: 'mongodb://localhost:27017',
        //     // encrypted_db_url: 'mongodb://mongoadmin:DegLk916ePdeG@65.0.69.57:27017/hotel_surguru?authMechanism=SCRAM-SHA-1&authSource=admin',
        //     // db_name: 'hotel_surguru'

        //     encrypted_db_url: 'mongodb://mongoadmin:DegLk916ePdeG@65.0.69.57:27017/tataest_674567d63c1fe49f5de4dc4b?authMechanism=SCRAM-SHA-1&authSource=admin',
        //     db_name: 'tataest_674567d63c1fe49f5de4dc4b'


        // },
        db_info: JSON.parse(sessionStorage.getItem("authUser"))?.db_info            

        ,
        cln_list: [{ "cln_name": "sales_Report_check", "user_friendly_name": "Hotel Surguru" }],
        report_math_operations: [
            {
                "id": 1,
                "name": "SUM"
            },
            {
                "id": 2,
                "name": "AVERAGE"
            },
            {
                "id": 3,
                "name": "MINIMUM"
            },
            {
                "id": 4,
                "name": "MAXIMUM"
            },
            {
                "id": 5,
                "name": "COUNT"
            },
            // {
            //     "id": 6,
            //     "name": "STANDARD DEVIATION"
            // },
            // {
            //     "id": 7,
            //     "name": "VARIANCE"
            // },
            // {
            //     "id": 8,
            //     "name": "MEDIAN"
            // }
        ],
        dateRangeField:'updated_on' ,




        aplnRequestLoading: false,
        aplnRequestError: null,
        clientData: null,
        authLoad: false,
        accActivationErr: false,
        invalidCredentials: false,
        invalidErrMsg: "",
        userFacilities: [],
        showVerifyPwd: false,
        pwdSession: null,
        updateMsg: false

    },
    reducers: {
        updateUserInfo: (state, action) => {
            state.userInfo = action.payload;
            state.isAuthenticated = true;
        },
        invalidAuth: (state, action) => {
            state.error = action.payload
            state.isAuthenticated = false;
        },
        setDbInfoSlicer: (state, action) => {
            console.log('state, action :>> ', state, action);
            state.db_info = action.payload
        },



        setAplnRequestLoading: (state, action) => {
            state.aplnRequestLoading = action.payload
        },
        setAplnRequestError: (state, action) => {
            state.aplnRequestError = action.payload
        },
        setClientData: (state, action) => {
            state.clientData = action.payload
        },
        setauthLoad: (state, action) => {
            state.authLoad = action.payload
        },
        setaccActivationErr: (state, action) => {
            state.accActivationErr = action.payload
        },
        setInvalidCredentials: (state, action) => {
            state.invalidCredentials = action.payload
        },
        setInvalidErrMsg: (state, action) => {
            state.invalidErrMsg = action.payload
        },
        setUserFacilities: (state, action) => {
            state.userFacilities = action.payload
        },
        setshowVerifyPwd: (state, action) => {
            state.showVerifyPwd = action.payload
        },
        setPwdSession: (state, action) => {
            state.pwdSession = action.payload
        },
        setUpdtMsg: (state, action) => {
            state.updateMsg = action.payload
        }



    },


   
});






export const getConfiguration = () => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await urlSocket.post('authentication/get-config');
            console.log('success :');
            if (response.status === 200) {
                // console.log('configdata', response.data.data[0])
                dispatch(setConfigInfo(response.data.data[0]))
                sessionStorage.setItem("configData", JSON.stringify(response.data.data[0]))
                // resolve(response.data);
            }
        } catch (error) {
            reject(error);
        }
    });
}


export const loginAuthentication = (value, history) => async (dispatch) => {
    console.log("value", value);
    const secretKey = process.env.REACT_APP_SECRETKEY;
    // console.log('secretKey', secretKey)
    const username = value.username.trim();
    const password = CryptoJS.AES.encrypt(value.password.trim(), secretKey).toString();
    const encryptedValue = { username, password };
    console.log('encryptedValue', encryptedValue)
    return new Promise(async (resolve, reject) => {
        try {
            const response = await urlSocket.post('incentive/login', encryptedValue);
            console.log('response :', response);
            if (response.status === 200) {
                resolve(response.data);
            }
        } catch (error) {
            reject(error);
        }
    });
};




export const userAuthenticate = (values, history) => {
    return async dispatch => {

        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("authentication/login-authenticate", values)
            console.log(responseData, 'responseData');
            dispatch(setAplnRequestLoading(false))
            dispatch(setauthLoad(false))
            if (responseData.status === 200 && (responseData.data.message === "new password required" || responseData.data.user_data !== undefined)) {
                if (responseData.data.message === "new password required") {
                    dispatch(setshowVerifyPwd(true))
                    dispatch(setPwdSession(responseData.data.data.Session))
                } else {
                    dispatch(setshowVerifyPwd(false))
                    return responseData.data;
                }
            } else if (responseData.data.error === "404db") {
                dispatch(setaccActivationErr(true))
                dispatch(setInvalidCredentials(false))

                setTimeout(() => {
                    dispatch(setaccActivationErr(false))
                }, 3000);

                return null
            } else if (responseData.data.code === 204) {
                if (Object.keys(responseData.data.error).length === 0) {
                    dispatch(setInvalidCredentials(true))
                    dispatch(setaccActivationErr(false))
                    setTimeout(() => {
                        dispatch(setInvalidCredentials(false))
                    }, 3000);
                    return null
                } else {
                    dispatch(setInvalidErrMsg(responseData.data.message))
                    setTimeout(() => {
                        dispatch(setInvalidErrMsg(""))
                    }, 3000);
                }
            } else {
                // history("/login")
                return responseData.data
            }


        } catch (error) {
            console.log(error, 'error');
            dispatch(setAplnRequestLoading(error))
        }
    }

}


export const userForgetPwd = (values) => {

    return async dispatch => {

        try {
            console.log(values, 'values');
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("ir-auth/forget-password", values)
            console.log(responseData, 'responseData');
            dispatch(setAplnRequestLoading(false))
            return responseData
        } catch (error) {
            console.log(error, 'error');
            dispatch(setAplnRequestLoading(error))
        }
    }
}


export const setNewForgetPwd = (values) => {
    return async dispatch => {
        try {
            console.log(values, 'values');
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("ir-auth/confirm-reset-password", values)
            console.log(responseData, 'responseData');
            dispatch(setAplnRequestLoading(false))
            return responseData
        } catch (error) {
            console.log(error, 'error');
            dispatch(setAplnRequestLoading(error))
        }
    }
}


export const confirmNewPwd = (values) => {
    return async dispatch => {

        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("authentication/confrm-new-pwd", values)
            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200) {
                dispatch(setUpdtMsg(true))
                setTimeout(() => {
                    dispatch(setUpdtMsg(false))
                    dispatch(setshowVerifyPwd(false))
                }, 3000);
            }

        } catch (error) {
            dispatch(setAplnRequestLoading(error))
        }
    }
}






export const { updateUserInfo, invalidAuth, setDbInfoSlicer,



    setAplnRequestError,
    setAplnRequestLoading,
    setClientData,
    setauthLoad,
    setInvalidErrMsg,
    setaccActivationErr,
    setInvalidCredentials,
    setUserFacilities,
    setshowVerifyPwd,
    setPwdSession,
    setUpdtMsg

} = authSlice.actions;
export const authReducer = authSlice.reducer






// commeneted on 17 Jan 25
// import { createSlice } from '@reduxjs/toolkit';
// import urlSocket from 'helpers/urlSocket';
// import { setConfigInfo, setAuthUserInfo } from "Slice/manageSessionSlice";

// var CryptoJS = require('crypto-js')

// const authSlice = createSlice({
//     name: 'auth',
//     initialState: {
//         userInfo: JSON.parse(sessionStorage.getItem('authUser')),
//         user_data: JSON.parse(sessionStorage.getItem('authUser')),
//         loading: false,
//         error: null,
//         isAuthenticated: false,
//         db_info: {
//             encrypted_db_url: 'mongodb://mongoadmin:DegLk916ePdeG@65.0.69.57:27017/hotel_surguru?authMechanism=SCRAM-SHA-1&authSource=admin',
//             db_name: 'hotel_surguru'
//         },
//         cln_list: [{ "cln_name": "sales_Report_check", "user_friendly_name": "Hotel Surguru" }],
//         report_math_operations: [
//             {
//                 "id": 1,
//                 "name": "SUM"
//             },
//             {
//                 "id": 2,
//                 "name": "AVERAGE"
//             },
//             {
//                 "id": 3,
//                 "name": "MINIMUM"
//             },
//             {
//                 "id": 4,
//                 "name": "MAXIMUM"
//             },
//             {
//                 "id": 5,
//                 "name": "COUNT"
//             },
//             {
//                 "id": 6,
//                 "name": "STANDARD DEVIATION"
//             },
//             {
//                 "id": 7,
//                 "name": "VARIANCE"
//             },
//             {
//                 "id": 8,
//                 "name": "MEDIAN"
//             }
//         ],




//         aplnRequestLoading: false,
//         aplnRequestError: null,
//         clientData: null,
//         authLoad: false,
//         accActivationErr: false,
//         invalidCredentials: false,
//         invalidErrMsg: "",
//         userFacilities: [],
//         showVerifyPwd: false,
//         pwdSession: null,
//         updateMsg: false

//     },
//     reducers: {
//         updateUserInfo: (state, action) => {
//             state.userInfo = action.payload;
//             state.isAuthenticated = true;
//         },
//         invalidAuth: (state, action) => {
//             state.error = action.payload
//             state.isAuthenticated = false;
//         },
//         setDbInfo: (state, action) => {
//             state.dbInfo = action.payload
//         },



//         setAplnRequestLoading: (state, action) => {
//             state.aplnRequestLoading = action.payload
//         },
//         setAplnRequestError: (state, action) => {
//             state.aplnRequestError = action.payload
//         },
//         setClientData: (state, action) => {
//             state.clientData = action.payload
//         },
//         setauthLoad: (state, action) => {
//             state.authLoad = action.payload
//         },
//         setaccActivationErr: (state, action) => {
//             state.accActivationErr = action.payload
//         },
//         setInvalidCredentials: (state, action) => {
//             state.invalidCredentials = action.payload
//         },
//         setInvalidErrMsg: (state, action) => {
//             state.invalidErrMsg = action.payload
//         },
//         setUserFacilities: (state, action) => {
//             state.userFacilities = action.payload
//         },
//         setshowVerifyPwd: (state, action) => {
//             state.showVerifyPwd = action.payload
//         },
//         setPwdSession: (state, action) => {
//             state.pwdSession = action.payload
//         },
//         setUpdtMsg: (state, action) => {
//             state.updateMsg = action.payload
//         }



//     },
// });






// export const getConfiguration = () => async (dispatch) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const response = await urlSocket.post('incentive/get-config');
//             console.log('success :');
//             if (response.status === 200) {
//                 // console.log('configdata', response.data.data[0])
//                 dispatch(setConfigInfo(response.data.data[0]))
//                 sessionStorage.setItem("configData", JSON.stringify(response.data.data[0]))
//                 // resolve(response.data);
//             }
//         } catch (error) {
//             reject(error);
//         }
//     });
// }


// export const loginAuthentication = (value, history) => async (dispatch) => {
//     console.log("value", value);
//     const secretKey = process.env.REACT_APP_SECRETKEY;
//     // console.log('secretKey', secretKey)
//     const username = value.username.trim();
//     const password = CryptoJS.AES.encrypt(value.password.trim(), secretKey).toString();
//     const encryptedValue = { username, password };
//     console.log('encryptedValue', encryptedValue)
//     return new Promise(async (resolve, reject) => {
//         try {
//             const response = await urlSocket.post('incentive/login', encryptedValue);
//             console.log('response :', response);
//             if (response.status === 200) {
//                 resolve(response.data);
//             }
//         } catch (error) {
//             reject(error);
//         }
//     });
// };




// export const userAuthenticate = (values, history) => {
//     return async dispatch => {

//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("incentive/login-authenticate", values)
//             console.log(responseData, 'responseData');
//             dispatch(setAplnRequestLoading(false))
//             dispatch(setauthLoad(false))
//             if (responseData.status === 200 && (responseData.data.message === "new password required" || responseData.data.user_data !== undefined)) {
//                 if (responseData.data.message === "new password required") {
//                     dispatch(setshowVerifyPwd(true))
//                     dispatch(setPwdSession(responseData.data.data.Session))
//                 }else {
//                     dispatch(setshowVerifyPwd(false))
//                     return responseData.data;
//                 }
//             }else if (responseData.data.error === "404db") {
//                 dispatch(setaccActivationErr(true))
//                 dispatch(setInvalidCredentials(false))

//                 setTimeout(() => {
//                     dispatch(setaccActivationErr(false))
//                 }, 3000);

//                 return null
//             }else if (responseData.data.code === 204) {
//                 if (Object.keys(responseData.data.error).length === 0) {
//                     dispatch(setInvalidCredentials(true))
//                     dispatch(setaccActivationErr(false))
//                     setTimeout(() => {
//                         dispatch(setInvalidCredentials(false))
//                     }, 3000);
//                     return null
//                 }else {
//                     dispatch(setInvalidErrMsg(responseData.data.message))
//                     setTimeout(() => {
//                         dispatch(setInvalidErrMsg(""))
//                     }, 3000);
//                 }
//             }else {
//                 // history("/login")
//                 return responseData.data
//             }


//         } catch (error) {
//             console.log(error, 'error');
//             dispatch(setAplnRequestLoading(error))
//         }
//     }

// }


// export const userForgetPwd = (values) => {

//     return async dispatch => {

//         try {
//             console.log(values, 'values');
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("ir-auth/forget-password", values)
//             console.log(responseData, 'responseData');
//             dispatch(setAplnRequestLoading(false))
//             return responseData
//         } catch (error) {
//             console.log(error, 'error');
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// }


// export const setNewForgetPwd = (values) => {
//     return async dispatch => {
//         try {
//             console.log(values, 'values');
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("ir-auth/confirm-reset-password", values)
//             console.log(responseData, 'responseData');
//             dispatch(setAplnRequestLoading(false))
//             return responseData
//         } catch (error) {
//             console.log(error, 'error');
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// }


// export const confirmNewPwd = (values) => {
//     return async dispatch => {

//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("incentive/confrm-new-pwd", values)
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(setUpdtMsg(true))
//                 setTimeout(() => {
//                     dispatch(setUpdtMsg(false))
//                     dispatch(setshowVerifyPwd(false))
//                 }, 3000);
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// }






// export const { updateUserInfo, invalidAuth, setDbInfo,



//     setAplnRequestError,
//     setAplnRequestLoading,
//     setClientData,
//     setauthLoad,
//     setInvalidErrMsg,
//     setaccActivationErr,
//     setInvalidCredentials,
//     setUserFacilities,
//     setshowVerifyPwd,
//     setPwdSession,
//     setUpdtMsg

// } = authSlice.actions;
// export const authReducer = authSlice.reducer






