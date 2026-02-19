import { createSlice } from '@reduxjs/toolkit';


const infoslice = createSlice({
    name: 'auditinfoslice',
    initialState: {
        image: '',
        audio: '',
        docs: '',
        video: '',
        recordedaudio: '',
        captuedimg: '',
        captuedvideo: '',
        capturedOrginalImage:'',
        markerState:null,
        imgUrl:'',
        imgfile:{},
        videoUrl:'',
        videofile:{},
        Audiofile:{},
        AudioUrl:'',
        docsUrl:'',
        docsfile:{},
        messageData:null,
        loggedInRoleUser: []
    


    },
    reducers: {
        setimage(state, action) {
            state.image = action.payload;
        },
        setimgUrl(state, action) {
            state.imgUrl = action.payload;
        },
        setimgfile(state, action) {
            state.imgfile = action.payload;
        }, 
        setaudio(state, action) {
            state.audio = action.payload;
        },
        setAudioUrl(state, action) {
            state.AudioUrl = action.payload;
        },
        setAudiofile(state, action) {
            state.Audiofile = action.payload;
        },
        setdocs(state, action) {
            state.docs = action.payload;
        },
        setdocsUrl(state, action) {
            state.docsUrl = action.payload;
        },
        setdocsfile(state, action) {
            state.docsfile = action.payload;
        },
        setvideo(state, action) {
            state.video = action.payload;
        },
        setvideoUrl(state, action) {
            state.videoUrl = action.payload;
        },
        setvideofile(state, action) {
            state.videofile = action.payload;
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
        setCapturedOrginalImg(state, action) {
            state.capturedOrginalImage = action.payload;
        },
        setMarkerState(state, action) {
            state.markerState = action.payload;
        },
        setmessagedata(state, action){
            state.messageData = action.payload;
        },
        clearAll(state) {
            return {
                image: '',
                audio: '',
                docs: '',
                video: '',
                recordedaudio: '',
                captuedimg: '',
                captuedvideo: '',
                capturedOrginalImage:"",
                markerState:null,
                imgUrl:'',
                imgfile:{},
                videoUrl:'',
                videofile:{},
                Audiofile:{},
                AudioUrl:'',
                docsUrl:'',
                docsfile:{},
            };
        },

        setloggedInRoleUser(state, action){
            state.loggedInRoleUser = action.payload;
        },

    },

})


export const {
    setdocsfile,
    setdocsUrl,
    setAudiofile,
    setAudioUrl, 
    setvideoUrl,
    setvideofile,
    setimage, 
    setaudio,
    setCapturedOrginalImg,
    setMarkerState, 
    setdocs, 
    setvideo, 
    setrecordedaudio, 
    setcaptuedimg, 
    setcaptuedvideo, 
    clearAll,
    setimgUrl,
    setimgfile,
    setmessagedata,
    setloggedInRoleUser
 } = infoslice.actions;

export const infosliceReducer = infoslice.reducer;


