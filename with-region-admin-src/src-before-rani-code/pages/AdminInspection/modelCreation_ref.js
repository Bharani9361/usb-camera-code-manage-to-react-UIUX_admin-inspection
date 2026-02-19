import React, { Component } from 'react'
import urlSocket from "./urlSocket"
import ImageUrl from './imageUrl'
import { Container, CardTitle, Button, Table, Label, Row, Col, CardBody, Card, Progress } from 'reactstrap';
import Webcam from "react-webcam";
import "./Css/style.css"
import { v4 as uuidv4 } from 'uuid';
import { Popconfirm, message, Image } from 'antd';
import { DeleteTwoTone } from '@ant-design/icons';
import 'antd/dist/antd.css';
import moment from 'moment';
import { Link } from "react-router-dom";


export default class modelCreation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comp_name: '',
            comp_code: '',
            model_name: '',
            compModelVerInfo: [],
            config: [],
            positive: '',
            negative: '',
            selectFilter: null,
            tabFilter: null,
            showOkButton: false,
            showNotokButton: false,
            showCamera: false,
            showLabelName: '',
            reqImgCount: null,
            lable_name: '',
            webcamEnabled: false,
            imageSrcNone: false,
            showTrainingINProgs: false,
            refersh: false, 
            initvalue: 1
        }
    }

    componentDidMount() {
        let compModelInfo = JSON.parse(sessionStorage.getItem('compModelData'));
        this.setState({ comp_name: compModelInfo.comp_name, comp_code: compModelInfo.comp_code, model_name: compModelInfo.model_name })
        this.modelCreation(compModelInfo)
        this.getConfigInfo()
    }

    componentWillUnmount() {
        // Clear the interval to avoid memory leaks
        clearInterval(this.trainingStatusInterval);
    }

    modelCreation = async (compModelInfo) => {
        console.log('compModelInfo', compModelInfo)
        try {
            const response = await urlSocket.post('/compModel_ver_info', { 'compModelInfo': compModelInfo }, { mode: 'no-cors' });
            const compModelVerInfo = response.data;
            console.log('first20', compModelVerInfo)
            this.setState({ compModelVerInfo, refersh:true })
        } catch (error) {
            console.log('error', error)
        }
    }

    getConfigInfo = async () => {
        try {
            const response = await urlSocket.post('/config', { mode: 'no-cors' });
            const config = response.data;
            console.log('first39', config)
            this.setState({ config, positive: config[0].positive, negative: config[0].negative })
        } catch (error) {
            console.log('error', error)
        }
    }

    getOK = (ok, tabFilter) => {
        console.log('first')
        const { config } = this.state;
        let reqImgCount = config[0].min_ok_for_training
        this.setState({ tabFilter, showOkButton: true, showNotokButton: false, showCamera: false, showLabelName: ok, reqImgCount })
    }

    getNotok = (notok, tabFilter) => {
        console.log('first53')
        const { config } = this.state;
        let reqImgCount = config[0].min_notok_for_training
        this.setState({ tabFilter, showNotokButton: true, showOkButton: false, showCamera: false, showLabelName: notok, reqImgCount })
    }

    getImgGalleryInfo = (selectFilter) => {
        this.setState({ selectFilter, showCamera: false })
    }

    startLiveCamera = (selectFilter, lable_name) => {
        this.setState({ selectFilter, showCamera: true, lable_name })
        // Simulate slow enable process for demonstration
        setTimeout(() => {
            this.setState({ webcamEnabled: true, imageSrcNone: false });
        }, 1000);
    }

    captureImage = async (labelName) => {
        const { compModelVerInfo } = this.state;
        const imageSrc = this.webcam.getScreenshot();

        if (!imageSrc) {
            this.setState({ imageSrcNone: true });
            return;
        }
        const blob = await this.dataURLtoBlob(imageSrc);
        const formData = new FormData();
        let imgUuid = uuidv4();
        formData.append('_id', compModelVerInfo[0]._id);
        formData.append('comp_name', compModelVerInfo[0].comp_name);
        formData.append('comp_code', compModelVerInfo[0].comp_code);
        formData.append('comp_id', compModelVerInfo[0].comp_id);
        formData.append('model_name', compModelVerInfo[0].model_name);
        formData.append('model_id', compModelVerInfo[0].model_id);
        formData.append('model_ver', compModelVerInfo[0].model_ver);
        formData.append('labelName', labelName);
        formData.append('imgName', blob, imgUuid + '.png');

        try {
            const response = await urlSocket.post('/addImage', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            });
            let getInfo = response.data;
            console.log('121', getInfo)
            if (getInfo.message === 'Image successfully added') {
                this.setState({ response_message: getInfo.message, compModelVerInfo: getInfo.comp_model_ver_info_list, refersh:true });
            }
            else {
                this.setState({ response_message: getInfo.message })
            }
            setTimeout(() => {
                this.setState({ response_message: "" });
            }, 1000);
        } catch (error) {
            console.log('error', error);
        }
    };

    dataURLtoBlob = (dataURL) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    getImages = (data1) => {
        if (data1 !== undefined) {
            console.log('data1', data1)
            let baseurl = ImageUrl
            let result = data1.image_path
            let output = baseurl + result
            return output
        }
        else {
            return null
        }
    }

    deleteImageClick = async (data, index, labelName) => {
        console.log('data', data);
        const { compModelVerInfo } = this.state;
        console.log('compModelVerInfo', compModelVerInfo);

        const updatedImageData = [...compModelVerInfo[0].datasets];
        console.log('updatedImageData', updatedImageData);
        updatedImageData.splice(index, 1);

        this.setState(prevState => ({
            compModelVerInfo: [{
                ...prevState.compModelVerInfo[0],
                datasets: updatedImageData
            }], refersh:true
        }));

        message.success('Click on Yes');
        let imgName = data.image_path;
        const formData = new FormData();
        formData.append('_id', compModelVerInfo[0]._id);
        formData.append('model_ver', compModelVerInfo[0].model_ver);
        formData.append('labelName', labelName);
        formData.append('imgName', imgName);
        formData.append('comp_named', compModelVerInfo[0].comp_name)
        formData.append('comp_code', compModelVerInfo[0].comp_code)
        formData.append('comp_id', compModelVerInfo[0].comp_id)
        formData.append('model_name', compModelVerInfo[0].model_name)
        formData.append('model_id', compModelVerInfo[0].model_id)
        formData.append('training_status', compModelVerInfo[0].training_status)
        formData.append('model_status', compModelVerInfo[0].model_status)

        urlSocket.post('/delete_image', formData, { 'comp_info': compModelVerInfo }, {
            headers: {
                'content-type': 'multipart/form-data'
            },
            mode: 'no-cors'
        })
            .then(response => {
                console.log('success', response.data);
                this.setState(prevState => ({
                    response_message: response.data,
                    compModelVerInfo: prevState.compModelVerInfo,
                }));
                setTimeout(() => {
                    this.setState({ response_message: "" });
                }, 1000);
            })
            .catch(error => {
                console.log('error', error);
            });
    }

    train = async (data) => {
        this.setState({ showTrainingINProgs: true });
        // Update the training_status_id to 0
        const updatedCompModelVerInfo = [...this.state.compModelVerInfo];
        updatedCompModelVerInfo[0].training_status_id = 0;
        this.setState({ compModelVerInfo: updatedCompModelVerInfo, refersh:true });

        this.trainingStatusInterval = setInterval(() => this.fetchTrainingStatus(data), 5000);       

        try {
            const response = await urlSocket.post('/Train', { 'compModelVerInfo': data, 'config': this.state.config }, { mode: 'no-cors' });
            console.log('first232', response.data)
            if (response.data === 'training completed') {
                data.training_status_id = 4;
                data.training_status = 'training completed';
                this.setState({ compModelVerInfo: [data], showTrainingINProgs: false, refersh:true });
                clearInterval(this.trainingStatusInterval);
            }
        } catch (error) {
            console.log('Error starting training:', error);
            clearInterval(this.trainingStatusInterval);
        }
    }

    clock = (data) => {
        console.log('first', data)
        let st_date = new Date(data).toISOString()
        var time = moment.utc(st_date).format("DD/MM/YYYY HH:mm:ss");
        console.log('st_date', st_date, time)
        let start = new Date().toString()
        console.log('end', start)
        var endtime = moment.utc(start).format("DD/MM/YYYY HH:mm:ss");
        console.log('endtime', endtime)
        let output = moment.utc(moment(endtime, "DD/MM/YYYY HH:mm:ss").diff(moment(time, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss")
        console.log('output', output)
        return output
    }

    fetchTrainingStatus = async (data) => {
        try {
            const response = await urlSocket.post('/getTrainingStatus', { 'compModelVerInfo': data }, { mode: 'no-cors' });
            const updatedCompModelVerInfo = response.data;
            console.log('updat', updatedCompModelVerInfo)
            this.setState({ compModelVerInfo: updatedCompModelVerInfo, refersh:true });
        } catch (error) {
            console.log('Error fetching training status:', error);
        }
    }
   
    adminAccTest = async (data) => {
        console.log('compModelverInfo271', data)
        let count = this.state.initvalue
        let compModelverInfo = {
            config: this.state.config,
            testCompModelVerInfo: data,
            batch_no: count++
        }
        // Save the data to localStorage
        localStorage.setItem('modelData', JSON.stringify(compModelverInfo));
      
        // Redirect to the test page
        // window.location.href = '/adminAccTesting';
      }      
    

    render() {
        const { compModelVerInfo, positive, negative, selectFilter, tabFilter, showOkButton, showNotokButton, showCamera, showLabelName, reqImgCount, lable_name, webcamEnabled, imageSrcNone, imageData, config, showTrainingINProgs, refersh } = this.state;
        console.log('first36', compModelVerInfo);
        const videoConstraints = {
            facingMode: "user"
        };

        return (
            <>
                <div className='page-content'>
                    <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                        <CardTitle className="text-center" style={{ fontSize: 22, paddingTop: '20px' }}> MODEL CREATION</CardTitle>
                        <div>
                            <Label>
                                Component Name: {this.state.comp_name} , Component Code: {this.state.comp_code} , Model Name: {this.state.model_name}
                            </Label>
                        </div>
                        {
                            refersh?
                            <div className='table-responsive'>
                            <Table striped>
                                <thead>
                                    <tr>
                                        <th>Model Version</th>
                                        <th>Model Status</th>
                                        <th>Created on</th>
                                        <th>Approved on</th>
                                        <th>Live on</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compModelVerInfo.map((data, index) => {
                                        const okCount = data.datasets.filter((dataset) => dataset.type === 'OK').length;
                                        const notokCount = data.datasets.filter((dataset) => dataset.type === 'NG').length;

                                        return (
                                            <tr key={index} id='recent-list'>
                                                <td>{'V'}{data.model_ver}</td>
                                                <td>{data.model_status}</td>
                                                <td>{data.created_on}</td>
                                                <td>{data.approved_on}</td>
                                                <td>{data.live_on}</td>
                                                <td style={{ fontSize: '18px' }}>
                                                    {!showTrainingINProgs && data.training_status !== 'training_in_progress' && (
                                                        data.training_status === 'training completed' ? (
                                                            <Link to='/adminAccTesting'><Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => this.adminAccTest(data)}>Start Admin Accuracy Test</Button> </Link>
                                                        ) : (
                                                            okCount >= Number(config[0]?.min_ok_for_training) && notokCount >= Number(config[0]?.min_notok_for_training) && (
                                                                <Button style={{ backgroundColor: 'blue', color: 'white' }} onClick={() => this.train(data)}>Train</Button>
                                                            )
                                                        )
                                                    )}

                                                    <div>
                                                        {showTrainingINProgs && (
                                                            <Row className="col-lg-6">
                                                                {data.training_status_id === 0 && (
                                                                    <Progress multi>
                                                                        <Progress bar color="primary" value={15} animated></Progress>
                                                                    </Progress>
                                                                )}
                                                                {data.training_status_id === 1 && (
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}>15%</Progress>
                                                                        <Progress bar color="primary" value={15} animated></Progress>
                                                                    </Progress>
                                                                )}
                                                                {data.training_status_id === 2 && (
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={15}>30%</Progress>
                                                                        <Progress bar color="primary" value={10} animated></Progress>
                                                                    </Progress>
                                                                )}
                                                                {data.training_status_id === 3 && (
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={10}>40%</Progress>
                                                                        <Progress bar color="primary" value={60} animated></Progress>
                                                                    </Progress>
                                                                )}
                                                                {data.training_status_id === 4 && (
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={10}></Progress>
                                                                        <Progress bar color="success" value={60}>100%</Progress>
                                                                    </Progress>
                                                                )}
                                                                <div style={{ 'textAlign': 'center' }}>
                                                                    {data.training_start_time ? this.clock(data.training_start_time) : 'Training started ...'}
                                                                </div>
                                                            </Row>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>:null
                        }
                        <div>
                            {showTrainingINProgs === false && (
                                <div>
                                    <Row>
                                        <Col className='text-center'>
                                            <Button color='primary' outline={tabFilter !== 0} onClick={() => this.getOK(positive, 0)} disabled={showTrainingINProgs}>{positive}</Button>
                                            <div style={{ marginTop: '10px' }}>
                                                {showOkButton ? (
                                                    <Row>
                                                        {Number(compModelVerInfo[0]?.model_ver) !== 1 ? (
                                                            <Col>
                                                                <Button color='primary' outline={selectFilter !== 0} onClick={() => this.getImgGalleryInfo(0)}>Image Gallery</Button>
                                                            </Col>
                                                        ) : null}
                                                        <Col>
                                                            <Button color='primary' outline={selectFilter !== 1} onClick={() => this.startLiveCamera(1, 'OK')}>Live Camera</Button>
                                                        </Col>
                                                    </Row>
                                                ) : null}
                                            </div>
                                        </Col>
                                        <Col className='text-center'>
                                            <Button color='primary' outline={tabFilter !== 1} onClick={() => this.getNotok(negative, 1)} disabled={showTrainingINProgs}>{negative}</Button>
                                            <div style={{ marginTop: '10px' }}>
                                                {showNotokButton ? (
                                                    <Row>
                                                        {compModelVerInfo[0]?.model_ver !== 1 ? (
                                                            <Col>
                                                                <Button color='primary' outline={selectFilter !== 3} onClick={() => this.getImgGalleryInfo(3)}>Image Gallery</Button>
                                                            </Col>
                                                        ) : null}
                                                        <Col>
                                                            <Button color='primary' outline={selectFilter !== 4} onClick={() => this.startLiveCamera(4, 'NG')}>Live Camera</Button>
                                                        </Col>
                                                    </Row>
                                                ) : null}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </div>
                        <br />
                        <div>
                            {showCamera ? (
                                <Row lg={12} className='text-center'>
                                    <Col lg={3}></Col>
                                    <Col lg={6}>
                                        <Card>
                                            <CardBody>
                                                <CardTitle className='mb-4'>Capture Image for Training</CardTitle>
                                                <label>{showLabelName} component (minimum required image: {reqImgCount})</label>

                                                <div className="containerImg">
                                                    {!webcamEnabled && <p className="small-text">Camera is not started. Please wait...</p>}
                                                    {imageSrcNone ? <p className='small-text'>Camera is not connected</p> : null}
                                                    {webcamEnabled && (
                                                        <Webcam
                                                            videoConstraints={videoConstraints}
                                                            audio={false}
                                                            height={'auto'}
                                                            screenshotFormat="image/png"
                                                            width={'100%'}
                                                            ref={node => this.webcam = node}
                                                        />
                                                    )}
                                                    <div className="centered">
                                                        {this.state.response_message}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Button color='primary' onClick={() => this.captureImage(lable_name)}>ADD IMAGE</Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col lg={3}></Col>
                                </Row>
                            ) : null}
                        </div>
                        <div>
                            {showCamera ? (
                                <Card>
                                    <Image.PreviewGroup>
                                        <Row>
                                            {compModelVerInfo[0]?.datasets.map((data, index) => (
                                                data.type === lable_name && (
                                                    <Col className='mt-2' key={index}>
                                                        <Image width={100} src={this.getImages(data)}></Image>
                                                        <Popconfirm placement="rightBottom" title="Do you want to delete?" onConfirm={() => this.deleteImageClick(data, index, lable_name)} okText="Yes">
                                                            <DeleteTwoTone twoToneColor="red" style={{ fontSize: '18px' }} />
                                                        </Popconfirm>
                                                    </Col>
                                                )
                                            ))}
                                        </Row>
                                    </Image.PreviewGroup>
                                </Card>
                            ) : null}
                        </div>
                    </Container>
                </div>
            </>
        );
    }
}
