import { createSlice } from '@reduxjs/toolkit';


const chatInfoSlice = createSlice({
    name: 'chatInfoSlice',
    initialState: {
        image: '',
        audio: '',
        docs: '',
        video: '',
        recordedaudio: '',
        captuedimg: '',
        captuedvideo: '',
        capturedOrginalImage:'',
        markerState:null

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
        setcaptuedimgChat(state, action) {
            console.log(action,'action')
            state.captuedimg = action.payload;
        },
        setcaptuedvideo(state, action) {
            state.captuedvideo = action.payload;
        },
        setCapturedOrginalImgChat(state, action) {
            state.capturedOrginalImage = action.payload;
        },
        setMarkerStateChat(state, action) {
            state.markerState = action.payload;
        },
        clearAllChat(state) {
            return {
                image: '',
                audio: '',
                docs: '',
                video: '',
                recordedaudio: '',
                captuedimg: '',
                captuedvideo: '',
                capturedOrginalImage:'',
                markerState:null
            };
        }

    },

})


export const { setimage,setMarkerStateChat,setCapturedOrginalImgChat, setaudio, setdocs, setvideo, setrecordedaudio, setcaptuedimgChat, setcaptuedvideo, clearAllChat } = chatInfoSlice.actions;

export const chatInfoSliceReducer = chatInfoSlice.reducer;


