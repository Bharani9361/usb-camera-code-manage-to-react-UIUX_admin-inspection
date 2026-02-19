import { createSlice } from '@reduxjs/toolkit';


const auditlocations = createSlice({
    name: 'auditlocationslice',
    initialState: {
        sessiondata: [],
        loadEndpointsInfo: []
    },
    reducers: {
        setSessiondata(state, action) {
            console.log("slice", action)
            state.sessiondata = action.payload;
        },
        setloadEndpointsInfo(state, action) {
            console.log("slice", action)
            state.loadEndpointsInfo = action.payload;
        },
    },
})


export const { setSessiondata, setloadEndpointsInfo } = auditlocations.actions;

export const auditlocationsReducer = auditlocations.reducer;
