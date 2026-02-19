import { createSlice } from "@reduxjs/toolkit";
// import urlSocket from "../../helpers/urlSocket";
import urlSocket from "pages/AdminInspection/urlSocket";
import { debounce } from "lodash";




const initialState = {
    aplnRequestLoading: false,
    aplnRequestError: null,
    userList: [],
    roleList: [],
    userMailIdExist: false,
    userNumExist: false,
    branchData: [],
    deptData: [],
    incdType: [],
    editUserInfo: null,
    HData: [],
    desgnData: [],

}


const userSlice = createSlice({
    name: "userSlice",
    initialState: initialState,
    reducers: {
        setAplnRequestLoading: (state, action) => {
            state.aplnRequestLoading = action.payload
        },
        setAplnRequestError: (state, action) => {
            state.aplnRequestError = action.payload
        },
        setUserList: (state, action) => {
            state.userList = action.payload
        },
        setRoleList: (state, action) => {
            state.roleList = action.payload
        },
        setUserMailIdExist: (state, action) => {
            state.userMailIdExist = action.payload
        },
        setUserNumExist: (state, action) => {
            state.userNumExist = action.payload
        },
        setBranchData: (state, action) => {
            state.branchData = action.payload
        },
        setHData: (state, action) => {
            state.HData = action.payload
        },
        setDeptData: (state, action) => {
            state.deptData = action.payload
        },
        setDesgnData: (state, action) => {
            state.desgnData = action.payload
        },
        setIncdType: (state, action) => {
            state.incdType = action.payload
        },
        setEditUserInfo: (state, action) => {
            state.editUserInfo = action.payload
        }
    }
})



export const getSelectedloc = (h_id, user_id) => {
    return async dispatch => {
        try {
            var authUser = JSON.parse(sessionStorage.getItem("authUser"))
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("cog/retrive-user-loc-info", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                h_id: h_id,
                user_id: user_id
            })
            if (responseData.data.response_code === 500) {
                return responseData.data.data
            }


        } catch (error) {
            console.log(error, 'error')
        }
    }
}



const debouncedApiCall = debounce(async (data, dispatch, dynamicReducer) => {
    try {
        const responseData = await urlSocket.post("cog/dup-name-validation", data);

        dispatch(setAplnRequestLoading(false));

        if (responseData.status === 200) {
            dispatch(dynamicReducer(responseData.data.data.length > 0 ? true : false));
        }
    } catch (error) {
        dispatch(setAplnRequestLoading(false));
        console.error(error, "error");
    }
}, 500);


export const retriveUserList = () => {

    return async dispatch => {
        var authUser = JSON.parse(sessionStorage.getItem("authUser"))

        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("ir-user/retrive-user-list", {
                created_by: authUser.user_data._id,
                encrypted_db_url: authUser.db_info.encrypted_db_url,
            })
            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200) {
                dispatch(setUserList(responseData.data.data))
                dispatch(setRoleList(responseData.data.roles))
            }
            else {
                dispatch(setAplnRequestError(responseData.data.message))
            }

        } catch (error) {
            dispatch(setAplnRequestError(error))
        }


    }

}


export const crudUserInfo=(values)=>{
    console.log(values,'values');

    return async (dispatch)=>{
        try {
            const responseData = await urlSocket.post("")
            
        } catch (error) {
            
        }


    }


}





export const validateExistValue = (editInfo, dynamic_cln, dynamic_key, dynamic_value, dynamicReducer) => {
    return async (dispatch) => {
        try {
            dispatch(setAplnRequestLoading(true));
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const responseData = await urlSocket.post('cog/dup-name-validation',
                {
                    encrypted_db_url: authUser.db_info.encrypted_db_url,
                    db_name: authUser.db_info.db_name,
                    dynamic_cln: dynamic_cln,
                    dynamic_key: dynamic_key,
                    editInfo: editInfo,
                    dynamic_value: dynamic_value
                }
            )
            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200) {
                dispatch(dynamicReducer(responseData.data.data.length > 0 ? true : false))
            }
        } catch (error) {
            dispatch(setAplnRequestLoading(false));
            console.error(error, "error");
        }
    };
};


export const validateRequired = () => {

    return async dispatch => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"))

        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("ir-user/validate-required-user-creation", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
            })
            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200) {
                return responseData
            }
            dispatch(setAplnRequestLoading(false))

        } catch (error) {
            dispatch(setAplnRequestError(error))

        }


    }

}



