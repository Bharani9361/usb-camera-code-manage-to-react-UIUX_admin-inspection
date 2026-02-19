import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Label, Table } from "reactstrap";
import React, { useEffect, useState } from "react";
import { Checkbox, } from 'antd';
import urlSocket from "pages/AdminInspection/urlSocket";
import No_data from 'assets/images/nodata/nodata_graph.jpg';

function App(props) {
  const data = props
  const station_info = data.station_info
  const sample_data = data.samples
  const selected_data = data.selected_data
  console.log('first', sample_data, selected_data)
  const [users, setUsers] = useState([]);
  const [comp_selected, setSelectedComp] = useState([]);
  const [partialySelected, setPartialySelected] = useState(false);
  const [selectAll, setSelectAll] = useState(false)
  const [dataloaded, setDataloaded] = useState(false)

  useEffect(() => {
    console.log('first', sample_data)
    setUsers(sample_data);
    loadSelected_comp(sample_data)
  }, []);

  const handleChange = (e) => {
    console.log('e', e);
    let users_data = [...users];
    let user_count = 0, checked_count = 0;

    users_data.forEach((user, index) => {
        if (user.comp_name + '_' + user.comp_code === e.target.name) {
            user.checked = e.target.checked;
        }
        if (user.checked === true) {
            checked_count++;
            console.log('checked_count', checked_count);
        } 
    });

    user_count = users_data.length;
    setUsers(users_data);
    if (user_count === checked_count) {
        setSelectAll(true);
        setPartialySelected(false);
    } else if (checked_count < user_count && checked_count > 0) {
        setPartialySelected(true);
    } else if (checked_count === 0) {
        setSelectAll(false);
        setPartialySelected(false);
    }
};


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
      console.log('selectAll107', selectAll)
    }
    else {
      setSelectAll(false)
      console.log('selectAll110', selectAll)
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
    console.log('i am here', samples, select_data);

    let user_count = 0;
    let checked_count = 0;

    samples.forEach((data) => {
        select_data.forEach((selected_data) => {
            if (selected_data.comp_id === data._id) {
                data.checked = true;
                checked_count++;
            }
        });
    });
  
    user_count = samples.length;

    if (user_count === checked_count) {
        setSelectAll(true);
        setPartialySelected(false);
    } else if (checked_count < user_count && checked_count > 0) {
        setPartialySelected(true);
    } else if (checked_count === 0) {
        setSelectAll(false);
        setPartialySelected(false);
    }
    setDataloaded(true);
};
 
  const submitForm = () => {
    selected_data(users)
  }

  if (dataloaded === true) {
    return (
      <div>
        <div className="table-responsive">
          <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
            <thead className="table-light">
              <tr>
                <th>
                  {console.log('432selectAll', selectAll)}
                  <div className="form-check">
                    <Checkbox indeterminate={partialySelected} checked={selectAll} onChange={handleChangeall}>Select All</Checkbox>
                  </div>
                </th>
                <th>Component Name</th>
                <th>Component Code</th>
              </tr>
            </thead>
            <tbody>
              {users.length !== 0 ?
                users.map((user, index) => (
                  <tr key={index}>
                    <td style={{backgroundColor: user?.checked ? 'lemonchiffon' : 'white'}}>
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
                    <td style={{backgroundColor: user?.checked ? 'lemonchiffon' : 'white'}}>{user.comp_name}</td>
                    <td style={{backgroundColor: user?.checked ? 'lemonchiffon' : 'white'}}>{user.comp_code}</td>
                  </tr>
                )) :
                <tr>
                  <td colSpan={3} className="text-center">
                    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
                      <div className="text-center">
                        <img src={No_data} className="img-fluid h-auto" alt="No Data" style={{ width: '30%' }} />
                        <p>No Components Available</p>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </Table>
        </div>
        <br />
        {users.length !== 0 &&
          <div className="row justify-content-end">
            <div className="text-end">
              <Button type="submit" color="primary" className="w-md" onClick={submitForm}>  SUBMIT</Button>
            </div>
          </div>
        }
    
      </div>
    );
  }
  else {
    return null;
  }
}
export default App;


