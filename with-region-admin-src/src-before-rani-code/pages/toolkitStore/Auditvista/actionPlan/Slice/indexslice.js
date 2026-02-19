import { createSlice } from '@reduxjs/toolkit';


const indexslice = createSlice({
    name: 'followupindexslice',
    initialState: {
        UserAudit: [],
        sessiondata: {}
    },
    reducers: {
        setUserAudit(state, action) {
            state.UserAudit = action.payload;
        },

    },
})


export const { setUserAudit } = indexslice.actions;

export const indexsliceReducer = indexslice.reducer;