export const retriveUserInfo = (user_id) => {

    return async dispatch => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"))


        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("cog/getUserInfo", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                _id: user_id
            })
            if (responseData.status === 200 && responseData.data.user_info.length > 0) {
                dispatch(setEditUserInfo(responseData.data.user_info[0]))
                return responseData.data.user_info[0]
            }
        } catch (error) {
            console.log(error, 'error');
            dispatch(setAplnRequestError(error))

        }

    }
}

export const getLocInfo = (h_id) => {

    return async dispatch => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"))
        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("incident-report/get-flat-hstructure", {
                h_id: h_id,
                company_id: authUser.client_info[0].company_id,
                encrypted_db_url: authUser.db_info.encrypted_db_url,
            })
            if (responseData.status === 200) {
                return responseData.data.data
            }
            dispatch(setAplnRequestLoading(false))


        } catch (error) {

        }

    }

}


// export const retriveRoleData = () => {

//     return async dispatch => {
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"))


//         try {
//             dispatch(setAplnRequestLoading(true))

//             const responseData = await urlSocket.post("cog/retrive-roles", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//             })
//             if (responseData.status === 200) {
//                 dispatch(setRoleList(responseData.data.data))
//                 dispatch(setDeptData(responseData.data.deptInfo))
//                 dispatch(setHData(responseData.data.hInfo))
//             }
//             else {
//                 dispatch(setAplnRequestError(responseData.data.message))
//             }


//         } catch (error) {
//             dispatch(setAplnRequestError(error))

//         }
//     }

// }



export const retriveRoleData = () => {

    return async dispatch => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"))


        try {
            dispatch(setAplnRequestLoading(true))

            const responseData = await urlSocket.post("cog/retrive-roles", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                user_id: authUser.user_data._id,
                dept_id: authUser.user_data.dept_id
            })
            if (responseData.status === 200) {
                dispatch(setRoleList(responseData.data.data))
                dispatch(setDeptData(responseData.data.deptInfo))
                dispatch(setHData(responseData.data.hInfo))
            }
            else {
                dispatch(setAplnRequestError(responseData.data.message))
            }


        } catch (error) {
            console.log('error :>> ', error);
            dispatch(setAplnRequestError(error))

        }
    }

}


export const createUserInfo = (values, history) => {
    return async dispatch => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"))


        try {
            dispatch(setAplnRequestLoading(true))

            const responseData = await urlSocket.post("cog/cruduser", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                user_info: values
            })
            await dispatch(setEditUserInfo(null))
            sessionStorage.removeItem("userId");
            if (responseData.status === 200) {
                if (history !== undefined) {
                    // history.go(-1)
                    history("/murs")
                }
            }
            else {
                dispatch(setAplnRequestError(responseData.data.message))
            }


        } catch (error) {
            console.log(error, 'error');
            dispatch(setAplnRequestError(error))

        }
    }

}


export const {
    setAplnRequestError,
    setAplnRequestLoading,
    setUserList,
    setRoleList,
    setDesgnData,
    setUserMailIdExist,
    setBranchData,
    setDeptData,
    setIncdType,
    setHData,
    setEditUserInfo,
    setUserNumExist
} = userSlice.actions

export default userSlice.reducer;













// import { createSlice } from "@reduxjs/toolkit";
// // import { put, post, get, del } from "helpers/api_helper";
// import urlSocket from "../../helpers/urlSocket";
// import { debounce } from "lodash";




// const initialState={
//     aplnRequestLoading: false,
//     aplnRequestError: null,
//     userList:[],
//     roleList:[],
//     // userMailIdExist : false,
//     userMailIdExist : false,
//     userNumExist : false,

//     branchData: [],
//     deptData: [],
//     incdType:[],
//     editUserInfo : null,
//     HData :[]

// }

// // const authUser = JSON.parse(sessionStorage.getItem("authUser"))


// const userSlice= createSlice({
//     name: "userSlice",
//     initialState: initialState,
//     reducers: {
//         setAplnRequestLoading: (state, action) => {
//             state.aplnRequestLoading = action.payload
//         },
//         setAplnRequestError: (state, action) => {
//             state.aplnRequestError = action.payload
//         },
//         setUserList: (state, action) => {
//             state.userList = action.payload
//         },
//         setRoleList: (state, action) => {
//             state.roleList = action.payload
//         },
//         setUserMailIdExist: (state, action) => {
//             state.userMailIdExist = action.payload
//         },
//         setUserNumExist: (state, action) => {
//             state.userNumExist = action.payload
//         },
//         setBranchData: (state, action) => {
//             state.branchData = action.payload
//         },
//         setHData: (state, action) => {
//             state.HData = action.payload
//         },
//         setDeptData: (state, action) => {
//             state.deptData = action.payload
//         },
//         setIncdType: (state, action) => {
//             state.incdType = action.payload
//         },
//         setEditUserInfo:(state,action)=>{
//             console.log(action.payload,'action')
//             state.editUserInfo = action.payload
//         }
//     }
// })



