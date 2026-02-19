import { createSlice } from "@reduxjs/toolkit";
// import urlSocket from "../../helpers/urlSocket";
import urlSocket from "pages/AdminInspection/urlSocket";


const initialState = {
    aplnRequestLoading: false,
    aplnRequestError: null,
    branchData: [],
    departMentData: [],
    designationData: [],
    editBranchInfo: null,
    editDeptInfo: null,
    editDesignationInfo: null,
    branchNameExist: false,
    deptNameExist: false,
    roleNameExist: false,
    incdTypeNameExist: false,
    sevrtTypeNameExist: false,
    locationNameExist: false,
    branchCodeExist: false,
    degnNameExist: false,
    deptStatus: null,
    flatDeptData: [],
    isDepartmentLoading: false,
    designationLoading: false,
}


const orgSlice = createSlice({
    name: "orgSlice",
    initialState: initialState,
    reducers: {
        setAplnRequestLoading: (state, action) => {
            state.aplnRequestLoading = action.payload
        },
        setAplnRequestError: (state, action) => {
            state.aplnRequestError = action.payload
        },
        setBranchData: (state, action) => {
            state.branchData = action.payload
        },
        setDepartmentData: (state, action) => {
            state.departMentData = action.payload
        },
        setDesignationData: (state, action) => {
            state.designationData = action.payload
        },
        seteditBranchInfo: (state, action) => {
            state.editBranchInfo = action.payload
        },
        seteditDeptInfo: (state, action) => {
            state.editDeptInfo = action.payload
        },
        setEditDesignationInfo: (state, action) => {
            state.editDesignationInfo = action.payload
        },
        setBranchNameExist: (state, action) => {
            state.branchNameExist = action.payload
        },
        setDepartmentExist: (state, action) => {
            state.deptNameExist = action.payload
        },
        setDesignationExist: (state, action) => {
            state.degnNameExist = action.payload
        },
        setRoleNameExist: (state, action) => {
            state.roleNameExist = action.payload
        },
        setIncdTypNameExist: (state, action) => {
            state.incdTypeNameExist = action.payload
        },
        setSevrtTypNameExist: (state, action) => {
            state.sevrtTypeNameExist = action.payload
        },
        setLocNameExist: (state, action) => {
            state.locationNameExist = action.payload
        },
        setBranchCodeExist: (state, action) => {
            state.branchCodeExist = action.payload
        },
        setDepartmentInfo: (state, action) => {
            state.departmentInfo = action.payload
        },
        setBranchInfo: (state, action) => {
            state.branchInfo = action.payload
        },
        setDeptStatus: (state, action) => {
            state.deptStatus = action.payload
        },
        setFlatDeptData: (state, action) => {
            state.flatDeptData = action.payload
        },
        setDepartmentLoading: (state, action) => {
            state.isDepartmentLoading = action.payload;
        },
        setDesignationLoading: (state, action) => {
            state.designationLoading = action.payload;
        },



    }
})


export const retriveBranchInfo = () => {

    return async dispatch => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"))

        try {
            dispatch(setAplnRequestLoading(true))
            // const responseData = await urlSocket.post("ir-org/retrive-branch", {
            //     encrypted_db_url: authUser.db_info.encrypted_db_url,
            // })
            dispatch(setAplnRequestLoading(false))
            // if (responseData.status === 200) {
            //     dispatch(setBranchData(responseData.data.data))
            // }
            // else {
            //     dispatch(setAplnRequestLoading(responseData.data.message))
            // }

        } catch (error) {
            dispatch(setAplnRequestLoading(error))

        }

    }

}

export const retriveDeptInfo = () => {
    return async dispatch => {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      try {
        dispatch(setDepartmentLoading(true));
  
        const responseData = await urlSocket.post("dept/retrive-dept", {
          encrypted_db_url: authUser.db_info.encrypted_db_url,
          dept_id: authUser.user_data.dept_id,
          branch_id: authUser.user_data.branch_id,
          user_id: authUser.user_data._id
        });
  
        if (responseData.status === 200) {
          dispatch(setDepartmentData(responseData.data.data));
          dispatch(setDepartmentInfo(responseData.data.deptInfo));
          dispatch(setBranchInfo(responseData.data.branchInfo));
        }
  
        dispatch(setDepartmentLoading(false));
      } catch (error) {
        dispatch(setDepartmentLoading(false));
      }
    };
  };


