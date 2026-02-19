

import React, { Component } from 'react'
import urlSocket from './urlSocket'
import './Css/style.css'
import './profileCrud.css'
import { Dropdown, Menu, Checkbox, Radio, Space, InputNumber } from 'antd';
import {
    Container, CardTitle, Button,
    Table, Label, Row, Col,
    CardBody, Card, Modal,
    Spinner,
    ModalBody
} from 'reactstrap';
import { Td } from 'react-super-responsive-table';
import Swal from 'sweetalert2';
import { Link, Prompt, Route } from 'react-router-dom';
import PropTypes from "prop-types"
import Breadcrumbs from 'components/Common/Breadcrumb';



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

            isEditMode: false,
            profileCopyData: {},
            isRevertingChanges: false,

            assigned_stations: [],
            isConfirmationOpen: false,

            isNotBoth: false,
            saveMsg: '',

            // region for vision
            overAll_testing: true,
            copied_data: [],
            region_wise_testing: false,
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

        console.log('data____1 compInfo, ', compInfo)
        if (compInfo.page_info) {
            page_info = compInfo.page_info
        }

        // 
        if ('overAll_testing' in compInfo && 'region_wise_testing' in compInfo) {
            this.setState({
                overAll_testing: compInfo.overAll_testing,
                region_wise_testing: compInfo.region_wise_testing,
            });
        }
        // 
        let comp_name = compInfo.comp_name
        let comp_code = compInfo.comp_code
        let profile_name = compInfo.profile_name
        let position = compInfo.position
        const profile_id = compInfo._id
        this.setState({
            comp_name: comp_name,
            comp_code: comp_code,
            comp_id: compInfo.comp_id,
            profile_name: profile_name,
            profile_id: compInfo._id,
            given_profile: compInfo,
            isEditMode: compInfo?.acceptance_ratio ? false : true,

            // 12-02-24
            page_info,
            station_comp_list
        })

        await this.get_prof_data(comp_name, comp_code, position)
        await this.get_model_data(comp_name, comp_code, profile_name, profile_id)

        // this.get_prof_data(comp_name, comp_code, position)
        //     .then(() => {
        //         this.get_model_data(comp_name, comp_code, profile_name);
        //     })
        //     .catch(error => {
        //         console.error("Error loading data:", error);
        //     });
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

            // 
            console.log('/profileCrud ', response)
            // const hasBoth = response.data.some(item => item.result_mode === 'both');

            // if (!hasBoth) {
            //     // Show Swal alerts only if "both" is not present
            //     response.data.forEach(item => {
            //         if (item.result_mode === 'ok') {
            //             Swal.fire({
            //                 title: 'Only OK model versions available',
            //                 icon: 'warning',
            //                 confirmButtonText: 'OK'
            //             });
            //             this.setState({
            //                 isNotBoth: true,
            //                 saveMsg: "For better accuracy and repeatability, please add models that can classify NG as well. Only then will you be permitted to save this profile."
            //             })
            //         } else if (item.result_mode === 'ng') {
            //             Swal.fire({
            //                 title: 'Only NG model versions available',
            //                 icon: 'warning',
            //                 confirmButtonText: 'OK'
            //             });
            //             this.setState({
            //                 isNotBoth: true,
            //                 saveMsg: "For better accuracy and repeatability, please add models that can classify OK as well. Only then will you be permitted to save this profile."
            //             })
            //         }
            //     });
            // }
            const responseData = response.data.versions;
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }
            else {
                const hasBoth = responseData.some(item => item.result_mode === 'both');
                const countOk = responseData.filter(item => item.result_mode === 'ok').length;
                const countNg = responseData.filter(item => item.result_mode === 'ng').length;
                const totalRows = responseData.length;

                const rectanglesTemp = response?.data?.rectangles || [];

                if (!hasBoth && (countOk > 0 || countNg > 0)) {
                    if (countOk === totalRows) {
                        Swal.fire({
                            title: 'Selection Required!',
                            text: 'Please select NG model',
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        });
                    } else if (countNg === totalRows) {
                        Swal.fire({
                            title: 'Selection Required!',
                            text: 'Please select OK model',
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        });
                    }
                }

                // 

                console.log('/profileCrud ', response.data)
                const modifiedData = response.data.versions.map(item => {
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

                console.log('modifiedData ', modifiedData);
                this.setState({ approved_data: modifiedData, rectangles: rectanglesTemp });
            }
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
                    if (data.error === "Tenant not found") {
                        this.error_handler(data.error);
                    }
                    else {
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
                        console.log('data____2 data[0], ', data[0]);

                        if ('overAll_testing' in data[0] && 'region_wise_testing' in data[0]) {
                            this.setState({
                                overAll_testing: data[0].overAll_testing,
                                region_wise_testing: data[0].region_wise_testing
                            })
                        }
                        // this.setState({
                        //     overAll_testing: data[0].overAll_testing, region_wise_testing: data[0].region_wise_testing
                        // }, 
                        // // () => {
                        // //     this.filteredArray()}
                        // )
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
                    }

                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.error('error ', error)
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
        if (!Array.isArray(transformedList)) {
            console.error('Invalid input: transformedList must be a non-empty array.');
            return [];
        }

        const samplesList = transformedList.flatMap(({ profile_data, comp_code, comp_name, _id }) => {
            const processModelData = (models, isOk) =>
                models.map(model => {
                    const {
                        model_name, model_ver, comp_zip, thres,
                        ok_rank, ng_rank, radio_checked,
                        required, pos, ok_model_checked, ng_model_checked,
                        sift_count_avg
                    } = model;

                    console.log('model314 ', model)

                    const commonData = {
                        model_name,
                        model_ver,
                        comp_zip,
                        thres,
                        model_ver_ok_rank: ok_rank,
                        model_ver_ng_rank: ng_rank,
                        comp_code,
                        comp_name,
                        _id,
                        sift_count_avg: sift_count_avg ?? undefined,
                        rectangles: model.rectangles || [],
                    };

                    return isOk
                        ? {
                            ...commonData,
                            ok_radio_checked: radio_checked,
                            ok_required: required,
                            ok_checked: ok_model_checked,
                            ng_checked: false,
                            ok_pos: pos
                        }
                        : {
                            ...commonData,
                            ng_radio_checked: radio_checked,
                            ng_required: required,
                            ok_checked: false,
                            ng_checked: ng_model_checked,
                            ng_pos: pos
                        };
                });

            const okItems = processModelData(profile_data.ok_model_data || [], true);
            const ngItems = processModelData(profile_data.ng_model_data || [], false);

            return [...okItems, ...ngItems];
        });

        return samplesList;
    };

    // reverseTransformSamplesList = (transformedList) => {
    //     console.log('transformedList', transformedList)
    //     if (!transformedList || !Array.isArray(transformedList)) {
    //         console.error('Invalid input: transformedList must be a non-empty array.');
    //         return []; // or handle the error as per your requirement
    //     }

    //     const samplesList = [];

    //     transformedList.forEach((item) => {
    //         item.profile_data.ok_model_data.forEach((okModelData) => {
    //             let okModelItem = {
    //                 model_name: okModelData.model_name,
    //                 model_ver: okModelData.model_ver,
    //                 comp_zip: okModelData.comp_zip,
    //                 thres: okModelData.thres,
    //                 model_ver_ok_rank: okModelData.ok_rank,
    //                 model_ver_ng_rank: okModelData.ng_rank,
    //                 ok_radio_checked: okModelData.radio_checked,
    //                 ok_required: okModelData.required,
    //                 ok_checked: okModelData.ok_model_checked,
    //                 ng_checked: false, // Default value for ng_checked in reverse transformation
    //                 comp_code: item.comp_code,
    //                 comp_name: item.comp_name,
    //                 ok_pos: okModelData.pos,
    //                 _id: item._id,
    //             };
    //             if ('sift_count_avg' in okModelData) {
    //                 okModelItem.sift_count_avg = okModelData.sift_count_avg
    //             }
    //             samplesList.push(okModelItem);
    //         });

    //         item.profile_data.ng_model_data.forEach((ngModelData) => {
    //             let ngModelItem = {
    //                 model_name: ngModelData.model_name,
    //                 model_ver: ngModelData.model_ver,
    //                 comp_zip: ngModelData.comp_zip,
    //                 thres: ngModelData.thres,
    //                 model_ver_ok_rank: ngModelData.ok_rank,
    //                 model_ver_ng_rank: ngModelData.ng_rank,
    //                 ng_radio_checked: ngModelData.radio_checked,
    //                 ng_required: ngModelData.required,
    //                 ok_checked: false, // Default value for ok_checked in reverse transformation
    //                 ng_checked: ngModelData.ng_model_checked,
    //                 ng_pos: ngModelData.pos,
    //                 comp_code: item.comp_code,
    //                 comp_name: item.comp_name,
    //                 _id: item._id,
    //             };
    //             if ('sift_count_avg' in ngModelData) {
    //                 ngModelItem.sift_count_avg = ngModelData.sift_count_avg
    //             }
    //             samplesList.push(ngModelItem);
    //         });
    //     });

    //     return samplesList;
    // };



    back = () => {
        console.log('this back functiosn works', this.state.page_info);
        const { save, page_info } = this.state;
        if (save === false) {
            // 12-02-24
            this.props.history.push(page_info)
        }
        else {
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
        }
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

    saveProfileWithConfirmation = async () => {
        const { given_profile, assigned_stations } = this.state;
        console.log('/given_profile ', given_profile, assigned_stations);

        if (given_profile?.acceptance_ratio) {
            this.setState({ isConfirmationOpen: true })
            // Swal.fire({
            //     title: "Warning",
            //     text: "Saving these changes will require you to retake the profile test to establish a new acceptance ratio. Without a valid acceptance ratio, this profile cannot be assigned to a station. Do you want to continue?",
            //     icon: "warning",
            //     showCancelButton: true,
            //     confirmButtonText: "Yes, Save",
            //     cancelButtonText: "Cancel",
            //     reverseButtons: true,
            // }).then((result) => {
            //     if (result.isConfirmed) {
            //         this.save();
            //     }
            // });
        }
        else {
            this.save();
        }
    }

    closeConfirmation = () => {
        this.setState({ isConfirmationOpen: false })
    }


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
                                'comp_id': given_profile.comp_id,
                                'overAll_testing': this.state.overAll_testing,
                                'region_wise_testing': this.state.region_wise_testing,
                            },
                            { mode: 'no-cors' })
                            .then((response) => {
                                let data = response.data.msg
                                if (response.data.error === "Tenant not found") {
                                    this.error_handler(response.data.error);
                                }
                                else {
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
                // region_selection : item.region_selection,
                // required:item.required,
                [type === 'ok' ? 'ok_model_checked' : 'ng_model_checked']: item[type === 'ok' ? 'ok_checked' : 'ng_checked'],
                [type === 'ok' ? 'pos' : 'pos']: item[type === 'ok' ? 'ok_pos' : 'ng_pos'],
                [type === 'ok' ? 'required' : 'required']: item[type === 'ok' ? 'ok_required' : 'ng_required'],
                [type === 'ok' ? 'radio_checked' : 'radio_checked']: item[type === 'ok' ? 'ok_radio_checked' : 'ng_radio_checked'],
            };

            if ('sift_count_avg' in item) {
                modelData.sift_count_avg = item.sift_count_avg
            }

            console.log('check region_selection, ', item.region_selection, this.state.rectangles, samplesList)

            // if (item.region_selection) {
            //     modelData.rectangles = item.rectangles;
            // }

            if (this.state.region_wise_testing) {
                modelData.rectangles = item.rectangles || [];
            }

            if (existingItem) {
                existingItem[type === 'ok' ? 'ok_model_data' : 'ng_model_data'].push(modelData);
            } else {
                const newItem = {
                    comp_code: item.comp_code,
                    comp_name: item.comp_name,
                    datasets: item.datasets,
                    model_status: item.model_status,
                    region_selection: item.region_selection,
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


    changeEditMode = async () => {
        // const {
        //     ok_model, ng_model, comp_opt, all_any,
        //     okAllAny, ok_allany, ok_opt_len, ok_opt,
        //     ngAllAny, ng_allany, ng_opt_len, ng_opt,
        // } = this.state;
        // const copiedProfileData ={
        //     ok_model, 
        //     ng_model, 
        //     comp_opt: null,
        //     all_any: null,
        //     okAllAny: null,
        //     ok_allany: null,
        //     ok_opt_len: null,
        //     ok_opt: null,
        //     ngAllAny: null,
        //     ng_allany: null,
        //     ng_opt_len: null,
        //     ng_opt: null,
        // }
        // this.setState({ profileCopyData: copiedProfileData })
        // console.log('copiedProfileData ', copiedProfileData)
        this.setState(prevState => ({
            isEditMode: !prevState.isEditMode
        }))
        // Swal.fire({
        //     title: "Warning",
        //     text: "Editing this profile will reset its acceptance ratio. You will need to complete the profile test again to establish a new acceptance ratio before assigning it to a station. Do you want to proceed?",
        //     icon: "warning",
        //     showCancelButton: true,
        //     confirmButtonText: "Yes, Edit",
        //     cancelButtonText: "Cancel",
        //     reverseButtons: true,
        //   }).then((result) => {
        //     if (result.isConfirmed) {
        //         this.setState(prevState => ({
        //             isEditMode: !prevState.isEditMode
        //         }))
        //     }
        //   });
    }

    closeEditMode = async () => {
        this.setState({ isRevertingChanges: true, save: false })
        await this.fetchProfileManageData();
        // const copiedProfileData = this.state.profileCopyData
        this.setState(prevState => ({
            ...prevState, // Retain other state properties
            isEditMode: false,
            isRevertingChanges: false
            // ...prevState.profileCopyData // Merge copiedProfileData into state
        }));
    }

    overallTest = (e) => {
        this.setState({ overAll_testing: e.target.checked, ok_model: [], ng_model: [], save: true },
            // ()=>{this.filteredArray()}
        )
    }

    region_wiseTest = (e) => {
        console.log('e.target.checked820', e.target.checked)
        this.setState({
            region_wise_testing: e.target.checked,
            ok_model: [],
            ng_model: [],
            save: true
        },
            // ()=>{this.filteredArray()}
        )
        console.log('this.state.approved_data', this.state.approved_data)
    }

    error_handler = (error) => {
        sessionStorage.removeItem("authUser");
        this.props.history.push("/login");
    }

    render() {
        const {
            approved_data, ok_model, ng_model, selectngmodel,
            selectokmodel, station_comp_list
        } = this.state;
        return (
            <>
                <div className='page-content'>
                    <Breadcrumbs
                        title="PROFILE MANAGEMENT"
                        isBackButtonEnable={true}
                        gotoBack={this.back}
                    />
                    <Container fluid>
                        <Card>
                            <CardBody>
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
                                <label className='text-center'>Testing Method</label>
                                <Row className='my-2 mb-2'>
                                    <Col>
                                        <Checkbox
                                            checked={this.state.overAll_testing}
                                            onChange={(e) => { this.overallTest(e) }}
                                        >
                                            Overall Testing
                                        </Checkbox>
                                        <Checkbox
                                            checked={this.state.region_wise_testing}
                                            onChange={(e) => { this.region_wiseTest(e) }}
                                        >
                                            Region-Wise Testing
                                        </Checkbox>
                                    </Col>
                                </Row>
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
                                            {
                                                this.state.given_profile?.acceptance_ratio ?
                                                    <Button
                                                        size='sm'
                                                        color={this.state.isEditMode ? "danger" : "primary"}
                                                        onClick={() => {
                                                            if (this.state.isEditMode) { this.closeEditMode() }
                                                            else { this.changeEditMode() }
                                                        }}
                                                    >
                                                        {this.state.isEditMode ? "Leave Edit Mode" : "Switch to Edit Mode"}
                                                    </Button>
                                                    : null
                                            }
                                            {/*  */}
                                            <Card className={`${this.state.isEditMode ? "edit-mode" : "edit-mode-disabled"}`}>
                                                <CardBody>
                                                    {/* <h5 className="text-center">
                                                {this.state.isEditMode ? "Edit Mode" : "View Mode"}
                                            </h5> */}
                                                    {
                                                        this.state.isRevertingChanges ?
                                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                                                                <Spinner color="primary" />
                                                                <h5 className="mt-4">
                                                                    <strong>Reverting Changes...</strong>
                                                                </h5>
                                                            </div>
                                                            :
                                                            <Row>
                                                                <Col lg={6}>
                                                                    <Table>
                                                                        <thead>
                                                                            <tr>
                                                                                <th colSpan="4" className='text-center'>OK Models</th>
                                                                            </tr>
                                                                            <tr>
                                                                                <th colSpan="4" className='text-center'>
                                                                                    <Button color='primary' className='btn btn-sm w-md'
                                                                                        onClick={this.tog_okbackdrop}
                                                                                        disabled={!this.state.isEditMode}
                                                                                    >
                                                                                        Add Model
                                                                                    </Button>
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
                                                                                                disabled={!this.state.isEditMode}
                                                                                            >
                                                                                                {this.state.comp_opt.map(option => (
                                                                                                    <Radio key={option.value} value={option.value}>{option.M}</Radio>
                                                                                                ))}
                                                                                            </Radio.Group>
                                                                                        </td>
                                                                                        <td width={'10%'}>
                                                                                            <i className="mdi mdi-18px mdi-arrow-down-circle"
                                                                                                style={{ cursor: this.state.isEditMode ? 'auto' : 'not-allowed' }}
                                                                                                onClick={() => {
                                                                                                    if (this.state.isEditMode) { this.ok_posdown(data, index) }
                                                                                                }}
                                                                                            ></i>
                                                                                            <i className="mdi mdi-18px mdi-arrow-up-circle"
                                                                                                style={{ cursor: this.state.isEditMode ? 'auto' : 'not-allowed' }}
                                                                                                onClick={() => {
                                                                                                    if (this.state.isEditMode) { this.ok_posup(data, index) }
                                                                                                }}
                                                                                            ></i>
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
                                                                                    disabled={!this.state.isEditMode}
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
                                                                                            disabled={!this.state.isEditMode}
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </Col>
                                                                <Col lg={6}>
                                                                    <Table>
                                                                        <thead>
                                                                            <tr >
                                                                                <th colSpan="4" className='text-center'>NG Models</th>
                                                                            </tr>
                                                                            <tr>
                                                                                <th colSpan="4" className='text-center'>
                                                                                    <Button color='primary' className='btn btn-sm w-md'
                                                                                        onClick={this.tog_ngbackdrop}
                                                                                        disabled={!this.state.isEditMode}
                                                                                    >
                                                                                        Add Model
                                                                                    </Button>
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
                                                                                                disabled={!this.state.isEditMode}
                                                                                            >
                                                                                                {this.state.comp_opt.map(option => (
                                                                                                    <Radio key={option.value} value={option.value}>{option.M}</Radio>
                                                                                                ))}
                                                                                            </Radio.Group>
                                                                                        </td>
                                                                                        <td width={'10%'}>
                                                                                            <i className="mdi mdi-18px mdi-arrow-down-circle"
                                                                                                style={{ cursor: this.state.isEditMode ? 'auto' : 'not-allowed' }}
                                                                                                onClick={() => {
                                                                                                    if (this.state.isEditMode) { this.ng_posdown(data, index) }
                                                                                                }}
                                                                                            ></i>
                                                                                            <i className="mdi mdi-18px mdi-arrow-up-circle"
                                                                                                style={{ cursor: this.state.isEditMode ? 'auto' : 'not-allowed' }}
                                                                                                onClick={() => {
                                                                                                    if (this.state.isEditMode) { this.ng_posdown(data, index) }
                                                                                                }}
                                                                                            ></i>
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
                                                                                    disabled={!this.state.isEditMode}
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
                                                                                            disabled={!this.state.isEditMode}
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </Col>
                                                            </Row>
                                                    }

                                                </CardBody>
                                            </Card>
                                            {/*  */}

                                        </div>
                                    </Col>
                                </Row>
                                <Row className='text-end mt-3 '>
                                    <Col>
                                        {
                                            this.state.isNotBoth ?
                                                <p className="text-danger fw-bold d-flex align-items-center justify-content-end">
                                                    <i className="bx bx-error-circle me-2"></i>
                                                    {this.state.saveMsg}
                                                </p>
                                                :
                                                station_comp_list ?
                                                    <Button size='sm' color='primary' disabled={!this.state.save} onClick={() => { this.saveProfileWithConfirmation() }} >
                                                        Save Profile
                                                    </Button>
                                                    :
                                                    <>
                                                        <Button
                                                            size='sm'
                                                            className='mx-1'
                                                            style={{
                                                                backgroundColor: this.state.save ? 'green' : 'red',
                                                                color: 'white',
                                                                cursor: this.state.save ? 'pointer' : 'not-allowed'
                                                            }}
                                                            disabled={!this.state.save} onClick={() => { this.saveProfileWithConfirmation() }}
                                                        >Save Profile</Button>
                                                    </>
                                        }

                                        <Route path="/" render={() => null} /> {/* Render a route for navigation */}
                                        <Prompt
                                            when={this.state.save}
                                            message="You have unsaved changes. Are you sure you want to leave?"
                                        />
                                    </Col>

                                </Row>

                            </CardBody>
                        </Card>

                    </Container>

                    {/* Modal 1 - ok modal window */}
                    {this.state.okModelwindow ?
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
                                                        disabled={!this.state.isEditMode}
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
                        : null}


                    {/* Modal 2 - ng modal window */}
                    {this.state.ngModelwindow ?
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
                        : null}

                    {/* Modal 3 - profile save with confirmation */}
                    {
                        this.state.isConfirmationOpen ?
                            <Modal isOpen={this.state.isConfirmationOpen} toggle={() => this.closeConfirmation()()} centered>
                                <ModalBody>
                                    <p>
                                        Saving these changes will require you to retake the profile test to establish a new acceptance ratio.
                                        Without a valid acceptance ratio, this profile cannot be assigned to a station.
                                    </p>
                                    {
                                        this.state.assigned_stations?.length > 0 ?
                                            <>
                                                <p>If you save changes in this profile, it will be deleted from the following stations:</p>
                                                <Table responsive striped bordered size="sm">
                                                    <thead>
                                                        <tr>
                                                            <th>S.No</th>
                                                            <th>Station Name</th>
                                                            {/* <th>Location</th> */}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {this.state.assigned_stations.map((station, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{station}</td>
                                                                {/* <td>{station.location}</td> */}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </>
                                            : null
                                    }
                                    <div>
                                        <p>Do you want to continue?</p>
                                    </div>
                                    <div className='d-flex my-2 justify-content-end gap-2'>
                                        <Button size='sm' color="danger" onClick={this.save}>
                                            Continue, Save
                                        </Button>
                                        <Button size='sm' color="secondary" onClick={() => this.closeConfirmation()}>
                                            Cancel
                                        </Button>
                                    </div>
                                </ModalBody>
                            </Modal>
                            : null
                    }
                </div>
            </>
        )
    }
}