// export const getSelectedloc = (h_id, user_id) => {
//     return async dispatch => {
//         try {
//             var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("cog/retrive-user-loc-info", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 h_id : h_id,
//                 user_id : user_id
//             })
//             console.log(responseData,'responseData')
//             if(responseData.data.response_code === 500){
//                 return responseData.data.data
//             }


//         } catch (error) {
//             console.log(error,'error')
//         }
//     }
// }



// const debouncedApiCall = debounce(async (data, dispatch, dynamicReducer) => {
//     try {
//       const responseData = await urlSocket.post("cog/dup-name-validation", data);
 
//       dispatch(setAplnRequestLoading(false));
//       console.log(responseData, "responseData11");
 
//       if (responseData.status === 200) {
//         dispatch(dynamicReducer(responseData.data.data.length > 0 ? true : false));
//       }
//     } catch (error) {
//       dispatch(setAplnRequestLoading(false));
//       console.error(error, "error");
//     }
//   }, 500);


// export const retriveUserList=()=>{

//     return async dispatch =>{
//     var authUser = JSON.parse(sessionStorage.getItem("authUser"))
  
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("ir-user/retrive-user-list",{
//                 created_by : authUser.user_data._id,
//                 encrypted_db_url : authUser.db_info.encrypted_db_url,
//             })
//             dispatch(setAplnRequestLoading(false))
//             console.log(responseData,'responseData');
//             if(responseData.status === 200){
//                 dispatch(setUserList(responseData.data.data))
//                 dispatch(setRoleList(responseData.data.roles))
//             }
//             else{
//                 dispatch(setAplnRequestError(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestError(error))
//         }


//     }

// }

// export const validateExistValue = (editInfo, dynamic_cln, dynamic_key, dynamic_value, dynamicReducer) => {
//     return async (dispatch) => {
//       try {
//         dispatch(setAplnRequestLoading(true));
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"));
  
//         // const requestData = {
//         //   encrypted_db_url: authUser.db_info.encrypted_db_url,
//         //   db_name: authUser.db_info.db_name,
//         //   dynamic_cln: dynamic_cln,
//         //   dynamic_key: dynamic_key,
//         //   editInfo: editInfo,
//         //   dynamic_value: dynamic_value,
//         // };
//         // console.log(requestData,'requestData')

//                     const responseData = await urlSocket.post('cog/dup-name-validation',
//                 {
//                     encrypted_db_url : authUser.db_info.encrypted_db_url,
//                     db_name : authUser.db_info.db_name,
//                     dynamic_cln : dynamic_cln,
//                     dynamic_key : dynamic_key,
//                     editInfo : editInfo,
//                     dynamic_value : dynamic_value
//                 }
//             )
//             dispatch(setAplnRequestLoading(false))
//             console.log(responseData,'responseData')
//             if(responseData.status === 200){
//                 dispatch(dynamicReducer(responseData.data.data.length >0 ? true : false))
//                 // return responseData.data.data
//             }


//         // Debounced API call
//         // debouncedApiCall(requestData, dispatch, dynamicReducer);
//       } catch (error) {
//         dispatch(setAplnRequestLoading(false));
//         console.error(error, "error");
//       }
//     };
//   };


// // export const validateExistValue=(editInfo,dynamic_cln,dynamic_key,dynamic_value,dynamicReducer)=>{

// //     return async dispatch =>{

// //         try {
// //             dispatch(setAplnRequestLoading(true))
// //             const authUser = JSON.parse(sessionStorage.getItem("authUser"))
            
// //             const responseData = await urlSocket.post('cog/dup-name-validation',
// //                 {
// //                     encrypted_db_url : authUser.db_info.encrypted_db_url,
// //                     db_name : authUser.db_info.db_name,
// //                     dynamic_cln : dynamic_cln,
// //                     dynamic_key : dynamic_key,
// //                     editInfo : editInfo,
// //                     dynamic_value : dynamic_value
// //                 }
// //             )
// //             dispatch(setAplnRequestLoading(false))
// //             console.log(responseData,'responseData')
// //             if(responseData.status === 200){
// //                 dispatch(dynamicReducer(responseData.data.data.length >0 ? true : false))
// //                 // return responseData.data.data
// //             }


// //         } catch (error) {
// //                 console.log(error,'error')
// //         }


// //     }


// // }


// export const validateRequired=()=>{

//     return async dispatch =>{
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"))

//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("ir-user/validate-required-user-creation", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//             })
//             console.log(responseData,'responseData')
//             dispatch(setAplnRequestLoading(false))
//             if(responseData.status === 200){
//                 return responseData
//             }
//             dispatch(setAplnRequestLoading(false))
            
//         } catch (error) {
//             dispatch(setAplnRequestError(error))
            
//         }


//     }

// }



// export const retriveUserInfo =(user_id)=>{

//     return async dispatch =>{
//     const authUser = JSON.parse(sessionStorage.getItem("authUser"))


//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("cog/getUserInfo", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                _id: user_id
//             })
//             console.log(responseData,'encrypted_db_url')
//             if(responseData.status === 200 && responseData.data.user_info.length >0){
//                 dispatch(setEditUserInfo(responseData.data.user_info[0]))
//                 return responseData.data.user_info[0]
//                 // dispatch(setRoleList(responseData.data.data))
//             }
//             else{
//                 // dispatch(setAplnRequestError(responseData.data.message))
//             }

            
//         } catch (error) {
//             console.log(error,'error');
//             dispatch(setAplnRequestError(error))

//         }

//     }
// }

// export const getLocInfo = (h_id) => {

//     return async dispatch => {
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("incident-report/get-flat-hstructure",{
//                 h_id : h_id,
//                 company_id : authUser.client_info[0].company_id,
//                 encrypted_db_url : authUser.db_info.encrypted_db_url,
//             })
//             console.log(responseData,'responseData')
//             if(responseData.status === 200){
//                 return responseData.data.data
//                 // convertFlatDataToTreeData(responseData.data.data)
//             }
//             dispatch(setAplnRequestLoading(false))
            

//         } catch (error) {
            
//         }

//     }

// }


// export const retriveRoleData =()=>{

//     return async dispatch =>{
//     const authUser = JSON.parse(sessionStorage.getItem("authUser"))


//         try {
//             dispatch(setAplnRequestLoading(true))

//             const responseData = await urlSocket.post("cog/retrive-roles", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//             })
//             console.log(responseData,'encrypted_db_url')
//             if(responseData.status === 200){
//                 dispatch(setRoleList(responseData.data.data))
//                 dispatch(setDeptData(responseData.data.deptInfo))
//                 dispatch(setHData(responseData.data.hInfo))
//             }
//             else{
//                 dispatch(setAplnRequestError(responseData.data.message))
//             }

            
//         } catch (error) {
//             dispatch(setAplnRequestError(error))
            
//         }
//     }

// }


// export const createUserInfo =(values,history)=>{
//     console.log(values,'values');
//     return async dispatch =>{
//     const authUser = JSON.parse(sessionStorage.getItem("authUser"))


//         try {
//             dispatch(setAplnRequestLoading(true))

//             const responseData = await urlSocket.post("cog/cruduser", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 user_info : values
//             })
//             console.log(responseData,'encrypted_db_url')
//             await dispatch(setEditUserInfo(null))
//             sessionStorage.removeItem("userId");
//             if(responseData.status === 200){
//                 if(history !== undefined){
//                     var navigate = sessionStorage.getItem("navigate")
//                     console.log('navigate ', navigate);
//                     history.go(-1)
//                     // history.push('/murs')

//                     // if(navigate === null){
//                     //     sessionStorage.removeItem("navigate")
//                     //     history.push('/mpusr')
//                     //   }


//                     // navigate ? history.push("/pblhcfg") : history.push("/map-user")
//                     // navigate ? history.push("/map-user") : history.push("/map-user")
//                     // sessionStorage.removeItem("navigate")



//                 }
//             }
//             else{
//                 dispatch(setAplnRequestError(responseData.data.message))
//             }

            
//         } catch (error) {
//             console.log(error,'error');
//             dispatch(setAplnRequestError(error))
            
//         }
//     }

// }









// export const {
//     setAplnRequestError,
//     setAplnRequestLoading,
//     setUserList,
//     setRoleList,
//     setUserMailIdExist,
//     setBranchData,
//     setDeptData,
//     setIncdType,
//     setHData,
//     setEditUserInfo,
//     setUserNumExist
// } = userSlice.actions

// export default userSlice.reducer
