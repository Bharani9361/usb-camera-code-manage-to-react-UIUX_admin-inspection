import { createSlice } from "@reduxjs/toolkit";
// import urlSocket from "../../helpers/urlSocket";
import urlSocket from "pages/AdminInspection/urlSocket";
import validateSession from "routes/validateSession";

const initialState = {
    aplnRequestLoading: false,
    aplnRequestError: null,
    clientData: null,
    authLoad: false,
    accActivationErr: false,
    invalidCredentials: false,
    invalidErrMsg: "",
    userFacilities: [],
    showVerifyPwd: false,
    pwdSession : null,
    updateMsg : false,
    dbUrl : null,
    dashboardInfo: null,
    showBranch : false,
    authInfo:{},
    userPoolInfo:{},
    encrypted_db_url:""

}

const IrSlice = createSlice({
    name: "IncdReportSlice",
    initialState: initialState,
    reducers: {
        setAplnRequestLoading: (state, action) => {
            state.aplnRequestLoading = action.payload
        },
        setAplnRequestError: (state, action) => {
            state.aplnRequestError = action.payload
        },
        setDashboardInfo:(state,action)=>{
            state.dashboardInfo = action.payload
        },
        setClientData: (state, action) => {
            state.clientData = action.payload
        },
        setDbUrl: (state, action) => {
            state.dbUrl = action.payload
        },
        setauthLoad: (state, action) => {
            state.authLoad = action.payload
        },
        setShowBranch: (state, action) => {
            state.showBranch = action.payload
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
        setshowVerifyPwd:(state,action)=>{
            state.showVerifyPwd = action.payload
        },
        setPwdSession:(state,action)=>{
            state.pwdSession = action.payload
        },
        setUpdtMsg:(state,action)=>{
            state.updateMsg = action.payload
        },
        setAuthInfo:(state,action)=>{
            state.authInfo = action.payload
        },
        setUserpoolInfo:(state,action)=>{
            state.userPoolInfo = action.payload
        },
        setDbUrl:(state,action)=>{
            state.encrypted_db_url = action.payload
        }

    }
})


export const getDashBoardInfo=()=>{
    return async dispatch =>{       
        try {
            // const responseData = await urlSocket.post("cog/dashboard-details")
            const authUser = JSON.parse(sessionStorage.getItem("authUser"))
            const responseData = await urlSocket.post("cog/dashboard-details", {
                // user_id: authUser.user_data._id,
                // encrypted_db_url: dbInfo.encrypted_db_url,
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                user_id: authUser.user_data._id
              } )
            if(responseData.status === 200){
               let data = responseData.data
               dispatch(setDashboardInfo(data))
            }
            
        } catch (error) {
            dispatch(setAplnRequestLoading(error))            
        }
    }
}

export const SaveNotifyToken = (token) => {
    return async (dispatch) => {
      try {
        const authUserRaw = await sessionStorage.getItem('authUser');
        const dbInfoRaw = await sessionStorage.getItem('db_info');
        if(authUserRaw){
        const authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
        const dbInfo = dbInfoRaw ? JSON.parse(dbInfoRaw) : null;
        const payload = {
            token: token,
            user_id: authUser.user_data._id,
            encrypted_db_url: dbInfo.encrypted_db_url,
            source: "2" // 1 for mobile  // 2 for web
          };
          
  
        const response = await urlSocket.post('cog/savetoken', payload);
  
        }
      } catch (error) {
        console.error("Error saving token:", error.message || error);
      }
    };
  };


export const saveBranch =  (values) => {

    return new Promise(async(resolve, reject) => {
        try {
            const responseData = await urlSocket.post("branch/crud-branches", { branch_info: values })
            console.log(responseData, 'responseData');
            resolve(responseData)

        } catch (error) {
            reject(error)
        }
    })

}






export const retriveUserFacilities = () => {

    return async dispatch => {

        try {
            dispatch(setAplnRequestLoading(true))
            const authUser = JSON.parse(sessionStorage.getItem("authUser"))
            const responseData = await urlSocket.post("ir-auth/get-role-facilities", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                user_data: authUser.user_data
            })
            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200 && responseData.data.data.length > 0) {
                dispatch(setUserFacilities(responseData.data.data[0].facilities))
            }

        } catch (error) {
            dispatch(setAplnRequestLoading(error))
        }


    }
}