// export const retriveDeptInfo = () => {
//     return async dispatch => {
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//         try {
//             dispatch(setDepartmentLoading(true));

//             const responseData = await urlSocket.post("dept/retrive-dept", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 dept_id: authUser.user_data.dept_id,
//                 branch_id: authUser.user_data.branch_id,
//                 user_id: authUser.user_data._id
//             });

//             if (responseData.status === 200) {
//                 dispatch(setDepartmentData(responseData.data.data));
//                 dispatch(setDepartmentInfo(responseData.data.deptInfo));
//                 dispatch(setBranchInfo(responseData.data.branchInfo));
//             }

//             dispatch(setDepartmentLoading(false));
//         } catch (error) {
//             dispatch(setDepartmentLoading(false));
//         }
//     };
// };

export const retriveDesignationInfo = () => {
    return async dispatch => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        try {
            dispatch(setDesignationLoading(true));
            const responseData = await urlSocket.post("desgn/retrive-designation", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
            });
            dispatch(setDesignationLoading(false)); 
            if (responseData.status === 200) {
                dispatch(setDesignationData(responseData.data.data));
            } else {
                dispatch(setDesignationLoading(false));
            }
        } catch (error) {
            dispatch(setDesignationLoading(false));
        }
    };
};



export const createBranchInfo = (values) => {

    return async dispatch => {
        var authUser = JSON.parse(sessionStorage.getItem("authUser"))


        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("ir-org/create-branch", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                branch_info: values
            })
            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200) {
                dispatch(retriveBranchInfo())
            }
            else {
                dispatch(setAplnRequestLoading(responseData.data.message))
            }

        } catch (error) {
            dispatch(setAplnRequestLoading(error))

        }

    }

}


export const createDeptInfo = (values) => {
    return async dispatch => {
        var authUser = JSON.parse(sessionStorage.getItem("authUser"))
        try {
            dispatch(setAplnRequestLoading(true))
            console.log('values :>> ', values);
            const responseData = await urlSocket.post("dept/create-dept", { encrypted_db_url: authUser.db_info.encrypted_db_url, dept_info: values})
            console.log('responseData :>> ', responseData);
            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200) {
                dispatch(retriveDeptInfo())
            }
            else {
                dispatch(setAplnRequestLoading(responseData.data.message))
            }
        } catch (error) {
            dispatch(setAplnRequestLoading(error))

        }
    }
};



export const createDesignation = (values) => {
    return async dispatch => {
        var authUser = JSON.parse(sessionStorage.getItem("authUser"))
        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("desgn/create-designation", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                desgn_info: values
            })

            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200) {
                dispatch(retriveDesignationInfo())
            }
            else {
                dispatch(setAplnRequestLoading(responseData.data.message))
            }
        } catch (error) {
            dispatch(setAplnRequestLoading(error))

        }
    }
}


export const deleteBranchInfo = (values) => {
    return async dispatch => {
        var authUser = JSON.parse(sessionStorage.getItem("authUser"))
        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("dept/delete-branch", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                branch_id: values._id
            })
            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200) {
                dispatch(retriveBranchInfo())
            }
            else {
                dispatch(setAplnRequestLoading(responseData.data.message))
            }

        } catch (error) {
            dispatch(setAplnRequestLoading(error))
        }
    }
}


export const deleteDegnInfo = (values) => {
    return async dispatch => {
        var authUser = JSON.parse(sessionStorage.getItem("authUser"))
        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("desgn/delete-designation", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                desgn_id: values._id
            })
            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200) {
                dispatch(retriveDesignationInfo())
            }
            else {
                dispatch(setAplnRequestLoading(responseData.data.message))
            }

        } catch (error) {
            dispatch(setAplnRequestLoading(error))
        }
    }
}


export const deleteDeptInfo = (values) => {

    return async dispatch => {
        var authUser = JSON.parse(sessionStorage.getItem("authUser"))

        try {
            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("dept/delete-dept", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                dept_id: values._id
            })
            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200) {
                dispatch(retriveDeptInfo())
            }
            else {
                dispatch(setAplnRequestLoading(responseData.data.message))
            }

        } catch (error) {
            dispatch(setAplnRequestLoading(error))

        }

    }

}


