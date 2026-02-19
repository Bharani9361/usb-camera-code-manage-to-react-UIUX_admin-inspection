import { createSlice } from '@reduxjs/toolkit';




const chatSlice = createSlice({
    name: 'groupchat',
    initialState: {
        appUsers: [],
        image: '',
        audio: '',
        docs: '',
        video: '',
        recordedaudio: '',
        captuedimg: '',
        captuedvideo: '',
    },
    reducers: {

        setimage(state, action) {
            state.image = action.payload;
        },
        setaudio(state, action) {
            state.audio = action.payload;
        },
        setdocs(state, action) {
            state.docs = action.payload;
        },
        setvideo(state, action) {
            state.video = action.payload;
        },
        setrecordedaudio(state, action) {
            state.recordedaudio = action.payload;
        },
        setcaptuedimg(state, action) {
            state.captuedimg = action.payload;
        },
        setcaptuedvideo(state, action) {
            state.captuedvideo = action.payload;
        },
        setAppuser(state, action) {
            state.appUsers = action.payload;
        },
        clearAllgroup(state) {
            return {
                image: '',
                audio: '',
                docs: '',
                video: '',
                recordedaudio: '',
                captuedimg: '',
                captuedvideo: '',
            };
        }
    },
})


export const { setimage,setAppuser, setaudio, setdocs, setvideo, setrecordedaudio, setcaptuedimg, setcaptuedvideo, clearAllgroup } = chatSlice.actions;

export const chatSliceReducer = chatSlice.reducer;













// import { createSlice } from '@reduxjs/toolkit';




// const chatSlice = createSlice({
//     name: 'groupchat',
//     initialState: {
//         appUsers: [],
//     },
//     reducers: {
//         setAppuser(state, action) {
//             console.log(action, 'action')
//             state.appUsers = action.payload;
//         },

//     },

// })


// export const { setAppuser } = chatSlice.actions;

// export const chatSliceReducer = chatSlice.reducer;


