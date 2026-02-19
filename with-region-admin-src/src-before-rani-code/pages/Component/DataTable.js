import "bootstrap/dist/css/bootstrap.min.css";
import {
  Card,
  Col,
  Container,
  Row,
  CardBody,
  CardTitle,
  Form,
  Label,
  Button,
  Table
} from "reactstrap";
import React, { useEffect, useState } from "react";
import { Checkbox, Radio, Space, Menu, TimePicker, Badge } from 'antd';
import 'antd/dist/antd.css';
import axios from "axios";
import urlSocket from "../AdminInspection/urlSocket"

// const userData = [
//   { name: "Jeevan", code: '1001' },
//   { name: "Manish", code: '1002' },
//   { name: "Prince", code: '1003' },
//   { name: "Arti", code: '1004' },
//   { name: "rahul", code: '1005' }
// ];
// const data_sample = []
// let datasend = {}

function App(props) {
  console.log('data', props)
  const data = props
  const station_info = data.station_info
  //console.log('station_info', station_info)
  const sample_data = data.samples
  // data_sample.push(sample_data)
  const selected_data = data.selected_data
  console.log('first', sample_data, selected_data)
  const manual_auto_option = [{ M: 'Manual' }, { M: 'Auto' }]

  const [users, setUsers] = useState([]);
  const [comp_selected, setSelectedComp] = useState([]);
  const [partialySelected, setPartialySelected] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [dataloaded, setDataloaded] = useState(false);
  const [manualAuto, setManualAuto] = useState([]);
  const [timer, setTimer] = useState(10);
  const [qrpartialySelected, setQrPartialySelected] = useState(false);
  const [qrselectAll, setQrSelectAll] = useState(false);
  const [qruniqpartialySelected, setQrUniqPartialySelected] = useState(false);
  const [qruniqselectAll, setQruniqSelectAll] = useState(false);

  useEffect(() => {
    console.log('first', sample_data)
    setUsers(sample_data);
    setManualAuto(manual_auto_option)
    // setSelectM_A(selectM_A + 'Manual')
    loadSelected_comp(sample_data)
  }, []);

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
      user.checked = e.target.checked
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
    samples.map((data) => {
      console.log('data74', data)
      select_data.filter((selected_data) => {
        console.log('selected_data', selected_data, data)
        if (selected_data.comp_id === data._id) {
          data.checked = true
          data.radio_checked = true
          data.qr_checked = selected_data.qr_checking
          data.qr_uniq_checked = selected_data.qruniq_checking
          data.checked_name = selected_data.inspection_type
          data.timer = Number(selected_data.timer)
          checked_count++
        }
      })
    })
    console.log('data129', data)
    user_count = samples.length
    if (user_count === checked_count) {
      setSelectAll(true)
      setQrSelectAll(true)
      setQruniqSelectAll(true)
      setPartialySelected(false)
      setQrPartialySelected(false)
      setQrUniqPartialySelected(false)
    }
    else if (checked_count < user_count && checked_count > 0) {
      setPartialySelected(true)
      setQrPartialySelected(true)
      setQrUniqPartialySelected(true)
    }
    else if (checked_count === 0) {
      setSelectAll(false)
      setQrSelectAll(false)
      setQruniqSelectAll(false)
      setPartialySelected(false)
      setQrPartialySelected(false)
      setQrUniqPartialySelected(false)
    }
    setDataloaded(true)
  }

  const selectManual_auto = (e, value, idx, str) => {
    console.log('e', e, value, idx, str)
    // console.log('je', manualAuto)
    let users_data = [...users]
    let countdown = timer
    let man_Auto = [...manualAuto]
    console.log('man_uto', man_Auto)

    if (str === '1') {
      users_data[idx].radio_checked = e.target.checked
      users_data[idx].checked_name = value.M
      users_data[idx].timer = countdown
      // setSelectM_A(e.target.value)
      console.log('data', e.target.value, users_data)
      setUsers(users_data)
    }
    if (str === '2') {
      users_data.map((user, index) => {
        console.log('user', user, index)
        user.checked_name = value.M
        user.radio_checked = e.target.checked

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
        // setManualAuto(man_Auto)
      })
      // setManualAuto(man_Auto)
      console.log('user_data', users_data)
      setUsers(users_data)
    }
  }

  const qr_checking = (e, idx, str) => {
    let users_data = [...users]
    let user_count = 0, checked_count = 0

    if (str === '1') {
      users_data[idx].qr_checked = e.target.checked
      if (users_data[idx].qr_checked === false || users_data[idx].qr_checked === undefined) {
        users_data[idx].qr_uniq_checked = false
      }
      users_data.map((user, index) => {
        // console.log('user', user, index) 
        if (user.qr_checked === true) {
          checked_count++;
          console.log('checked_count221', checked_count)
        }
      })
      user_count = users_data.length
      setUsers(users_data)
      console.log('users_data126', users_data, user_count, checked_count)
      if (user_count === checked_count) {
        setQrSelectAll(true)
        setQrPartialySelected(false)
      }
      else if (checked_count < user_count && checked_count > 0) {
        setQrPartialySelected(true)
      }
      else if (checked_count === 0) {
        setQrSelectAll(false)
        setQrPartialySelected(false)
      }
    }}

    const qrChangeall = (e) => {
      console.log('first', e.target.checked)
      let users_data = [...users]
      users_data.map((user, index) => {
        console.log('user226', user, index)
        user.qr_checked = e.target.checked
        if(e.target.checked === false){
           user.qr_uniq_checked = false
        }
      })
      setUsers(users_data)
      if (e.target.checked == true) {
        console.log('231', e.target.checked)
        setQrSelectAll(true)
      }
      else {
        setQrSelectAll(false)
        setQruniqSelectAll(false)
      }
      setQrPartialySelected(false)
    }

    const qruniqChangeall = (e) => {
      console.log('first', e.target.checked)
      let users_data = [...users]
      users_data.map((user, index) => {
        console.log('user', user, index)
        user.qr_uniq_checked = e.target.checked
        if(e.target.checked === true){
          user.qr_checked = true
        }
      })
      setUsers(users_data)
      if (e.target.checked == true) {
        setQruniqSelectAll(true)
        setQrSelectAll(true)
      }
      else {
        setQruniqSelectAll(false)
      }
      setQrUniqPartialySelected(false)
    }

    const qr_uniq_checking = (e, idx, str) => {
      let users_data = [...users]
      let user_count = 0, checked_count = 0
      
      if (str === '1') {
        users_data[idx].qr_uniq_checked = e.target.checked
        if (users_data[idx].qr_checked === false || users_data[idx].qr_checked === undefined) {
          users_data[idx].qr_checked = true
          users_data[idx].qr_uniq_checked = e.target.checked
        }
       
        users_data.map((user, index) => {
          if (user.qr_uniq_checked === true) {
            checked_count++;
            console.log('checked_count221', checked_count)
          }
        })
        user_count = users_data.length
        setUsers(users_data)
        console.log('users_data126', users_data, user_count, checked_count)
        if (user_count === checked_count) {
          setQruniqSelectAll(true)
          setQrUniqPartialySelected(false)
        }
        else if (checked_count < user_count && checked_count > 0) {
          setQrUniqPartialySelected(true)
        }
        else if (checked_count === 0) {
          setQruniqSelectAll(false)
          setQrUniqPartialySelected(false)
        }
      }
    }

    const countdown = (value, idx, str) => {
      console.log('value194', value)
      // setInputValue(event.target.value)
      let users_data = [...users]
      if (str === '2') {
        console.log('str', str)
        users_data[idx].timer = Number(value)
        console.log('data202', users_data)
        setUsers(users_data)
      }
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


    if (dataloaded === true) {
      return (
        <div>
          {/* <form className="form w-100"> */}
          <Table striped>
            <thead>
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
                    <Checkbox indeterminate={partialySelected} checked={selectAll} onChange={handleChangeall}>Select All</Checkbox>
                  </div>
                </th>
                <th>
                  <Row>
                    <Col>
                      Component Name
                    </Col>
                  </Row>
                  <br />
                </th>
                <th>
                  <Row>
                    <Col>
                      Component Code
                    </Col>
                  </Row>
                  <br />
                </th>
                <th>
                  Inspection Mode
                  <div>
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
                  </div>
                </th>
                <th>
                  <Checkbox indeterminate={qrpartialySelected} checked={qrselectAll} onChange={qrChangeall}>QR Check</Checkbox>
                </th>
                <th>
                  <Checkbox indeterminate={qruniqpartialySelected} checked={qruniqselectAll} onChange={qruniqChangeall}> QR Uniqness Check</Checkbox>
                </th>
              </tr>
            </thead>
            <tbody>
              {
                users.map((user, index) => (
                  <tr key={index}>
                    <td>
                      {
                        <div className="form-check">
                          <Checkbox
                            // type="checkbox"
                            // className="form-check-input"
                            name={user.comp_name + '_' + user.comp_code}
                            value={user}
                            checked={user?.checked || false}
                            onChange={handleChange}
                          />
                        </div>
                      }
                    </td>
                    <td>{user.comp_name}</td>
                    <td>{user.comp_code}</td>
                    <td>
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
                    <td>
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
                          checked={user?.qr_uniq_checked || false}
                          onChange={(e) => qr_uniq_checking(e, index, '1')}
                        ></Checkbox>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
          <br />

          <div className="row justify-content-end">
            <div className="text-end">

              <Button
                type="submit"
                color="primary"
                className="w-md"
                onClick={submitForm}
              >
                SUBMIT
              </Button>

            </div>
          </div>
        </div>

      );
    }
    else {
      return null;
    }
  }

  export default App;
