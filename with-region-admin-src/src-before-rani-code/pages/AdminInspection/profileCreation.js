import React, { useState, useEffect } from 'react'
import MetaTags from 'react-meta-tags';
import {
  Container, CardTitle, Button, Col, Row, Modal,
  Form, Label, Input, Table, ModalBody, CardBody, Card,
  Spinner, CardText, ButtonGroup, UncontrolledTooltip,
  ModalHeader, FormGroup, ModalFooter
} from 'reactstrap';
import urlSocket from "./urlSocket"
import PropTypes from "prop-types"
import { Link } from 'react-router-dom';
import { Switch, Radio, Checkbox, Spin, Progress } from 'antd';

import {
  ArrowUpOutlined,
  LoadingOutlined
} from '@ant-design/icons';
//import 'antd/dist/antd.css';

import Swal from 'sweetalert2';
// import CompInfo from './compInfo';

import './profileCreation.css';
import { Dropdown, Menu, Tooltip } from 'antd';
import { DownOutlined } from '@ant-design/icons';

// export default function compInfo({ history }) {

const CompInfo = ({ history }) => {
  const [addCompModal, setAddCompModal] = useState(false);
  const [comp_name, setComp_name] = useState("");
  const [comp_code, setComp_code] = useState("");
  const [profile_name, setProfile_name] = useState("");
  const [profileNameError, setProfileNameError] = useState("");
  const [componentList, setComponentList] = useState([]);
  const [model_info, setModel_info] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [search_componentList, setSearch_componentList] = useState([]);
  const [sorting, setSorting] = useState({ field: "", order: "" });
  const [items_per_page_stock, setItems_per_page_stock] = useState(100);
  const [currentPage_stock, setCurrentPage_stock] = useState(1);
  const [config, setConfig] = useState([]);
  const [comp_info, setComp_info] = useState([]);
  const [show_station_info, setShow_station_info] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selected_profile, setSelected_profile] = useState({});
  const [barcode_check_type, setBarcode_check_type] = useState({
    0: 'only With Correct Barcode',
    1: 'with Both Correct & Incorrect'
  });
  const [detectionType, setDetectionType] = useState(['ML', 'DL', 'Smart Object Locator']);
  const [tabs, setTabs] = useState(false);
  const [selectFilter, setSelectFilter] = useState('');
  const [position, setPosition] = useState('');
  const [profile_data, setProfile_data] = useState([]);
  const [togglingProfileStatus, setTogglingProfileStatus] = useState({});
  const [isProfileStatusModalOpen, setIsProfileStatusModalOpen] = useState(false);
  const [profileAssignedStations, setProfileAssignedStations] = useState([]);
  const [profileStatusDataTemp, setProfileStatusDataTemp] = useState({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [zoom_value, setZoom_value] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButtonIndex, setLoadingButtonIndex] = useState(null);
  const [regionList, setRegionList] = useState(['Region 1', 'Region 2', 'Region 3', 'Region 4']);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDataIndex, setCurrentDataIndex] = useState(null);
  const [modalDetectionType, setModalDetectionType] = useState(null);
  const [modalSelectedRegions, setModalSelectedRegions] = useState([]);
  const [showValidationMsg, setShowValidationMsg] = useState(false);
  const [positive, setPositive] = useState();
  const [negative, setNegative] = useState();
  const [qrbar_value, setQrbar_value] = useState();
  const [page_info, setPage_info] = useState();

  const getConfigInfo = async () => {
    try {
      const response = await urlSocket.post('/config', { mode: 'no-cors' });
      if (response.data.error === "Tenant not found") {
        console.log("data error", response.data.error);
        error_handler(response.data.error);
      }
      else {
        const configData = response.data;
        console.log('first39', configData);
        setConfig(configData);
        setPositive(configData[0].positive);
        setNegative(configData[0].negative);
      }

    } catch (error) {
      console.log('error', error);
    }
  };

  const getting_back = async () => {
    try {
      let type = JSON.parse(sessionStorage.getItem('profiletype'));
      console.log('type92', type.string, type.value, type.compInfo)
      setProfile_data(type?.compInfo)
      await fixedOrany(type.string, type.value);
    }
    catch {
      console.log('this error block running')
      setSelectFilter('');
      setTabs(false)
    }
  }




  const submitForm = async () => {
    const trimmedProfileName = profile_name.trim().toUpperCase();
    console.log('first26', profile_name, trimmedProfileName)

    setProfileNameError('');

    if (!trimmedProfileName) {
      setProfileNameError('The profile name is required');
    }

    else {
      console.log('first546', profile_name, trimmedProfileName)
      try {
        const response = await urlSocket.post('/add_profile', {
          profile_name: trimmedProfileName, comp_info, position
        }, { mode: 'no-cors' });
        const data = response.data;
        if (data.error === "Tenant not found") {
          console.log("data error", data.error);
          error_handler(data.error);
        }
        else {
          console.log('data4784', data)

          if (data === 'Profile name is already created') {
            setProfileNameError('The profile name is already created');
          }
          else {
            setAddCompModal(false);
            setComponentList(data);
            setOriginalData(data);
            setSearch_componentList(data);
            setProfile_name('');
            setProfileNameError('');
          }
        }

      } catch (error) {
        console.log(error);
      }
    }
  };

  const getProfile_info = async (comp_infoData, string) => {
    console.log('comp_info154', comp_infoData, string)
    try {
      const response = await urlSocket.post('/get_Profile_info',
        {
          "comp_info": comp_infoData,
          'position': string,
        },
        { mode: 'no-cors' }
      );
      if (response.data.error === "Tenant not found") {
        console.log("data error", response.data.error);
        error_handler(response.data.error);
      }
      else {
        const data = response.data;
        console.log('data169', response)
        let data1 = data.map(item => ({
          ...item,
          detect_selection: item?.detect_selection !== undefined ? item?.detect_selection : false,
          detection_type: item?.detection_type !== undefined && item?.detection_type !== null
            ? item?.detection_type
            : 'ML' // default to 'ML' only if not already set
        }));
        console.log('data185', data1)
        setComponentList(data1)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIsAssignedToStations = async (data) => {
    try {
      const response = await urlSocket.post(
        '/profile_assigned_stations', { '_id': data._id }, { mode: 'no-cors' });

      console.log('/profile_assigned_stations ', response.data);
      if (response.data.error === "Tenant not found") {
        console.log("data error", response.data.error);
        error_handler(response.data.error);
      }
      else {
        return response.data.station_list;
      }

    } catch (error) {
      console.error(error);
      return [];
    }
  }

  const changeProfileStatus = async () => {
    setIsProfileStatusModalOpen(false)
    console.log('/profileStatusDataTemp ', profileStatusDataTemp)
    const { data, checked } = profileStatusDataTemp;
    let profile_id = data._id
    let profile_name = data.profile_name
    let comp_id = data.comp_id
    console.log('169 data : ', data, checked)
    try {
      const response = await urlSocket.post('/profile_status_upd',
        { '_id': profile_id, 'profile_name': profile_name, 'profile_active': checked, 'comp_id': comp_id },
        { mode: 'no-cors' });
      const dataRes = response.data;
      if (dataRes.error === "Tenant not found") {
        console.log("data error", dataRes.error);
        error_handler(dataRes.error);
      }
      else {
        console.log('data298', dataRes)
        console.log(' this.state.componentList', componentList);

        const newProfile = dataRes.filter(profile => profile.position === position);
        const profileinfo = newProfile.map((prof, index) => {
          if (prof._id === componentList[index]._id && prof.profile_active === true) {
            prof.detect_selection = componentList[index].detect_selection,
              prof.detection_type = componentList[index].detection_type
          } else {
            prof.detect_selection = false,
              prof.detection_type = null
          }
          return prof
        })


        // 
        setComponentList(profileinfo);
        setOriginalData(profileinfo);
        setSearch_componentList(profileinfo)
      }

    }
    catch (error) {
      console.log('error', error)
    }
    finally {
      setTogglingProfileStatus(prevState => ({
        ...prevState, [data._id]: false
      }));
      setProfileStatusDataTemp({})
    }
  }

  const toggleProfileStatusModal = () => {
    const { data } = profileStatusDataTemp;
    setIsProfileStatusModalOpen(false);
    setTogglingProfileStatus(prevData => ({
      ...prevData, [data._id]: false
    }))
  }

  const onChange = async (e, data) => {
    const checked = e;
    setTogglingProfileStatus(prevState => ({
      ...prevState, [data._id]: true
    }));
    setProfileStatusDataTemp({ data, checked });
    console.log('profileStatusDataTemp ', profileStatusDataTemp)

    try {
      const station_list = await checkIsAssignedToStations(data);
      const isAssignedToStations = station_list.length > 0;

      if (!isAssignedToStations) {
        await changeProfileStatus();
      } else {
        setProfileAssignedStations(station_list);
        setIsProfileStatusModalOpen(true);
      }
    } catch (error) {
      console.error("Error toggling profile status: ", error);
      setTogglingProfileStatus(prevState => ({
        ...prevState, [data._id]: false
      }));
      setProfileStatusDataTemp({})
    }


  }

  const logComp = (data) => {
    console.log('first', data)
    if (data.datasets === undefined) {
      data.datasets = []
    }
    let { comp_name: compName, comp_code: compCode, _id } = data

    let datas = {
      component_name: compName,
      component_code: compCode,
      datasets: data.datasets,
      status: data.status,
      positive: data.positive,
      negative: data.negative,
      posble_match: data.posble_match,
      _id,
      config_data: config,
    }
    console.log('datasss', datas)
    sessionStorage.removeItem("compData")
    sessionStorage.setItem("compData", JSON.stringify(datas))
    setComp_code(compCode);
    setComp_name(compName);

    history.push('/comp_log');
  }

  const manageStation = (data) => {
    console.log('data808', data);

    if (data.acceptance_ratio) {
      data.qrbar_value = qrbar_value ? qrbar_value : undefined;
      data.comp_ver = comp_info.comp_ver;
      data.zoom_value = comp_info?.zoom_value;
      sessionStorage.removeItem("selected_profile")
      sessionStorage.setItem("selected_profile", JSON.stringify(data));

      history.push('/StageStationData')
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Calculate Acceptance Ratio, before Assigning it to the Station',
        confirmButtonText: 'OK',
      });
    }
  }


  const handleModalClosed = () => {
    console.log("Modal closed. Perform any cleanup or additional actions here.@@@");

    setAddCompModal(false);
    setProfile_name('');
    setProfileNameError('');
  }

  // profileInfo
  const profileInfo = (data) => {
    console.log('data95', data)
    data.page_info = '/profileCreation';
    sessionStorage.removeItem("profile_Info");
    sessionStorage.setItem("profile_Info", JSON.stringify(data));

    // history.push('/profileCrud');
    history.push('/StageProfileCrud');

  }

  const handleRowSelect = (rowId, data) => {
    console.log('264 data : ', data)
    setSelectedRow(rowId);
    setSelected_profile(data);
  };

  const back = () => {
    const currentPageInfo = page_info;
    console.log('back is working');
    history.push(currentPageInfo);
    sessionStorage.removeItem('profiletype')
  }

  // const computeProfileRatio = async (prof_data) => {
  //   console.log('data349 ', prof_data, prof_data.qrbar_check, prof_data.qrbar_check_type)

  //   if (prof_data.profile_data &&  (prof_data.stage_profiles && Object.keys(prof_data.stage_profiles).length > 0)) {
  //     if (prof_data.qrbar_check === true &&
  //       (prof_data.qrbar_check_type === undefined || prof_data.qrbar_check_type === null)) {
  //       Swal.fire({
  //         icon: 'warning',
  //         title: 'Barcode Checking Type Required',
  //         confirmButtonText: 'OK',
  //       });
  //     }
  //     else {
  //       try {
  //         const response = await urlSocket.post('/createProfileBatch',
  //           {
  //             'comp_name': prof_data.comp_name,
  //             'comp_code': prof_data.comp_code,
  //             'comp_id': prof_data.comp_id,
  //             'prof_data': prof_data
  //           },
  //           { mode: 'no-cors' }
  //         );
  //         if (response.data.error === "Tenant not found") {
  //           console.log("data error", response.data.error);
  //           error_handler(response.data.error);
  //         }
  //         else {
  //           console.log('305response : ', response)

  //           prof_data.batch_id = response.data;
  //           prof_data.page_info = '/profileCreation'
  //         }
  //       } catch (error) {
  //         console.log('error', error)
  //       }

  //       if ('qrbar_check' in prof_data) {
  //         prof_data.qrbar_value = qrbar_value
  //       }

  //       console.log('data349 prof_data: ', prof_data);

  //       const data = {
  //         current_profile: prof_data,
  //         current_comp_info: profile_data,
  //       }

  //       sessionStorage.removeItem("computeProfData");
  //       sessionStorage.setItem("computeProfData", JSON.stringify(data));

  //       history.push('/profile-ratio-handler');
  //     }
  //   } else {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'Add OK and NG models to this profile to continue...',
  //       confirmButtonText: 'OK',
  //     });
  //   }
  // }


  const computeProfileRatio = async (prof_data) => {
    console.log('data349 ', prof_data, prof_data.qrbar_check, prof_data.qrbar_check_type);

    const hasProfileData = prof_data.profile_data && Object.keys(prof_data.profile_data).length > 0;
    const hasStageProfiles = prof_data.stage_profiles && Object.keys(prof_data.stage_profiles).length > 0;

    if (hasProfileData || hasStageProfiles) {
      if (
        prof_data.qrbar_check === true &&
        (prof_data.qrbar_check_type === undefined || prof_data.qrbar_check_type === null)
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Barcode Checking Type Required',
          confirmButtonText: 'OK',
        });
      } else {
        try {
          const response = await urlSocket.post(
            '/api/stage/createProfileBatch_stg',
            {
              comp_name: prof_data.comp_name,
              comp_code: prof_data.comp_code,
              comp_id: prof_data.comp_id,
              prof_data: prof_data,
            },
            { mode: 'no-cors' }
          );

          if (response.data.error === 'Tenant not found') {
            console.log('data error', response.data.error);
            error_handler(response.data.error);
          } else {
            console.log('305response : ', response);
            prof_data.batch_id = response.data;
            prof_data.page_info = '/profileCreation';
          }
        } catch (error) {
          console.log('error', error);
        }

        if ('qrbar_check' in prof_data) {
          prof_data.qrbar_value = qrbar_value;
        }

        console.log('data349 prof_data: ', prof_data);

        const data = {
          current_profile: prof_data,
          current_comp_info: profile_data,
        };

        sessionStorage.removeItem('computeProfData');
        sessionStorage.setItem('computeProfData', JSON.stringify(data));

        history.push('/profile-ratio-handler-stg');
        // history.push('/profile-ratio-handler');
      }
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Add OK and NG models to this profile to continue...',
        confirmButtonText: 'OK',
      });
    }
  };


  const Gallery = async prof_data => {
    console.log(
      'data349gallery',
      prof_data,
      prof_data.qrbar_check,
      prof_data.qrbar_check_type
    );

    const hasProfileData =
      prof_data.profile_data && Object.keys(prof_data.profile_data).length > 0;
    const hasStageProfiles =
      prof_data.stage_profiles &&
      Object.keys(prof_data.stage_profiles).length > 0;

    if (hasProfileData || hasStageProfiles) {
      if (
        prof_data.qrbar_check === true &&
        (prof_data.qrbar_check_type === undefined ||
          prof_data.qrbar_check_type === null)
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Barcode Checking Type Required',
          confirmButtonText: 'OK'
        });
      } else {
        try {
          const response = await urlSocket.post(
            '/api/stage/createProfileBatch_stg',
            {
              comp_name: prof_data.comp_name,
              comp_code: prof_data.comp_code,
              comp_id: prof_data.comp_id,
              prof_data: prof_data
            },
            { mode: 'no-cors' }
          );

          if (response.data.error === 'Tenant not found') {
            console.log('data error', response.data.error);
            error_handler(response.data.error);
          } else {
            console.log('305response : ', response);
            prof_data.batch_id = response.data;
            prof_data.page_info = '/profileCreation';
          }
        } catch (error) {
          console.log('error', error);
        }

        if ('qrbar_check' in prof_data) {
          prof_data.qrbar_value = qrbar_value;
        }

        console.log('data349 prof_data: ', prof_data);

        const data = {
          current_profile: prof_data,
          current_comp_info: profile_data
        };

        sessionStorage.removeItem('computeProfData');
        sessionStorage.setItem('computeProfData', JSON.stringify(data));

        history.push('/CalculateAcceptanceRationGallery', {
          componentList: data
        });
        // history.push('/profile-ratio-handler');
      }
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Add OK and NG models to this profile to continue...',
        confirmButtonText: 'OK'
      });
    }
  };


  const objDetectCheck = (e, data, idx, str) => {
    let compList = [...componentList];
    if (str === '1') {
      compList[idx].detect_selection = e.target.checked;
      if (e.target.checked == false) {
        compList[idx].detection_type = '';
      } else {
        compList[idx].detection_type = config[0].detection_type;
      }
      setComponentList(compList);
      setSearch_componentList(compList)
    }
  }

  const handleObjDetect = (e, data, index) => {
    const selectedOption = e.target.value;
    console.log('data803 ', e, data, index);

    let compList = [...componentList]
    compList[index].detection_type = e.target.value; // Convert value to integer
    setComponentList(compList)
  }

  // ---start
  const handleObjectDetectionToggle = async (e, rowData, index) => {
    const isChecked = e.target.checked;
    const updated = [...componentList]; // assuming tableData in state
    updated[index].detect_selection = isChecked;

    // If unchecked, clear detection fields
    if (!isChecked) {
      updated[index].detection_type = null;
      updated[index].selected_regions = [];
    }
    // Set componentList in state first
    setComponentList(updated);

    if (isChecked) {
      // open modal to configure
      setModalVisible(true);
      setCurrentDataIndex(index);
      setModalDetectionType(updated[index].detection_type || 'ML');
      setModalSelectedRegions(updated[index].selected_regions || (profile_data?.rectangles.map(region => region.name) || []));
      setShowValidationMsg(false);
    } else {
      updated[index].detection_type = null;
      updated[index].selected_regions = [];
    }
    try {
      await urlSocket.post('/update_detection_status', {
        profile_id: updated[index]._id,
        detect_selection: isChecked,
        detection_type: updated[index].detection_type,
        selected_regions: updated[index].selected_regions
      });
    } catch (error) {
      console.error("Failed to update detection status:", error);
    }

    setComponentList(updated);
    setModalSelectedRegions([]);
  };

  const openDetectionModal = (rowData, index) => {
    setModalVisible(true);
    setCurrentDataIndex(index);
    setModalDetectionType(rowData.detection_type || 'ML');
    setModalSelectedRegions(rowData.selected_regions || profile_data?.rectangles.map(region => region.name) || []);
    setShowValidationMsg(false);
  };

  const handleModalConfirm = async () => {
    if (modalDetectionType === 'Smart Object Locator' && modalSelectedRegions.length === 0) {
      setShowValidationMsg(true);
      return;
    }

    const updated = [...componentList];

    updated[currentDataIndex].detection_type = modalDetectionType;
    updated[currentDataIndex].selected_regions =
      modalDetectionType === 'Smart Object Locator' ? modalSelectedRegions : [];

    try {
      await urlSocket.post('/update_detection_status', {
        profile_id: updated[currentDataIndex]._id,
        detect_selection: true, // assuming modal opens only when detect_selection is true
        detection_type: updated[currentDataIndex].detection_type,
        selected_regions: updated[currentDataIndex].selected_regions,
      });
      setModalDetectionType(updated[currentDataIndex].detection_type)
      console.log(' detection_type: updated[currentDataIndex].detection_type,', updated[currentDataIndex].detection_type)
    } catch (err) {
      console.log("Failed to update detection settings", err);
    }

    setComponentList(updated);
    setModalVisible(false);
    setCurrentDataIndex(null);
    setModalDetectionType(null);
    setModalSelectedRegions([]);
    setShowValidationMsg(false);
  };
  // ---end

  const qrbar_check = (e, data, idx, str) => {
    let compList = [...componentList]
    console.log('data379 ', e, data, idx, str, componentList);
    console.log('this.state.compList : ', compList, typeof compList, Object.keys(componentList).length);
    if (str === '1') {
      compList[idx].qrbar_check = e.target.checked
      this.setState({
        componentList: compList,
        search_componentList: compList
      });
    }
  }

  const handleQRBarcodeCheckType = (e, data, index) => {
    const selectedOption = e.target.value;
    console.log('data803 ', e, data, index);

    let compList = [...componentList]
    compList[index].qrbar_check_type = parseInt(e.target.value); // Convert value to integer
    setComponentList(compList)
  }

  const fixedOrany = async (string, value) => {
    let data = JSON.parse(sessionStorage.getItem('InfoComp'));

    let profileData = data?.component_info;
    // setProfile_data(profileData)
    console.log('string, value', string, value, profileData)
    setIsLoading(true);
    setLoadingButtonIndex(value);
    await getProfile_info(profileData, string);
    let dataToStore = {
      string: string,
      value: value,
      compInfo: profileData,
    }
    console.log("dataToStore", dataToStore)
    sessionStorage.setItem('profiletype', JSON.stringify(dataToStore))
    setSelectFilter(value);
    setTabs(true);
    setPosition(string);
    setLoadingButtonIndex(null);
    setIsLoading(false);
  }

  const error_handler = (error) => {
    sessionStorage.removeItem("authUser");
    history.push("/login");
  }

  useEffect(() => {
    const componentDidMountFunc = async () => {
      try {
        let data = JSON.parse(sessionStorage.getItem('InfoComp'));
        console.log('data48 ', data);

        const zoom_values = data?.component_info?.zoom_value;
        if (zoom_values) {
          sessionStorage.setItem('zoom_values', JSON.stringify(zoom_values));
          setZoom_value(zoom_values);
          console.log('value applied to state')
        }

        let profileData = data?.component_info;
        setProfile_data(profileData)
        let pageInfo = data.page_info;

        setComp_name(profileData.comp_name);
        setComp_code(profileData.comp_code);
        setComp_info(profileData);
        setPage_info(pageInfo);

        if ('qrOrBar_code' in profileData) {
          setQrbar_value(profileData.qrOrBar_code);
        }

        setShow_station_info(pageInfo == '/entry_scrn' ? false : true);

        if (data.createProf && data.createProf === true) {
          setAddCompModal(true)
        }
        // this.getProfile_info(profile_data);
        // await getProfile_info(profileData);
        await getConfigInfo();
        await getting_back()

        // this.getCompModelInfo(InfoComp);

      }
      catch (error) {
        console.error('/didmount ', error)
      }
      finally {
        setProfileLoading(false)
      }
    };

    componentDidMountFunc();
  }, []);


  const isProgressComplete = (data) => {
    return data.matchingstage !== undefined &&
      data.totalstage !== undefined &&
      data.totalstage > 0 &&
      data.matchingstage === data.totalstage;
  };



  const {
    comp_name: compName, comp_code: compCode, profile_name: profileName, profileNameError: profileNameErrorVal,
    show_station_info: showStationInfo, selectedRow: selectedRowVal
  } = {
    comp_name, comp_code, profile_name, profileNameError,
    show_station_info, selectedRow
  };
  console.log('comp_name!!, comp_code==', compName, compCode)
  return (
    // react Fragment tag
    <>
      <div className='page-content'>
        <Row className="mb-3">
          <Col xs={9}>
            <div className="d-flex align-items-center justify-content-between">
              <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">PROFILE CREATION</div>
            </div>
          </Col>
          <Col xs={3} className='d-flex align-items-center justify-content-end'>
            <button className='btn btn-outline-primary btn-sm me-2' color="primary" onClick={() => back()}>Back <i className="mdi mdi-arrow-left"></i></button>
          </Col>
        </Row>
        <Container fluid={true}>
          <Card>
            <CardBody>
              {
                profileLoading ?
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <Spinner color="primary" />
                    <h5 className="mt-4">
                      <strong>Loading Profiles...</strong>
                    </h5>
                  </div>
                  :
                  <>
                    <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
                      <Col xs="12" lg="auto" className="text-left">
                        <CardText className="mb-0 "><span className="me-2 font-size-12">Component Name :</span>{comp_name}</CardText>
                        <CardText className="mb-0"><span className="me-2 font-size-12">Component Code :</span>{comp_code}</CardText>
                        <ButtonGroup className='my-2'>
                          <Button
                            className='btn btn-sm'
                            color="primary"
                            outline={selectFilter !== 0}
                            onClick={() => fixedOrany('Fixed', 0)}
                            disabled={isLoading}
                          >
                            {isLoading && loadingButtonIndex === 0 ? (
                              <>
                                <Spinner size="sm" className="me-2" />
                                Loading...
                              </>
                            ) : (
                              'Fixed position'
                            )}
                          </Button>
                          <Button
                            className='btn btn-sm'
                            color="primary"
                            outline={selectFilter !== 1}
                            onClick={() => fixedOrany('any', 1)}
                            disabled={isLoading}
                          >
                            {isLoading && loadingButtonIndex === 1 ? (
                              <>
                                <Spinner size="sm" className="me-2" />
                                Loading...
                              </>
                            ) : (
                              'Any position'
                            )}
                          </Button>
                        </ButtonGroup>
                      </Col>
                      {
                        tabs ?
                          <Col xs="12" lg="auto" className="text-center">
                            <Button className='btn btn-sm d-flex align-items-center w-sm' color='primary' onClick={() => setAddCompModal(true)}>
                              <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> CREATE PROFILE
                            </Button>
                          </Col>
                          : null
                      }

                    </Row>
                    <div>

                    </div>
                    {
                      console.log('componentList', componentList)
                    }
                    {tabs && (
                      <>
                        {
                          componentList.length === 0 ?
                            <div className="container" style={{ position: 'relative', height: '20vh' }}>
                              <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} >
                                <h5 className="text-secondary">No Profiles Available</h5>
                              </div>
                            </div>
                            :
                            <div className='table-responsive'>
                              <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                                <thead className="table-light">
                                  <tr>
                                    <th>S. No.</th>
                                    <th>Profile Name</th>
                                    <th>Profile Status</th>
                                    <th>Acceptance Ratio</th>
                                    <th>Object Detection</th>

                                    <th>Position</th>
                                    <th>Approved Profiles Stage</th>

                                    <th>Action</th>
                                  </tr>
                                </thead>
                                {
                                  console.log('componentList', componentList)
                                }
                                <tbody>
                                  {componentList.map((data, index) => {
                                    const progressComplete = isProgressComplete(data);

                                    return (
                                      <tr key={index} id="recent-list">
                                        <td style={{ backgroundColor: "white" }}>{index + 1}</td>
                                        <td style={{ backgroundColor: "white" }}>{data.profile_name}</td>
                                        <td style={{ backgroundColor: "white" }}>
                                          {togglingProfileStatus?.[data._id] ? (
                                            <div className='ms-2'>
                                              <Spin indicator={<LoadingOutlined />} />
                                            </div>
                                          ) : (
                                            <Switch
                                              checked={data.profile_active}
                                              onChange={(e) => onChange(e, data)}
                                              checkedChildren="Active"
                                              unCheckedChildren="Inactive"
                                            />
                                          )}
                                        </td>
                                        <td style={{ backgroundColor: "white", whiteSpace: 'pre' }}>
                                          {data.acceptance_ratio ? `${data.acceptance_ratio} %` : `- NA -`}
                                        </td>
                                        <td style={{ backgroundColor: "white" }}>
                                          <div className="align-items-start" style={{ cursor: "pointer" }}>
                                            <Checkbox
                                              checked={data?.detect_selection || false}
                                              onChange={(e) => handleObjectDetectionToggle(e, data, index)}
                                            >
                                              Enable Object Detection
                                            </Checkbox>

                                            {data?.detect_selection && (
                                              <div style={{ marginTop: 8 }} className='d-flex flex-column'>
                                                <Label>
                                                  Method: <strong>{data.detection_type || "Not selected"}</strong>
                                                </Label>

                                                {data.detection_type === 'Smart Object Locator' && (
                                                  <Label style={{ color: '#555' }}>
                                                    Regions: {data.selected_regions?.length > 0 ? data.selected_regions.join(', ') : 'None'}
                                                  </Label>
                                                )}

                                                <span
                                                  onClick={() => openDetectionModal(data, index)}
                                                  style={{ marginTop: 4, display: 'inline-block', color: '#007bff', cursor: 'pointer' }}
                                                >
                                                  ✎ Edit
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td style={{ backgroundColor: "white" }}>{data.position}</td>

                                        <td style={{ backgroundColor: "white" }}>
                                          <div className="d-flex gap-2 align-items-center">
                                            {data.matchingstage !== undefined && data.totalstage !== undefined ? (
                                              (() => {
                                                const percentage = data.totalstage > 0
                                                  ? Math.round((data.matchingstage / data.totalstage) * 100)
                                                  : 0;

                                                return (
                                                  <>
                                                    <span style={{ minWidth: "40px", fontWeight: 500 }}>
                                                      {data.matchingstage}/{data.totalstage}
                                                    </span>
                                                    <Progress
                                                      percent={percentage}
                                                      steps={data.totalstage}
                                                      strokeColor="#52c41a"
                                                      trailColor="#d9d9d9"
                                                      strokeWidth={12}
                                                      style={{ width: "120px" }}
                                                    />
                                                  </>
                                                );
                                              })()
                                            ) : (
                                              <>
                                                <span style={{ minWidth: "40px", fontWeight: 500 }}>-</span>
                                                <Progress
                                                  percent={0}
                                                  steps={5}
                                                  strokeWidth={12}
                                                  style={{ width: "120px" }}
                                                />
                                              </>
                                            )}
                                          </div>
                                        </td>

                                        <td style={{ backgroundColor: "white" }}>
                                          <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
                                            {data.profile_active !== false && (
                                              <>
                                                <Button color="primary" className='btn btn-sm' onClick={() => profileInfo(data)} id={`profile-${data._id}`}>
                                                  Profile Info
                                                </Button>
                                                <UncontrolledTooltip placement="top" target={`profile-${data._id}`}>
                                                  Manage Profile Info
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {/* {data.profile_active !== false && progressComplete && (
                                              <>
                                                <Button color="primary" className='btn btn-sm' onClick={() => computeProfileRatio(data)} id={`test-${data._id}`}>
                                                  Calculate Acceptance Ratio
                                                </Button>
                                                <UncontrolledTooltip placement="top" target={`test-${data._id}`}>
                                                  Calculate Acceptance Ratio with Profile Test
                                                </UncontrolledTooltip>
                                              </>
                                            )} */}


                                            <>
                                              {data.profile_active !== false &&
                                                progressComplete && (
                                                  <div
                                                    style={{
                                                      display: 'inline-block'
                                                    }}
                                                  >
                                                    {/* MENU */}
                                                    <Dropdown
                                                      overlay={
                                                        <Menu>
                                                          <Menu.Item
                                                            key={`calc-${data._id}`}
                                                            onClick={() =>
                                                              computeProfileRatio(
                                                                data
                                                              )
                                                            }
                                                          >
                                                            <span className='text-primary'>
                                                              Calculate Acceptance
                                                              Ratio
                                                            </span>
                                                          </Menu.Item>

                                                          <Menu.Item
                                                            key={`gallery-${data._id}`}
                                                            onClick={() =>
                                                              // history.push(
                                                              //   `/CalculateAcceptanceRationGallery`,
                                                              //   {
                                                              //     componentList:
                                                              //       componentList
                                                              //   }
                                                              // )
                                                              Gallery(data)
                                                            }
                                                          >
                                                            <span className='text-success'>
                                                              Calculate Acceptance
                                                              Ratio Gallery
                                                            </span>
                                                          </Menu.Item>
                                                        </Menu>
                                                      }
                                                      trigger={['click']}
                                                    >
                                                      <Tooltip title='Choose an action'>
                                                        <Button
                                                          color='primary'
                                                          className='btn btn-sm'
                                                        >
                                                          Calculate Acceptance Ratio
                                                          Options <DownOutlined />
                                                        </Button>
                                                      </Tooltip>
                                                    </Dropdown>
                                                  </div>
                                                )}
                                            </>


                                            {data.profile_active !== false && !progressComplete && (
                                              <>
                                                <Button
                                                  color="info"
                                                  className='btn btn-sm'
                                                  // disabled
                                                  id={`test-disabled-${data._id}`}
                                                >
                                                  Calculate Acceptance Ratio
                                                </Button>
                                                <UncontrolledTooltip placement="top" target={`test-disabled-${data._id}`}>
                                                  Complete all stages to calculate acceptance ratio
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {show_station_info && data.profile_active !== false && (
                                              <>
                                                <Button color="primary" className='btn btn-sm' onClick={() => manageStation(data)} id={`station-${data._id}`}>
                                                  Station Info
                                                </Button>
                                                <UncontrolledTooltip placement="top" target={`station-${data._id}`}>
                                                  Manage Station Info
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            <>
                                              <Button color="primary" className='btn btn-sm' onClick={() => logComp(data)} id={`log-${data._id}`}>
                                                Log Info
                                              </Button>
                                              <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
                                                Log Info
                                              </UncontrolledTooltip>
                                            </>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </Table>
                            </div>
                        }
                      </>
                    )}
                  </>
              }
            </CardBody>
          </Card>



        </Container>
        {/* Modal 1 - component inactive */}
        {
          isProfileStatusModalOpen ?
            <Modal isOpen={isProfileStatusModalOpen} toggle={() => toggleProfileStatusModal()} centered>
              {/* <ModalHeader toggle={() => this.toggleProfileStatusModal()}>Confirm Deactivation</ModalHeader> */}
              <ModalBody>
                <p>If you deactivate this profile, it will be deleted from the following stations:</p>
                <Table responsive striped bordered size="sm">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Station Name</th>
                      {/* <th>Location</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {profileAssignedStations.map((station, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{station}</td>
                        {/* <td>{station.location}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className='d-flex my-2 justify-content-end gap-2'>
                  <Button size='sm' color="danger" onClick={changeProfileStatus}>
                    Yes, Deactivate
                  </Button>
                  <Button size='sm' color="secondary" onClick={() => toggleProfileStatusModal()}>
                    Cancel
                  </Button>
                </div>
              </ModalBody>
            </Modal>
            : null
        }

        {/* Modal 2 - Add Profile */}
        <Modal isOpen={addCompModal} onClosed={() => handleModalClosed()}>
          <div className="modal-header">
            <h5 className="modal-title mt-0" id="myModalLabel">
              Enter Profile Details
            </h5>
            <button
              type="button"
              onClick={() => setAddCompModal(false)}
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
                  <Label for="horizontal-profilename-Input">Profile name</Label>
                  <Input
                    type="text"
                    className="form-control"
                    id="horizontal-profilename-Input"
                    placeholder="Enter Your"
                    value={profile_name}
                    maxLength="40"
                    onChange={(e) => setProfile_name(e.target.value)}
                  />
                  {profileNameError && <p className="error-message" style={{ color: "red" }}>{profileNameError}</p>}
                </Col>
              </div>
              <div className="row justify-content-end">
                <Col sm={9}>
                  <div className="text-end">
                    <Button
                      size='sm'
                      color="primary"
                      className="w-md"
                      onClick={() => submitForm()}
                    >
                      ADD
                    </Button>
                  </div>
                </Col>
              </div>
            </Form>
          </div>
        </Modal>

        {/* Modal 3 - Select Object Detection */}
        <Modal isOpen={modalVisible} toggle={() => setModalVisible(false)}>
          {/* <ModalHeader toggle={() => this.setState({ modalVisible: false })}>
            Object Detection Configuration
          </ModalHeader> */}

          <ModalBody>
            <h6 className='fw-bold'>Choose Object Detection Method</h6>
            {detectionType.map((type, i) => (
              <FormGroup check key={i}>
                <Label check>
                  <Input
                    type="radio"
                    name="detectMethod"
                    value={type}
                    checked={modalDetectionType === type}
                    onChange={(e) => setModalDetectionType(e.target.value)}
                  />{' '}
                  {type}
                </Label>
              </FormGroup>
            ))}

            {modalDetectionType === 'Smart Object Locator' && (
              <div style={{ marginTop: '1rem' }}>
                <div
                  style={{
                    backgroundColor: '#f1f1f1',
                    padding: '12px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    marginBottom: '10px'
                  }}
                >
                  <p style={{ marginBottom: 4 }}>
                    This mode automatically locates components even if they are <strong>not in their fixed positions</strong>.
                    Useful when objects <strong>shift/move inside the test image</strong>.
                  </p>

                  <div className='p-2 rounded' style={{ backgroundColor: 'white', border: '1px solid #ccc' }}>
                    <p><strong>Select regions where movement might happen:</strong></p>

                    {profile_data?.rectangles.map((region, idx) => (
                      <FormGroup check key={idx}>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={modalSelectedRegions.includes(region.name)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              let updated = [...modalSelectedRegions];

                              if (isChecked) updated.push(region.name);
                              else updated = updated.filter(r => r !== region.name);

                              setModalSelectedRegions(updated);
                              setShowValidationMsg(false);
                            }}
                          />{' '}
                          {region.name}
                        </Label>
                      </FormGroup>
                    ))}

                    {/* Warning message */}
                    {showValidationMsg && (
                      <div style={{ color: 'red', marginTop: 8 }}>
                        {`*Please select at least one region for Smart Object Locator to work.`}
                      </div>
                    )}
                  </div>
                  <p style={{ fontStyle: 'italic' }}>
                    You can uncheck regions where components always stay fixed.
                  </p>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button size='sm' color="secondary" onClick={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button size='sm' color="primary" onClick={handleModalConfirm}>
              Confirm
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </>

  )
};
CompInfo.propTypes = { history: PropTypes.any.isRequired }

export default CompInfo;
