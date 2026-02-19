import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
import { Col, Container, Row, CardTitle, Label, Button, Form, Input, Modal, Table } from "reactstrap";
import axios from "axios";
import { Link } from "react-router-dom";
import { Progress, } from "reactstrap"
import { EditOutlined } from '@ant-design/icons';
import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';
import SearchField from "react-search-field";
import SweetAlert from 'react-bootstrap-sweetalert';
import 'antd/dist/antd.css';
import { formValueSelector } from "redux-form";
import urlSocket from '../AdminInspection/urlSocket'
import ImageUrl from "../AdminInspection/imageUrl";

// import CardComp from './Components/CardComp'
class CRUDComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            component_name: "",
            component_code: "",
            is_active: "",
            SearchField: '',
            timeout: null,
            act_inact_msg: false,
            comp_id: '',
            showacitve_inactive: false,
            chooseacitve_inactive: false,
            addCompModal: false,
            selectedFilter: null,
            chooseFilter: null,
            selectFilter: null,
            qc_filter: null,
            filter: null,
            items_per_page_stock: 100,
            currentPage_stock: 1,
            config_data: [],
            sorting: { field: "", order: "" },
            msg: "",
            clock: new Date().toISOString(),
            training_status: [],
            progressList: [],
            training_duration: 20,
            initvalue: 1,
            //train_status_all: "ALL",
            train_status_traincompleted: "training completed",
            train_status_train_progress: "training_in_progress",
            train_status_notstarted: "training_not_started",
            search_componentList: [],
            componentList: [

            ]
        }
    }

    componentDidMount() {
        this.qc_insp_result_updt()
        //this.compListAPICall()
        // this.state.selectFilter !==0
        //this.setState({selectFilter:0})        
        // this.active_inactive(true) // changes for 28.04.2022
        // this.setState({ selectedFilter: 1 })// changes for 28.04.2022

        try {
            urlSocket.post('/config', { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config_data', data)
                    this.setState({ config_data: data })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
        this.training_fields(this.state.train_status_notstarted, 0)
        //this.setState({ selectedFilter: 1 })
    }


    qc_insp_result_updt = () => {
        try {
            urlSocket.post('/qc_chgs_updt', { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('qc_data91', data)
                    // this.setState({ config_data: data })
                })
                .catch((error) => {
                    console.log(error)
                })

        } catch (error) {
            console.log("----", error)
        }
    }


    compListAPICall = () => {
        try {
            urlSocket.post('/comp_list', { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    //console.log('is_active', data)
                    if (data.length === 0 || data === null || data === undefined) {
                        // this.setState({ componentList: [], dataloaded: true })
                    } else {
                        //console.log(`object`, data[0].comp_code)
                        // this.setState({ componentList: data, dataloaded: true })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    // navigateto = () => {
    //     const { history } = this.props
    //     console.log(this.props)
    //     setTimeout(() => {
    //         history.push("/crudcomponent")
    //     }, 5000);
    //     // history.push("/crudcomponent")
    // }

    // contApicall = (d) => {
    //     console.log('first', d)
    //     setInterval(() => {
    //         if (d === 2) {
    //             training_fields = ('training_in_progress', 2)
    //             //this.gettraining_status("training_in_progress")
    //         }
    //     }, 1000)
    // }

    gettraining_status = (d1) => {
        console.log('d1', d1)
        urlSocket.post('/training_status', { 'progress_status': d1 }, {
            mode: 'no-cors'
        })
            .then(response => {
                console.log('success1', response.data);
                let data = response.data
                this.setState({ progressList: data })
            })
            .catch(error => {
                console.log('error', error);
            })
    }

    qc_sugt_retrain = (qc_filter) => {
        this.setState({ qc_filter, filter: null, filter: null, chooseFilter: null, SearchField: "", selectFilter: null, showacitve_inactive: false, chooseacitve_inactive: false })
        try {
            urlSocket.post('/qc_sugested_retrain',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log("status", data)
                    if (data.length === 0 || data === null || data === undefined) {
                        this.setState({ componentList: [], search_componentList: data, dataloaded: true })
                    }
                    else {
                        this.setState({ componentList: data, search_componentList: data, dataloaded: true })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log(error)
        }
    }

    training_fields = (data, selectFilter) => {
        clearTimeout(this.state.timeout)
        this.setState({ filter: null, chooseFilter: null, SearchField: "", selectFilter, showacitve_inactive: false, chooseacitve_inactive: false })
        // this.setState({  })
        // this.setState({ showacitve_inactive: false, chooseacitve_inactive: false })
        // if (selectFilter === 2) {
        //     this.setState({ showacitve_inactive: true })
        //     this.active_inactive(true, "training completed", 1)
        //     this.setState({ selectedFilter: 1 })
        // }      
        // else {
        console.log('selectFilter', selectFilter)
        this.training_extention(data)
    }

    training_extention = (data) => {
        let status = data
        console.log('status154', status, this.state.SearchField)
        try {
            urlSocket.post('/train_fields', { 'status': status },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log("status", data)

                    // this.setState({training_status:data})                       
                    if (data.length === 0 || data === null || data === undefined) {
                        this.setState({ componentList: [], search_componentList: data, dataloaded: true })
                    }
                    else {
                        console.log(`object`, data[0].comp_code)
                        if (this.state.selectFilter === 1 && this.state.SearchField.length > 0) {
                            this.setState({ componentList: data, dataloaded: false })
                            this.dataListProcess()
                        }
                        else if (this.state.selectFilter === 1 && this.state.SearchField.length === 0) {
                            this.setState({ componentList: data, search_componentList: data, dataloaded: true })
                        }
                        else {
                            this.setState({ componentList: data, search_componentList: data, dataloaded: true })
                        }
                    }
                    /////////////////////////////////New JB//////////////////////////////////////////////////                       
                    // setInterval(() => {
                    //training_in_progress
                    if (this.state.selectFilter === 1) {
                        let timeout = setTimeout(() => {
                            this.training_extention(this.state.train_status_train_progress, 1)
                        }, 5000)
                        this.setState({ timeout: timeout })
                    }
                    // }, 10000)               
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
        // }
        this.setState({ refresh: true })
    }


    train_fields = (data, filter) => {
        clearTimeout(this.state.timeout)
        this.setState({ filter, SearchField: "" })
        this.setState({ selectFilter: null })
        this.setState({ showacitve_inactive: true, chooseacitve_inactive: false })
        this.active_inactive(true, data, 1)
        this.setState({ selectedFilter: 1 })
    }

    trained_fields = (data, selectFilter) => {
        clearTimeout(this.state.timeout)
        this.setState({ selectFilter, filter: null, selectedFilter: null, SearchField: '' })
        this.setState({ chooseacitve_inactive: true, showacitve_inactive: false, })
        this.chooseact_inact(true, data, 1)
        this.setState({ chooseFilter: 1 })
    }

    active_inactive = (data, data1, selectedFilter) => {
        let active = data
        let training_status = data1
        this.setState({ selectFilter: null, SearchField: '' })
        this.setState({ selectedFilter })

        try {
            urlSocket.post('/active_inactive', { 'is_active': active, 'status': training_status },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log("is_active", data)
                    //this.setState({componentList: data})
                    // let datasets = data.datasets
                    // if (datasets.image_path === "") {
                    //     this.setState({ componentList: data, dataloaded: true})
                    // }
                    if (data.length === 0 || data === null || data === undefined) {
                        this.setState({ componentList: [], search_componentList: data, dataloaded: true })
                    } else {
                        console.log(`object`, data[0].comp_code)
                        this.setState({ componentList: data, search_componentList: data, dataloaded: true })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
        this.setState({ refresh: true })
    }

    chooseact_inact = (data, data1, chooseFilter) => {
        let active = data
        let training_status = data1
        this.setState({ selectedFilter: null })
        this.setState({ chooseFilter, SearchField: "" })

        try {
            urlSocket.post('/active_inactive', { 'is_active': active, 'status': training_status },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log("is_active", data)
                    if (data.length === 0 || data === null || data === undefined) {
                        this.setState({ componentList: [], search_componentList: data, dataloaded: true })
                    } else {
                        console.log(`object`, data[0].comp_code)
                        this.setState({ componentList: data, search_componentList: data, dataloaded: true })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
        this.setState({ refresh: true })
    }

    submitForm = () => {
        console.log(this.state.component_name, this.state.component_code)
        console.log('config_data', this.state.config_data)
        let config_data = this.state.config_data

        let comp_name = this.state.component_name.trim()
        let component_name = comp_name.toUpperCase();
        console.log("component_name", component_name)
        let comp_code = this.state.component_code.trim()
        let component_code = comp_code.toUpperCase();

        if (component_name === "" && component_code === "") {
            alert("The component name and code is empty")
        }
        else if (component_name === "") {
            alert("The component name is empty")
        }
        else if (component_code === "") {
            alert("The component code is empty")
        }
        // else if(component_name !== undefined && component_code !== undefined && component_name !== componentList[0].comp_name && component_code !== componentList[0].comp_code) 
        else if (component_name !== undefined && component_code !== undefined) {
            try {
                urlSocket.post('/add_comp', { 'comp_name': component_name, 'comp_code': component_code },
                    { mode: 'no-cors' })
                    .then((response) => {
                        let data = response.data
                        console.log(data)
                        let compData = {
                            component_name: component_name,
                            component_code: component_code,
                            _id: data[1]._id,
                            config_data: this.state.config_data,
                            positive: data[1].positive,
                            negative: data[1].negative,
                            posble_match: data[1].posble_match,
                            status: data[1].status
                        }
                        sessionStorage.removeItem("compData")
                        sessionStorage.setItem("compData", JSON.stringify(compData))

                        if (data[0].res === "created") {
                            this.navigateto();
                        }
                        else
                            alert(data)
                    })
                    .catch((error) => {

                        console.log(error)
                    })
            } catch (error) {
            }
        }
    }

    onChangeStatus = (value, data) => {
        console.log('data338', data._id)
        console.log('value', value)
        this.setState({ component_name: data.comp_name, component_code: data.comp_code, is_active: value, comp_id: data._id })
        data.is_active = value

        if (this.state.chooseFilter === 1 && value === false) {
            this.setState({ act_inact_msg: true })
        }
        // if (this.state.chooseFilter === 1 && value === false) {
        //     this.setState({ act_inact_msg: true })
        // }
        else {
            try {
                urlSocket.post('/is_active', { 'comp_id': data._id, 'comp_name': data.comp_name, 'comp_code': data.comp_code, 'is_active': value },
                    { mode: 'no-cors' })
                    .then((response) => {
                        let data = response.data
                        console.log("is_active", data[0].is_active)
                        this.setState({ is_active: data[0].is_active })
                        if (this.state.selectedFilter === 2 && data[0].is_active === true) {
                            this.active_inactive(false, 'training completed', 2)
                        }
                        else if (this.state.selectedFilter === 1 && data[0].is_active === false) {
                            this.active_inactive(true, 'training completed', 1)
                        }
                        else if (this.state.chooseFilter === 1 && data[0].is_active === false) {
                            this.chooseact_inact(true, 'admin approved trained model', 1)
                        }
                        else if (this.state.chooseFilter === 2 && data[0].is_active === true) {
                            this.chooseact_inact(false, 'admin approved trained model', 2)
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            } catch (error) {
            }
        }
        this.setState({ refresh: true })
    }

    actInactChange = () => {
        let comp_name = this.state.component_name
        let comp_code = this.state.component_code
        let value = this.state.is_active
        let _id = this.state.comp_id
        this.setState({ act_inact_msg: false })
        try {
            urlSocket.post('/is_active', { 'comp_id': _id, 'comp_name': comp_name, 'comp_code': comp_code, 'is_active': value },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log("is_active", data[0].is_active)
                    this.setState({ is_active: data[0].is_active })
                    if (this.state.selectedFilter === 2 && data[0].is_active === true) {
                        this.active_inactive(false, 'training completed', 2)
                    }
                    else if (this.state.selectedFilter === 1 && data[0].is_active === false) {
                        this.active_inactive(true, 'training completed', 1)
                    }
                    else if (this.state.chooseFilter === 1 && data[0].is_active === false) {
                        this.chooseact_inact(true, 'admin approved trained model', 1)
                    }
                    else if (this.state.chooseFilter === 2 && data[0].is_active === true) {
                        this.chooseact_inact(false, 'admin approved trained model', 2)
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
    }

    actInactNotChange = () => {
        this.setState({ act_inact_msg: false })
        if (this.state.chooseFilter === 1 && this.state.is_active === false) {
            this.chooseact_inact(true, 'admin approved trained model', 1)
        }
        else if (this.state.chooseFilter === 2 && this.state.is_active === true) {
            this.chooseact_inact(false, 'admin approved trained model', 2)
        }
    }

    navigateto = () => {
        const { history } = this.props
        console.log(this.props)
        history.push("/training")
    }

    editComp = (data) => {
        let qc_changes_uptd = 0
        if (data.datasets === undefined) {
            data.datasets = []
        }
        if (this.state.qc_filter !== null) {
            qc_changes_uptd = 1
        }

        let { comp_name, comp_code, _id } = data
        let datas = {
            component_name: comp_name,
            component_code: comp_code,
            datasets: data.datasets,
            status: data.status,
            positive: data.positive,
            negative: data.negative,
            posble_match: data.posble_match,
            qc_changes_uptd,
            _id,
            config_data: this.state.config_data,
        }

        console.log('datas', datas)
        sessionStorage.removeItem("compData")
        sessionStorage.setItem("compData", JSON.stringify(datas))

        this.setState({ component_code: comp_code, component_name: comp_name, _id })
    }

    logComp = (data) => {
        console.log('first', data)
        if (data.datasets === undefined) {
            data.datasets = []
        }
        let { comp_name, comp_code, _id } = data

        let datas = {
            component_name: comp_name,
            component_code: comp_code,
            datasets: data.datasets,
            status: data.status,
            positive: data.positive,
            negative: data.negative,
            posble_match: data.posble_match,
            _id,
            config_data: this.state.config_data,
        }
        console.log('datas', datas)
        sessionStorage.removeItem("compData")
        sessionStorage.setItem("compData", JSON.stringify(datas))

        this.setState({ component_code: comp_code, component_name: comp_name, _id })
    }
    // getDate = () => {
    //     let today = new Date();
    //     let yyyy = today.getFullYear();
    //     let mm = today.getMonth() + 1; // Months start at 0!
    //     let dd = today.getDate();
    //     let hours = today.getHours()
    //     let min = today.getMinutes()
    //     let secc = today.getSeconds()
    //     let ms = today.getMilliseconds()
    //     //let time = hours +':' + min + ':' + secc

    //     if (dd < 10) dd = '0' + dd;
    //     if (mm < 10) mm = '0' + mm;

    //     return today = dd + '/' + mm + '/' + yyyy + '/' + hours + ':' + min + ':' + secc + ':' + ms;
    // }

    clock = (data) => {
        console.log('first', data)
        let st_date = new Date(data).toISOString()
        var time = moment.utc(st_date).format("DD/MM/YYYY HH:mm:ss");
        console.log('st_date', st_date, time)
        let start = new Date().toString()
        // let start1 = new Date().toUTCString()
        // let start2 = new Date().toLocaleString()  
        console.log('end', start)
        var endtime = moment.utc(start).format("DD/MM/YYYY HH:mm:ss");
        console.log('endtime', endtime)
        // let now = "04/09/2013 15:00:00";
        // let then = "04/09/2013 14:20:30";
        let output = moment.utc(moment(endtime, "DD/MM/YYYY HH:mm:ss").diff(moment(time, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss")
        console.log('output', output)
        return output
    }

    testComp = (data) => {
        let count = this.state.initvalue
        //console.log('first', count++)
        if (data.datasets === undefined) {
            data.datasets = []
        }
        console.log(`data`, data)
        let { comp_name, comp_code, _id } = data

        let datas = {
            component_name: comp_name,
            component_code: comp_code,
            datasets: data.datasets,
            status: data.status,
            positive: data.positive,
            negative: data.negative,
            posble_match: data.posble_match,
            comp_ver: data.comp_ver,
            mod_ver: data.mod_ver,
            _id,
            config_data: this.state.config_data,
            batch_no: count++
        }
        console.log('datas530', datas)
        sessionStorage.removeItem("compData")
        sessionStorage.setItem("compData", JSON.stringify(datas))

        this.setState({ component_code: comp_code, component_name: comp_name, _id })
    }

    deploy_model = (data) => {
        console.log('data', data)
    }

    manageStation = (data) => {
        console.log('data', data)
        sessionStorage.removeItem("InfoComp")
        sessionStorage.setItem("InfoComp", JSON.stringify(data))
    }

    onSearch = (search) => {
        console.log('e', search)
        // clearTimeout(this.state.timeout)
        this.setState({ search, SearchField: search, currentPage_stock: 1 })
        setTimeout(() => {
            this.dataListProcess()
        }, 100);
    }

    dataListProcess = () => {
        try {
            let { search_componentList, search, sorting, currentPage_stock, items_per_page_stock } = this.state
            console.log('serach_componentList', search_componentList, search, sorting)

            if (search) {
                search_componentList = search_componentList.filter(d => d.comp_name.toUpperCase().includes(search.toUpperCase()))
                //   console.log('serach_componentList123', search_componentList)
            }
            if (sorting.field) {
                const reversed = sorting.order === "asc" ? 1 : -1
                search_componentList = search_componentList.sort((a, b) => reversed * a[sorting.field].localeCompare(b[sorting.field]))
            }
            let d = search_componentList.slice((currentPage_stock - 1) * items_per_page_stock, (currentPage_stock - 1) * items_per_page_stock + items_per_page_stock)
            this.setState({ componentList: d, totalItems_stock: search_componentList.length, dataloaded: true })
            // console.log('this.state.', this.state.componentList, this.state.totalItems_stock)
        } catch (error) {
        }
    }

    // getImage = (data1) => {
    //     if (data1 !== undefined) {
    //         // console.log('data1', data1)
    //         let baseurl = 'https://172.16.1.91:8000/'
    //         let result = data1[0].image_path
    //         let output = baseurl + result
    //         return output
    //     }
    //     else {
    //         return null
    //     }
    // }

    getImage = (data1) => {
        if (data1 !== undefined) {
            console.log('data1', data1)
            let baseurl = ImageUrl
            // let baseurl = 'https://172.16.1.91:8001/'
            let data2 = data1.filter((data) => {
                return data.type === 'OK'
            })
            let output = ""
            if (data2.length > 0) {
                console.log('first598', data2[0].image_path)
                let replace = data2[0].image_path.replaceAll("\\", "/");
                let result = replace
                output = baseurl + result
            }
            return output
        }
        else {
            return null
        }
    }

    render() {
        if (this.state.dataloaded) {
            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags>
                            <title>Form Layouts | Skote - React Admin & Dashboard Template</title>
                        </MetaTags>
                        <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                            {/* <Breadcrumbs title="Forms" breadcrumbItem="Form Layouts" /> */}
                            <br />
                            <div>
                                <CardTitle className="text-center" style={{ fontSize: 22 }}> COMPONENT INFORMATION</CardTitle>
                                <Row className="p-2">
                                    <Col lg={12} className="text-end">
                                        <Button onClick={() => this.setState({ addCompModal: true })}>ADD COMPONENTS</Button>
                                    </Col>
                                </Row>
                            </div>

                            <br />

                            <Row>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 0} onClick={() => { this.training_fields(this.state.train_status_notstarted, 0) }}>Training not started</Button>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 1} onClick={() => { this.training_fields(this.state.train_status_train_progress, 1) }}>Training InProgress</Button>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.filter !== 2} onClick={() => { this.train_fields(this.state.train_status_traincompleted, 2) }}>Training completed</Button>
                                    <div>
                                        {
                                            this.state.showacitve_inactive &&
                                            <Row>
                                                <Col>
                                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 1} onClick={() => { this.active_inactive(true, "training completed", 1) }}> Active </Button>
                                                </Col>
                                                <Col>
                                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 2} onClick={() => { this.active_inactive(false, "training completed", 2) }}> Inactive </Button>
                                                </Col>
                                                {/* <Col>
                                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 3} onClick={() => { this.active_inactive("ALL", "training completed", 3) }}> ALL </Button>
                                                </Col> */}
                                            </Row>
                                        }
                                    </div>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 3} onClick={() => { this.training_fields('admin accuracy testing in_progress', 3) }}>Admin Accuracy Testing In_progress</Button>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 4} onClick={() => { this.trained_fields('admin approved trained model', 4) }}>Admin Approved Trained Model</Button>
                                    <div>
                                        {
                                            this.state.chooseacitve_inactive &&
                                            <Row>
                                                <Col>
                                                    <Button color="primary" className="w-md m-1" outline={this.state.chooseFilter !== 1} onClick={() => { this.chooseact_inact(true, "admin approved trained model", 1) }}> Active </Button>
                                                </Col>
                                                <Col>
                                                    <Button color="primary" className="w-md m-1" outline={this.state.chooseFilter !== 2} onClick={() => { this.chooseact_inact(false, "admin approved trained model", 2) }}> Inactive </Button>
                                                </Col>
                                            </Row>
                                        }
                                    </div>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.qc_filter !== 5} onClick={() => { this.qc_sugt_retrain(5) }}>Retrain suggested by QC</Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <SearchField
                                        placeholder="Search Name"
                                        autoFocus
                                        searchText={this.state.SearchField}
                                        onChange={(e) => this.onSearch(e)}
                                        style={{ 'cursor': 'auto' }}
                                    // classNames="test-class w-50"
                                    />
                                </Col>
                            </Row>
                            <div className="table-responsive">

                                <Table striped>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Code</th>
                                            <th>Images</th>
                                            {/* <th>id</th> */}
                                            <th>Training Status</th>
                                            <th>Actions</th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                            <th>Log</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.componentList.map((data, index) => (
                                                <tr key={index} id="recent-list">
                                                    <td>{data.comp_name}</td>
                                                    <td>{data.comp_code}</td>
                                                    <td>
                                                        <Row>
                                                            {
                                                                <img src={data.datasets === undefined ? "" : data.datasets.length !== 0 ? this.getImage(data.datasets) : ""} style={{ width: 100, height: 'auto' }} />
                                                                // <img src={data.datasets !== undefined ? this.getImage(data.datasets) : data.datasets.length === 0 ? "" : data.datasets} style={{ width: 100, height: 'auto' }} />
                                                            }
                                                        </Row>
                                                    </td>
                                                    <td>{data.status}
                                                        {
                                                            data.status === "training_in_progress" &&
                                                            <Row className="col-lg-6">
                                                                {
                                                                    data.training_status === 0 &&
                                                                    <Progress multi>
                                                                        <Progress bar color="primary" value={15} animated></Progress>
                                                                    </Progress>
                                                                }
                                                                {
                                                                    data.training_status === 1 &&
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}>15%</Progress>
                                                                        <Progress bar color="primary" value={15} animated></Progress>
                                                                    </Progress>
                                                                }
                                                                {
                                                                    data.training_status === 2 &&
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={15}>30%</Progress>
                                                                        <Progress bar color="primary" value={10} animated></Progress>
                                                                    </Progress>
                                                                }
                                                                {
                                                                    data.training_status === 3 &&
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={10}>40%</Progress>
                                                                        <Progress bar color="primary" value={60} animated></Progress>
                                                                    </Progress>
                                                                }
                                                                {
                                                                    data.training_status === 4 &&
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={10}></Progress>
                                                                        <Progress bar color="success" value={60}>100%</Progress>
                                                                    </Progress>
                                                                }
                                                                <div style={{ 'textAlign': 'center' }}>
                                                                    {
                                                                        this.clock(data.training_start_time)
                                                                    }
                                                                </div>
                                                            </Row>
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            data.status !== "admin accuracy testing in_progress" && data.status !== "training_in_progress" &&
                                                            data.is_active &&
                                                            <Link to="/training"><Button onClick={() => this.editComp(data)} ><EditOutlined />Edit</Button></Link>
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            data.status !== "admin accuracy testing in_progress" &&
                                                            <div className="square-switch">
                                                                <input type="checkbox" id={"is_active" + index} switch="bool" checked={data.is_active} onChange={(e) => this.onChangeStatus(e.target.checked, data)} />
                                                                <label className="mb-0" htmlFor={"is_active" + index} data-on-label="Yes" data-off-label="No" ></label>
                                                            </div>
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            data.status === "training completed" &&
                                                            data.is_active === true &&
                                                            <Link to="/inspect"><Button onClick={() => this.testComp(data)}>Test</Button></Link>
                                                        }
                                                    </td>
                                                    {/* <td>
                                                        {
                                                            data.status === "admin accuracy testing in_progress" &&
                                                            data.is_active === true &&
                                                            <Link to="/inspect"><Button onClick={() => this.testComp(data)}>Test</Button></Link>
                                                        }
                                                    </td> */}
                                                    {/* <td>
                                                        {
                                                            data.status === "admin approved trained model" &&
                                                            data.is_active === true &&
                                                            <Button onClick={() => this.deploy_model(data)}>Deploy</Button>
                                                        }
                                                    </td> */}
                                                    <td>
                                                        {
                                                            data.status === "admin approved trained model" &&
                                                            data.is_active === true &&
                                                            <Link to="/station_data"><Button onClick={() => this.manageStation(data)}>Manage Station</Button></Link>
                                                        }
                                                    </td>
                                                    {/* <td><Button>Inactive</Button></td>
                                                    <td><Button>Publish</Button></td> */}
                                                    <td><Link to="/comp_log"><Button onClick={() => this.logComp(data)}>Log</Button></Link></td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                            </div>
                            <Modal
                                isOpen={this.state.addCompModal}
                            // toggle={this.tog_standard}
                            >
                                <div className="modal-header">
                                    <h5 className="modal-title mt-0" id="myModalLabel">
                                        Enter Component Details
                                    </h5>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            this.setState({ addCompModal: false })
                                        }
                                        className="close"
                                        data-dismiss="modal"
                                        aria-label="Close"
                                    >
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <Form>
                                        <div className="row mb-4">
                                            <Col sm={12}>
                                                <Label>Component name</Label>
                                                <Input
                                                    type="text"
                                                    className="form-control"
                                                    id="horizontal-compname-Input"
                                                    placeholder="Enter Your"
                                                    value={this.state.component_name}
                                                    maxLength="40"
                                                    onChange={(e) => this.setState({ component_name: e.target.value })}
                                                />
                                                {/* { this.state.component_name } */}
                                            </Col>
                                        </div>
                                        <div className="row mb-4">
                                            <Col sm={12}>
                                                <Label>Component code</Label>
                                                <Input
                                                    type="number"
                                                    className="form-control"
                                                    id="example-number-input"
                                                    placeholder="Enter Your"
                                                    maxLength="32"
                                                    value={this.state.component_code}
                                                    onChange={(e) => this.setState({ component_code: e.target.value })}
                                                />
                                            </Col>
                                        </div>
                                        <div className="row justify-content-end">
                                            <Col sm={9}>
                                                <div className="text-end">
                                                    {/* <Link to="Camera"> */}
                                                    <Button
                                                        //type="submit"
                                                        color="primary"
                                                        className="w-md"
                                                        onClick={() => { this.submitForm() }}
                                                    >
                                                        ADD
                                                    </Button>
                                                    {/* </Link> */}

                                                </div>
                                            </Col>
                                        </div>
                                    </Form>
                                </div>
                            </Modal>
                            {
                                this.state.componentList.length === 0 ?
                                    <div className="text-center">
                                        <h3>No Records found </h3>
                                    </div> : null
                            }

                            {
                                this.state.act_inact_msg ?
                                    // this.state.alertmsg ?
                                    <SweetAlert
                                        showCancel
                                        title={
                                            <Label style={{ fontSize: 20 }}>
                                                Are you sure to deactivate the component
                                                {/* {this.state.comp_name}  */}
                                                <br />
                                                This will remove the station relationship.
                                            </Label>
                                        }
                                        cancelBtnBsStyle="success"
                                        confirmBtnText="Yes"
                                        cancelBtnText="No"
                                        onConfirm={() => this.actInactChange()}
                                        onCancel={() => this.actInactNotChange()}
                                        closeOnClickOutside={false}
                                        style={{ zIndex: 997 }}
                                    >
                                    </SweetAlert> : null
                            }


                        </Container>
                    </div>
                </React.Fragment>
            );
        }
        else {
            return null
        }
    }
}
CRUDComponent.propTypes = {
    history: PropTypes.any.isRequired,
};
export default CRUDComponent;