export const verifyShortName = (history) => {

    return async dispatch => {

        try {
            dispatch(setAplnRequestLoading(true))
            // const reponseData1 = await urlSocket.post("ir-auth/fetch-client-info",{short_name:"novac"})

            const reponseData = await urlSocket.post("cog/find-short-name")
            console.log(reponseData,'reponseData191');
            dispatch(setAplnRequestLoading(false))
            if (reponseData.data.response_code === 500) {
                if(reponseData.data.code ===201){
                    history("/pages-403")
                }
                else {
                    dispatch(setClientData(reponseData.data.data))
                    dispatch(setUserpoolInfo(reponseData.data.userpoolinfo))
                    dispatch(setDbUrl(reponseData.data.encrypted_db_url))
                    var express_session = JSON.parse(localStorage.getItem("express-session"))
                    var returnInfo =null
                    if(express_session){
                      returnInfo = await validateSession(express_session,reponseData.data.encrypted_db_url)
                    }

                    sessionStorage.setItem('short_name', reponseData.data.data.short_name)
                    returnInfo ?  history("/dashboard") : history("/login")
                }
            }

            else {
                sessionStorage.clear()
                history("/url-not-found")
            }

        } catch (error) {
            dispatch(setAplnRequestLoading(error))

        }
    }

}


export const userAuthenticate = (values, history) => {

    return async dispatch => {

        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("cog/login-authenticate", values)
            console.log(responseData,'responseData');
            dispatch(setAplnRequestLoading(false))
            dispatch(setauthLoad(false))
            if (responseData.status === 200 && (responseData.data.message === "new password required" || responseData.data.user_data !== undefined)) {
                if(responseData.data.message === "new password required"){
                    dispatch(setshowVerifyPwd(true))
                    dispatch(setPwdSession(responseData.data.data.Session))
                }
                else{
                    dispatch(setshowVerifyPwd(false))
                    if(responseData.data.branch_data.length === 0){
                        dispatch(setShowBranch(true))
                        dispatch(setAuthInfo(responseData.data))
                        return false
                    }
                    else {
                        dispatch(setShowBranch(false))
                        return responseData.data;
                    }
                }
            }
            else if (responseData.data.error === "404db") {
                dispatch(setaccActivationErr(true))
                dispatch(setInvalidCredentials(false))

                setTimeout(() => {
                    dispatch(setaccActivationErr(false))
                }, 3000);

                return null
            }
            else if (responseData.data.code=== 204) {
                if (Object.keys(responseData.data.error).length === 0) {
                    dispatch(setInvalidCredentials(true))
                    dispatch(setaccActivationErr(false))
                    setTimeout(() => {
                        dispatch(setInvalidCredentials(false))
                    }, 3000);
                    return null
                }
                else {
                    dispatch(setInvalidErrMsg(responseData.data.message))
                    setTimeout(() => {
                        dispatch(setInvalidErrMsg(""))
                    }, 3000);
                }
            }
            else {
                history("/login")
                return null
            }


        } catch (error) {
            console.log(error,'error');
            dispatch(setAplnRequestLoading(error))
        }
    }

}


export const userForgetPwd=(values)=>{

    return async dispatch =>{
 
        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("ir-auth/forget-password", values)
            dispatch(setAplnRequestLoading(false))
            return responseData
        } catch (error) {
            console.log(error,'error');
            dispatch(setAplnRequestLoading(error))
        }
    }
}



export const setNewForgetPwd=(values)=>{

    return async dispatch =>{
 
        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("ir-auth/confirm-reset-password", values)
            dispatch(setAplnRequestLoading(false))
            return responseData
        } catch (error) {
            console.log(error,'error');
            dispatch(setAplnRequestLoading(error))
        }
    }
}


export const confirmNewPwd=(values)=>{

    return async dispatch =>{
       
        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("cog/confrm-new-pwd", values)
            dispatch(setAplnRequestLoading(false))
            if(responseData.status === 200){
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








export const {
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
    setUpdtMsg,
    setDbUrl,
    setDashboardInfo,
    setShowBranch,
    setAuthInfo,
    setUserpoolInfo,
} = IrSlice.actions
export default IrSlice.reducer