

import React, { Component } from 'react'
import urlSocket from './urlSocket'
import './Css/style.css'
import { Dropdown, Menu, Checkbox, Radio, Space, InputNumber } from 'antd';
import {
    Container, CardTitle, Button,
    Table, Label, Row, Col,
    CardBody, Card, Modal
} from 'reactstrap';
import { Td } from 'react-super-responsive-table';
import Swal from 'sweetalert2';
import { Link, Prompt, Route } from 'react-router-dom';
import PropTypes from "prop-types"
import { rectangle } from 'leaflet';



export default class profileCrud extends Component {
    static propTypes = { history: PropTypes.any.isRequired }
    constructor(props) {
        super(props);
        this.state = {
            comp_name: '',
            comp_code: '',
            profile_data: '',
            approved_data: [],
            ok_checked: false,
            ng_checked: false,
            checkedData: [],
            ok_model: [],
            ng_model: [],
            okModelwindow: false,
            ngModelwindow: false,
            modal_backdrop: false,
            new_ok: [],
            comp_opt: [{ M: 'com', value: 'compulsory' }, { M: 'opt', value: 'optional' }],
            save: false,

            all_any: [{ M: 'All', value: 'all' }, { M: 'Any', value: 'any' }],
        }
        this.tog_okbackdrop = this.tog_okbackdrop.bind(this)
        this.tog_ngbackdrop = this.tog_ngbackdrop.bind(this)
    }

    componentDidMount = () => {
        this.fetchProfileManageData();
    }

    fetchProfileManageData = async () => {
        var compInfo = JSON.parse(sessionStorage.getItem("profile_Info"));

        // 12-02-24
        let InfoComp = JSON.parse(sessionStorage.getItem("InfoComp"));
        let page_info;
        // let page_info = InfoComp.page_info;
        let station_comp_list = false;
        // if (InfoComp && InfoComp.page_info === "/entry_scrn") {
        //     station_comp_list = true;
        // }

        console.log('57compInfo, InfoComp : ', compInfo, InfoComp)
        if (compInfo.page_info) {
            page_info = compInfo.page_info
        }
        let comp_name = compInfo.comp_name
        let comp_code = compInfo.comp_code
        let profile_name = compInfo.profile_name
        let position = compInfo.position
        this.setState({
            comp_name: comp_name,
            comp_code: comp_code,
            comp_id: compInfo.comp_id,
            profile_name: profile_name,
            profile_id: compInfo._id,
            given_profile: compInfo,

            // 12-02-24
            page_info,
            station_comp_list
        })
        this.get_prof_data(comp_name, comp_code, position)
        this.get_model_data(comp_name, comp_code, profile_name)
        window.addEventListener('beforeunload', this.handleBeforeUnload);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }


    handleBeforeUnload = (event) => {
        if (this.state.save) {
            event.preventDefault();
            event.returnValue = ''; // Required for some browsers
        }
    }

    handleNavigateBack = () => {
        if (this.state.save) {
            window.history.pushState(null, null, window.location.href);
        }
    }


    get_prof_data = async (comp_name, comp_code, position) => {
        try {
            const response = await urlSocket.post('/profileCrud', { 'comp_name': comp_name, 'comp_code': comp_code, 'position': position }, { mode: 'no-cors' });
            console.log('response5353', response.data)
            const modifiedData = response.data.map(item => {
                if (item.result_mode === 'ok') {
                    return { ...item, ok_checked: true, ng_checked: false };
                } else if (item.result_mode === 'ng') {
                    return { ...item, ok_checked: false, ng_checked: true };
                } else if (item.result_mode === 'both') {
                    return { ...item, ok_checked: true, ng_checked: true };
                } else {
                    return item; // Handle other cases if needed
                }
            });

            console.log('data122 ', modifiedData);
            this.setState({ approved_data: modifiedData });
        } catch (error) {
            console.log('error', error);
        }
    }