export const IRTvalidateDupName = (editInfo, dynamic_cln, dynamic_key, dynamic_value, dynamicReducer) => {

    return async dispatch => {

        try {
            var authUser = JSON.parse(sessionStorage.getItem("authUser"))

            dispatch(setAplnRequestLoading(true))
            const responseData = await urlSocket.post("cog/dup-name-validation", {
                encrypted_db_url: authUser.db_info.encrypted_db_url,
                db_name: authUser.db_info.db_name,
                dynamic_cln: dynamic_cln,
                dynamic_key: dynamic_key,
                editInfo: editInfo,
                dynamic_value: dynamic_value
            })
            dispatch(setAplnRequestLoading(false))
            if (responseData.status === 200) {
                dispatch(dynamicReducer(responseData.data.data.length > 0 ? true : false))
            }
        } catch (error) {
            console.log(error, 'error')
            dispatch(setAplnRequestLoading(error))
        }
    }
}






export const {
    setAplnRequestError,
    setAplnRequestLoading,
    seteditBranchInfo,
    setBranchNameExist,
    setBranchData,
    setDepartmentData,
    setDesignationData,
    seteditDeptInfo,
    setEditDesignationInfo,
    setDepartmentExist,
    setDesignationExist,
    setRoleNameExist,
    setIncdTypNameExist,
    setSevrtTypNameExist,
    setLocNameExist,
    setBranchCodeExist,
    setDepartmentInfo,
    setBranchInfo,
    setDeptStatus,
    setFlatDeptData,
    setDepartmentLoading,
    setDesignationLoading
} = orgSlice.actions

export default orgSlice.reducer;














// import { createSlice } from "@reduxjs/toolkit";
// import urlSocket from "../../helpers/urlSocket";


// const initialState = {
//     aplnRequestLoading: false,
//     aplnRequestError: null,
//     branchData: [],
//     departMentData: [],
//     designationData: [],
//     editBranchInfo: null,
//     editDeptInfo: null,
//     editDesignationInfo: null,
//     branchNameExist: false,
//     deptNameExist: false,
//     roleNameExist: false,
//     incdTypeNameExist: false,
//     sevrtTypeNameExist: false,
//     locationNameExist: false,
//     branchCodeExist: false,
//     degnNameExist: false,
// }


// const orgSlice = createSlice({
//     name: "orgSlice",
//     initialState: initialState,
//     reducers: {
//         setAplnRequestLoading: (state, action) => {
//             state.aplnRequestLoading = action.payload
//         },
//         setAplnRequestError: (state, action) => {
//             state.aplnRequestError = action.payload
//         },
//         setBranchData: (state, action) => {
//             state.branchData = action.payload
//         },
//         setDepartmentData: (state, action) => {
//             state.departMentData = action.payload
//         },
//         setDesignationData: (state, action) => {
//             state.designationData = action.payload
//         },
//         seteditBranchInfo: (state, action) => {
//             state.editBranchInfo = action.payload
//         },
//         seteditDeptInfo: (state, action) => {
//             state.editDeptInfo = action.payload
//         },
//         setEditDesignationInfo: (state, action) => {
//             state.editDesignationInfo = action.payload
//         },
//         setBranchNameExist: (state, action) => {
//             state.branchNameExist = action.payload
//         },
//         setDepartmentExist: (state, action) => {
//             state.deptNameExist = action.payload
//         },
//         setDesignationExist: (state, action) => {
//             state.degnNameExist = action.payload
//         },
//         setRoleNameExist: (state, action) => {
//             state.roleNameExist = action.payload
//         },
//         setIncdTypNameExist: (state, action) => {
//             state.incdTypeNameExist = action.payload
//         },
//         setSevrtTypNameExist: (state, action) => {
//             state.sevrtTypeNameExist = action.payload
//         },
//         setLocNameExist: (state, action) => {
//             state.locationNameExist = action.payload
//         },
//         setBranchCodeExist: (state, action) => {
//             state.branchCodeExist = action.payload
//         },
//         setDepartmentInfo: (state, action) => {
//             state.departmentInfo = action.payload
//         },
//         setBranchInfo: (state, action) => {
//             state.branchInfo = action.payload
//         },

//     }
// })


// export const retriveBranchInfo = () => {

//     return async dispatch => {
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"))

//         try {
//             dispatch(setAplnRequestLoading(true))
//             // const responseData = await urlSocket.post("ir-org/retrive-branch", {
//             //     encrypted_db_url: authUser.db_info.encrypted_db_url,
//             // })
//             dispatch(setAplnRequestLoading(false))
//             // if (responseData.status === 200) {
//             //     dispatch(setBranchData(responseData.data.data))
//             // }
//             // else {
//             //     dispatch(setAplnRequestLoading(responseData.data.message))
//             // }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }


