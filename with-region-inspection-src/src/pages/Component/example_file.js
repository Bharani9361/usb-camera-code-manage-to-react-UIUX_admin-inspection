// Eparampara Mail	Revathi Eparampara < revathi@eparampara.org>
//     (no subject)
// Joseprakash Eparampara < joseprakash@eparampara.org> Fri, Sep 1, 2023 at 1: 13 PM
// To: revathi @eparampara.org
import React, { Component } from 'react'
import Dropzone from "react-dropzone"
import { Row, Col, Label, } from "reactstrap"
import { Progress } from 'antd';
import { AvForm, AvField } from "availity-reactstrap-validation"
import 'react-tagsinput/react-tagsinput.css'
import 'react-h5-audio-player/lib/styles.css';
import VideoStatus from '../../../components/VideoStatus'
import uuid from "react-uuid";
import SweetAlert from "react-bootstrap-sweetalert"
import VideoPlayerPreview from '../../../components/VideoPlayerPreview'
import { Popconfirm } from 'antd'
import toastr from "toastr"
import Select from "react-select"

var urlSocket = require("../../../helpers/urlSocket")


export default class Multianglevideo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            uploading: false,
            video_up_prgrs: null,
            media_files: [],
            file_info: [],
            media_processing_status: null,
            origina_name: "",
            video_url: "",
            showVideo: false
        }
    }


    componentDidMount() {
        this.getJobCompletionStatus()
        this.videoStatus = setInterval(() => { this.getJobCompletionStatus() }, 3000)
    }

    getJobCompletionStatus = async () => {
        let id = this.props.video_id
        let input_key = this.props.input_key
        if (id !== "" && input_key !== "") {
            // console.log(id, input_key)
            try {
                await urlSocket.post("ctlibmgt/jobstatus", { id, input_key })
                    .then(res => {
                        console.log(res.data.data.Job.Status)
                        if (res.data.response_code === 504) {
                            console.log(res.data.err.message)
                        } else {
                            let status = res.data.data.Job.Status
                            if (status === 'Complete') {
                                clearInterval(this.videoStatus)
                                this.setState({ showVideo: true })
                            } else if (status === 'Progressing') {
                                // this.toastSuccess("Video is still Progressing. Please wait")
                            } else if (status === 'Error') {
                                this.toastSuccess("Oops! something went wrong")
                                clearInterval(this.videoStatus)

                            } else {
                                clearInterval(this.videoStatus)
                            }

                        }
                    })
                    .catch(err => {
                        clearInterval(this.videoStatus)
                        console.log(err)
                    })
            } catch (error) {
                console.log("catch error", error)
            }
        }
    }

    toastError = () => {
        let title = "Error"
        let message = "Something Went Wrong. Please try again"
        toastr.remove()
        toastr.clear()
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-left"
        toastr.error(message, title)
    }

    toastSuccess = (message) => {
        let title = "Success"
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-left"
        toastr.success(message, title)
    }

    handleAcceptedFiles = async (files) => {
        this.setState({ indrag: false, showVideo: false, media_processing_status: null, video_up_prgrs: null, isEdit: false })
        this.props.changeIsEdit()
        setTimeout(() => { this.setState({ showVideo: true }) }, 500)
        if (files.length === 1) {
            files.map(file => Object.assign(file, { preview: URL.createObjectURL(file), formattedSize: this.formatBytes(file.size) }))
            console.log(files)
            await this.setState({ media_files: files, video_url: files[0].preview, media_processing_status: 0, origina_name: files[0].name, formattedSize: files[0].formattedSize })
        } else {
            alert("Select only one File required type")
        }
    }


    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        let res = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
        return res
    }


    cancel_job = async () => {

        let id = this.props.video_id
        let input_key = this.props.input_key
        if (id !== "" && input_key !== "") {

            try {
                await urlSocket.post("ctlibmgt/cancel_job", { id, input_key })
                    .then(res => {
                        if (res.data.response_code === 500) {
                            this.setState({ media_processing_status: null })
                            this.toastSuccess("Video Transcoding cancelled")
                            clearInterval(this.videoStatus)

                        } else {
                            this.toastError(res.data.message)
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
            } catch (error) {
                console.log("catch error", error)
            }
        }
    }


    uploadAngleVideo = async () => {
        console.log('uploadAngleVideo')
        if (this.props.viewing_angle === undefined || this.props.viewing_angle === null) {
            this.setState({ angle_invalid: true })
            return
        } else {
            this.setState({ angle_invalid: false })
        }

        if (this.state.media_files.length === 0) {
            return
        }

        this.setState({ uploading: true })
        this.props.uploadingFile(false)
        // try {
        console.log('this.state.media_files', this.state.media_files)
        let file_info = this.state.media_files
        console.log('file_info', file_info)
        file_info = file_info[0]
        console.log('file_info', file_info)


        const file = new FormData()
        let u_id = uuid()
        let extension = file_info.type.slice(file_info.type.lastIndexOf('/') + 1)

        file.append('image', file_info, u_id + 'content.' + extension)
        file.append('path', u_id + 'content.' + extension)
        file.append('media_path', u_id + 'content.' + extension)
        file.append('media_type', 'Video')
        file_info.preview = u_id + 'content.' + extension
        file_info.input_url = u_id + 'content.' + extension
        file_info.origina_name = file_info.name

        this.setState({ file_info, media_processing_status: 1 })

        console.log('UPLOAD file_info', file_info, file)
        await urlSocket.post('ctlibmgt/upvid', file, {
            onUploadProgress: ProgressEvent => {
                this.props.uploadingFile(true)
                this.setState({ video_up_prgrs: Math.round(ProgressEvent.loaded / ProgressEvent.total * 100), })
            },
            maxContentLength: 10000000000,
            maxBodyLength: 100000000000

        },
            { timeout: 5000000 }
        )
            .then(async (res) => {
                // setTimeout(() => {

                // }, 120000);
                console.log('RESSS', res.data)
                if (res.data.response_code === 500 || res.data.status === 200) {
                    await this.setState({ uploading: false })
                    file_info.preview = ""
                    file_info.output_url = res.data.finalurl
                    let JobId = res.data.data.Job.Id
                    let input_key = res.data.data.Job.Input.Key
                    let output_url = res.data.finalurl
                    await this.getJobstatus(JobId, input_key, file_info, output_url)
                } else {
                    this.setState({ video_up_prgrs: null, media_processing_status: null, error_alert: true, error_msg: res.data.message, uploading: false })
                }
            })
            .catch(err => {
                console.log('err errerr', err)
                this.toastError()
                this.setState({ media_processing_status: null })

            })
        // } catch (error) {
        // console.log('error errorerrorerror', error)

        // }
    }

    getJobstatus = async (id, input_key, file_info, output_url) => {
        this.setState({ media_processing_status: 2 })

        try {
            await urlSocket.post("ctlibmgt/jobstatus", { id, input_key })
                .then(async (res) => {
                    if (res.data.response_code === 500) {
                        let status = res.data.data.Job.Status
                        if (status === 'Submitted') {
                            file_info.output_url = output_url
                            file_info.video_id = id
                            file_info.input_key = input_key
                            this.setState({ video_id: id, input_key, showVideo: false })
                            await this.props.getFileInfo(output_url, file_info)
                            this.toastSuccess("Video Uploaded and Processing you can submit and check again later")
                            this.props.uploadingFile(false)
                            setTimeout(() => { this.getJobstatus(id, input_key, file_info, output_url) }, 2000)
                        } else if (status === 'Complete') {
                            this.setState({ media_processing_status: 3, showVideo: true })
                            file_info.output_url = output_url
                        } else if (status === 'Progressing') {
                            setTimeout(() => { this.getJobstatus(id, input_key, file_info, output_url) }, 2000)
                        } else if (status === 'Error') {
                            this.toastSuccess("Oops! something went wrong")
                        }
                    } else {
                        console.log(res.data.err.message)
                    }
                    this.setState({ refresh: true })
                })
                .catch(err => {
                    console.log(err)
                })
        } catch (error) {
            console.log("catch error", error)
        }
    }

    // getFileInfo = () => {
    // let { origina_name, formattedSize } = file_info
    // data.output_url = output_url;
    // data.origina_name = origina_name;
    // data.formattedSize = formattedSize;

    // data.video_id = file_info.video_id
    // data.input_key = file_info.input_key

    // console.log('Multi Angle', data)
    // await this.setState({ refresh: true })

    // }

    render() {
        return (
            <AvForm className="mt-2 p-3" style={{ border: '1px solid #34c38f' }}>
                <Row>
                    <Col lg={6} sm={12} className="multiangleForm">
                        <Row>
                            <Col md={6} className="align-self-center">
                                {/* <AvField name="angle" label="Viewing Angle" value={this.props.viewing_angle} onChange={(e) => this.props.angleName(e.target.value)} className="form-control" placeholder="Angle Name" type="text" validate={{ required: true }} /> */}

                                <Label style={{ color: this.state.angle_invalid ? 'red' : null }}>Angle name</Label>
                                <Select
                                    value={{ angle_name: this.props.viewing_angle === undefined ? 'Select' : this.props.viewing_angle }}
                                    options={this.props.video_angles}
                                    onChange={(e) => { this.setState({ angle_invalid: false }); this.props.angleName(e.angle_name) }}
                                    // onChange={(e) => this.setState({ angle_name: e, validLang: false })} 
                                    classNamePrefix="select2-selection" getOptionLabel={(option) => option.angle_name} />

                            </Col>
                            <Col md={3}>
                                <Label>Status</Label>
                                <div className="square-switch">
                                    <input type="checkbox" disabled={this.props.disabled} id={this.props.uniqueKey} switch="bool" checked={this.props.status} onChange={() => this.props.onStatusChange()} />
                                    <label htmlFor={this.props.uniqueKey} data-on-label="Active" data-off-label="In-active" ></label>
                                </div>
                            </Col>
                            <Col md={3} className="align-self-center" style={{ textAlign: 'right' }}>
                                <Popconfirm title="Are you sure you want to delete?" okText="Yes" cancelText="No" onConfirm={() => { this.props.deleteAngleVideo(); this.setState({ media_files: [] }) }}>
                                    <button className="btn btn-danger btn-block " type="submit" disabled={this.props.disabled} >Delete</button>
                                </Popconfirm>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col md={12}>
                                <Dropzone disabled={this.props.disabled} onDrop={acceptedFiles => this.handleAcceptedFiles(acceptedFiles)} onDragEnter={() => this.setState({ indrag: true })} accept={'video/*'} onClick={e => e.stopPropagation()}>
                                    {
                                        ({ getRootProps, getInputProps }) => (
                                            <div className="dropzone" {...getRootProps()} style={{ height: this.state.indrag ? 300 : 150 }} onClick={e => e.stopPropagation()}>
                                                <div className="dz-message needsclick" {...getRootProps()} >
                                                    <input {...getInputProps()} />
                                                    <div className="mb-3">
                                                        <i className="display-4 text-muted bx bxs-cloud-upload" />
                                                    </div>
                                                    <h5>Drop video files here or click to upload.</h5>
                                                </div>
                                            </div>
                                        )
                                    }
                                </Dropzone>
                            </Col>
                        </Row>
                        {
                            <Row className="mt-2">
                                <Col className="align-self-end " style={{ textAlign: 'right' }}>
                                    <div className="mt-4 d-grid">

                                        <button className="btn btn-success btn-block mt-2" type="button" disabled={this.state.uploading || this.props.disabled} onClick={() => this.uploadAngleVideo()}>Upload Video</button>
                                        {/* <button className="btn btn-success btn-block mt-2" type="button" disabled={this.state.uploading || this.state.media_files.length === 0 || this.props.disabled} onClick={() => this.uploadAngleVideo()}>Upload Video</button> */}
                                    </div>
                                </Col>
                            </Row>
                        }
                    </Col>
                    {
                        (this.state.video_up_prgrs !== null && this.state.media_processing_status !== 3) &&
                        <Col md={6} sm={12} >
                            <Row>
                                <Col md={12}>
                                    <div className="mt-2">
                                        <div>
                                            {/* <Progress color="success" value={Number(this.state.video_up_prgrs)} style={{ height: 20 }} >{this.state.video_up_prgrs} %</Progress> */}
                                            <Progress percent={Number(this.state.video_up_prgrs)} strokeColor={{ '0%': '#108ee9', '100%': '#87d068', }} />
                                        </div>
                                        <div className="mt-1 text-center">
                                            <label>{this.state.video_up_prgrs === 100 ? 'Uploaded : ' : 'Uploading'}<strong>{this.state.video_up_prgrs} %</strong> </label>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mt-2"><VideoStatus status={this.state.media_processing_status} cancelJob={() => this.cancel_job()} /></Row>
                        </Col>
                    }

                    {
                        (((this.state.media_processing_status === 3 || (this.state.media_processing_status === 0))) || (this.props.video_not_uploaded)) ?
                            <Col lg={6} sm={12} className="align-self-center text-center">
                                {
                                    this.state.showVideo ?
                                        <VideoPlayerPreview
                                            invalidVideo={() => { this.setState({ media_processing_status: null }) }}
                                            isEdit={this.props.output_url !== "" ? true : false}
                                            origina_name={this.state.origina_name || this.props.origina_name}
                                            formattedSize={this.state.formattedSize || this.props.formattedSize}
                                            video_url={this.state.video_url}
                                            full_url={this.props.baseUrl + this.props.output_url}
                                            video_id={this.state.video_id || this.props.video_id}
                                            input_key={this.state.input_key || this.props.input_key}
                                        />
                                        :
                                        <h4>{this.state.uploading ? '' : 'Loading...'} </h4>
                                }
                            </Col>
                            :
                            null
                    }
                    {
                        this.state.error_alert ? (<SweetAlert danger title={"Alert"} onConfirm={() => { this.setState({ error_alert: false }) }} >{this.state.error_msg}</SweetAlert>) : null
                    }
                </Row>
            </AvForm>
        )
    }
}