    get_model_data = async (comp_name, comp_code, profile_name) => {
        try {
            console.log('this try wokrs')
            await urlSocket.post('/get_model', { 'comp_name': comp_name, 'comp_code': comp_code, 'profile_name': profile_name },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('data77', data)
                    // if (data !== undefined && data !== '') {
                    //     this.setState({ ok_model: data[0].profile_data.ok_model_data, ng_model: data[0].profile_data.ng_model_data })
                    // }
                    console.log('data86', data)
                    if (data[0].ok_allany && data[0].ok_opt) {
                        console.log('130 inside if ')
                        this.setState({
                            ok_allany: data[0].ok_allany,
                            ok_opt: data[0].ok_opt,
                        })
                    }

                    if (data[0].ng_allany && data[0].ng_opt) {
                        this.setState({
                            ng_allany: data[0].ng_allany,
                            ng_opt: data[0].ng_opt
                        })
                    }

                    let sampledata = this.reverseTransformSamplesList(data)
                    const filteredList = sampledata.filter(item => item.ok_checked === true);
                    const filteredListng = sampledata.filter(item => item.ng_checked === true);
                    console.log('data159 ', filteredList)
                    this.setState({ ok_model: filteredList, ng_model: filteredListng })
                    // console.log('sampledata', filteredList1)
                    // this.setState({ batch_id: data })


                    // 13-02-24
                    this.setAllAnyState(filteredList, 'ok');
                    this.setAllAnyState(filteredListng, 'ng');
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {

        }

    }

    setAllAnyState = (model, type) => {
        const undefinedChecked = model.some(data => data[`${type}_radio_checked`] === undefined);
        const isOptional = model.some(data => data[`${type}_required`] === "optional");
        const isOptionalLen = model.filter(data => data[`${type}_required`] === "optional").length;

        this.setState({ [`${type}AllAny`]: !undefinedChecked && isOptional, [`${type}_opt_len`]: isOptionalLen });

        console.log(`155 ${type}AllAny : `, !undefinedChecked && isOptional)
    }

    reverseTransformSamplesList = (transformedList) => {
        console.log('transformedList', transformedList)
        if (!transformedList || !Array.isArray(transformedList)) {
            console.error('Invalid input: transformedList must be a non-empty array.');
            return []; // or handle the error as per your requirement
        }

        const samplesList = [];

        transformedList.forEach((item) => {
            item.profile_data.ok_model_data.forEach((okModelData) => {
                let okModelItem = {
                    model_name: okModelData.model_name,
                    model_ver: okModelData.model_ver,
                    comp_zip: okModelData.comp_zip,
                    thres: okModelData.thres,
                    model_ver_ok_rank: okModelData.ok_rank,
                    model_ver_ng_rank: okModelData.ng_rank,
                    ok_radio_checked: okModelData.radio_checked,
                    ok_required: okModelData.required,
                    ok_checked: okModelData.ok_model_checked,
                    ng_checked: false, // Default value for ng_checked in reverse transformation
                    comp_code: item.comp_code,
                    comp_name: item.comp_name,
                    ok_pos: okModelData.pos,
                    _id: item._id,
                };
                if ('sift_count_avg' in okModelData) {
                    okModelItem.sift_count_avg = okModelData.sift_count_avg
                }
                samplesList.push(okModelItem);
            });

            item.profile_data.ng_model_data.forEach((ngModelData) => {
                let ngModelItem = {
                    model_name: ngModelData.model_name,
                    model_ver: ngModelData.model_ver,
                    comp_zip: ngModelData.comp_zip,
                    thres: ngModelData.thres,
                    model_ver_ok_rank: ngModelData.ok_rank,
                    model_ver_ng_rank: ngModelData.ng_rank,
                    ng_radio_checked: ngModelData.radio_checked,
                    ng_required: ngModelData.required,
                    ok_checked: false, // Default value for ok_checked in reverse transformation
                    ng_checked: ngModelData.ng_model_checked,
                    ng_pos: ngModelData.pos,
                    comp_code: item.comp_code,
                    comp_name: item.comp_name,
                    _id: item._id,
                };
                if ('sift_count_avg' in ngModelData) {
                    ngModelItem.sift_count_avg = ngModelData.sift_count_avg
                }
                samplesList.push(ngModelItem);
            });
        });

        return samplesList;
    };



    back = () => {
        console.log('this back functiosn works');
        const { save, page_info } = this.state;
        // if (save === false) {
        //     // 12-02-24
        //     this.props.history.push(page_info)
        // }
        // else {
            Swal.fire({
                title: "Do you want to save the changes?",
                icon: "warning",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Save",
                denyButtonText: `Don't save`
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    this.save()
                } else if (result.isDenied) {
                    Swal.fire("Changes are not saved", "", "info");
                    this.setState({ save: false })
                    this.props.history.push(page_info)
                }
            });
        // }
    }


    // this  two functions are for showing the data while clicking add models button in OK model and NG m 
    selectOkModel = () => {
        const { approved_data } = this.state;
        const selectokmodel = approved_data
            .filter(data => data.ok_checked === true)
            .sort((a, b) => a.model_ver_ok_rank - b.model_ver_ok_rank);

        console.log('selectokmodel:', selectokmodel);
        this.setState({ selectokmodel });
    }


    selectNGModel = () => {
        const { approved_data } = this.state;
        const selectngmodel = approved_data
            .filter(data => data.ng_checked === true)
            .sort((a, b) => a.model_ver_ng_rank - b.model_ver_ng_rank);

        console.log('selectngmodel:', selectngmodel);
        this.setState({ selectngmodel });
    }





    tog_okbackdrop = () => {
        this.setState(prevState => ({
            okModelwindow: !prevState.okModelwindow,
        }))
        this.selectOkModel()
        this.removeBodyCss()
    }


    tog_ngbackdrop = () => {
        this.setState(prevState => ({
            ngModelwindow: !prevState.ngModelwindow,
        }))
        this.selectNGModel()
        this.removeBodyCss()
    }

    removeBodyCss = () => {
        document.body.classList.add("no_padding")
    }


    handleChange = (e, data, type) => {
        const { approved_data } = this.state;
        const checkedData = [];

        const dataIndex = approved_data.findIndex(item => item.model_name === data.model_name && item.model_ver === data.model_ver);

        const updatedApprovedData = [...approved_data];

        if (dataIndex !== -1) {
            if (type === 'OK') {
                updatedApprovedData[dataIndex].ok_model_checked = e.target.checked;
                console.log('updatedApprovedData388', updatedApprovedData)
            } else {
                updatedApprovedData[dataIndex].ng_model_checked = e.target.checked;

            }
        }
        checkedData.push(updatedApprovedData[dataIndex]);
        this.setState((prevState) => ({
            approved_data: updatedApprovedData,
            checkedData: [...prevState.checkedData, ...checkedData],
        }));
    };





    handleAdd = () => {
        const { checkedData } = this.state;
        console.log('checkedData', checkedData)
        const uniqueCheckedData = checkedData.reduce((uniqueData, currentData) => {
            const existingIndex = uniqueData.findIndex(item => item.model_name === currentData.model_name && item.model_ver === currentData.model_ver);
            if (existingIndex === -1) {
                uniqueData.push(currentData);
            }
            return uniqueData;
        }, []);
        const okModelData = uniqueCheckedData.filter(data => data.ok_model_checked);
        let ok_model = okModelData.map((data, index) => {

            if (data.pos === undefined) {
                data.ok_pos = index + 1
            }
            return data
        })
        console.log('ok_model270', ok_model)
        this.setState({
            ok_model: ok_model,
            okModelwindow: false,
            ngModelwindow: false,
            save: true,

            ok_allany: null,
            ok_opt: null
        });

        this.setAllAnyState(ok_model, 'ok');
    };


    handleAddng = () => {
        const { checkedData } = this.state;
        const uniqueCheckedData = checkedData.reduce((uniqueData, currentData) => {
            const existingIndex = uniqueData.findIndex(item => item.model_name === currentData.model_name && item.model_ver === currentData.model_ver);

            if (existingIndex === -1) {
                uniqueData.push(currentData);
            }

            return uniqueData;
        }, []);

        const ngModelData = uniqueCheckedData.filter(data => data.ng_model_checked);
        let ng_model = ngModelData.map((data, index) => {

            if (data.pos === undefined) {
                data.ng_pos = index + 1
            }
            return data
        })
        this.setState({
            ng_model: ng_model,
            okModelwindow: false,
            ngModelwindow: false,
            save: true,

            ng_allany: null,
            ng_opt: null
        });

        this.setAllAnyState(ng_model, 'ng');
    };


    save = () => {
        const {
            ok_model, ng_model, new_ok, profile_name, page_info,
            ok_allany, ng_allany, ok_opt, ng_opt, ok_opt_len, ng_opt_len,
            given_profile
        } = this.state;
        console.log('ok_model, ng_model', ok_model, ng_model);
        console.log('ok_allany, ng_allany, ok_opt, ng_opt, ok_opt_len, ng_opt_len : ', ok_allany, ng_allany, ok_opt, ng_opt, ok_opt_len, ng_opt_len)

        // ok and ng selected
        let ok_sltd = 0;
        let ng_sltd = 0;

        ok_model.map((data, id) => {
            if (data.ok_radio_checked !== undefined) {
                ok_sltd += 1;
            }
        });

        ng_model.map((data, id) => {
            if (data.ng_radio_checked !== undefined) {
                ng_sltd += 1;
            }
        });

        console.log('380  : ok_sltd, ok_model.length, ng_sltd, ng_model.length :', ok_sltd, ok_model.length, ng_sltd, ng_model.length)

        if (ok_model.length !== 0 && ng_model.length !== 0) {
            console.log('both OK and NG selected');
            if (ok_sltd === ok_model.length && ng_sltd === ng_model.length) {
                console.log('380 Both OK and NG models all are selected');

                let ok_allany_val = ok_allany;
                let ok_opt_val = ok_opt;
                let ng_allany_val = ng_allany;
                let ng_opt_val = ng_opt;

                if (ok_opt_len === 0) {
                    ok_allany_val = null;
                    ok_opt_val = null;
                }
                if (ng_opt_len === 0) {
                    ng_allany_val = null;
                    ng_opt_val = null;
                }

                if (ok_opt_len > 0 && (ok_allany === undefined || ok_allany === null)) {
                    console.log('446 choose all any for OK');

                    Swal.fire({
                        icon: 'info',
                        title: 'Choose All/Any for OK models',
                        confirmButtonText: 'OK',
                    });
                }
                else if (ng_opt_len > 0 && (ng_allany === undefined || ng_allany === null)) {
                    console.log('446 choose all any for NG');

                    Swal.fire({
                        icon: 'info',
                        title: 'Choose All/Any for NG models',
                        confirmButtonText: 'OK',
                    });
                }
                else {
                    // 12-02-24
                    console.log('data480 ', ok_model, ng_model)
                    const ok_file = this.transformSamplesList(ok_model, 'ok');
                    const ng_file = this.transformSamplesList(ng_model, 'ng');
                    let ng_data = ng_file[0].ng_model_data
                    let ok_data = ok_file[0].ok_model_data
                    delete ok_file[0].ok_model_data
                    ok_file[0].model_data = { 'ok_model_data': ok_data, 'ng_model_data': ng_data }
                    console.log('data486 ', ok_file)

                    try {
                        console.log('this try wokrs')
                        urlSocket.post('/addprofilemodel',
                            {
                                'profiledata': ok_file,
                                'profile_name': profile_name,
                                'ok_allany': ok_allany_val,
                                'ng_allany': ng_allany_val,
                                'ok_opt': ok_opt_val,
                                'ng_opt': ng_opt_val,
                                'profile_id': given_profile._id,
                                'comp_id': given_profile.comp_id
                            },
                            { mode: 'no-cors' })
                            .then((response) => {
                                let data = response.data.msg
                                console.log('data157', data)
                                if (data === 'success') {
                                    Swal.fire({
                                        title: "Good job!",
                                        text: "Profile Saved",
                                        icon: "success"
                                    });
                                    this.setState({ save: false })
                                    // data starts
                                    let updateChoosenProf = {};

                                    if (response.data.updatedProfile.length > 0) {
                                        let profileData = response.data.updatedProfile.filter(data_ => data_._id === given_profile._id);
                                        console.log('profileData634', profileData)
                                        // updateChoosenProf.choosenProf = profileData[0];
                                        updateChoosenProf.profData = response.data.updatedProfile;
                                    }
                                    console.log('636updateChoosenProf', updateChoosenProf)
                                    sessionStorage.setItem("updatedProfile", JSON.stringify(updateChoosenProf));

                                    this.props.history.push(page_info);
                                }
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                    } catch (error) {

                    }
                }
            }
            else if (ok_sltd !== ok_model.length && ng_sltd !== ng_model.length) {
                console.log('380 Both are not fully selected');

                Swal.fire({
                    icon: 'warning',
                    title: 'For OK & NG models, Compulsory/Optional required',
                    confirmButtonText: 'OK',
                });
            }
            else if (ok_sltd !== ok_model.length) {
                console.log('380 OK models are not fully selected');

                Swal.fire({
                    icon: 'warning',
                    title: 'For OK models, Compulsory/Optional required',
                    confirmButtonText: 'OK',
                });
            }
            else if (ng_sltd !== ng_model.length) {
                console.log('380 NG models are not fully selected');

                Swal.fire({
                    icon: 'warning',
                    title: 'For NG models, Compulsory/Optional required',
                    confirmButtonText: 'OK',
                });
            }

        } else if (ok_model.length === 0) {
            console.log('only NG selected');
            Swal.fire({
                icon: 'warning',
                title: 'Select OK models to Continue...',
                confirmButtonText: 'OK',
            });
        } else if (ng_model.length === 0) {
            console.log('only OK selected');
            Swal.fire({
                icon: 'warning',
                title: 'Select NG models to Continue...',
                confirmButtonText: 'OK',
            });
        }
    }

    transformSamplesList = (samplesList, type) => {
        console.log('data581 ', samplesList)
        const transformedList = [];

        samplesList.forEach((item) => {
            const existingItem = transformedList.find(
                (transformedItem) =>
                    transformedItem.comp_code === item.comp_code &&
                    transformedItem.comp_name === item.comp_name
            );

            let modelData = {
                model_name: item.model_name,
                model_ver: item.model_ver,
                comp_zip: item.comp_zip,
                thres: item.thres,
                ok_rank: item.model_ver_ok_rank,
                ng_rank: item.model_ver_ng_rank,
                // regionselection : item.regionselection,
                // required:item.required,
                [type === 'ok' ? 'ok_model_checked' : 'ng_model_checked']: item[type === 'ok' ? 'ok_checked' : 'ng_checked'],
                [type === 'ok' ? 'pos' : 'pos']: item[type === 'ok' ? 'ok_pos' : 'ng_pos'],
                [type === 'ok' ? 'required' : 'required']: item[type === 'ok' ? 'ok_required' : 'ng_required'],
                [type === 'ok' ? 'radio_checked' : 'radio_checked']: item[type === 'ok' ? 'ok_radio_checked' : 'ng_radio_checked'],
            };

            if ('sift_count_avg' in item) {
                modelData.sift_count_avg = item.sift_count_avg
            }
            if (item.regionselection) {
                modelData.rectangles = item.rectangles;
            }

            if (existingItem) {
                existingItem[type === 'ok' ? 'ok_model_data' : 'ng_model_data'].push(modelData);
            } else {
                const newItem = {
                    comp_code: item.comp_code,
                    comp_name: item.comp_name,
                    datasets: item.datasets,
                    model_status: item.model_status,
                    regionselection: item.regionselection,
                    [type === 'ok' ? 'ok_model_data' : 'ng_model_data']: [modelData],
                    _id: item._id,
                };
                transformedList.push(newItem);
            }
        });


        return transformedList;
    };

    radioonChange = (e, data, index, type) => {
        const { ok_model, ng_model } = this.state;
        const model = type === 'ok' ? ok_model : ng_model;
        const allAny = type === 'ok' ? 'okAllAny' : 'ngAllAny';
        const opt_len = type === 'ok' ? 'ok_opt_len' : 'ng_opt_len';

        const opt_allany = type === 'ok' ? 'ok_allany' : 'ng_allany';
        const opt = type === 'ok' ? 'ok_opt' : 'ng_opt';

        data[`${type}_radio_checked`] = true;
        data[`${type}_required`] = e.target.value;
        model[index] = data;

        const isUndefined = model.some(data => data[`${type}_radio_checked`] === undefined);
        const isOptional = model.some(data => data[`${type}_required`] === "optional");
        const isOptionalLen = model.filter(data => data[`${type}_required`] === "optional").length;
        this.setState({
            [`${type}_model`]: model,
            save: true,
            [allAny]: !isUndefined && isOptional,
            [opt_len]: isOptionalLen,
            [opt_allany]: null,
            [opt]: null
        });

        console.log('type, isOptionalLen : ', type, isOptionalLen)
    }



    ok_posup = (data, index) => {
        const { ok_model } = this.state;
        if (index !== 0) {
            console.log('data,index416', data, index)
            console.log('ok_model[index]', ok_model[index - 1])
            let value = ok_model[index - 1]
            ok_model[index - 1] = data
            ok_model[index - 1].ok_pos -= 1
            ok_model[index] = value
            ok_model[index].ok_pos += 1
            console.log('ok_model420', ok_model)
            this.setState({ ok_model, save: true, })
        }
        else {
            Swal.fire({
                title: "error",
                text: "Already in 1st Position",
                icon: "error"
            });
        }

    }

    ng_posup = (data, index) => {
        const { ng_model } = this.state;
        if (index !== 0) {
            console.log('data,index416', data, index)
            console.log('ng_model[index]', ng_model[index - 1])
            let value = ng_model[index - 1]
            ng_model[index - 1] = data
            ng_model[index - 1].ng_pos -= 1
            ng_model[index] = value
            ng_model[index].ng_pos += 1
            console.log('ng_model', ng_model)
            this.setState({ ng_model, save: true, })
        }
        else {
            Swal.fire({
                title: "error",
                text: "Already in 1st Position",
                icon: "error"
            });
        }

    }


    ok_posdown = (data, index) => {
        const { ok_model } = this.state;
        console.log('data,index416', ok_model.length, index)
        if (ok_model.length !== index + 1) {
            console.log('ok_model[index]', ok_model[index + 1])
            let value = ok_model[index + 1]
            ok_model[index + 1] = data
            ok_model[index + 1].ok_pos += 1
            ok_model[index] = value
            ok_model[index].ok_pos -= 1
            console.log('ok_model451', ok_model)
            this.setState({ ok_model, save: true, })
        }
        else {
            Swal.fire({
                title: "error",
                text: "Already in last Position",
                icon: "error"
            });
        }
    }

    ng_posdown = (data, index) => {
        const { ng_model } = this.state;
        if (ng_model.length !== index + 1) {
            console.log('data,index416', data, index)
            console.log('ng_model[index]', ng_model[index + 1])
            let value = ng_model[index + 1]
            ng_model[index + 1] = data
            ng_model[index + 1].ng_pos += 1
            ng_model[index] = value
            ng_model[index].ng_pos -= 1
            console.log('ng_model', ng_model)
            this.setState({ ng_model, save: true, })
        }
        else {
            Swal.fire({
                title: "error",
                text: "Already in 1st Position",
                icon: "error"
            });
        }

    }

    radioAllAny = (type, e) => {
        const { ok_model, ng_model, ok_opt_len, ng_opt_len } = this.state;

        console.log('value changed', e.target.value, e.target.checked);

        if (type === 'ok') {
            if (e.target.value === 'all') {
                this.setState({ ok_allany: e.target.value, ok_opt: ok_opt_len })
            }
            else {
                this.setState({
                    ok_allany: e.target.value,
                    ok_opt: ok_opt_len > 1 ? ok_opt_len - 1 : ok_opt_len
                });

            }
        }
        else if (type === 'ng') {
            if (e.target.value === 'all') {
                this.setState({ ng_allany: e.target.value, ng_opt: ng_opt_len })
            }
            else {
                this.setState({
                    ng_allany: e.target.value,
                    ng_opt: ng_opt_len > 1 ? ng_opt_len - 1 : ng_opt_len
                })
            }
        }

        this.setState({ save: true })


    }

    handleOptCount = (e, type) => {
        console.log('726 value : ', e, type)
        // this.setState({ ok_opt: e.target.value });
        const opt = type === 'ok' ? 'ok_opt' : 'ng_opt';

        this.setState({ [opt]: e })
    }


    render() {
        const {
            approved_data, ok_model, ng_model, selectngmodel,
            selectokmodel, station_comp_list
        } = this.state;
        return (
            <>
                <div className='page-content'>
                    <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                        <div>
                            <Button className='mt-2' onClick={() => this.back()}>Back</Button>
                            <CardTitle className="text-center" style={{ fontSize: 22, marginTop: '-31px' }}> PROFILE MANAGEMENT</CardTitle>
                        </div>
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>Component Name</th>
                                    <th>Component code</th>
                                    <th>Profile Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <Td>{this.state.comp_name}</Td>
                                    <Td>{this.state.comp_code}</Td>
                                    <Td>{this.state.profile_name}</Td>
                                </tr>
                            </tbody>
                        </Table>
                        <Row>
                            <Col lg={4}>
                                <div className='table-responsive'>
                                    <Table striped>
                                        <thead>
                                            <tr>
                                                <th colSpan="5" className='text-center'>Approve Models</th>
                                            </tr>
                                            <tr>
                                                <th>Model Name</th>
                                                <th>OK</th>
                                                <th>OK Rank</th>
                                                <th>NG</th>
                                                <th>NG Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {approved_data.map((data, index) => (
                                                <tr key={index} id="recent-list">
                                                    <td>{`${data.model_name} - ${'V'}${data.model_ver}`}</td>
                                                    <td>
                                                        <Checkbox
                                                            className="custom-checkbox"
                                                            defaultChecked={data.ok_checked}
                                                            style={{ cursor: 'not-allowed' }}
                                                            disabled
                                                        />
                                                    </td>
                                                    <td>{data.model_ver_ok_rank}</td>
                                                    <td>
                                                        <Checkbox
                                                            className="custom-checkbox"
                                                            defaultChecked={data.ng_checked}
                                                            disabled
                                                            style={{ cursor: 'not-allowed' }}
                                                        />
                                                    </td>
                                                    <td>{data.model_ver_ng_rank}</td>
                                                </tr>
                                            ))}

                                        </tbody>
                                    </Table>
                                </div>
                            </Col>
                            <Col lg={8}> {/* from this onwards table of OK model and NG Models starts */}
                                <div>
                                    <Row>
                                        <Col lg={6}>
                                            <Table>
                                                <thead>
                                                    <tr>
                                                        <th colSpan="3" className='text-center'>OK Models</th>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan="3" className='text-center'>
                                                            <Button onClick={this.tog_okbackdrop}>Add Model</Button>
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th>Model Name</th>
                                                        <th>OK Rank</th>
                                                        <th>Compulsory / Optional</th>
                                                        <th>Up / Down</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ok_model.length !== 0 ? (
                                                        ok_model.map((data, index) => (
                                                            <tr key={index}>
                                                                <td width={'25%'}>{`${data.model_name} - ${'V'}${data.model_ver}`}</td>
                                                                {/* <td>{data.model_ver_ok_rank}</td> */}
                                                                <td width={'20%'}>{data.model_ver_ok_rank || data.ok_rank}</td>
                                                                <td>
                                                                    {/* <Radio.Group onChange={this.onChange} value={this.state.value}> */}
                                                                    <Radio.Group
                                                                        onChange={(e) => { this.radioonChange(e, data, index, 'ok') }}
                                                                        value={this.state.comp_opt.find(option => option.value === data.ok_required)?.value}
                                                                    >
                                                                        {this.state.comp_opt.map(option => (
                                                                            <Radio key={option.value} value={option.value}>{option.M}</Radio>
                                                                        ))}
                                                                    </Radio.Group>
                                                                </td>
                                                                <td width={'10%'}>
                                                                    <i className="mdi mdi-18px mdi-arrow-down-circle" onClick={() => { this.ok_posdown(data, index) }} ></i>
                                                                    <i className="mdi mdi-18px mdi-arrow-up-circle" onClick={() => { this.ok_posup(data, index) }}></i>
                                                                </td>

                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr key="no-models">
                                                            <td colSpan="5" className='text-center'>NO model is added</td>
                                                        </tr>
                                                    )}

                                                </tbody>

                                            </Table>
                                            {
                                                this.state.okAllAny &&
                                                <div className='mt-3 text-center'> {/* Apply mt-3 for top margin and text-center for centering */}
                                                    <div>
                                                        {/* Select No. of Optional <span style={{fontWeight: 'bold', color: 'green'}}>OK</span> models */}
                                                        Select no. of Optional models should say <span style={{ fontWeight: 'bold', color: 'green' }}>OK</span>
                                                    </div>
                                                    <div className="mt-2 d-flex justify-content-center"> {/* Apply Bootstrap's justify-content-center class to center the Radio.Group */}
                                                        <Radio.Group
                                                            onChange={(e) => { this.radioAllAny('ok', e) }}
                                                            value={this.state.ok_allany}
                                                        // value={this.state.all_any.find(option => option.value === this.state.ok_allany)?.value}
                                                        >
                                                            {this.state.all_any.map(option => (
                                                                <Radio key={option.value} value={option.value}>{option.M}</Radio>
                                                            ))}
                                                        </Radio.Group>
                                                    </div>
                                                    <div className='my-2 d-flex flex-column justify-content-center'>
                                                        <div>
                                                            {this.state.ok_allany === 'any' && (
                                                                <InputNumber
                                                                    min={1}
                                                                    max={
                                                                        this.state.ok_opt_len < 2 ? this.state.ok_opt_len : this.state.ok_opt_len - 1
                                                                    }
                                                                    defaultValue={this.state.ok_opt}
                                                                    onChange={(e) => this.handleOptCount(e, 'ok')}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            }

                                            <Modal
                                                isOpen={this.state.okModelwindow}
                                                toggle={this.tog_okbackdrop}
                                                scrollable={true}
                                                backdrop={'static'}
                                                centered={true}
                                                id="staticBackdrop"
                                            >
                                                <div className="modal-header">
                                                    <h5 className="modal-title" id="staticBackdropLabel">OK Model</h5>
                                                    <Button type="button" className="btn-close" onClick={() =>
                                                        this.setState({ okModelwindow: false })
                                                    } aria-label="Close"></Button>
                                                </div>
                                                <div className="modal-body">
                                                    <Table>
                                                        <thead>
                                                            <tr>
                                                                <th>Model Name</th>
                                                                <th>OK Rank</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selectokmodel !== undefined && selectokmodel.map((data, index) => (
                                                                <tr key={index}>
                                                                    <td>{`${data.model_name} - V${data.model_ver}`}</td>
                                                                    <td>{`${data.model_ver_ok_rank} `}</td>
                                                                    <td>
                                                                        <Checkbox
                                                                            // onChange={()=>{this.handleChange(data)}}
                                                                            onChange={(e) => { this.handleChange(e, data, 'OK') }}
                                                                            checked={data?.ok_model_checked || false}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                                <div className="modal-footer">
                                                    <Button type="button" onClick={() =>
                                                        this.setState({ okModelwindow: false })
                                                    }>Close</Button>
                                                    <Button type="button" className="btn btn-primary" onClick={() => { this.handleAdd() }}>Add</Button>
                                                </div>
                                            </Modal>
                                        </Col>
                                        <Col lg={6}>
                                            <Table>
                                                <thead>
                                                    <tr >
                                                        <th colSpan="3" className='text-center'>NG Models</th>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan="3" className='text-center'>
                                                            <Button onClick={this.tog_ngbackdrop}>Add Model</Button>
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th>Model Name</th>
                                                        <th>NG Rank</th>
                                                        <th>Compulsory / Optional</th>
                                                        <th>Up / Down</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ng_model.length !== 0 ? (
                                                        this.state.ng_model.map((data, index) => (
                                                            <tr key={index}>
                                                                <td width={'25%'}>{`${data.model_name} - ${'V'}${data.model_ver}`}</td>
                                                                <td width={'20%'}>{data.model_ver_ng_rank || data.ng_rank}</td>
                                                                <td>
                                                                    <Radio.Group
                                                                        onChange={(e) => { this.radioonChange(e, data, index, 'ng') }}
                                                                        value={this.state.comp_opt.find(option => option.value === data.ng_required)?.value}
                                                                    >
                                                                        {this.state.comp_opt.map(option => (
                                                                            <Radio key={option.value} value={option.value}>{option.M}</Radio>
                                                                        ))}
                                                                    </Radio.Group>
                                                                </td>
                                                                <td width={'10%'}>
                                                                    <i className="mdi mdi-18px mdi-arrow-down-circle" onClick={() => { this.ng_posdown(data, index) }}></i>
                                                                    <i className="mdi mdi-18px mdi-arrow-up-circle" onClick={() => { this.ng_posup(data, index) }}></i>
                                                                </td>

                                                                {/* <td>{'V'}{data.model_ver}</td> */}
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr key="no-models">
                                                            <td colSpan="5" className='text-center'>NO model is added</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                            {
                                                this.state.ngAllAny &&
                                                <div className='mt-3 text-center'> {/* Apply mt-3 for top margin and text-center for centering */}
                                                    <div>
                                                        Select no. of Optional models should say <span style={{ fontWeight: 'bold', color: 'red' }}>NG</span>
                                                    </div>
                                                    <div className="mt-2 d-flex justify-content-center"> {/* Apply Bootstrap's justify-content-center class to center the Radio.Group */}
                                                        <Radio.Group
                                                            onChange={(e) => { this.radioAllAny('ng', e) }}
                                                            value={this.state.ng_allany}
                                                        >
                                                            {this.state.all_any.map(option => (
                                                                <Radio key={option.value} value={option.value}>{option.M}</Radio>
                                                            ))}
                                                        </Radio.Group>
                                                    </div>
                                                    <div className='my-2 d-flex flex-column justify-content-center'>
                                                        <div>
                                                            {this.state.ng_allany === 'any' && (
                                                                <InputNumber
                                                                    min={1}
                                                                    max={
                                                                        this.state.ng_opt_len < 2 ? this.state.ng_opt_len : this.state.ng_opt_len - 1}
                                                                    defaultValue={this.state.ng_opt}
                                                                    onChange={(e) => this.handleOptCount(e, 'ng')}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            }

                                            <Modal
                                                isOpen={this.state.ngModelwindow}
                                                toggle={this.tog_ngbackdrop}
                                                scrollable={true}
                                                backdrop={'static'}
                                                centered={true}
                                                id="staticBackdrop"
                                            >
                                                <div className="modal-header">
                                                    <h5 className="modal-title" id="staticBackdropLabel">NG Model</h5>
                                                    <Button type="button" className="btn-close" onClick={() =>
                                                        this.setState({ ngModelwindow: false })
                                                    } aria-label="Close"></Button>
                                                </div>

                                                <div className="modal-body">
                                                    <Table>
                                                        <thead>
                                                            <tr>
                                                                <th>Model Name</th>
                                                                <th>NG Rank</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selectngmodel !== undefined && selectngmodel.map((data, index) => (
                                                                <tr key={index}>
                                                                    <td>{`${data.model_name} - V${data.model_ver}`}</td>
                                                                    <td>{data.model_ver_ng_rank}</td>
                                                                    <td><Checkbox
                                                                        onChange={(e) => { this.handleChange(e, data, 'NG') }}
                                                                        checked={data?.ng_model_checked || false}
                                                                    /></td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                                <div className="modal-footer">
                                                    <Button type="button" onClick={() =>
                                                        this.setState({ ngModelwindow: false })
                                                    }>Close</Button>
                                                    <Button type="button" className="btn btn-primary" onClick={() => { this.handleAddng() }}>Add</Button>
                                                </div>
                                            </Modal>
                                        </Col>
                                    </Row>

                                </div>
                            </Col>
                        </Row>
                        <Row className='text-end mt-3 '>
                            <Col>
                                {/* // 12-02-24 */}
                                {
                                    station_comp_list ?
                                        <Button color='primary' disabled={!this.state.save} onClick={() => { this.save() }} >
                                            Save
                                        </Button>
                                        :
                                        <>
                                            <Button
                                                className='mx-1'
                                                style={{
                                                    backgroundColor: this.state.save ? 'green' : 'red',
                                                    color: 'white',
                                                    cursor: this.state.save ? 'pointer' : 'not-allowed'
                                                }}
                                                disabled={!this.state.save} onClick={() => { this.save() }}
                                            >Save</Button>
                                        </>
                                }

                                <Route path="/" render={() => null} /> {/* Render a route for navigation */}
                                <Prompt
                                    when={this.state.save}
                                    message="You have unsaved changes. Are you sure you want to leave?"
                                />
                            </Col>

                        </Row>

                    </Container>
                </div>
            </>
        )
    }
}