// export const retriveDeptInfo = () => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/retrive-dept", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 dept_id: authUser.user_data.dept_id,
//                 branch_id: authUser.user_data.branch_id,
//                 user_id : authUser.user_data._id

//             })
//             console.log('responseData', responseData)
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(setDepartmentData(responseData.data.data))
//                 dispatch(setDepartmentInfo(responseData.data.deptInfo))
//                 dispatch(setBranchInfo(responseData.data.branchInfo))
                
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }
//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// };


// export const retriveDesignationInfo = () => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("desgn/retrive-designation", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(setDesignationData(responseData.data.data))
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }
//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// };


// export const createBranchInfo = (values) => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))


//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("ir-org/create-branch", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 branch_info: values
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveBranchInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }


// export const createDeptInfo = (values) => {
//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/create-dept", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 dept_info: values
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveDeptInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }
//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }
//     }
// };



// export const createDesignation = (values) => {
//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("desgn/create-designation", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 desgn_info: values
//             })

//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveDesignationInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }
//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }
//     }
// }


// export const deleteBranchInfo = (values) => {
//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/delete-branch", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 branch_id: values._id
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveBranchInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// }


// export const deleteDegnInfo = (values) => {
//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("desgn/delete-designation", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 desgn_id: values._id
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveDesignationInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// }


// export const deleteDeptInfo = (values) => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))

//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/delete-dept", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 dept_id: values._id
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveDeptInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }


// export const IRTvalidateDupName = (editInfo, dynamic_cln, dynamic_key, dynamic_value, dynamicReducer) => {

//     return async dispatch => {

//         try {
//             var authUser = JSON.parse(sessionStorage.getItem("authUser"))

//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("cog/dup-name-validation", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 db_name: authUser.db_info.db_name,
//                 dynamic_cln: dynamic_cln,
//                 dynamic_key: dynamic_key,
//                 editInfo: editInfo,
//                 dynamic_value: dynamic_value
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(dynamicReducer(responseData.data.data.length > 0 ? true : false))
//             }
//         } catch (error) {
//             console.log(error, 'error')
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// }






// export const {
//     setAplnRequestError,
//     setAplnRequestLoading,
//     seteditBranchInfo,
//     setBranchNameExist,
//     setBranchData,
//     setDepartmentData,
//     setDesignationData,
//     seteditDeptInfo,
//     setEditDesignationInfo,
//     setDepartmentExist,
//     setDesignationExist,
//     setRoleNameExist,
//     setIncdTypNameExist,
//     setSevrtTypNameExist,
//     setLocNameExist,
//     setBranchCodeExist,
//     setDepartmentInfo,
//     setBranchInfo
// } = orgSlice.actions

// export default orgSlice.reducer;














// import { createSlice } from "@reduxjs/toolkit";
// import urlSocket from "../../helpers/urlSocket";


// const initialState = {
//     aplnRequestLoading: false,
//     aplnRequestError: null,
//     branchData: [],
//     departMentData: [],
//     designationData: [],
//     editBranchInfo: null,
//     editDeptInfo: null,
//     editDesignationInfo: null,
//     branchNameExist: false,
//     deptNameExist: false,
//     roleNameExist: false,
//     incdTypeNameExist: false,
//     sevrtTypeNameExist: false,
//     locationNameExist: false,
//     branchCodeExist: false,
//     degnNameExist: false,
// }


// const orgSlice = createSlice({
//     name: "orgSlice",
//     initialState: initialState,
//     reducers: {
//         setAplnRequestLoading: (state, action) => {
//             state.aplnRequestLoading = action.payload
//         },
//         setAplnRequestError: (state, action) => {
//             state.aplnRequestError = action.payload
//         },
//         setBranchData: (state, action) => {
//             state.branchData = action.payload
//         },
//         setDepartmentData: (state, action) => {
//             state.departMentData = action.payload
//         },
//         setDesignationData: (state, action) => {
//             state.designationData = action.payload
//         },
//         seteditBranchInfo: (state, action) => {
//             state.editBranchInfo = action.payload
//         },
//         seteditDeptInfo: (state, action) => {
//             state.editDeptInfo = action.payload
//         },
//         setEditDesignationInfo: (state, action) => {
//             state.editDesignationInfo = action.payload
//         },
//         setBranchNameExist: (state, action) => {
//             state.branchNameExist = action.payload
//         },
//         setDepartmentExist: (state, action) => {
//             state.deptNameExist = action.payload
//         },
//         setDesignationExist: (state, action) => {
//             state.degnNameExist = action.payload
//         },
//         setRoleNameExist: (state, action) => {
//             state.roleNameExist = action.payload
//         },
//         setIncdTypNameExist: (state, action) => {
//             state.incdTypeNameExist = action.payload
//         },
//         setSevrtTypNameExist: (state, action) => {
//             state.sevrtTypeNameExist = action.payload
//         },
//         setLocNameExist: (state, action) => {
//             state.locationNameExist = action.payload
//         },
//         setBranchCodeExist: (state, action) => {
//             state.branchCodeExist = action.payload
//         },

