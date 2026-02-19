import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table, Input } from "reactstrap";
import React, { useEffect, useState } from "react";
import urlSocket from "pages/AdminInspection/urlSocket";
import No_data from 'assets/images/nodata/nodata_graph.jpg';

function App(props) {
  console.log('data', props)
  const data = props
  const comp_info = data.compinfo
  const sample_data = data.station_data
  const selected_data = data.selected_data
  const [users, setUsers] = useState([]);
  const [comp_selected, setSelectedComp] = useState([]);
  const [partialySelected, setPartialySelected] = useState(false);
  const [selectAll, setSelectAll] = useState(false) 
  const [dataloaded, setDataloaded] = useState(false)

  useEffect(() => {
    setUsers(sample_data);
    loadSelected_comp(sample_data)
  }, []);

  const handleChange = (e) => {
    console.log('50eee', e)
    let users_data = [...users]
    let user_count = 0, checked_count = 0
    users_data.map((user, index) => {
      if (user.station_name + '_' + user.mac_addrs === e.target.name) {
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
      setPartialySelected(false)
    }
    else if (checked_count < user_count && checked_count > 0) {
      setPartialySelected(true)
    }
    else if (checked_count === 0) {
      setSelectAll(false)
      setPartialySelected(false)
    }
  }

  const handleChangeall = (e) => {
    console.log('first', e.target.checked)
    let users_data = [...users]
    users_data.map((user, index) => {
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
    console.log('comp_info', comp_info)
    try {
      urlSocket.post('/comp_station_list', { 'comp_id': comp_info.component_info._id },
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
    console.log('I am here:', samples, select_data);

    let user_count = 0;
    let checked_count = 0;

    // Iterate through samples and update their properties based on select_data
    samples.forEach((data) => {
        select_data.forEach((selected_data) => {
            if (selected_data.station_id === data._id) {
                data.checked = true;                
                checked_count++;
            }
        });
    });

    console.log('Updated samples:', samples);
    user_count = samples.length;

    // Update selection state based on checked counts
    if (user_count === checked_count) {
        setSelectAll(true);
        setPartialySelected(false);
    } else if (checked_count > 0) {
        setPartialySelected(true);
        setSelectAll(false);
    } else {
        setSelectAll(false);
        setPartialySelected(false);
    }
    setDataloaded(true);
};
    
  const submitForm = () => {
    selected_data(users) 
  }


  if(dataloaded===true){
    return (
      <div>
        <div className="table-responsive">
          <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
            <thead className="table-light">
              <tr>
                <th>
                  {/* Select All Checkbox */}
                  <div className="form-check form-check-md">
                    <Input
                      type="checkbox"
                      className="form-check-input"
                      id="selectAllCheckbox"
                      indeterminate={partialySelected ? 'true' : undefined} // Simulates indeterminate state
                      checked={selectAll}
                      onChange={handleChangeall}
                    />
                    <label className="form-check-label" htmlFor="selectAllCheckbox">
                      Select All
                    </label>
                  </div>
                </th>
                <th>Station Name</th>
              </tr>
            </thead>
            <tbody>
              {users.length !== 0 ? (
                users.map((user, index) => (
                  <tr key={index}>
                    <td style={{ backgroundColor: user?.checked ? "lemonchiffon" : 'white' }}>
                      <div className="form-check form-check-md">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          name={`${user.station_name}_${user.mac_addrs}`}
                          value={user}
                          checked={user?.checked || false}
                          onChange={handleChange}
                        />
                      </div>
                    </td>
                    <td style={{ backgroundColor: user?.checked ? "lemonchiffon" : 'white' }}>{user.station_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center">
                    <div
                      className="container d-flex justify-content-center align-items-center"
                      style={{ minHeight: "70vh" }}
                    >
                      <div className="text-center">
                        <p>No Stations Available</p>
                        <img
                          src={No_data}
                          className="img-fluid h-auto"
                          alt="No Data"
                          style={{ width: "30%" }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Submit Button */}
          {users.length !== 0 && (
            <div className="text-end">
              <Button
                type="submit"
                color="success"
                className="w-md mt-2"
                onClick={submitForm}
              >
                SUBMIT
              </Button>
            </div>
          )}
        </div>
      </div>  
    );
  }
  else{
    return null;
  }
}

export default App;