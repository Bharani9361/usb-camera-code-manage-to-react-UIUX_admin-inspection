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
  Table
} from "reactstrap";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Checkbox, Radio, Space, Menu, TimePicker, Badge } from 'antd';
// import 'antd/dist/antd.css';

import { FaExclamationCircle, FaPlusCircle  } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
//import { Item } from "react-bootstrap/lib/Breadcrumb";
import urlSocket from "./urlSocket";


function App(props) {
  console.log('data24', props)
  const data = props
  const comp_info = data.compinfo
  //console.log('station_info', station_info)
  const sample_data = data.station_data
  // data_sample.push(sample_data)
  const selected_data = data.selected_data
  //console.log('first', sample_data, selected_data)
  const [users, setUsers] = useState([]);
  const [manualAuto, setManualAuto] = useState([{ M: 'Manual' }, { M: 'Auto' }]);
  // const [detectionType, setDetectionType] = useState([{ M: 'ML' }, { M: 'DL' }]);
  const [detectionType, setDetectionType] = useState(['ML', 'DL']);
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
  const [configData, setConfigData] = useState({});

  const history = useHistory();

  useEffect(() => {
    console.log('first', sample_data)
    setUsers(sample_data);
    loadSelected_comp(sample_data);
    getConfigInfo();
  }, []);

  const getConfigInfo = async () => {
    try {
      const response = await urlSocket.post('/config', { mode: 'no-cors' });
      console.log('data155 ', response);
      setConfigData(response.data[0])
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
      if (user.station_name + '_' + user.mac_addrs === e.target.name) {
        // console.log('user121', user)
        user.checked = e.target.checked
      }
      if (user.checked === true) {
        checked_count++;
        console.log('checked_count', checked_count);
        user.detect_selection = true;
        user.detection_type = configData.detection_type;
      }
      else if (user.checked === false) {
        user.radio_checked = false;
        user.qr_checked = false;
        user.qruniq_checked = false;

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

  const handleChangeall = (e) => {
    console.log('first', e.target.checked)
    let users_data = [...users]
    users_data.map((user, index) => {
      console.log('user', user, index)
      user.checked = e.target.checked;
      if(e.target.checked == false) {
        user.radio_checked = false
        user.qr_checked = false
        user.qruniq_checked = false

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
    console.log('comp_info', comp_info)
    try {
      urlSocket.post('/comp_station_list', { 'comp_id': comp_info.comp_id, 'profile_id': comp_info._id },
        { mode: 'no-cors' })
        .then((response) => {
          let res = response.data
          console.log('list63', res)
          setSelectedComp(res)
          checkCompSelected(data, res)
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log("----", error)
    }
  }
  const checkCompSelected = (samples, select_data) => {
    console.log('i am here', samples, select_data)
    var user_count = 0, checked_count = 0
    var qr_count = 0, qr_checked_count = 0
    var qruniq_count = 0, qruniq_checked_count = 0
    samples.map((data) => {
      console.log('data74', data)
      select_data.filter((selected_data) => {
        console.log('selected_data', selected_data, data)
        if (selected_data.station_id === data._id) {
          data.checked = true
          data.radio_checked = true
          data.checked_name = selected_data.inspection_type
          data.timer = Number(selected_data.timer)

          data.detect_selection = selected_data.detect_selection
          data.detection_type = selected_data.detection_type
          
          data.qrbar_check = selected_data.qrbar_check
          data.qrbar_check_type = selected_data.qrbar_check_type
          
          checked_count++
          data.qr_checked = selected_data.qr_checking
          if (data.qr_checked === true) {
            qr_checked_count++
          }
          data.qruniq_checked = selected_data.qruniq_checking
          if (data.qruniq_checked === true) {
            qruniq_checked_count++
          }
        }
      })
    })
    setUsers(samples)
    console.log('data129', data)
    user_count = samples.length
    qr_count = select_data.length
    qruniq_count = select_data.length
    if (user_count === checked_count && user_count > 0) {
      console.log('data202 ', user_count, checked_count)
      setSelectAll(true)
      setPartialySelected(false)
    }
    else if (checked_count < user_count && checked_count > 0) {
      setPartialySelected(true)
    }
    else if (checked_count === 0) {
      setSelectAll(false)
      setPartialySelected(false)
    }
    if (qr_count === qr_checked_count) {
      setSelectQrAll(true)
      setPartialyQrSelected(false)
    }
    else if (qr_checked_count < qr_count && qr_checked_count > 0) {
      setPartialyQrSelected(true)
    }
    else if (qr_checked_count === 0) {
      setSelectQrAll(false)
      setPartialyQrSelected(false)
    }
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
    setDataloaded(true);
  }

  const selectManual_auto = (e, value, idx, str) => {
    console.log('e', e, value, idx, str)
    // console.log('je', manualAuto)
    let users_data = [...users]
    let countdown = timer
    let man_Auto = [...manualAuto]
    console.log('man_uto', man_Auto)

    if (str === '1') {
      if (users_data[idx].checked === true) {
        console.log('checked_count162', users_data)
        users_data[idx].radio_checked = e.target.checked
        users_data[idx].checked_name = value.M
        users_data[idx].timer = countdown
        setUsers(users_data)
      }
      else if (users_data[idx].checked !== true) {
        console.log('first167', 'first select the component then choosse the manual or auto')
      }
    }
    if (str === '2') {
      users_data.map((user, index) => {
        console.log('user', user, index)
        if (user.checked === true) {
          user.checked_name = value.M
          user.radio_checked = e.target.checked
          user.timer = countdown
        }
      })
      man_Auto.map((item, index) => {
        if (index === idx) {
          console.log('item188', item)
          man_Auto[idx].radio_checked = e.target.checked
          man_Auto[idx].checked_name = value.M
        }
        else {
          console.log('item191', item)
          man_Auto[index].radio_checked = false
        }
      })
      console.log('user_data', users_data)
      setUsers(users_data)
    }
  }

  const selectDetectType = (e, value, idx, str) => {
    // console.log('1403e users: ', users, ' e: ',e, ' value: ', value, ' idx:', idx, ' str: ', str);
    let users_data = [...users]
    let detectType = [...detectionType]
    console.log('1403man_uto', detectType)

    if (str === '1') {
      if (users_data[idx].checked === true) {
        console.log('checked_count162', users_data)
        users_data[idx].detect_selection = e.target.checked
        users_data[idx].detection_type = value.M
        setUsers(users_data)
      }
      else {
        Swal.fire({
          title: `"${users_data[idx].station_name}" is not Selected`,
          icon: 'warning',
          timer: 4000,
          showConfirmButton: false,
        });
      }
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
        console.log('data196', users_data)
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
    selected_data(users)

    //console.log('sbmited', users)
    // users.forEach((user)=>{
    //   // console.log('user', user)
    //   if(user.checked===true){
    //     console.log('user66', user)
    //     selected_data(user)
    //   }
    // })

  }

  const objDetectSelect = (e, data, idx, str) => {
    let compList = [...users]
    if (str === '1') {
      compList[idx].detect_selection = e.target.checked;
      if(e.target.checked == false) {
        compList[idx].detection_type = '';
      } else {
        compList[idx].detection_type = configData.detection_type;
      }
      setUsers(compList);
    }
    console.log('data1002 ', users)
  }

  const handleObjDetectType = (e, data, index) => {
    console.log('data510 ', e)

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

  const NavigateToStationInfo = () => {
    history.push('/station_list');
  }

  if (dataloaded === true) {
    return (
      <div>
        {/* <form className="form w-100"> */}
        {
          users.length > 0 ?
            <div className='table-response'>
              <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                <thead className="table-light">
                  <tr>
                    <th>
                      <div className="form-check">
                        {/* <input
                          type="checkbox"
                          className="form-check-input"
                          name="allSelect"                   
                          indeterminate={partialySelected}
                          // checked={
                          //   users.filter((user) => user?.isChecked !== true).length < 1
                          // }
                          checked={!users.some((user) => user?.checked !== true)}
                          onChange={handleChange}
                        /> */}
                        <Checkbox
                          indeterminate={partialySelected}
                          checked={selectAll}
                          onChange={handleChangeall}
                          disabled={users.length === 0}
                        >
                          Select All
                        </Checkbox>
                      </div>
                    </th>
                    <th>Station Name</th>
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
                <tbody>
                  {
                    users.map((user, index) => (
                      <tr key={index}>
                        <td className="bg-white">
                          {
                            <div className="form-check">
                              <Checkbox
                                // type="checkbox"
                                // className="form-check-input"
                                name={user.station_name + '_' + user.mac_addrs}
                                value={user}
                                checked={user?.checked || false}
                                onChange={handleChange}
                              />
                            </div>
                          }
                        </td>

                        <td className="bg-white">{user.station_name}</td>

                        <td className="bg-white">
                          <div>
                            <Col>
                              {
                                manualAuto.map((data, idx) => (
                                  <Radio.Group key={idx} value={(user.radio_checked === true && user.checked_name === data.M) ? true : false || undefined}>
                                    <Space >
                                      <div className='pay_cards' >
                                        <Radio onChange={(e) => selectManual_auto(e, data, index, '1')} value={(user.radio_checked === true && user.checked_name === data.M) ? true : false}>{data.M}</Radio>
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
                          <div className="d-flex justify-content-start align-items-start">
                            <Checkbox
                              checked={user?.detect_selection || false}
                              // disabled={!comp_info.qrbar_value}
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
                                        <Radio value={type} >{type}</Radio>
                                      </div>
                                    ))
                                  }
                                </Radio.Group>
                              </div>
                            }

                          </div>
                          {/* <div>
                      <Col>
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
                      </Col>
                    </div> */}
                        </td>

                        {/* <td className="bg-white">
                      <Checkbox
                        checked={user?.qrbar_check || false}
                        // disabled={comp_info.qrbar_value == null || comp_info.qrbar_value == undefined}
                        disabled={!comp_info.qrbar_value}
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
          :
            <div className="container" style={{ position: 'relative', height: '40vh' }}>
              <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <FaExclamationCircle size={36} className="text-secondary mb-3" />
                <h5 className="text-secondary mb-3">No Stations Created</h5>
                <button className="btn btn-primary" onClick={NavigateToStationInfo}>
                  <FaPlusCircle className="me-2" />
                  Create Station
                </button>
              </div>
            </div>
        }
        <br />

        {
          users.length > 0 ?
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