//     }
// })


// export const retriveBranchInfo = () => {

//     return async dispatch => {
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"))

//         try {
//             dispatch(setAplnRequestLoading(true))
//             // const responseData = await urlSocket.post("ir-org/retrive-branch", {
//             //     encrypted_db_url: authUser.db_info.encrypted_db_url,
//             // })
//             dispatch(setAplnRequestLoading(false))
//             // if (responseData.status === 200) {
//             //     dispatch(setBranchData(responseData.data.data))
//             // }
//             // else {
//             //     dispatch(setAplnRequestLoading(responseData.data.message))
//             // }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }


// export const retriveDeptInfo = () => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/retrive-dept", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(setDepartmentData(responseData.data.data))
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }
//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// };


// export const retriveDesignationInfo = () => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("desgn/retrive-designation", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(setDesignationData(responseData.data.data))
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }
//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// };


// export const createBranchInfo = (values) => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))


//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("ir-org/create-branch", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 branch_info: values
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveBranchInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }


// export const createDeptInfo = (values) => {
//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/create-dept", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 dept_info: values
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveDeptInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }
//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }
//     }
// };



// export const createDesignation = (values) => {
//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("desgn/create-designation", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 desgn_info: values
//             })

//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveDesignationInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }
//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }
//     }
// }


// export const deleteBranchInfo = (values) => {
//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/delete-branch", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 branch_id: values._id
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveBranchInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// }


// export const deleteDegnInfo = (values) => {
//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))
//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("desgn/delete-designation", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 desgn_id: values._id
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveDesignationInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// }


// export const deleteDeptInfo = (values) => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))

//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/delete-dept", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 dept_id: values._id
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveDeptInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }


// export const IRTvalidateDupName = (editInfo, dynamic_cln, dynamic_key, dynamic_value, dynamicReducer) => {

//     return async dispatch => {

//         try {
//             var authUser = JSON.parse(sessionStorage.getItem("authUser"))

//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("cog/dup-name-validation", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 db_name: authUser.db_info.db_name,
//                 dynamic_cln: dynamic_cln,
//                 dynamic_key: dynamic_key,
//                 editInfo: editInfo,
//                 dynamic_value: dynamic_value
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(dynamicReducer(responseData.data.data.length > 0 ? true : false))
//             }
//         } catch (error) {
//             console.log(error, 'error')
//             dispatch(setAplnRequestLoading(error))
//         }
//     }
// }






// export const {
//     setAplnRequestError,
//     setAplnRequestLoading,
//     seteditBranchInfo,
//     setBranchNameExist,
//     setBranchData,
//     setDepartmentData,
//     setDesignationData,
//     seteditDeptInfo,
//     setEditDesignationInfo,
//     setDepartmentExist,
//     setDesignationExist,
//     setRoleNameExist,
//     setIncdTypNameExist,
//     setSevrtTypNameExist,
//     setLocNameExist,
//     setBranchCodeExist
// } = orgSlice.actions

// export default orgSlice.reducer;













// import { createSlice } from "@reduxjs/toolkit";
// // import { put, post, get, del } from "helpers/api_helper";
// import urlSocket from "../../helpers/urlSocket";


// const initialState = {
//     aplnRequestLoading: false,
//     aplnRequestError: null,
//     branchData: [],
//     departMentData:[],
//     editBranchInfo : null,
//     editDeptInfo : null,
//     branchNameExist : false,
//     deptNameExist: false,
//     roleNameExist : false,
//     incdTypeNameExist: false,
//     sevrtTypeNameExist : false,
//     locationNameExist : false,
//     branchCodeExist : false
// }


