import "bootstrap/dist/css/bootstrap.min.css";
import {
  Card,
  Col,
  Container,
  Row,
  CardBody,
  CardTitle,
  Label,
  Button,
  Table,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form,
  Input,
  FormGroup,
} from "reactstrap";
import React, {
  useEffect, useState,
  createContext, useContext
} from "react";
import { Checkbox, Radio, Space, Menu, TimePicker, Badge, Switch } from 'antd';
// import 'antd/dist/antd.css';
import axios from "axios";
import urlSocket from "./urlSocket";

import { Link } from 'react-router-dom';

import Swal from 'sweetalert2';
import { useHistory } from "react-router-dom";
import { update } from "lodash";
import { getConfig } from "@testing-library/react";

// const userData = [
//   { name: "Jeevan", code: '1001' },
//   { name: "Manish", code: '1002' },
//   { name: "Prince", code: '1003' },
//   { name: "Arti", code: '1004' },
//   { name: "rahul", code: '1005' }
// ];
// const data_sample = []
// let datasend = {}

const UserContext = createContext();

function App(props) {
  const history = useHistory();


  const data = props
  console.log('datadata', data)
  const station_info = data.station_info
  const sample_data = data.samples
  console.log('sample_datastation_info', station_info, sample_data)

  const selected_data = data.selected_data

  const [profData, setProfData] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [choosenProf, setChoosenProf] = useState(null);

  const [choosenComp, setChoosenComp] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [profComp, setProfComp] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentDataIndex, setCurrentDataIndex] = useState(null);
  const [detectionType, setDetectionType] = useState(['ML', 'DL']); //, 'Smart Object Locator'
  const [modalDetectionType, setModalDetectionType] = useState('ML');
  const [modalSelectedRegions, setModalSelectedRegions] = useState([]);
  const [showValidationMsg, setShowValidationMsg] = useState(false);


  const [users, setUsers] = useState([]);
  const [manualAuto, setManualAuto] = useState([{ M: 'Manual' }, { M: 'Auto' }]);
  // const [detectionType, setDetectionType] = useState([{ M: 'ML' }, { M: 'DL' }]);
  const [barcode_check_type, qrbarcode_check_type] = useState({
    0: 'only With Correct Barcode',
    1: 'with Both Correct & Incorrect'
  });
  const [timer, setTimer] = useState(10);
  const [comp_selected, setSelectedComp] = useState([]);
  const [partialySelected, setPartialySelected] = useState(false);
  const [partialyQrSelected, setPartialyQrSelected] = useState(false);
  const [partialyQrUniqSelected, setPartialyQrUniqSelected] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [selectQrAll, setSelectQrAll] = useState(false)
  const [selectQrUniqAll, setSelectQrUniqAll] = useState(false)
  const [dataloaded, setDataloaded] = useState(false);

  const [inputBox, setInputBox] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [profilePosition, setprofilePosition] = useState('');
  const [profileNameError, setProfileNameError] = useState('');
  const [configData, setConfigData] = useState({});
  const [position, setPosition] = useState([{ M: 'Fixed' },
  { M: 'any' }]
  );



  useEffect(() => {
    console.log('first85: ', sample_data)
    // setUsers(sample_data);
    // loadSelected_comp(sample_data);
    getSavedData();
    getConfigInfo();
  }, []);

  const getSavedData = () => {
    const savedData = JSON.parse(sessionStorage.getItem('stationCompDataSaved'));
    console.log('savedData91', savedData)
    if (savedData) {
      setProfData(savedData.profData)
      setSelectedProfile(savedData.selectedProfile)
      setChoosenProf(savedData.choosenProf)
      setChoosenComp(savedData.choosenComp)
      setShowModal(savedData.showModal)
      setProfComp(savedData.profComp)
      setUsers(savedData.users)
      setManualAuto(savedData.manualAuto)
      setTimer(savedData.timer)
      setSelectedComp(savedData.comp_selected)
      setPartialySelected(savedData.partialySelected)
      setPartialyQrSelected(savedData.partialyQrSelected)
      setPartialyQrUniqSelected(savedData.partialyQrUniqSelected)
      setSelectAll(savedData.selectAll)
      setSelectQrAll(savedData.selectQrAll)
      setSelectQrUniqAll(savedData.selectQrUniqAll)
      setDataloaded(savedData.dataloaded)
      setInputBox(savedData.inputBox)
      setNewProfileName(savedData.newProfileName)
      setProfileNameError(savedData.profileNameError)
      sessionStorage.removeItem('stationCompDataSaved');

      let updatedProfile = JSON.parse(sessionStorage.getItem("updatedProfile"))
      console.log('updatedProfile116', updatedProfile);

      if (updatedProfile !== null && updatedProfile.profData !== profData) {
        setProfData(updatedProfile.profData);
        console.log('savedData.choosedProf122', savedData.choosedProf)
        if (savedData.choosedProf !== null && savedData.choosedProf !== undefined) {
          console.log('savedData.choosedProf122 If')
          let updatedData = updatedProfile.profData.filter(data_ => data_._id === savedData.choosenProf._id)
          if (choosenProf !== updatedData[0]) {
            setChoosenProf(updatedData[0])
          }
        }
      } else {
        console.log('123No changes have made.')
      }
      sessionStorage.removeItem("updatedProfile");
    } else {
      setUsers(sample_data);
      loadSelected_comp(sample_data);
    }
  }

  const error_handler = (error) => {
    sessionStorage.removeItem("authUser");
    history.push("/login");
  }

  const getConfigInfo = async () => {
    try {
      const response = await urlSocket.post('/config', { mode: 'no-cors' });
      if (response.data.error === "Tenant not found") {
        error_handler(response.data);
      }
      else {
        console.log('data155 ', response);
        setConfigData(response.data[0])
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleChange = (e) => {
    console.log('e', e)
    let users_data = [...users]
    // console.log('user_data', users_data)
    let user_count = 0, checked_count = 0
    users_data.map((user, index) => {
      // console.log('user', user, index) 
      if (user.comp_name + '_' + user.comp_code === e.target.name) {
        // console.log('user121', user)
        user.checked = e.target.checked
      }
      if (user.checked === true) {
        checked_count++;
        console.log('checked_count', checked_count)
        user.detect_selection = true;
        user.detection_type = configData.detection_type;
      }
      else if (user.checked === false) {
        user.radio_checked = false
        user.qr_checked = false
        user.qruniq_checked = false

        delete user.profile_name;
        delete user.profile_id;
        delete user.profile;
        delete user.ok_allany;
        delete user.ok_opt;
        delete user.ng_allany;
        delete user.ng_opt;

        delete user.checked_name;
        delete user.detect_selection;
        delete user.detection_type;

        delete user.qrbar_check;
        delete user.qrbar_check_type;
      }
    })
    user_count = users_data.length
    setUsers(users_data)
    console.log('users_data126', users_data, user_count, checked_count)
    if (user_count === checked_count) {
      setSelectAll(true)
      //user.checked = true
      setPartialySelected(false)
    }
    else if (checked_count < user_count && checked_count > 0) {
      setPartialySelected(true)
    }
    else if (checked_count === 0) {
      setSelectAll(false)
      //user.checked=false
      setPartialySelected(false)
    }
  }
  const handleInspectionMethodChange = (e, user, index) => {
    const updatedUsers = [...users];
    updatedUsers[index].inspection_method = e.target.value; // set value
    setUsers(updatedUsers);
  };

  const handleChangeall = (e) => {
    console.log('first188: ', e.target.checked)
    let users_data = [...users]
    users_data.map((user, index) => {
      console.log('user', user, index)
      user.checked = e.target.checked;
      if (e.target.checked == false) {
        user.radio_checked = false
        user.qr_checked = false
        user.qruniq_checked = false

        delete user.profile_name;
        delete user.profile_id;
        delete user.stage_profiles;
        // delete user.ok_allany;
        // delete user.ok_opt;
        // delete user.ng_allany;
        // delete user.ng_opt;

        delete user.checked_name;
        delete user.detect_selection;
        delete user.detection_type;

        delete user.qrbar_check;
        delete user.qrbar_check_type;
      }
    })
    setUsers(users_data)
    if (e.target.checked == true) {
      setSelectAll(true)
    }
    else {
      setSelectAll(false)
    }
    setPartialySelected(false)
  }

  const loadSelected_comp = (data) => {
    console.log('station_info', station_info)
    try {
      urlSocket.post('/station_comp_list', { 'station_id': station_info._id },
        { mode: 'no-cors' })
        .then((response) => {
          let res = response.data
          if (res.error === 'Tenant not found') {
            error_handler(res.error);
          }
          else {
            console.log('list63', res)
            setSelectedComp(res)
            checkCompSelected(data, res)
          }

        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log("----", error)
    }
  }

  const checkCompSelected = (samples, select_data) => {
    console.log('i am here', samples, select_data);

    const selectedMap = new Map(select_data.map(item => [item.comp_id, item]));

    let checked_count = 0;
    let qr_checked_count = 0;
    let qruniq_checked_count = 0;

    const updatedSamples = samples.map(sample => {
      const selected = selectedMap.get(sample._id);
      console.log('307', selected)
      if (selected) {
        checked_count++;

        const updated = {
          ...sample,
          checked: true,
          radio_checked: true,
          checked_name: selected.inspection_type,
          timer: Number(selected.timer),
          profile_name: selected.profile_name,
          profile_id: selected.profile_id,
          stage_profiles: selected.stage_profiles,
          inspection_method: selected.inspection_method,
          comp_ver: selected.comp_ver,
          // profile_ver: selected.profile_ver,
          // ok_allany: selected.ok_allany,
          // ok_opt: selected.ok_opt,
          // ng_allany: selected.ng_allany,
          // ng_opt: selected.ng_opt,
          // overAll_testing: selected.overAll_testing,
          // region_selection: selected.region_selection,
          // region_wise_testing: selected.region_wise_testing,
          detect_selection: selected.detect_selection,
          detection_type: selected.detection_type,
          qrbar_check: selected.qrbar_check,
          qrbar_check_type: selected.qrbar_check_type,
          qr_checked: selected.qr_checking,
          qruniq_checked: selected.qruniq_checking
        };

        if (selected.qr_checking) qr_checked_count++;
        if (selected.qruniq_checking) qruniq_checked_count++;
        if (selected.detect_selection && selected.detection_type === 'Smart Object Locator') {
          updated.selected_regions = selected.selected_regions || [];
        }

        return updated;
      }
      return sample;
    });

    const user_count = samples.length;
    const qr_count = select_data.length;
    const qruniq_count = select_data.length;

    setUsers(updatedSamples);

    // Selection status
    setSelectAll(checked_count === user_count);
    setPartialySelected(checked_count > 0 && checked_count < user_count);

    setSelectQrAll(qr_checked_count === qr_count);
    setPartialyQrSelected(qr_checked_count > 0 && qr_checked_count < qr_count);

    setSelectQrUniqAll(qruniq_checked_count === qruniq_count);
    setPartialyQrUniqSelected(qruniq_checked_count > 0 && qruniq_checked_count < qruniq_count);

    setDataloaded(true);

    // Session storage fallback
    const storedData = JSON.parse(sessionStorage.getItem("selectedStationComp"));
    if (storedData) {
      console.log('selectedStationCompData:', storedData);
      setUsers(storedData);
      sessionStorage.removeItem("selectedStationComp");
    }
  };

  const selectManual_auto = (e, value, idx, str) => {
    console.log('1403e', e, value, idx, str)
    // console.log('je', manualAuto)
    let users_data = [...users]
    let countdown = timer
    let man_Auto = [...manualAuto]
    console.log('1403man_uto', man_Auto)

    if (str === '1') {
      if (users_data[idx].checked === true) {

        if (users_data[idx].profile_name) {
          console.log('checked_count162', users_data)
          users_data[idx].radio_checked = e.target.checked
          users_data[idx].checked_name = value.M
          users_data[idx].timer = countdown
          setUsers(users_data)
        } else {
          Swal.fire({
            title: `Profile Selection required for "${users_data[idx].comp_name}"`,
            icon: 'warning',
            timer: 4000,
            showConfirmButton: false,
          });
        }
      }
      else {
        Swal.fire({
          title: `"${users_data[idx].comp_name}" is not Selected`,
          icon: 'warning',
          timer: 4000,
          showConfirmButton: false,
        });
      }
      // else if (users_data[idx].checked !== true) {
      //   console.log('first167', 'first select the component then choosse the manual or auto')
      // }
    }
    if (str === '2') {
      users_data.map((user, index) => {
        console.log('1403user', user, index)
        if (user.checked === true) {
          user.checked_name = value.M
          user.radio_checked = e.target.checked
          user.timer = countdown
        }
      })
      man_Auto.map((item, index) => {
        if (index === idx) {
          console.log('1403item188', item)
          man_Auto[idx].radio_checked = e.target.checked
          man_Auto[idx].checked_name = value.M
        }
        else {
          console.log('1403item191', item)
          man_Auto[index].radio_checked = false
        }
      })
      console.log('1403user_data', users_data)
      setUsers(users_data)
    }
  }

  const selectDetectType = (e, value, idx, str) => {
    console.log('1403e', e, value, idx, str)
    let users_data = [...users]
    let detectType = [...detectionType]
    console.log('1403man_uto', detectType)

    if (str === '1') {
      if (users_data[idx].checked === true) {

        // if (users_data[idx].profile_name) {
        console.log('checked_count162', users_data)
        users_data[idx].detect_selection = e.target.checked
        users_data[idx].detection_type = value.M
        setUsers(users_data)
        // } else {
        //   Swal.fire({
        //     title: `Profile Selection required for "${users_data[idx].comp_name}"`,
        //     icon: 'warning',
        //     timer: 4000,
        //     showConfirmButton: false,
        //   });
        // }
      }
      else {
        Swal.fire({
          title: `"${users_data[idx].comp_name}" is not Selected`,
          icon: 'warning',
          timer: 4000,
          showConfirmButton: false,
        });
      }
      // else if (users_data[idx].checked !== true) {
      //   console.log('first167', 'first select the component then choosse the manual or auto')
      // }
    }
    if (str === '2') {
      users_data.map((user, index) => {
        console.log('1403user', user, index)
        if (user.checked === true) {
          user.detection_type = value.M
          user.detect_selection = e.target.checked
        }
      })
      detectType.map((item, index) => {
        if (index === idx) {
          console.log('1403item188', item)
          detectType[idx].detect_selection = e.target.checked
          detectType[idx].detection_type = value.M
        }
        else {
          console.log('1403item191', item)
          detectType[index].detect_selection = false
        }
      })
      console.log('1403user_data', users_data)
      setUsers(users_data)
    }
  }

  const countdown = (value, idx, str) => {
    console.log('value194', value)
    // setInputValue(event.target.value)
    let users_data = [...users]
    if (str === '2') {
      console.log('str', str)
      if (users_data[idx].checked === true) {
        users_data[idx].timer = Number(value)
        console.log('data202', users_data)
        setUsers(users_data)
      }
      else {
        console.log('dont change anything')
      }
    }
  }

  const qr_checking = (e, idx, str) => {
    let users_data = [...users]
    let qr_count = 0, qr_checked_count = 0

    if (str === '1') {
      if (users_data[idx].checked === true) {
        users_data[idx].qr_checked = e.target.checked
        if (users_data[idx].qr_checked === false || users_data[idx].qr_checked === undefined) {
          users_data[idx].qruniq_checked = false
        }
      }
      else {
        console.log('dont access the checkbox')
      }
      users_data.map((user, index) => {
        // console.log('user', user, index) 
        if (user.checked === true) {
          qr_count++
          if (user.qr_checked === true) {
            qr_checked_count++;
            // console.log('checked_count221', qr_checked_count)
          }
        }
      })
      // qr_count = users_data.length
      setUsers(users_data)
      console.log('users_data126', users_data, qr_count, qr_checked_count)
      if (qr_count === qr_checked_count) {
        console.log('qr_count247', qr_count, qr_checked_count)
        setSelectQrAll(true)
        setPartialyQrSelected(false)
      }
      else if (qr_checked_count < qr_count && qr_checked_count > 0) {
        console.log('qr_count252', qr_count, qr_checked_count)
        setPartialyQrSelected(true)
        if (users_data[idx].qruniq_checked !== undefined && users_data[idx].qruniq_checked !== false) {
          console.log('255', users_data)
          setPartialyQrUniqSelected(true)
        }
        else if (users_data[idx].qruniq_checked === false && users_data[idx].qr_checked === false) {
          console.log('263', users_data)
          setPartialyQrUniqSelected(true)
        }
        else if (users_data[idx].qruniq_checked === false && users_data[idx].qr_checked === true) {
          console.log('267', users_data)
          setPartialyQrUniqSelected(false)
        }

      }
      else if (qr_checked_count === 0) {
        console.log('qr_count256', qr_count, qr_checked_count)
        setSelectQrAll(false)
        setSelectQrUniqAll(false)
        if (users_data[idx].qruniq_checked !== undefined) {
          setPartialyQrSelected(false)
          setPartialyQrUniqSelected(false)
        }
      }
    }
  }


  const qr_uniq_checking = (e, idx, str) => {
    let users_data = [...users]
    let qruniq_count = 0, qruniq_checked_count = 0

    if (str === '1') {
      if (users_data[idx].checked === true) {
        users_data[idx].qruniq_checked = e.target.checked
        if (users_data[idx].qr_checked === false || users_data[idx].qr_checked === undefined) {
          users_data[idx].qr_checked = true
          users_data[idx].qruniq_checked = e.target.checked
        }
      }
      else {
        console.log('dont access the check box')
      }
      users_data.map((user, index) => {
        if (user.checked === true) {
          qruniq_count++
          if (user.qruniq_checked === true) {
            qruniq_checked_count++;
            console.log('checked_count221', qruniq_checked_count)
          }
        }
      })
      // qruniq_count = users_data.length
      setUsers(users_data)
      console.log('users_data126', users_data, qruniq_count, qruniq_checked_count)
      if (qruniq_count === qruniq_checked_count) {
        setSelectQrUniqAll(true)
        setPartialyQrUniqSelected(false)
      }
      else if (qruniq_checked_count < qruniq_count && qruniq_checked_count > 0) {
        setPartialyQrUniqSelected(true)
      }
      else if (qruniq_checked_count === 0) {
        setSelectQrUniqAll(false)
        setPartialyQrUniqSelected(false)
      }
    }
  }

  const handleModalConfirm = () => {
    // Validation: if Smart Object Locator, require at least one region
    if (modalDetectionType === 'Smart Object Locator' && modalSelectedRegions.length === 0) {
      setShowValidationMsg(true);
      return;
    }

    const updated = [...users];

    updated[currentDataIndex].detection_type = modalDetectionType;
    updated[currentDataIndex].selected_regions =
      modalDetectionType === 'Smart Object Locator' ? modalSelectedRegions : [];

    setUsers(updated);
    setModalVisible(false);
    setCurrentDataIndex(null);
    setModalDetectionType(null);
    setModalSelectedRegions([]);
    setShowValidationMsg(false);
  }


  const qrChangeall = (e) => {
    console.log('first', e.target.checked)
    let users_data = [...users]
    users_data.map((user, index) => {
      console.log('user226', user, index)
      if (user.checked === true) {
        user.qr_checked = e.target.checked
        if (e.target.checked === false) {
          user.qruniq_checked = false
        }
      }
      else {
        console.log('dont access the check box')
      }
    })
    setUsers(users_data)
    if (e.target.checked == true) {
      setSelectQrAll(true)
    }
    else {
      setSelectQrAll(false)
      setSelectQrUniqAll(false)
    }
    setPartialyQrSelected(false)
  }

  const qruniqChangeall = (e) => {
    console.log('first', e.target.checked)
    let users_data = [...users]

    users_data.map((user, index) => {
      console.log('user', user, index)
      if (user.checked === true) {
        user.qruniq_checked = e.target.checked
        if (e.target.checked === true) {
          user.qr_checked = true
        }
      }
    })
    setUsers(users_data)
    if (e.target.checked == true) {
      setSelectQrUniqAll(true)
      setSelectQrAll(true)
    }
    else {
      setSelectQrUniqAll(false)
    }
    setPartialyQrUniqSelected(false)
  }

  const submitForm = () => {
    console.log('users', users)
    props.selected_data(users);

    // selected_data(users)

  }

  const manageProfile = (value, e, idx, str) => {
    console.log('428 comp_data : ', value);

    let users_data = [...users];
    if (str === '1') {
      if (users_data[idx].checked === true) {
        // if(users_data[idx].radio_checked) {
        // code here

        setChoosenComp(value);

        try {
          urlSocket.post('/comp_profile_list', { 'comp_info': value },
            { mode: 'no-cors' })
            .then((response) => {
              let profData = response.data; // Changed prof_data to profData
              if (profData.error === 'Tenant not found') {
                error_handler(profData.error);
              }
              else {
                setProfData(profData); // Update state with the fetched data
                setProfComp(value);

                let choosedProf = profData.filter(prof_data => prof_data.profile_name == value.profile_name);

                if (choosedProf.length > 0) {
                  console.log('choosedProf444 st', choosedProf[0])
                  setChoosenProf(choosedProf[0]);
                  setSelectedProfile(choosedProf[0].profile_name)
                }
                setShowModal(true); // Show modal after fetching data
                console.log('435 profData, selectedProfile, profComp, value : ', profData, selectedProfile, profComp, value);
              }
            })
            .catch((error) => {
              console.log(error)
            })
        } catch (error) {
          console.log("----", error)
        }

        // code ended here
        // } else {
        //   Swal.fire({
        //     title: `Inspection mode not selected for "${users_data[idx].comp_name}"`,
        //     icon: 'warning',
        //     timer: 4000,
        //     showConfirmButton: false,
        //   });
        // }
      }
      else {
        Swal.fire({
          title: `"${users_data[idx].comp_name}" is not Selected`,
          icon: 'warning',
          timer: 4000,
          showConfirmButton: false,
        });
      }
    }


  }

  const createProfile = (isCreateProf) => {

    setInputBox(true);


    // let data = {
    //   component_info: choosenComp, 
    //   page_info: '/entry_scrn'
    // }

    // if(isCreateProf === true) {
    //   data.createProf = true;
    // } else {
    //   data.createProf = false;
    // }

    // sessionStorage.removeItem("InfoComp");
    // sessionStorage.setItem("InfoComp", JSON.stringify(data));

    // sessionStorage.removeItem("selectedStationComp");
    // sessionStorage.setItem("selectedStationComp", JSON.stringify(users));
  }

  const handleProfileSelect = (e, profileData) => {
    console.log('e.target.value : ', e.target.value, profileData)
    console.log('choosedProf444 se', profileData)
    setSelectedProfile(e.target.value);
    setChoosenProf(profileData);
  }

  const handleOk = () => {

    // close CreateProfile Tab
    setInputBox(false);
    setNewProfileName('');
    setProfileNameError('');

    console.log('choosenProf 768: ', choosenProf,);
    console.log('profComp769 ', profComp,);
    console.log('users :770 ', users);

    if (choosenProf !== null) {
      setShowModal(false); // Close modal after selecting a profile

      let updated_comp = [...users];
      updated_comp.map((comp, comp_index) => {
        if (comp._id == profComp._id) {
          comp.profile_name = choosenProf.profile_name;
          comp.profile_id = choosenProf._id;
          comp.stage_profiles = choosenProf.stage_profiles;
          // comp.profile_ver = choosenProf.profile_ver;

          // comp.ok_allany = choosenProf.ok_allany;
          // comp.ok_opt = choosenProf.ok_opt;
          // comp.ng_allany = choosenProf.ng_allany;
          // comp.ng_opt = choosenProf.ng_opt;
          // comp.overAll_testing = choosenProf.overAll_testing;
          // comp.region_selection = choosenProf.region_selection;
          // comp.region_wise_testing = choosenProf.region_wise_testing;
        }
      });

      setUsers(updated_comp);
      setSelectedProfile(null);
      setChoosenProf(null);
      setProfComp(null);
    } else {
      Swal.fire({
        title: `No profiles selected.`,
        text: `Are you sure you want to clear the Profile for this Component`,
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'No',
        cancelButtonColor: '#28a745',
        confirmButtonText: 'Yes',
        confirmButtonColor: '#007bff'
      }).then((result) => {
        if (result.isConfirmed) {
          setShowModal(false); // Close modal after selecting a profile

          let updated_comp = [...users];
          updated_comp.map((comp, comp_index) => {
            if (comp._id == profComp._id) {
              delete comp.profile_name,
                delete comp.profile_id,
                delete comp.stage_profiles
              // delete comp.profile_ver,

              // delete comp.ok_allany,
              // delete comp.ok_opt,
              // delete comp.ng_allany,
              // delete comp.ng_opt
            }
          });

          setUsers(updated_comp);
          setSelectedProfile(null);
          setChoosenProf(null);
          setProfComp(null);

        } else {
          console.log('Got answer: No')
        }
      });
    }
  }

  const handleCancel = () => {
    setShowModal(false);
    setSelectedProfile(null);

    // close CreateProfile Tab
    setInputBox(false);
    setNewProfileName('');
    setProfileNameError('');
    setprofilePosition('');
  }

  // SOL --start
  const handleObjectDetectionToggle = (e, rowData, index) => {
    const updated = [...users]; // assuming tableData in state
    updated[index].detect_selection = e.target.checked;

    if (e.target.checked) {
      // open modal to configure
      setModalVisible(true);
      setCurrentDataIndex(index);
      setModalDetectionType(updated[index].detection_type || 'ML');
      const rectangles = updated[index]?.profile?.ng_model_data?.[0]?.rectangles || [];
      setModalSelectedRegions(updated[index].selected_regions ? updated[index].selected_regions : []);

      setShowValidationMsg(false);
    } else {
      updated[index].detection_type = configData.detection_type;
      updated[index].selected_regions = [];
    }
    setUsers(updated);
  };

  const openDetectionModal = (rowData, index) => {
    setModalVisible(true);
    setCurrentDataIndex(index);
    setModalDetectionType(rowData.detection_type || 'ML');
    const rectangles = rowData?.profile?.ng_model_data?.[0]?.rectangles || [];
    setModalSelectedRegions(rowData.selected_regions ? rowData.selected_regions : []);
    setShowValidationMsg(false);
  };
  // SOL --end

  const toggleProfileChoosing = () => {
    setShowModal(!showModal);
    setSelectedProfile(null);

    // close CreateProfile Tab
    setInputBox(false);
    setNewProfileName('');
    setProfileNameError('');
    setprofilePosition('');
  }

  const submitProfile = async () => {

    console.log('newProfileName, users627', newProfileName, choosenComp);

    setProfileNameError('');
    const trimmedProfileName = newProfileName.trim().toUpperCase();
    console.log('first26', newProfileName, trimmedProfileName)

    if (!trimmedProfileName) {
      setProfileNameError('The profile name is required');
    }

    else {
      try {
        const response = await urlSocket.post('/add_profile',
          {
            profile_name: trimmedProfileName,
            position: profilePosition,
            page: 'stationinfo',
            comp_info: choosenComp
          }, { mode: 'no-cors' });
        const data = response.data;
        console.log('data4784', data)
        if (data.error === 'Tenant not found') {
          error_handler(data.error);
        }
        else {
          if (data === 'Profile name is already created') {
            setProfileNameError('The profile name is already created');
          }
          else {
            setInputBox(false);
            setProfData(data);
            setNewProfileName('');
            setProfileNameError('');
            setprofilePosition('');
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const profStatusChange = async (checked, data) => {
    console.log('choosenProf, checked, data663', choosenProf, checked, data);

    if (checked == false && choosenProf !== null && choosenProf._id == data._id) {
      Swal.fire({
        title: `${data.profile_name} is assigned to ${data.comp_name}.`,
        text: `Are you sure you want to remove this from Station: ${station_info.station_name}`,
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        cancelButtonColor: '#28a745',
        confirmButtonText: 'OK',
        confirmButtonColor: '#007bff'
      }).then((result) => {
        if (result.isConfirmed) {
          setSelectedProfile(null);
          setChoosenProf(null);
          allowProfileChange(checked, data);
        } else {
          // Handle user cancellation
          console.log('User canceled');
        }
      });
    } else {
      allowProfileChange(checked, data);
    }
  }

  const allowProfileChange = async (checked, data) => {
    console.log('allowProfileChange706')
    try {
      const response = await urlSocket.post('/profile_status_upd',
        {
          '_id': data._id,
          'profile_name': data.profile_name,
          'profile_active': checked,
          'comp_id': data.comp_id
        },
        { mode: 'no-cors' });
      const profile_data = response.data;
      if (profile_data.error === 'Tenant not found') {
        error_handler(profile_data.error);
      }
      else {
        console.log('profile_status_upd675', profile_data);
        setProfData(profile_data);
      }

    } catch (error) {
      console.log('error', error)
    }
  }

  const editProfile = (data) => {
    let saved_data = {
      profData,
      selectedProfile,
      choosenProf,
      choosenComp,
      showModal,
      profComp,
      users,
      manualAuto,
      timer,
      comp_selected,
      partialySelected,
      partialyQrSelected,
      partialyQrUniqSelected,
      selectAll,
      selectQrAll,
      selectQrUniqAll,
      dataloaded,
      inputBox,
      newProfileName,
      profileNameError,
    }

    sessionStorage.removeItem("stationCompDataSaved");
    sessionStorage.setItem("stationCompDataSaved", JSON.stringify(saved_data));

    data.page_info = "/entry_scrn";
    sessionStorage.removeItem("profile_Info");
    sessionStorage.setItem("profile_Info", JSON.stringify(data));
  }

  const computeProfileRatio = async (prof_data) => {
    console.log('data955 ', choosenComp, prof_data);

    if (prof_data.stage_profiles) {
      try {
        const response = await urlSocket.post('/createProfileBatch_stg',
          {
            'comp_name': prof_data.comp_name,
            'comp_code': prof_data.comp_code,
            'comp_id': prof_data.comp_id,
            'prof_data': prof_data
          },
          { mode: 'no-cors' }
        );

        if (response.data.error === 'Tenant not found') {
          error_handler(response.data.error);
        }
        else {
          console.log('305response : ', response)
          prof_data.batch_id = response.data;
          prof_data.page_info = '/entry_scrn';
          prof_data.qrbar_check = choosenComp.qrbar_check;
          prof_data.qrbar_check_type = choosenComp.qrbar_check_type;
          prof_data.detect_selection = choosenComp.detect_selection;
          prof_data.detection_type = choosenComp.detection_type;
        }

      } catch (error) {
        console.log('error', error)
      }

      const comp_list = [...users];
      const specific_comp = comp_list.find(comp => comp._id === prof_data.comp_id);
      console.log('data1050 ', specific_comp)

      const compute_profile_data = {
        current_profile: prof_data,
        current_comp_info: specific_comp || {},
      }

      sessionStorage.removeItem("computeProfData");
      sessionStorage.setItem("computeProfData", JSON.stringify(compute_profile_data));

      let saved_data = {
        profData,
        selectedProfile,
        choosenProf,
        choosenComp,
        showModal,
        profComp,
        users,
        manualAuto,
        timer,
        comp_selected,
        partialySelected,
        partialyQrSelected,
        partialyQrUniqSelected,
        selectAll,
        selectQrAll,
        selectQrUniqAll,
        dataloaded,
        inputBox,
        newProfileName,
        profileNameError,
      }

      sessionStorage.removeItem("stationCompDataSaved");
      sessionStorage.setItem("stationCompDataSaved", JSON.stringify(saved_data));

      console.log('savedData91 set', saved_data)

      // history.push('/profile-ratio-handler');
      history.push('/profile-ratio-handler-stg');

    } else {
      Swal.fire({
        icon: 'info',
        title: 'Add OK and NG models to this profile to continue...',
        confirmButtonText: 'OK',
      });
    }
  }

  const objDetectSelect = (e, data, idx, str) => {
    console.log('data996 ', e, idx, str)
    let compList = [...users]
    if (str === '1') {
      compList[idx].detect_selection = e.target.checked;
      if (e.target.checked == false) {
        compList[idx].detection_type = '';
      } else {
        compList[idx].detection_type = configData.detection_type;
      }
      setUsers(compList);
    }
    console.log('data1002 ', users)
  }

  const handleObjDetectType = (e, data, index) => {
    console.log('data1031 ', e)

    let compList = [...users]
    compList[index].detection_type = e.target.value; // Convert value to integer
    setUsers(compList);
  }

  const qrbar_check = (e, data, idx, str) => {
    console.log('data996 ', e, idx, str)
    let compList = [...users]
    if (str === '1') {
      compList[idx].qrbar_check = e.target.checked;
      setUsers(compList);
    }
    console.log('data1002 ', users)
  }

  const handleQRBarcodeCheckType = (e, data, index) => {
    const selectedOption = e.target.value;
    console.log('data803 ', e, data, index);

    let compList = [...users]
    compList[index].qrbar_check_type = parseInt(e.target.value); // Convert value to integer
    setUsers(compList);
  }

  const positionChange = (e) => {
    console.log('e.target.value', e)
    setprofilePosition(e.target.value)
  }

  if (dataloaded === true) {
    return (

      <div>
        {/* <form className="form w-100"> */}
        <div className='table-responsive'>
          <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
            <thead className="table-light">
              <tr>
                <th>
                  <div className="form-check">
                    <Checkbox indeterminate={partialySelected} checked={selectAll} onChange={handleChangeall}>Select All</Checkbox>
                  </div>
                </th>
                <th>Component Name</th>
                <th>Component Code</th>
                <th>Published Profile</th>
                <th>Manage Profile</th>
                <th>Inspection Mode
                  {/* <div>
                  {
                    manualAuto.map((data, idx) => (
                      <Radio.Group key={idx} value={(data.radio_checked === true && data.checked_name === data.M) ? true : false || undefined}>
                        <Space >
                          <div className='pay_cards' >
                            <Radio onChange={(e) => selectManual_auto(e, data, idx, '2')} value={(data.radio_checked === true && data.checked_name === data.M) ? true : false}>{data.M}</Radio>
                          </div>
                        </Space>
                      </Radio.Group>
                    ))
                  }
                </div> */}
                </th>
                <th>Inspection Method</th>

                <th>
                  Object Detection Type
                  {/* <div>
                  {
                    detectionType.map((data, idx) => (
                      <Radio.Group key={idx} value={(data.detect_selection === true && data.detection_type === data.M) ? true : false || undefined}>
                        <Space >
                          <div className='pay_cards' >
                            <Radio onChange={(e) => selectDetectType(e, data, idx, '2')} value={(data.detect_selection === true && data.detection_type === data.M) ? true : false}>{data.M}</Radio>
                          </div>
                        </Space>
                      </Radio.Group>
                    ))
                  }
                </div> */}
                </th>
                {/* <th>Barcode Check</th> */}
                {/* <th>
                <Checkbox indeterminate={partialyQrSelected} checked={selectQrAll} onChange={qrChangeall}>QR Check</Checkbox>
              </th>
              <th>
                <Checkbox indeterminate={partialyQrUniqSelected} checked={selectQrUniqAll} onChange={qruniqChangeall}> QR Uniqness Check</Checkbox>
              </th> */}
              </tr>
            </thead>
            {
              console.log('users', users)
            }
            <tbody>
              {
                users.map((user, index) => (
                  <tr key={index}>
                    <td className="bg-white">
                      {
                        <div className="form-check">
                          <Checkbox
                            name={user.comp_name + '_' + user.comp_code}
                            value={user}
                            checked={user?.checked || false}
                            onChange={handleChange}
                          />
                        </div>
                      }
                    </td>

                    <td className="bg-white">{user.comp_name}</td>

                    <td className="bg-white">{user.comp_code}</td>

                    <td className="bg-white">
                      {
                        user.profile_name ? user.profile_name : '- NA -'
                      }
                    </td>

                    <td className="bg-white">
                      {
                        data.comp_status !== false &&
                        // <Link to='/profileCreation'></Link>
                        <Button className="btn btn-sm w-md" color="info" onClick={(e) => manageProfile(user, e, index, '1')}>Manage</Button>

                      }
                    </td>

                    <td className="bg-white">
                      <div>
                        <Col>
                          {
                            manualAuto.map((data, idx) => (
                              <Radio.Group key={idx} value={(user.radio_checked === true && user.checked_name === data.M) ? true : false || undefined}>
                                <Space >
                                  <div className='pay_cards' >
                                    <Radio onChange={(e) => selectManual_auto(e, data, index, '1')} value={(user.radio_checked === true && user.checked_name === data.M) ? true : false}>
                                      {data.M}
                                    </Radio>
                                  </div>
                                </Space>
                              </Radio.Group>
                            ))
                          }
                        </Col>
                      </div>
                      <div>
                        {
                          user.checked_name === 'Auto' &&
                          <Row>
                            <Col sm={5}>
                              <label>
                                Countdown (in sec):
                              </label>
                              <div>
                                <input
                                  className="form-control"
                                  type="number"
                                  defaultValue={user.timer}
                                  id="example-number-input"
                                  onChange={(e) => countdown(e.target.value, index, '2')}
                                />
                              </div>
                            </Col>
                          </Row>
                        }
                      </div>
                    </td>
                    <td className="bg-white">
                      <Radio.Group
                        onChange={(e) => handleInspectionMethodChange(e, user, index)}
                        value={user.inspection_method || ""} // "Sequential" | "Non-Sequential"
                      >
                        <Space direction="vertical">
                          <Radio value="Sequential">Sequential</Radio>
                          <Radio value="Non-Sequential">Non-Sequential</Radio>
                        </Space>
                      </Radio.Group>
                    </td>


                    <td className="bg-white">
                      {/* <div className="d-flex justify-content-start align-items-start">
                        <Checkbox
                          checked={user?.detect_selection || false}
                          // disabled={!user.qrOrBar_code}
                          onChange={(e) => objDetectSelect(e, user, index, '1')}
                        ></Checkbox>
                        {
                          user?.detect_selection === true &&
                          <div className="ms-2">
                            <Radio.Group
                              onChange={(e) => handleObjDetectType(e, user, index)}
                              value={user.detection_type} // Assuming selectedOption is a state variable that holds the selected option
                            >
                              {
                                detectionType.map((type, typeId) => (
                                  <div key={typeId}>
                                    <Radio value={type}>{type}</Radio>
                                  </div>
                                ))
                              }
                            </Radio.Group>
                          </div>
                        }

                      </div> */}


                      <div className="align-items-start" style={{ cursor: "pointer", userSelect: 'none' }}>
                        <Checkbox
                          checked={user?.detect_selection || false}
                          onChange={(e) => handleObjectDetectionToggle(e, user, index)}
                        >
                          Enable Object Detection
                        </Checkbox>


                        {user?.detect_selection && (
                          <div style={{ marginTop: 8 }} className='d-flex flex-column'>
                            <Label>
                              Method: <strong>{user.detection_type || "Not selected"}</strong>
                            </Label>

                            {user.detection_type === 'Smart Object Locator' && (
                              <Label style={{ color: '#555' }}>
                                Regions: {user.selected_regions?.length > 0 ? user.selected_regions.join(', ') : 'None'}
                              </Label>
                            )}

                            <span
                              onClick={() => openDetectionModal(user, index)}
                              style={{ marginTop: 4, display: 'inline-block', color: '#007bff', cursor: 'pointer' }}
                            >
                              ✎ Edit
                            </span>
                          </div>
                        )}
                      </div>


                      {/* <div>
                        {
                          detectionType.map((data, idx) => (
                            <Radio.Group key={idx} value={(user.detect_selection === true && user.detection_type === data.M) ? true : false || undefined}>
                              <Space >
                                <div className='pay_cards' >
                                  <Radio onChange={(e) => selectDetectType(e, data, index, '1')} value={(user.detect_selection === true && user.detection_type === data.M) ? true : false}>{data.M}</Radio>
                                </div>
                              </Space>
                            </Radio.Group>
                          ))
                        }
                    </div> */}
                    </td>

                    {/* <td className="bg-white">
                      <Checkbox
                        checked={user?.qrbar_check || false}
                        // disabled={user.qrOrBar_code == null || user.qrOrBar_code == undefined}
                        disabled={!user.qrOrBar_code}
                        onChange={(e) => qrbar_check(e, user, index, '1')}
                      ></Checkbox>
                      {
                        user?.qrbar_check === true &&
                        <div>
                          <Radio.Group
                            onChange={(e) => handleQRBarcodeCheckType(e, user, index)}
                            value={user.qrbar_check_type} // Assuming selectedOption is a state variable that holds the selected option
                          >
                            {
                              Object.entries(barcode_check_type).map(([key, value]) => (
                                <div key={key}>
                                  <Radio value={parseInt(key)}>{value}</Radio>
                                </div>
                              ))
                            }
                          </Radio.Group>
                        </div>
                      }
                    </td> */}

                    {/* <td>
                    <div className="form-check">
                      <Checkbox
                        checked={user?.qr_checked || false}
                        onChange={(e) => qr_checking(e, index, '1')}
                      ></Checkbox>
                    </div>
                  </td>
                  <td>
                    <div className="form-check">
                      <Checkbox
                        checked={user?.qruniq_checked || false}
                        onChange={(e) => qr_uniq_checking(e, index, '1')}
                      ></Checkbox>
                    </div>
                  </td> */}
                  </tr>
                ))
              }
            </tbody>
          </Table>

        </div>
        <br />
        <Modal size="lg" isOpen={showModal} toggle={() => toggleProfileChoosing()} centered > {/* fullscreen */}
          <ModalHeader toggle={() => toggleProfileChoosing()}>
            <div style={{ fontWeight: 'bold' }}>Select Profile</div>
          </ModalHeader>
          {/* <ModalBody> */}
          <div className="d-flex justify-content-center my-3">
            <UserContext.Provider value={users}>
              {/* <Link to='/profileCreation' className="ml-auto"> */}
              {/* <Button color="primary" onClick={() => createProfile(profData.length > 0 ? false : true)}> */}
              <Button color="primary" onClick={() => createProfile()}>
                {/* {profData.length > 0 ? `Manage Profile` : `Create Profile`} */}
                Create Profile
              </Button>
              {/* </Link> */}
            </UserContext.Provider>
          </div>
          {
            inputBox ?
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
                        value={newProfileName}
                        maxLength="40"
                        onChange={(e) => setNewProfileName(e.target.value)}
                      />
                      {profileNameError && <p className="error-message" style={{ color: "red" }}>{profileNameError}</p>}
                      <Label for="horizontal-profilename-Input">Position</Label>
                      <div>
                        <Radio.Group onChange={(e) => positionChange(e)}>
                          <Radio value='Fixed'>Fixed</Radio>
                          <Radio value='any'>Any</Radio>
                        </Radio.Group>
                      </div>
                    </Col>
                  </div>
                  <div className="row justify-content-end">
                    <Col sm={9}>
                      <div className="text-end">
                        <Button
                          className="w-md me-3"
                          onClick={() => { setInputBox(false); setNewProfileName(''); setProfileNameError('') }}
                        >
                          Cancel
                        </Button>
                        <Button
                          color="primary"
                          className="w-md"
                          onClick={() => submitProfile()}
                        >
                          ADD
                        </Button>
                      </div>
                    </Col>
                  </div>
                </Form>
              </div>
              : null
          }
          {
            profData.length !== 0 ?
              <Table bordered responsive>
                <thead>
                  <tr>
                    <th style={{ width: '20%', textAlign: 'center' }}>Choose</th>
                    <th>Profile Status</th>
                    <th>Position</th>
                    <th>Profile name</th>
                    <th>Manage</th>
                    <th>Profile Test</th>
                    <th>Acceptance Ratio</th>
                  </tr>
                </thead>

                {
                  console.log('profData', profData)
                }

                {profData && profData.map(profile => (
                  <tbody key={profile._id}>
                    <tr>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="radio"
                          value={profile.profile_name}
                          onChange={(e) => handleProfileSelect(e, profile)}
                          checked={selectedProfile === profile.profile_name}
                          disabled={profile.profile_active === true && profile.acceptance_ratio ? false : true}
                        />
                      </td>
                      <td>
                        <Switch
                          checked={profile.profile_active}
                          checkedChildren="Active"
                          unCheckedChildren="Inactive"
                          onChange={(e) => profStatusChange(e, profile)}
                        />
                      </td>
                      <td>{profile.position}</td>
                      <td>{profile.profile_name}</td>
                      <td>
                        <Link to="/profileCrud">
                          <Button
                            type="button"
                            className="btn btn-success"
                            style={{ whiteSpace: 'pre' }}
                            onClick={() => editProfile(profile)}
                          >
                            <i className="mdi mdi-pencil"></i>  Edit
                          </Button>
                        </Link>
                      </td>
                      <td>
                        {/* <Link to='/profile-ratio-handler'> */}
                        <Button color='info' onClick={() => computeProfileRatio(profile)}>Test</Button>
                        {/* </Link> */}
                      </td>
                      <td>
                        {
                          profile.acceptance_ratio ?

                            `${parseFloat(profile.acceptance_ratio.toFixed(2))}%`
                            : `- NA -`
                        }
                        {/* ${profile.acceptance_ratio}  */}
                      </td>
                    </tr>
                  </tbody>
                ))}

              </Table>
              :
              <div className="d-flex justify-content-center mt-3">
                <p>No profiles available</p>
              </div>
          }

          {/* </ModalBody> */}
          <ModalFooter>
            {
              // selectedProfile !== null &&
              <Button color="success" onClick={handleOk}>Ok</Button>
            }
            <Button color="secondary" onClick={handleCancel}>Cancel</Button>
          </ModalFooter>
        </Modal>

        <div className="row justify-content-end">
          <div className="text-end">

            <Button
              size="sm"
              type="submit"
              color="primary"
              className="w-md"
              onClick={submitForm}
            >
              SUBMIT
            </Button>

          </div>
        </div>
        {
          modalVisible ?
            <Modal isOpen={modalVisible} toggle={() => setModalVisible(false)} >

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

                        {/* {users?.[currentDataIndex]?.profile?.ng_model_data?.[0]?.rectangles.map((region, idx) => ( */}
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
                        {/* ))} */}

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
            : null
        }
      </div>

    );
  }
  else {
    return null;
  }
}

export default App;




