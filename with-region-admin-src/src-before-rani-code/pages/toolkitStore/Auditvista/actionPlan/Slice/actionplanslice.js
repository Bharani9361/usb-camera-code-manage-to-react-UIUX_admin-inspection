import { createSlice } from '@reduxjs/toolkit';


const actionplanslice = createSlice({
    name: 'followupactionplanslice',
    initialState: {
        messageData: [],
        action_plan_info :[],
        location_summary : []
    },
    reducers: {
        setmessagedata(state, action) {
            state.messageData = action.payload;
        },
        setActionplanData(state,action){
            state.action_plan_info = action.payload

        },
        setlocationSummary(state,action){
            state.location_summary = action.payload
        }

    },
})


export const { setmessagedata,setActionplanData,setlocationSummary } = actionplanslice.actions;

export const actionplansliceReducer = actionplanslice.reducer;
