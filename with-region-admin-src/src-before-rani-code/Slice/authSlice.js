import { createSlice } from '@reduxjs/toolkit';
import { setConfigInfo, setAuthUserInfo } from "Slice/manageSessionSlice";

var CryptoJS = require('crypto-js')

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        userInfo: JSON.parse(sessionStorage.getItem('authUser')),
        loading: false,
        error: null,
        isAuthenticated: false,
        // dbInfo: {
        //     encrypted_db_url: 'mongodb://mongoadmin:DegLk916ePdeG@15.206.204.11:27017/hotel_surguru-beta?authMechanism=SCRAM-SHA-1&authSource=admin',
        //     db_name: 'hotel_surguru-beta'
        // },

        user_data: JSON.parse(sessionStorage.getItem('authUser')),
        db_info: {
            encrypted_db_url: 'mongodb://mongoadmin:DegLk916ePdeG@15.206.204.11:27017/hotel_surguru-beta?authMechanism=SCRAM-SHA-1&authSource=admin',
            db_name: 'hotel_surguru-beta',


        },
        cln_list:
            [
                {
                    "cln_name": "sales_data",
                    "user_friendly_name": "Hotel Runout"
                }
            ],

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
            {
                "id": 6,
                "name": "STANDARD DEVIATION"
            },
            {
                "id": 7,
                "name": "VARIANCE"
            },
            {
                "id": 8,
                "name": "MEDIAN"
            }
        ]


       



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
        setDbInfo: (state, action) => {
            state.dbInfo = action.payload
        }
    },
});


const  loginInfo= {   
    "email": "runoutadmin@gmail.com",
    "country_code": "+91 India",
    "full_name": "RunoutAdmin",
    "mobile": "1234567890",
    "status": true,
    "updated_on": null,
    '_id': '66614a9f5adde9895052ae69'
}



export const getConfig = () => async (dispatch) => {
}


export const loginAuthentication = (value, history) => async (dispatch) => {
    
    if (value.username.trim() === 'RunoutAdmin' && value.password.trim() === 'R12345678') {
        dispatch(setAuthUserInfo(loginInfo))
        sessionStorage.setItem("authUser", JSON.stringify(loginInfo))
        dispatch(updateUserInfo(loginInfo))
        dispatch(invalidAuth(null))
        history.push("/dashboard")
    } 

};

export const { updateUserInfo, invalidAuth, setDbInfo } = authSlice.actions;
export const authReducer = authSlice.reducer