// const orgSlice = createSlice({
//     name: "orgSlice",
//     initialState: initialState,
//     reducers: {
//         setAplnRequestLoading: (state, action) => {
//             state.aplnRequestLoading = action.payload
//         },
//         setAplnRequestError: (state, action) => {
//             state.aplnRequestError = action.payload
//         },
//         setBranchData: (state, action) => {
//             state.branchData = action.payload
//         },
//         setDepartmentData:(state,action)=>{
//             state.departMentData = action.payload
//         },
//         seteditBranchInfo:(state,action)=>{
//             state.editBranchInfo = action.payload
//         },
//         seteditDeptInfo:(state,action)=>{
//             state.editDeptInfo = action.payload
//         },
//         setBranchNameExist:(state,action)=>{
//             state.branchNameExist = action.payload
//         },
//         setDepartmentExist:(state,action)=>{
//             state.deptNameExist = action.payload
//         },
//         setRoleNameExist:(state,action)=>{
//             state.roleNameExist = action.payload
//         },
//         setIncdTypNameExist:(state,action)=>{
//             state.incdTypeNameExist = action.payload
//         },
//         setSevrtTypNameExist:(state,action)=>{
//             state.sevrtTypeNameExist = action.payload
//         },
//         setLocNameExist:(state,action)=>{
//             state.locationNameExist = action.payload
//         },
//         setBranchCodeExist:(state,action)=>{
//             state.branchCodeExist = action.payload
//         },

//     }
// })


// export const retriveBranchInfo = () => {

//     return async dispatch => {
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"))

//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("ir-org/retrive-branch", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(setBranchData(responseData.data.data))
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }



// export const retriveDeptInfo = () => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))


//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/retrive-dept", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//             })
//             dispatch(setAplnRequestLoading(false))
//             console.log(responseData,'responseData');
//             if (responseData.status === 200) {
//                 dispatch(setDepartmentData(responseData.data.data))
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }



// export const createBranchInfo = (values) => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))


//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("ir-org/create-branch", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 branch_info: values
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveBranchInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }




// export const createDeptInfo = (values) => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))


//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/create-dept", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 dept_info: values
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 // dispatch(retriveBranchInfo())
//                 dispatch(retriveDeptInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }



// export const deleteBranchInfo = (values) => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))

//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/delete-branch", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 branch_id: values._id
//             })
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveBranchInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }




// export const deleteDeptInfo = (values) => {

//     return async dispatch => {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))

//         try {
//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("dept/delete-dept", {
//                 encrypted_db_url: authUser.db_info.encrypted_db_url,
//                 dept_id: values._id
//             })
//             console.log(responseData,'responseData');
//             dispatch(setAplnRequestLoading(false))
//             if (responseData.status === 200) {
//                 dispatch(retriveDeptInfo())
//             }
//             else {
//                 dispatch(setAplnRequestLoading(responseData.data.message))
//             }

//         } catch (error) {
//             dispatch(setAplnRequestLoading(error))

//         }

//     }

// }


// export const IRTvalidateDupName=(editInfo,dynamic_cln,dynamic_key,dynamic_value,dynamicReducer)=>{

//     return async dispatch =>{

//         try {
//         var authUser = JSON.parse(sessionStorage.getItem("authUser"))

//             dispatch(setAplnRequestLoading(true))
//             const responseData = await urlSocket.post("cog/dup-name-validation",{
//                 encrypted_db_url : authUser.db_info.encrypted_db_url,
//                 db_name : authUser.db_info.db_name,
//                 dynamic_cln : dynamic_cln,
//                 dynamic_key : dynamic_key,
//                 editInfo : editInfo,
//                 dynamic_value : dynamic_value
//             })
//             dispatch(setAplnRequestLoading(false))
//             console.log(responseData,'responseData');
//             if(responseData.status === 200){
//                 dispatch(dynamicReducer(responseData.data.data.length >0 ? true : false))
//                 // return responseData.data.data
//             }
            
//         } catch (error) {
//             console.log(error,'error')
//             dispatch(setAplnRequestLoading(error))
            
//         }


//     }



// }






// export const {
//     setAplnRequestError,
//     setAplnRequestLoading,
//     seteditBranchInfo,
//     setBranchNameExist,
//     setBranchData,
//     setDepartmentData,
//     seteditDeptInfo,
//     setDepartmentExist,
//     setRoleNameExist,
//     setIncdTypNameExist,
//     setSevrtTypNameExist,
//     setLocNameExist,
//     setBranchCodeExist
// } = orgSlice.actions

// export default orgSlice.reducer