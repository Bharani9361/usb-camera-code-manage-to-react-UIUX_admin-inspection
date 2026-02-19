

import React, { useState, useEffect, useCallback } from 'react';
import urlSocket from './urlSocket';
import './Css/style.css';
import './profileCrud.css';
import { Dropdown, Menu, Checkbox, Radio, Space, InputNumber, Spin } from 'antd';
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
import PropTypes from "prop-types";
import Breadcrumbs from 'components/Common/Breadcrumb';
import { Tag } from "antd";
import { set } from 'lodash';

const StageProfileCrud = (props) => {
    // Component info states
    const [comp_name, setComp_name] = useState('');
    const [comp_code, setComp_code] = useState('');
    const [profile_name, setProfile_name] = useState('');
    const [profile_id, setProfile_id] = useState('');
    const [comp_id, setComp_id] = useState('');
    const [given_profile, setGiven_profile] = useState({});
    const [page_info, setPage_info] = useState('');
    const [station_comp_list, setStation_comp_list] = useState(false);

    // Data lists states
    const [profile_data, setProfile_data] = useState('');
    const [approved_data, setApproved_data] = useState([]);
    const [ok_model, setOk_model] = useState([]);
    const [ng_model, setNg_model] = useState([]);
    const [checkedData, setCheckedData] = useState([]);
    const [selectokmodel, setSelectokmodel] = useState([]);
    const [selectngmodel, setSelectngmodel] = useState([]);
    const [rectangles, setRectangles] = useState([]);

    // Modal and UI states
    const [okModelwindow, setOkModelwindow] = useState(false);
    const [ngModelwindow, setNgModelwindow] = useState(false);
    const [modal_backdrop, setModal_backdrop] = useState(false);
    const [new_ok, setNew_ok] = useState([]);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [isNotBoth, setIsNotBoth] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    // Edit mode states
    const [isEditMode, setIsEditMode] = useState(false);
    console.log('isEditMode', isEditMode)
    const [profileCopyData, setProfileCopyData] = useState({});
    const [isRevertingChanges, setIsRevertingChanges] = useState(false);

    // Save and selection states
    const [save, setSave] = useState(false);
    const [ok_checked, setOk_checked] = useState(false);
    const [ng_checked, setNg_checked] = useState(false);
    const [assigned_stations, setAssigned_stations] = useState([]);

    // Configuration arrays (static)
    const comp_opt = [{ M: 'com', value: 'compulsory' }, { M: 'opt', value: 'optional' }];
    const all_any = [{ M: 'All', value: 'all' }, { M: 'Any', value: 'any' }];

    // All/Any and optional states
    const [ok_allany, setOk_allany] = useState(null);
    const [ng_allany, setNg_allany] = useState(null);
    const [ok_opt, setOk_opt] = useState(null);
    const [ng_opt, setNg_opt] = useState(null);
    const [ok_opt_len, setOk_opt_len] = useState(0);
    const [ng_opt_len, setNg_opt_len] = useState(0);
    const [okAllAny, setOkAllAny] = useState(false);
    const [ngAllAny, setNgAllAny] = useState(false);

    // Testing states
    const [overAll_testing, setOverAll_testing] = useState(true);
    const [region_wise_testing, setRegion_wise_testing] = useState(false);
    const [copied_data, setCopied_data] = useState([]);
    const [loading, setLoading] = useState(false);



    const [stageData, setstageData] = useState([]);
    const [cmprStageData, setCmprStageData] = useState([]);
    const [stageName, setstageName] = useState('');
    const [stageCode, setstageCode] = useState('');
    const [stageID, setstageID] = useState('');

    const [selectedCamData, setSelectedCamData] = useState('');

    console.log('cmprStageData', cmprStageData)



    // Fetch initial data
    const fetchProfileManageData = useCallback(async () => {

        var compInfo = JSON.parse(sessionStorage.getItem("profile_Info"));
        console.log('compInfo?.acceptance_ratio', compInfo)
        let InfoComp = JSON.parse(sessionStorage.getItem("InfoComp"));
        console.log('InfoComp', InfoComp)
        let station_comp_list_temp = false;
        let page_info_temp = '';
        if (compInfo.page_info) {
            page_info_temp = compInfo.page_info;
        }
        if ('overAll_testing' in compInfo && 'region_wise_testing' in compInfo) {
            setOverAll_testing(compInfo.overAll_testing);
            setRegion_wise_testing(compInfo.region_wise_testing);
        }
        let comp_name_temp = compInfo.comp_name;
        let comp_code_temp = compInfo.comp_code;
        let profile_name_temp = compInfo.profile_name;
        let stage_profiles = compInfo.stage_profiles;
        console.log('stage_profiles', stage_profiles)

        let position = compInfo.position;
        const profile_id_temp = compInfo._id;
        setCmprStageData(stage_profiles);
        setComp_name(comp_name_temp);
        setComp_code(comp_code_temp);
        setComp_id(compInfo?.comp_id);
        setProfile_name(profile_name_temp);
        setProfile_id(profile_id_temp);
        setGiven_profile(compInfo);
        setIsEditMode(compInfo?.acceptance_ratio ? false : true);
        setPage_info(page_info_temp);
        setStation_comp_list(station_comp_list_temp);
        await getStageData(comp_name, comp_code, compInfo?.comp_id)

        // await get_prof_data(stageData, comp_code_temp, position ,camer);
        // await get_model_data(comp_name_temp, comp_code_temp, profile_name_temp, profile_id_temp,);

        window.addEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Cleanup
    useEffect(() => {
        fetchProfileManageData();
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);


    const getStageData = async (comp_name, comp_code, comp_id) => {
        console.log('comp_name, comp_code, comp_id', comp_name, comp_code, comp_id)
        try {
            const response = await urlSocket.post('/api/stage/get_stagedata', {
                'comp_name': comp_name,
                'comp_code': comp_code,
                'comp_id': comp_id
            }, { mode: 'no-cors' });


            const data = response.data;

            if (data.error === "Tenant not found") {
                error_handler(data.error);
                return;
            }

            console.log('data169', data)
            setstageData(data)

            console.log('responsedata153', response)

        } catch (error) {
            console.error('error ', error);
        }
    };

    const handleBeforeUnload = (event) => {
        if (save) {
            event.preventDefault();
            event.returnValue = '';
        }
    };

    const handleNavigateBack = () => {
        if (save) {
            window.history.pushState(null, null, window.location.href);
        }
    };

    // Data fetching functions
    const get_prof_data = async (stageData, stagename, camera, given_profile) => {
        try {
            setLoading(true);
            const response = await urlSocket.post('/api/stage/profileCrud_stg', {
                'stageData': stageData,
                'stagename': stagename,
                'camera': camera,
                'profile': given_profile
            }, { mode: 'no-cors' });
            console.log('/profileCrud_stg ', response);
            const responseData = response.data.versions;
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                error_handler(response.data.error);
            } else {
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
                console.log('/profileCrud ', response.data);
                const modifiedData = responseData.map(item => {
                    if (item.result_mode === 'ok') {
                        return { ...item, ok_checked: true, ng_checked: false };
                    } else if (item.result_mode === 'ng') {
                        return { ...item, ok_checked: false, ng_checked: true };
                    } else if (item.result_mode === 'both') {
                        return { ...item, ok_checked: true, ng_checked: true };
                    } else {
                        return item;
                    }
                });
                console.log('modifiedData ', modifiedData);
                setApproved_data(modifiedData);
                setRectangles(rectanglesTemp);
            }
        } catch (error) {
            console.log('error', error);

        } finally {
            setLoading(false); // ✅ Stop loader regardless of success/failure
        }
    };

    // const get_model_data = async (stageData, stagename, camera, given_profile) => {
    //     try {
    //         console.log('this try wokrs');
    //         await urlSocket.post('/api/stage/get_model_stg', {
    //             'stageData': stageData,
    //             'stagename': stagename,
    //             'camera': camera,
    //             'profile': given_profile
    //         },
    //             { mode: 'no-cors' })
    //             .then((response) => {
    //                 let data = response.data;
    //                 console.log('data243', data)
    //                 if (data.error === "Tenant not found") {
    //                     error_handler(data.error);
    //                 } else {
    //                     console.log('data77', data);
    //                     console.log('data86', data);
    //                     if (data[0].ok_allany && data[0].ok_opt) {
    //                         console.log('130 inside if ');
    //                         setOk_allany(data[0].ok_allany);
    //                         setOk_opt(data[0].ok_opt);
    //                     }
    //                     if (data[0].ng_allany && data[0].ng_opt) {
    //                         setNg_allany(data[0].ng_allany);
    //                         setNg_opt(data[0].ng_opt);
    //                     }
    //                     console.log('data____2 data[0], ', data[0]);
    //                     if ('overAll_testing' in data[0] && 'region_wise_testing' in data[0]) {
    //                         setOverAll_testing(data[0].overAll_testing);
    //                         setRegion_wise_testing(data[0].region_wise_testing);
    //                     }
    //                     let sampledata = reverseTransformSamplesList(data);
    //                     const filteredList = sampledata.filter(item => item.ok_checked === true);
    //                     const filteredListng = sampledata.filter(item => item.ng_checked === true);
    //                     console.log('data159 ', filteredList);
    //                     setOk_model(filteredList);
    //                     setNg_model(filteredListng);
    //                     setAllAnyState(filteredList, 'ok');
    //                     setAllAnyState(filteredListng, 'ng');
    //                 }
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });
    //     } catch (error) {
    //         console.error('error ', error);
    //     }
    // };


    // const get_model_data = async (stageData, stagename, camera, given_profile) => {
    //     try {
    //         console.log('this try works');

    //         await urlSocket.post('/api/stage/get_model_stg', {
    //             stageData,
    //             stagename,
    //             camera,
    //             profile: given_profile
    //         }, { mode: 'no-cors' })
    //             .then((response) => {
    //                 let data = response.data;

    //                 if (data.error === "Tenant not found") {
    //                     error_handler(data.error);
    //                     return;
    //                 }


    //                 const stageProfile = data?.stage_profiles?.[stagename]?.[camera.label];

    //                 if (!stageProfile) {
    //                     console.warn('⚠️ No matching stage/camera data found for', stageName, selectedCamData);
    //                     return;
    //                 }


    //                 if (stageProfile.ok_allany && stageProfile.ok_opt) {
    //                     setOk_allany(stageProfile.ok_allany);
    //                     setOk_opt(stageProfile.ok_opt);
    //                 }

    //                 if (stageProfile.ng_allany && stageProfile.ng_opt) {
    //                     setNg_allany(stageProfile.ng_allany);
    //                     setNg_opt(stageProfile.ng_opt);
    //                 }

    //                 if ('overAll_testing' in stageProfile && 'region_wise_testing' in stageProfile) {
    //                     setOverAll_testing(stageProfile.overAll_testing);
    //                     setRegion_wise_testing(stageProfile.region_wise_testing);
    //                 }

    //                 let sampledata = reverseTransformSamplesList(data, stagename, camera.label);

    //                 const filteredList = sampledata.filter(item => item.ok_checked === true);
    //                 const filteredListng = sampledata.filter(item => item.ng_checked === true);



    //                 setOk_model(filteredList);
    //                 setNg_model(filteredListng);

    //                 setAllAnyState(filteredList, 'ok');
    //                 setAllAnyState(filteredListng, 'ng');
    //             })
    //             .catch((error) => {
    //                 console.error('API error:', error);
    //             });

    //     } catch (error) {
    //         console.error('error ', error);
    //     }
    // };

    const get_model_data = async (stageData, stagename, camera, given_profile) => {
        try {
            console.log('this try works');
            setLoading(true); // 🌀 Start loader

            const response = await urlSocket.post(
                '/api/stage/get_model_stg',
                {
                    stageData,
                    stagename,
                    camera,
                    profile: given_profile
                },
                { mode: 'no-cors' }
            );

            const data = response.data;

            if (data.error === "Tenant not found") {
                error_handler(data.error);
                return;
            }

            const stageProfile = data?.stage_profiles?.[stagename]?.[camera.label];

            if (!stageProfile) {
                console.warn('⚠️ No matching stage/camera data found for', stagename, camera);
                return;
            }

            if (stageProfile.ok_allany && stageProfile.ok_opt) {
                setOk_allany(stageProfile.ok_allany);
                setOk_opt(stageProfile.ok_opt);
            }

            if (stageProfile.ng_allany && stageProfile.ng_opt) {
                setNg_allany(stageProfile.ng_allany);
                setNg_opt(stageProfile.ng_opt);
            }

            if ('overAll_testing' in stageProfile && 'region_wise_testing' in stageProfile) {
                setOverAll_testing(stageProfile.overAll_testing);
                setRegion_wise_testing(stageProfile.region_wise_testing);
            }

            // ✅ Process models
            const sampledata = reverseTransformSamplesList(data, stagename, camera.label);
            const filteredList = sampledata.filter(item => item.ok_checked === true);
            const filteredListng = sampledata.filter(item => item.ng_checked === true);

            setOk_model(filteredList);
            setNg_model(filteredListng);

            setAllAnyState(filteredList, 'ok');
            setAllAnyState(filteredListng, 'ng');
        } catch (error) {
            console.error('error ', error);
        } finally {
            setLoading(false); // ✅ Stop loader regardless of success/failure
        }
    };


    const setAllAnyState = (model, type) => {
        const undefinedChecked = model.some(data => data[`${type}_radio_checked`] === undefined);
        const isOptional = model.some(data => data[`${type}_required`] === "optional");
        const isOptionalLen = model.filter(data => data[`${type}_required`] === "optional").length;
        if (type === 'ok') {
            setOkAllAny(!undefinedChecked && isOptional);
            setOk_opt_len(isOptionalLen);
        } else {
            setNgAllAny(!undefinedChecked && isOptional);
            setNg_opt_len(isOptionalLen);
        }
        console.log(`155 ${type}AllAny : `, !undefinedChecked && isOptional);
    };

    // const reverseTransformSamplesList = (transformedList) => {
    //     console.log('transformedList', transformedList)
    //     if (!Array.isArray(transformedList)) {
    //         console.error('Invalid input: transformedList must be a non-empty array.');
    //         return [];
    //     }
    //     const samplesList = transformedList.flatMap(({ profile_data, comp_code, comp_name, _id }) => {
    //         const processModelData = (models, isOk) =>
    //             models.map(model => {
    //                 const {
    //                     model_name, model_ver, comp_zip, thres,
    //                     ok_rank, ng_rank, radio_checked,
    //                     required, pos, ok_model_checked, ng_model_checked,
    //                     sift_count_avg
    //                 } = model;
    //                 console.log('model314 ', model);
    //                 const commonData = {
    //                     model_name,
    //                     model_ver,
    //                     comp_zip,
    //                     thres,
    //                     model_ver_ok_rank: ok_rank,
    //                     model_ver_ng_rank: ng_rank,
    //                     comp_code,
    //                     comp_name,
    //                     _id,
    //                     sift_count_avg: sift_count_avg ?? undefined,
    //                     rectangles: model.rectangles || [],
    //                 };
    //                 return isOk
    //                     ? {
    //                         ...commonData,
    //                         ok_radio_checked: radio_checked,
    //                         ok_required: required,
    //                         ok_checked: ok_model_checked,
    //                         ng_checked: false,
    //                         ok_pos: pos
    //                     }
    //                     : {
    //                         ...commonData,
    //                         ng_radio_checked: radio_checked,
    //                         ng_required: required,
    //                         ok_checked: false,
    //                         ng_checked: ng_model_checked,
    //                         ng_pos: pos
    //                     };
    //             });
    //         const okItems = processModelData(profile_data?.ok_model_data || [], true);
    //         const ngItems = processModelData(profile_data?.ng_model_data || [], false);
    //         return [...okItems, ...ngItems];
    //     });
    //     return samplesList;
    // };


    const reverseTransformSamplesList = (data, stageName, camera) => {
        console.log('reverseTransformSamplesList input:', data);

        // ✅ Navigate safely into the nested structure
        const stageProfile = data?.stage_profiles?.[stageName]?.[camera];

        if (!stageProfile) {
            console.error('❌ Invalid stageName or camera. No data found for:', stageName, camera);
            return [];
        }

        // ✅ Extract OK + NG model data arrays
        const okModels = stageProfile.ok_model_data || [];
        const ngModels = stageProfile.ng_model_data || [];

        // ✅ Helper to process models into your "flat" list format
        const processModelData = (models, isOk) =>
            models.map(model => {
                const {
                    model_name, model_ver, comp_zip, thres,
                    ok_rank, ng_rank, radio_checked,
                    required, pos, ok_model_checked, ng_model_checked,
                    sift_count_avg
                } = model;

                const commonData = {
                    model_name,
                    model_ver,
                    comp_zip,
                    thres,
                    model_ver_ok_rank: ok_rank,
                    model_ver_ng_rank: ng_rank,
                    comp_code: data.comp_code,
                    comp_name: data.comp_name,
                    _id: data._id,
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

        // ✅ Flatten and return
        const samplesList = [
            ...processModelData(okModels, true),
            ...processModelData(ngModels, false)
        ];

        console.log('✅ reverseTransformSamplesList output:', samplesList);
        return samplesList;
    };

    // Navigation and save functions
    const back = () => {
        console.log('this back functiosn works', page_info);
        const { save: save_temp, page_info: page_info_temp } = { save: save, page_info: page_info };
        if (save_temp === false) {
            props.history.push(page_info_temp);
        } else {
            Swal.fire({
                title: "Do you want to save the changes?",
                icon: "warning",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Save",
                denyButtonText: `Don't save`
            }).then((result) => {
                if (result.isConfirmed) {
                    saveProfile();
                } else if (result.isDenied) {
                    Swal.fire("Changes are not saved", "", "info");
                    setSave(false);
                    props.history.push(page_info_temp);
                }
            });
        }
    };

    const selectOkModel = () => {
        const { approved_data: approved_data_temp } = { approved_data: approved_data };
        const selectokmodel_temp = approved_data_temp
            .filter(data => data.ok_checked === true)
            .sort((a, b) => a.model_ver_ok_rank - b.model_ver_ok_rank);
        console.log('selectokmodel:', selectokmodel_temp);
        setSelectokmodel(selectokmodel_temp);
    };

    const selectNGModel = () => {
        const { approved_data: approved_data_temp } = { approved_data: approved_data };
        const selectngmodel_temp = approved_data_temp
            .filter(data => data.ng_checked === true)
            .sort((a, b) => a.model_ver_ng_rank - b.model_ver_ng_rank);
        console.log('selectngmodel:', selectngmodel_temp);
        setSelectngmodel(selectngmodel_temp);
    };

    const tog_okbackdrop = () => {
        setOkModelwindow(prev => !prev);
        selectOkModel();
        removeBodyCss();
    };

    const tog_ngbackdrop = () => {
        setNgModelwindow(prev => !prev);
        selectNGModel();
        removeBodyCss();
    };

    const removeBodyCss = () => {
        document.body.classList.add("no_padding");
    };

    const handleChange = (e, data, type) => {
        const { approved_data: approved_data_temp } = { approved_data: approved_data };
        const checkedData_temp = [];
        const dataIndex = approved_data_temp.findIndex(item => item.model_name === data.model_name && item.model_ver === data.model_ver);
        const updatedApprovedData = [...approved_data_temp];
        if (dataIndex !== -1) {
            if (type === 'OK') {
                updatedApprovedData[dataIndex].ok_model_checked = e.target.checked;
            } else {
                updatedApprovedData[dataIndex].ng_model_checked = e.target.checked;
            }
        }
        checkedData_temp.push(updatedApprovedData[dataIndex]);
        setApproved_data(updatedApprovedData);
        setCheckedData(prev => [...prev, ...checkedData_temp]);
    };

    const handleAdd = () => {
        const { checkedData: checkedData_temp } = { checkedData: checkedData };
        console.log('checkedData', checkedData_temp);
        const uniqueCheckedData = checkedData_temp.reduce((uniqueData, currentData) => {
            const existingIndex = uniqueData.findIndex(item => item.model_name === currentData.model_name && item.model_ver === currentData.model_ver);
            if (existingIndex === -1) {
                uniqueData.push(currentData);
            }
            return uniqueData;
        }, []);
        const okModelData = uniqueCheckedData.filter(data => data.ok_model_checked);
        let ok_model_temp = okModelData.map((data, index) => {
            if (data.pos === undefined) {
                data.ok_pos = index + 1;
            }
            return data;
        });
        console.log('ok_model270', ok_model_temp);
        setOk_model(ok_model_temp);
        setOkModelwindow(false);
        setNgModelwindow(false);
        setSave(true);
        setOk_allany(null);
        setOk_opt(null);
        setAllAnyState(ok_model_temp, 'ok');
    };

    const handleAddng = () => {
        const { checkedData: checkedData_temp } = { checkedData: checkedData };
        const uniqueCheckedData = checkedData_temp.reduce((uniqueData, currentData) => {
            const existingIndex = uniqueData.findIndex(item => item.model_name === currentData.model_name && item.model_ver === currentData.model_ver);
            if (existingIndex === -1) {
                uniqueData.push(currentData);
            }
            return uniqueData;
        }, []);
        const ngModelData = uniqueCheckedData.filter(data => data.ng_model_checked);
        let ng_model_temp = ngModelData.map((data, index) => {
            if (data.pos === undefined) {
                data.ng_pos = index + 1;
            }
            return data;
        });
        setNg_model(ng_model_temp);
        setOkModelwindow(false);
        setNgModelwindow(false);
        setSave(true);
        setNg_allany(null);
        setNg_opt(null);
        setAllAnyState(ng_model_temp, 'ng');
    };

    const saveProfileWithConfirmation = async () => {
        const { given_profile: given_profile_temp, assigned_stations: assigned_stations_temp } = { given_profile: given_profile, assigned_stations: assigned_stations };
        console.log('/given_profile ', given_profile_temp, assigned_stations_temp);
        if (given_profile_temp?.acceptance_ratio) {
            setIsConfirmationOpen(true);
        } else {
            saveProfile();
        }
    };

    const closeConfirmation = () => {
        setIsConfirmationOpen(false);
    };

    const saveProfile = () => {
        const {
            ok_model: ok_model_temp, ng_model: ng_model_temp, new_ok: new_ok_temp, profile_name: profile_name_temp, page_info: page_info_temp,
            ok_allany: ok_allany_temp, ng_allany: ng_allany_temp, ok_opt: ok_opt_temp, ng_opt: ng_opt_temp, ok_opt_len: ok_opt_len_temp, ng_opt_len: ng_opt_len_temp,
            given_profile: given_profile_temp
        } = {
            ok_model: ok_model, ng_model: ng_model, new_ok: new_ok, profile_name: profile_name, page_info: page_info,
            ok_allany: ok_allany, ng_allany: ng_allany, ok_opt: ok_opt, ng_opt: ng_opt, ok_opt_len: ok_opt_len, ng_opt_len: ng_opt_len,
            given_profile: given_profile
        };
        console.log('ok_model, ng_model', ok_model_temp, ng_model_temp);
        console.log('ok_allany, ng_allany, ok_opt, ng_opt, ok_opt_len, ng_opt_len : ', ok_allany_temp, ng_allany_temp, ok_opt_temp, ng_opt_temp, ok_opt_len_temp, ng_opt_len_temp);
        let ok_sltd = 0;
        let ng_sltd = 0;
        ok_model_temp.map((data) => {
            if (data.ok_radio_checked !== undefined) {
                ok_sltd += 1;
            }
        });
        ng_model_temp.map((data) => {
            if (data.ng_radio_checked !== undefined) {
                ng_sltd += 1;
            }
        });
        console.log('380 : ok_sltd, ok_model.length, ng_sltd, ng_model.length :', ok_sltd, ok_model_temp.length, ng_sltd, ng_model_temp.length);
        if (ok_model_temp.length !== 0 && ng_model_temp.length !== 0) {
            console.log('both OK and NG selected');
            if (ok_sltd === ok_model_temp.length && ng_sltd === ng_model_temp.length) {
                console.log('380 Both OK and NG models all are selected');
                let ok_allany_val = ok_allany_temp;
                let ok_opt_val = ok_opt_temp;
                let ng_allany_val = ng_allany_temp;
                let ng_opt_val = ng_opt_temp;
                if (ok_opt_len_temp === 0) {
                    ok_allany_val = null;
                    ok_opt_val = null;
                }
                if (ng_opt_len_temp === 0) {
                    ng_allany_val = null;
                    ng_opt_val = null;
                }
                if (ok_opt_len_temp > 0 && (ok_allany_temp === undefined || ok_allany_temp === null)) {
                    console.log('446 choose all any for OK');
                    Swal.fire({
                        icon: 'info',
                        title: 'Choose All/Any for OK models',
                        confirmButtonText: 'OK',
                    });
                } else if (ng_opt_len_temp > 0 && (ng_allany_temp === undefined || ng_allany_temp === null)) {
                    console.log('446 choose all any for NG');
                    Swal.fire({
                        icon: 'info',
                        title: 'Choose All/Any for NG models',
                        confirmButtonText: 'OK',
                    });
                } else {
                    console.log('data480 ', ok_model_temp, ng_model_temp);
                    const ok_file = transformSamplesList(ok_model_temp, 'ok');
                    const ng_file = transformSamplesList(ng_model_temp, 'ng');
                    let ng_data = ng_file[0].ng_model_data;
                    let ok_data = ok_file[0].ok_model_data;
                    delete ok_file[0].ok_model_data;
                    ok_file[0] = { 'ok_model_data': ok_data, 'ng_model_data': ng_data };
                    console.log('data486 ', ok_file);
                    const payload = {
                        // profiledata: ok_file,
                        // stagedata: stageData,
                        // profile_name: profile_name_temp,
                        ng_model_data: ng_file[0].ng_model_data,
                        ok_model_data: ok_file[0].ok_model_data,
                        ok_allany: ok_allany_val,
                        ng_allany: ng_allany_val,
                        ok_opt: ok_opt_val,
                        ng_opt: ng_opt_val,

                        overAll_testing: overAll_testing,
                        region_wise_testing: region_wise_testing,
                    };
                    const finalData = {
                        'profile_id': given_profile_temp._id,
                        'comp_id': given_profile_temp.comp_id,
                        'stage_name': stageName,
                        'stage_id': stageID,
                        'stage_code': stageCode,
                        [stageName]: {
                            [selectedCamData]: payload
                        }
                    };

                    try {
                        console.log('this try wokrs', finalData);
                        urlSocket.post('/api/stage/addprofilemodel_stg', finalData,

                            { mode: 'no-cors' })
                            .then((response) => {
                                let data = response.data.msg;
                                if (response.data.error === "Tenant not found") {
                                    error_handler(response.data.error);
                                } else {
                                    console.log('data157', data);
                                    if (data === 'success') {
                                        Swal.fire({
                                            title: "Good job!",
                                            text: "Profile Saved",
                                            icon: "success"
                                        });
                                        setSave(false);
                                        let updateChoosenProf = {};
                                        if (response.data.updatedProfile.length > 0) {
                                            let profileData = response.data.updatedProfile.filter(data_ => data_._id === given_profile_temp._id);
                                            console.log('profileData634', profileData);
                                            updateChoosenProf.profData = response.data.updatedProfile;
                                        }
                                        console.log('636updateChoosenProf', updateChoosenProf);
                                        sessionStorage.setItem("updatedProfile", JSON.stringify(updateChoosenProf));
                                        props.history.push(page_info_temp);
                                    }
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    } catch (error) {
                    }
                }
            } else if (ok_sltd !== ok_model_temp.length && ng_sltd !== ng_model_temp.length) {
                console.log('380 Both are not fully selected');
                Swal.fire({
                    icon: 'warning',
                    title: 'For OK & NG models, Compulsory/Optional required',
                    confirmButtonText: 'OK',
                });
            } else if (ok_sltd !== ok_model_temp.length) {
                console.log('380 OK models are not fully selected');
                Swal.fire({
                    icon: 'warning',
                    title: 'For OK models, Compulsory/Optional required',
                    confirmButtonText: 'OK',
                });
            } else if (ng_sltd !== ng_model_temp.length) {
                console.log('380 NG models are not fully selected');
                Swal.fire({
                    icon: 'warning',
                    title: 'For NG models, Compulsory/Optional required',
                    confirmButtonText: 'OK',
                });
            }
        } else if (ok_model_temp.length === 0) {
            console.log('only NG selected');
            Swal.fire({
                icon: 'warning',
                title: 'Select OK models to Continue...',
                confirmButtonText: 'OK',
            });
        } else if (ng_model_temp.length === 0) {
            console.log('only OK selected');
            Swal.fire({
                icon: 'warning',
                title: 'Select NG models to Continue...',
                confirmButtonText: 'OK',
            });
        }
    };

    const transformSamplesList = (samplesList, type) => {
        console.log('data581 ', samplesList);
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
                [type === 'ok' ? 'ok_model_checked' : 'ng_model_checked']: item[type === 'ok' ? 'ok_checked' : 'ng_checked'],
                [type === 'ok' ? 'pos' : 'pos']: item[type === 'ok' ? 'ok_pos' : 'ng_pos'],
                [type === 'ok' ? 'required' : 'required']: item[type === 'ok' ? 'ok_required' : 'ng_required'],
                [type === 'ok' ? 'radio_checked' : 'radio_checked']: item[type === 'ok' ? 'ok_radio_checked' : 'ng_radio_checked'],
            };
            if ('sift_count_avg' in item) {
                modelData.sift_count_avg = item.sift_count_avg;
            }
            console.log('check region_selection, ', item.region_selection, rectangles, samplesList);
            if (region_wise_testing) {
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

    // const radioonChange = (e, data, index, type) => {
    //     console.log('e, data, index, type', e, data, index, type)
    //     const { ok_model: ok_model_temp, ng_model: ng_model_temp } = { ok_model: ok_model, ng_model: ng_model };
    //     const model = type === 'ok' ? ok_model_temp : ng_model_temp;
    //     const allAny = type === 'ok' ? 'okAllAny' : 'ngAllAny';
    //     const opt_len = type === 'ok' ? 'ok_opt_len' : 'ng_opt_len';
    //     const opt_allany = type === 'ok' ? 'ok_allany' : 'ng_allany';
    //     const opt = type === 'ok' ? 'ok_opt' : 'ng_opt';
    //     data[`${type}_radio_checked`] = true;
    //     data[`${type}_required`] = e.target.value;
    //     model[index] = data;
    //     const isUndefined = model.some(data_temp => data_temp[`${type}_radio_checked`] === undefined);
    //     const isOptional = model.some(data_temp => data_temp[`${type}_required`] === "optional");
    //     const isOptionalLen = model.filter(data_temp => data_temp[`${type}_required`] === "optional").length;
    //     if (type === 'ok') {
    //         setOk_model(model);
    //     } else {
    //         setNg_model(model);
    //     }
    //     setSave(true);
    //     if (type === 'ok') {
    //         setOkAllAny(!isUndefined && isOptional);
    //         setOk_opt_len(isOptionalLen);
    //         setOk_allany(null);
    //         setOk_opt(null);
    //     } else {
    //         setNgAllAny(!isUndefined && isOptional);
    //         setNg_opt_len(isOptionalLen);
    //         setNg_allany(null);
    //         setNg_opt(null);
    //     }
    //     console.log('type, isOptionalLen : ', type, isOptionalLen);
    // };

    const radioonChange = (e, data, index, type) => {
        const value = e.target.value;
        console.log('e, data, index, type', e, data, index, type);

        // Clone models to avoid mutating state directly
        const model = type === 'ok' ? [...ok_model] : [...ng_model];

        // Clone the specific data row
        const updatedData = { ...data, [`${type}_radio_checked`]: true, [`${type}_required`]: value };

        // Replace the updated row in the model
        model[index] = updatedData;

        // Calculate states
        const isUndefined = model.some(d => d[`${type}_radio_checked`] === undefined);
        const isOptional = model.some(d => d[`${type}_required`] === "optional");
        const isOptionalLen = model.filter(d => d[`${type}_required`] === "optional").length;

        // Update corresponding states
        if (type === 'ok') {
            setOk_model(model);
            setOkAllAny(!isUndefined && isOptional);
            setOk_opt_len(isOptionalLen);
            setOk_allany(null);
            setOk_opt(null);
        } else {
            setNg_model(model);
            setNgAllAny(!isUndefined && isOptional);
            setNg_opt_len(isOptionalLen);
            setNg_allany(null);
            setNg_opt(null);
        }

        setSave(true);
        console.log('type, isOptionalLen : ', type, isOptionalLen);
    };

    const ok_posup = (data, index) => {
        const { ok_model: ok_model_temp } = { ok_model: ok_model };
        if (index !== 0) {
            console.log('data,index416', data, index);
            console.log('ok_model[index]', ok_model_temp[index - 1]);
            let value = ok_model_temp[index - 1];
            ok_model_temp[index - 1] = data;
            ok_model_temp[index - 1].ok_pos -= 1;
            ok_model_temp[index] = value;
            ok_model_temp[index].ok_pos += 1;
            console.log('ok_model420', ok_model_temp);
            setOk_model(ok_model_temp);
            setSave(true);
        } else {
            Swal.fire({
                title: "error",
                text: "Already in 1st Position",
                icon: "error"
            });
        }
    };

    const ng_posup = (data, index) => {
        const { ng_model: ng_model_temp } = { ng_model: ng_model };
        if (index !== 0) {
            console.log('data,index416', data, index);
            console.log('ng_model[index]', ng_model_temp[index - 1]);
            let value = ng_model_temp[index - 1];
            ng_model_temp[index - 1] = data;
            ng_model_temp[index - 1].ng_pos -= 1;
            ng_model_temp[index] = value;
            ng_model_temp[index].ng_pos += 1;
            console.log('ng_model', ng_model_temp);
            setNg_model(ng_model_temp);
            setSave(true);
        } else {
            Swal.fire({
                title: "error",
                text: "Already in 1st Position",
                icon: "error"
            });
        }
    };

    const ok_posdown = (data, index) => {
        const { ok_model: ok_model_temp } = { ok_model: ok_model };
        console.log('data,index416', ok_model_temp.length, index);
        if (ok_model_temp.length !== index + 1) {
            console.log('ok_model[index]', ok_model_temp[index + 1]);
            let value = ok_model_temp[index + 1];
            ok_model_temp[index + 1] = data;
            ok_model_temp[index + 1].ok_pos += 1;
            ok_model_temp[index] = value;
            ok_model_temp[index].ok_pos -= 1;
            console.log('ok_model451', ok_model_temp);
            setOk_model(ok_model_temp);
            setSave(true);
        } else {
            Swal.fire({
                title: "error",
                text: "Already in last Position",
                icon: "error"
            });
        }
    };

    const ng_posdown = (data, index) => {
        const { ng_model: ng_model_temp } = { ng_model: ng_model };
        if (ng_model_temp.length !== index + 1) {
            console.log('data,index416', data, index);
            console.log('ng_model[index]', ng_model_temp[index + 1]);
            let value = ng_model_temp[index + 1];
            ng_model_temp[index + 1] = data;
            ng_model_temp[index + 1].ng_pos += 1;
            ng_model_temp[index] = value;
            ng_model_temp[index].ng_pos -= 1;
            console.log('ng_model', ng_model_temp);
            setNg_model(ng_model_temp);
            setSave(true);
        } else {
            Swal.fire({
                title: "error",
                text: "Already in 1st Position",
                icon: "error"
            });
        }
    };

    const radioAllAny = (type, e) => {
        const { ok_model: ok_model_temp, ng_model: ng_model_temp, ok_opt_len: ok_opt_len_temp, ng_opt_len: ng_opt_len_temp } = { ok_model: ok_model, ng_model: ng_model, ok_opt_len: ok_opt_len, ng_opt_len: ng_opt_len };
        console.log('value changed', e.target.value, e.target.checked);
        if (type === 'ok') {
            if (e.target.value === 'all') {
                setOk_allany(e.target.value);
                setOk_opt(ok_opt_len_temp);
            } else {
                setOk_allany(e.target.value);
                setOk_opt(ok_opt_len_temp > 1 ? ok_opt_len_temp - 1 : ok_opt_len_temp);
            }
        } else if (type === 'ng') {
            if (e.target.value === 'all') {
                setNg_allany(e.target.value);
                setNg_opt(ng_opt_len_temp);
            } else {
                setNg_allany(e.target.value);
                setNg_opt(ng_opt_len_temp > 1 ? ng_opt_len_temp - 1 : ng_opt_len_temp);
            }
        }
        setSave(true);
    };

    const handleOptCount = (e, type) => {
        console.log('726 value : ', e, type);
        const opt = type === 'ok' ? 'ok_opt' : 'ng_opt';
        if (opt === 'ok_opt') {
            setOk_opt(e);
        } else {
            setNg_opt(e);
        }
    };

    const changeEditMode = async () => {
        setIsEditMode(prev => !prev);
    };

    const closeEditMode = async () => {
        setIsRevertingChanges(true);
        setSave(false);
        await fetchProfileManageData();
        setIsEditMode(false);
        setIsRevertingChanges(false);
    };

    const overallTest = (e) => {
        setOverAll_testing(e.target.checked);
        setOk_model([]);
        setNg_model([]);
        setSave(true);
    };

    const region_wiseTest = (e) => {
        console.log('e.target.checked820', e.target.checked);
        setRegion_wise_testing(e.target.checked);
        setOk_model([]);
        setNg_model([]);
        setSave(true);
        console.log('this.state.approved_data', approved_data);
    };

    const error_handler = (error) => {
        sessionStorage.removeItem("authUser");
        props.history.push("/login");
    };

    const handleCameraSelect = async (stageData, stagename, camera) => {
        setSelectedCamData(camera?.label)
        setstageName(stagename)
        setstageID(stageData._id)
        setstageCode(stageData.stage_code)


        console.log('first118', stagename, camera, stageData._id, stageData.stage_code);

        try {
            setLoading(true);
            const response = await urlSocket.post('/api/stage/get_stage_camera_models', {
                'stageData': stageData,
                'stagename': stagename,
                'camera': camera,
                'profile': given_profile
            }, { mode: 'no-cors' });


            const responseData = response.data;

            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                error_handler(response.data.error);
                return;
            }

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

            const modifiedData = response.data.map(item => {
                if (item.result_mode === 'ok') {
                    return { ...item, ok_checked: true, ng_checked: false };
                } else if (item.result_mode === 'ng') {
                    return { ...item, ok_checked: false, ng_checked: true };
                } else if (item.result_mode === 'both') {
                    return { ...item, ok_checked: true, ng_checked: true };
                } else {
                    return item;
                }
            });

            console.log('modifiedData ', modifiedData);
            setApproved_data(modifiedData);
            setRectangles(rectanglesTemp);
            await get_prof_data(stageData, stagename, camera, given_profile)
            await get_model_data(stageData, stagename, camera, given_profile)


        } catch (error) {
            console.error('error ', error);
        }
        finally {
            setLoading(false); // ✅ Stop loader regardless of success/failure
        }

    };



    console.log('stageData', stageData)
    const stageMenu = (
        <Menu>
            {stageData?.length > 0 ? (
                stageData?.map((stage) => {
                    // const registeredStage = cmprStageData[stage?.stage_name] || {};
                    const registeredStage = cmprStageData?.[stage?.stage_name] || {};
                    const registeredCameras = Object.keys(registeredStage);

                    return (
                        <Menu.SubMenu
                            key={stage._id || stage.stage_name}
                            title={stage.stage_name}
                        >
                            {stage.camera_selection?.cameras?.length > 0 ? (
                                stage.camera_selection.cameras.map((camera, camIdx) => {

                                    const isRegistered =
                                        registeredCameras.includes(camera.label);

                                    return (
                                        <Menu.Item
                                            key={`${stage.stage_name}-${camera.label}-${camIdx}`}
                                            onClick={() =>
                                                handleCameraSelect(stage, stage.stage_name, camera)
                                            }
                                        >
                                            {camera.label}
                                            {isRegistered && (
                                                <span style={{ marginLeft: 8 }}>✔️</span>
                                            )}
                                        </Menu.Item>
                                    );
                                })
                            ) : (
                                <Menu.Item disabled>No Cameras available</Menu.Item>
                            )}
                        </Menu.SubMenu>
                    );
                })
            ) : (
                <Menu.Item disabled>No Stages available</Menu.Item>
            )}
        </Menu>
    );


    // const stageMenu = (
    //     <Menu>
    //         {stageData.length !== 0 ? (
    //             stageData.map((stage, idx) => (
    //                 <Menu.SubMenu key={idx} title={stage.stage_name}>
    //                     {stage.camera_selection && stage.camera_selection.cameras && stage.camera_selection.cameras.length > 0 ? (
    //                         stage.camera_selection.cameras.map((camera, camIdx) => (
    //                             <Menu.Item
    //                                 key={`${idx}-${camIdx}`}
    //                                 onClick={() => handleCameraSelect(stage, stage.stage_name, camera)}
    //                             >
    //                                 {camera.label}
    //                             </Menu.Item>
    //                         ))
    //                     ) : (
    //                         <Menu.Item key={`${idx}-no-cam`} disabled>
    //                             No Cameras available
    //                         </Menu.Item>
    //                     )}
    //                 </Menu.SubMenu>

    //             ))
    //         ) : (
    //             <Menu.Item key="no-stage" disabled>
    //                 No Stages available
    //             </Menu.Item>
    //         )}
    //     </Menu>
    // );

    // Render
    return (
        <>
            <div className='page-content'>
                <Breadcrumbs
                    title="PROFILE MANAGEMENT"
                    isBackButtonEnable={true}
                    gotoBack={back}
                />
                <Container fluid>
                    <Card>
                        <CardBody>
                            <Table striped responsive>
                                <thead>
                                    <tr>
                                        <th>Component Name</th>
                                        <th>Component Code</th>
                                        <th>Profile Name</th>
                                        <th>Choose Stages</th>
                                        <th>selected stage</th>
                                        <th>selected camera</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{comp_name}</td>
                                        <td>{comp_code}</td>
                                        <td>{profile_name}</td>
                                        <td>
                                            <Dropdown overlay={stageMenu} arrow>
                                                <Button className="btn btn-sm" color="info">
                                                    Select Stage / Camera
                                                </Button>
                                            </Dropdown>
                                        </td>
                                        <td>{stageName || "please select stage"}</td>
                                        <td>{selectedCamData || "please select cam"}</td>
                                    </tr>
                                </tbody>
                            </Table>
                            {/* <label className='text-center'>Testing Method</label>
                             */}
                            <Tag
                                style={{
                                    background: "linear-gradient(90deg, #009ccc 0%, #8bb6ff 100%)",
                                    color: "white",
                                    fontSize: 13,
                                    padding: "6px 14px",
                                    borderRadius: 12,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                }}
                            >
                                <b>Stage:</b> {stageName || "None"} &nbsp;|&nbsp; <b>Camera:</b> {selectedCamData || "None"}
                            </Tag>
                            <Row className='my-2 mb-2'>
                                <Col>
                                    <Checkbox
                                        checked={overAll_testing}
                                        onChange={overallTest}
                                    >
                                        Overall Testing
                                    </Checkbox>
                                    <Checkbox
                                        checked={region_wise_testing}
                                        onChange={region_wiseTest}
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
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-8">
                                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                                {/* <span className="text-blue-500 font-semibold text-sm">Loading...</span>
                                                                 */}
                                                                {loading && <Spin tip="Loading models..." />}

                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) :
                                                    approved_data.map((data, index) => (
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
                                <Col lg={8}>
                                    <div>
                                        {
                                            given_profile?.acceptance_ratio ?
                                                <Button
                                                    size='sm'
                                                    color={isEditMode ? "danger" : "primary"}
                                                    onClick={() => {
                                                        if (isEditMode) { closeEditMode() }
                                                        else { changeEditMode() }
                                                    }}
                                                >
                                                    {isEditMode ? "Leave Edit Mode" : "Switch to Edit Mode"}
                                                </Button>
                                                : null
                                        }
                                        <Card className={`${isEditMode ? "edit-mode" : "edit-mode-disabled"}`}>
                                            <CardBody>
                                                {
                                                    isRevertingChanges ?
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
                                                                                    onClick={tog_okbackdrop}
                                                                                    disabled={!isEditMode}
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
                                                                        {loading ? (
                                                                            <tr>
                                                                                <td colSpan="5" className="text-center py-8">
                                                                                    <div className="flex flex-col items-center justify-center space-y-3">
                                                                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                                                        {/* <span className="text-blue-500 font-semibold text-sm">Loading...</span>
                                                                                         */}
                                                                                        {loading && <Spin tip="Loading models..." />}

                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ) :
                                                                            ok_model.length !== 0 ? (
                                                                                ok_model.map((data, index) => (
                                                                                    <tr key={index}>
                                                                                        <td width={'25%'}>{`${data.model_name} - ${'V'}${data.model_ver}`}</td>
                                                                                        <td width={'20%'}>{data.model_ver_ok_rank || data.ok_rank}</td>
                                                                                        <td>
                                                                                            <Radio.Group
                                                                                                onChange={(e) => { radioonChange(e, data, index, 'ok') }}
                                                                                                value={comp_opt.find(option => option.value === data.ok_required)?.value}
                                                                                                disabled={!isEditMode}
                                                                                            >
                                                                                                {comp_opt.map(option => (
                                                                                                    <Radio key={option.value} value={option.value}>{option.M}</Radio>
                                                                                                ))}
                                                                                            </Radio.Group>
                                                                                        </td>
                                                                                        <td width={'10%'}>
                                                                                            <i className="mdi mdi-18px mdi-arrow-down-circle"
                                                                                                style={{ cursor: isEditMode ? 'auto' : 'not-allowed' }}
                                                                                                onClick={() => {
                                                                                                    if (isEditMode) { ok_posdown(data, index) }
                                                                                                }}
                                                                                            ></i>
                                                                                            <i className="mdi mdi-18px mdi-arrow-up-circle"
                                                                                                style={{ cursor: isEditMode ? 'auto' : 'not-allowed' }}
                                                                                                onClick={() => {
                                                                                                    if (isEditMode) { ok_posup(data, index) }
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
                                                                    okAllAny &&
                                                                    <div className='mt-3 text-center'>
                                                                        <div>
                                                                            Select no. of Optional models should say <span style={{ fontWeight: 'bold', color: 'green' }}>OK</span>
                                                                        </div>
                                                                        <div className="mt-2 d-flex justify-content-center">
                                                                            <Radio.Group
                                                                                onChange={(e) => { radioAllAny('ok', e) }}
                                                                                value={ok_allany}
                                                                                disabled={!isEditMode}
                                                                            >
                                                                                {all_any.map(option => (
                                                                                    <Radio key={option.value} value={option.value}>{option.M}</Radio>
                                                                                ))}
                                                                            </Radio.Group>
                                                                        </div>
                                                                        <div className='my-2 d-flex flex-column justify-content-center'>
                                                                            <div>
                                                                                {ok_allany === 'any' && (
                                                                                    <InputNumber
                                                                                        min={1}
                                                                                        max={
                                                                                            ok_opt_len < 2 ? ok_opt_len : ok_opt_len - 1
                                                                                        }
                                                                                        defaultValue={ok_opt}
                                                                                        onChange={(e) => handleOptCount(e, 'ok')}
                                                                                        disabled={!isEditMode}
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
                                                                        <tr>
                                                                            <th colSpan="4" className='text-center'>NG Models</th>
                                                                        </tr>
                                                                        <tr>
                                                                            <th colSpan="4" className='text-center'>
                                                                                <Button color='primary' className='btn btn-sm w-md'
                                                                                    onClick={tog_ngbackdrop}
                                                                                    disabled={!isEditMode}
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
                                                                        {loading ? (
                                                                            <tr>
                                                                                <td colSpan="5" className="text-center py-8">
                                                                                    <div className="flex flex-col items-center justify-center space-y-3">
                                                                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                                                        {/* <span className="text-blue-500 font-semibold text-sm">Loading...</span>
                                                                                         */}
                                                                                        {loading && <Spin tip="Loading models..." />}

                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ) :
                                                                            ng_model.length !== 0 ? (
                                                                                ng_model.map((data, index) => (
                                                                                    <tr key={index}>
                                                                                        <td width={'25%'}>{`${data.model_name} - ${'V'}${data.model_ver}`}</td>
                                                                                        <td width={'20%'}>{data.model_ver_ng_rank || data.ng_rank}</td>
                                                                                        <td>
                                                                                            <Radio.Group
                                                                                                onChange={(e) => { radioonChange(e, data, index, 'ng') }}
                                                                                                value={comp_opt.find(option => option.value === data.ng_required)?.value}
                                                                                                disabled={!isEditMode}
                                                                                            >
                                                                                                {comp_opt.map(option => (
                                                                                                    <Radio key={option.value} value={option.value}>{option.M}</Radio>
                                                                                                ))}
                                                                                            </Radio.Group>
                                                                                        </td>
                                                                                        <td width={'10%'}>
                                                                                            <i className="mdi mdi-18px mdi-arrow-down-circle"
                                                                                                style={{ cursor: isEditMode ? 'auto' : 'not-allowed' }}
                                                                                                onClick={() => {
                                                                                                    if (isEditMode) { ng_posdown(data, index) }
                                                                                                }}
                                                                                            ></i>
                                                                                            <i className="mdi mdi-18px mdi-arrow-up-circle"
                                                                                                style={{ cursor: isEditMode ? 'auto' : 'not-allowed' }}
                                                                                                onClick={() => {
                                                                                                    if (isEditMode) { ng_posup(data, index) }
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
                                                                    ngAllAny &&
                                                                    <div className='mt-3 text-center'>
                                                                        <div>
                                                                            Select no. of Optional models should say <span style={{ fontWeight: 'bold', color: 'red' }}>NG</span>
                                                                        </div>
                                                                        <div className="mt-2 d-flex justify-content-center">
                                                                            <Radio.Group
                                                                                onChange={(e) => { radioAllAny('ng', e) }}
                                                                                value={ng_allany}
                                                                                disabled={!isEditMode}
                                                                            >
                                                                                {all_any.map(option => (
                                                                                    <Radio key={option.value} value={option.value}>{option.M}</Radio>
                                                                                ))}
                                                                            </Radio.Group>
                                                                        </div>
                                                                        <div className='my-2 d-flex flex-column justify-content-center'>
                                                                            <div>
                                                                                {ng_allany === 'any' && (
                                                                                    <InputNumber
                                                                                        min={1}
                                                                                        max={
                                                                                            ng_opt_len < 2 ? ng_opt_len : ng_opt_len - 1}
                                                                                        defaultValue={ng_opt}
                                                                                        onChange={(e) => handleOptCount(e, 'ng')}
                                                                                        disabled={!isEditMode}
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
                                    </div>
                                </Col>
                            </Row>
                            <Row className='text-end mt-3 '>
                                <Col>
                                    {
                                        isNotBoth ?
                                            <p className="text-danger fw-bold d-flex align-items-center justify-content-end">
                                                <i className="bx bx-error-circle me-2"></i>
                                                {saveMsg}
                                            </p>
                                            :
                                            station_comp_list ?
                                                <Button size='sm' color='primary' disabled={!save} onClick={saveProfileWithConfirmation} >
                                                    Save Profile
                                                </Button>
                                                :
                                                <>
                                                    <Button
                                                        size='sm'
                                                        className='mx-1'
                                                        style={{
                                                            backgroundColor: save ? 'green' : 'red',
                                                            color: 'white',
                                                            cursor: save ? 'pointer' : 'not-allowed'
                                                        }}
                                                        disabled={!save} onClick={saveProfileWithConfirmation}
                                                    >Save Profile</Button>
                                                </>
                                    }
                                    <Route path="/" render={() => null} />
                                    <Prompt
                                        when={save}
                                        message="You have unsaved changes. Are you sure you want to leave?"
                                    />
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Container>
                {/* Modal 1 - ok modal window */}
                {okModelwindow ?
                    <Modal
                        isOpen={okModelwindow}
                        toggle={tog_okbackdrop}
                        scrollable={true}
                        backdrop={'static'}
                        centered={true}
                        id="staticBackdrop"
                    >
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">OK Model</h5>
                            <Button type="button" className="btn-close" onClick={() =>
                                setOkModelwindow(false)
                            } aria-label="Close"></Button>
                        </div>
                        <div className="modal-body">
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Model Name</th>
                                        <th>OK Rank</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectokmodel !== undefined && selectokmodel.map((data, index) => (
                                        <tr key={index}>
                                            <td>{`${data.model_name} - V${data.model_ver}`}</td>
                                            <td>{`${data.model_ver_ok_rank} `}</td>
                                            <td>
                                                <Checkbox
                                                    onChange={(e) => { handleChange(e, data, 'OK') }}
                                                    checked={data?.ok_model_checked || false}
                                                    disabled={!isEditMode}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        <div className="modal-footer">
                            <Button type="button" onClick={() =>
                                setOkModelwindow(false)
                            }>Close</Button>
                            <Button type="button" className="btn btn-primary" onClick={handleAdd}>Add</Button>
                        </div>
                    </Modal>
                    : null}
                {/* Modal 2 - ng modal window */}
                {ngModelwindow ?
                    <Modal
                        isOpen={ngModelwindow}
                        toggle={tog_ngbackdrop}
                        scrollable={true}
                        backdrop={'static'}
                        centered={true}
                        id="staticBackdrop"
                    >
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">NG Model</h5>
                            <Button type="button" className="btn-close" onClick={() =>
                                setNgModelwindow(false)
                            } aria-label="Close"></Button>
                        </div>
                        <div className="modal-body">
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Model Name</th>
                                        <th>NG Rank</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectngmodel !== undefined && selectngmodel.map((data, index) => (
                                        <tr key={index}>
                                            <td>{`${data.model_name} - V${data.model_ver}`}</td>
                                            <td>{data.model_ver_ng_rank}</td>
                                            <td><Checkbox
                                                onChange={(e) => { handleChange(e, data, 'NG') }}
                                                checked={data?.ng_model_checked || false}
                                            /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        <div className="modal-footer">
                            <Button type="button" onClick={() =>
                                setNgModelwindow(false)
                            }>Close</Button>
                            <Button type="button" className="btn btn-primary" onClick={handleAddng}>Add</Button>
                        </div>
                    </Modal>
                    : null}
                {/* Modal 3 - profile save with confirmation */}
                {
                    isConfirmationOpen ?
                        <Modal isOpen={isConfirmationOpen} toggle={closeConfirmation} centered>
                            <ModalBody>
                                <p>
                                    Saving these changes will require you to retake the profile test to establish a new acceptance ratio.
                                    Without a valid acceptance ratio, this profile cannot be assigned to a station.
                                </p>
                                {
                                    assigned_stations?.length > 0 ?
                                        <>
                                            <p>If you save changes in this profile, it will be deleted from the following stations:</p>
                                            <Table responsive striped bordered size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>S.No</th>
                                                        <th>Station Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {assigned_stations.map((station, index) => (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{station}</td>
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
                                    <Button size='sm' color="danger" onClick={saveProfile}>
                                        Continue, Save
                                    </Button>
                                    <Button size='sm' color="secondary" onClick={closeConfirmation}>
                                        Cancel
                                    </Button>
                                </div>
                            </ModalBody>
                        </Modal>
                        : null
                }
            </div >
        </>
    );
};

StageProfileCrud.propTypes = { history: PropTypes.any.isRequired };

export default StageProfileCrud;
