//CHiran

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Input, Modal, Form, Label, Card, CardBody, UncontrolledTooltip } from "reactstrap";
import { Radio, Space } from "antd";
import axios from "axios";
// import Breadcrumbs from "../components/Common/Breadcrumb"; // adjust path
// import Breadcrumbs from "components - Copy/Common/Breadcrumb";
import Breadcrumbs from "components/Common/Breadcrumb";
// import PaginationComponent from "../components/Common/PaginationComponent"; // adjust path
import PaginationComponent from "./PaginationComponent";
import SweetAlert from "react-bootstrap-sweetalert";
import { Checkbox } from "antd";
import { MetaTags } from "react-meta-tags";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import urlSocket from "./urlSocket";
import { Spinner } from "reactstrap";

// import { useNavigate } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
// const urlSocket = axios.create({ baseURL: "http://your-api-url.com" }); // replace with your API URL

const StationInformation = () => {

    const [samplesList, setSamplesList] = useState([]);
    const [stationInfo, setStationInfo] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(1);
    const [searchField, setSearchField] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [addStationModal, setAddStationModal] = useState(false);
    const [stationName, setStationName] = useState("");
    const [macAddress, setMacAddress] = useState("");
    const [selectM_A, setSelectM_A] = useState("Active");
    const [configChange, setConfigChange] = useState(false);
    const [stationId, setStationId] = useState("");
    const [stnVer, setStnVer] = useState("");
    const [isMacDisabled, setIsMacDisabled] = useState(false);
    const [alertMsg, setAlertMsg] = useState(false);
    const [message, setMessage] = useState("");
    const [mesgShow, setMesgShow] = useState(false);
    const [deviceInfoA, setDeviceInfoA] = useState([]);
    const [deviceInfoB, setDeviceInfoB] = useState([]);
    const [filter, setFilter] = useState(1);
    // const [loading, setLoading] = useState(true); // spinner initially visible
    //   const [configChange, setConfigChange] = useState(false);
    const activeInactiveOptions = ["Active", "Inactive"];
    const history = useHistory();

    //   const activeInactive = async (status, filter) => {
    //     setDataLoaded(false);
    //     setSelectedFilter(filter);
    //     setSearchField("");

    //     try {
    //       const response = await urlSocket.post("/station_info", { status });
    //       const data = response.data;
    //       console.log('responsedata :>> ', data);

    //       if (data.error === "Tenant not found") {
    //         console.error("Tenant not found");
    //       } else {
    //         let filteredData = data;
    //         if (filter === 2) filteredData = data.filter(d => d.status === "Active");
    //         else if (filter === 3) filteredData = data.filter(d => d.status === "Inactive");

    //         setCurrentItems(data); 
    //         setSamplesList(filteredData);
    //         setStationInfo(filteredData);
    //       }
    //     } catch (err) {
    //     console.error(err);
    //     setCurrentItems([]);
    //     setSamplesList([]);
    //     setStationInfo([]);
    //   } finally {
    //     // setLoading(true);   // spinner OFF
    //     setDataLoaded(true); // data fetch finished
    //   }
    //   };
    const activeInactive = async (status, filter) => {
        setDataLoaded(false); // 1️⃣ show spinner before fetch
        setSelectedFilter(filter);
        setSearchField("");

        try {
            const response = await urlSocket.post("/station_info", { status });
            let data = response.data || [];

            // Optional: filter based on Active/Inactive
            if (filter === 2) data = data.filter(d => d.status === "Active");
            else if (filter === 3) data = data.filter(d => d.status === "Inactive");

            // setCurrentItems(data); // 2️⃣ update table rows
            setSamplesList(data);  // optional, if you use a separate state
            setStationInfo(data);
        } catch (err) {
            console.error(err);
            // setCurrentItems([]);   // 2️⃣ clear table on error
            setSamplesList([]);
            setStationInfo([]);
        } finally {
            setDataLoaded(true); // 3️⃣ hide spinner after fetch completes
        }
    };


    useEffect(() => {
        activeInactive("ALL", 1);
    }, []);

    // useEffect(() => {
    //   // Fetch all stations initially
    //   const fetchStations = async () => {
    //     await activeInactive("ALL", 1); // This will populate stationInfo
    //   };
    //   fetchStations();
    // }, []); // runs only once on mount

    // useEffect(() => {
    //   const fetchStations = async () => {
    //     try {
    //       setLoading(true); // start spinner
    //       await activeInactive("ALL", 1); // fetch data
    //       // assume activeInactive updates stationInfo via setStationInfo internally
    //     } catch (err) {
    //       console.error(err);
    //     } finally {
    //       setLoading(false); // stop spinner when fetch finishes
    //     }
    //   };

    //   fetchStations();
    // }, []);
    // Effect to update filtered list whenever searchField or stationInfo changes
    useEffect(() => {
        const filtered = stationInfo.filter(d =>
            d.station_name.toUpperCase().includes(searchField.toUpperCase())
        );
        setSamplesList(filtered);
        setCurrentPage(1); // Reset page to 1 when search changes
    }, [searchField, stationInfo]);

    const cancelDeactivation = () => {
        setAlertMsg(false);
    };

    const selectActiveInactive = (e) => {
        console.log('first', e.target.value);
        setSelectM_A(e.target.value);
    };

    const toastSuccess = (title, message) => {
        toastr.options.closeDuration = 8000;
        toastr.options.positionClass = "toast-bottom-right";
        toastr.success(message, title);
    };


    const toastWarning = (message) => {
        toastr.options.closeDuration = 8000;
        toastr.options.positionClass = "toast-bottom-right";
        toastr.warning('', message);
    };

    const toastError = (message) => {
        toastr.options.closeDuration = 8000;
        toastr.options.positionClass = "toast-bottom-right";
        toastr.error(message, "Failed");
    };



    const filteredItems = () => {
        let filtered = samplesList;
        if (searchField) {
            filtered = filtered.filter(d =>
                d.station_name.toUpperCase().includes(searchField.toUpperCase())
            );
        }
        return filtered;
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems().slice(indexOfFirstItem, indexOfLastItem);



    const submitForm = async () => {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

        if (!stationName.trim()) {
            setMessage("Enter the station name");
            setMesgShow(true);
            return;
        }
        if (!macAddress.trim()) {
            setMessage("Enter the MAC address");
            setMesgShow(true);
            return;
        }
        if (!macRegex.test(macAddress)) {
            setMessage("Invalid MAC address format");
            setMesgShow(true);
            return;
        }

        const adminDB = JSON.parse(sessionStorage.getItem("userData") || "{}");

        const payload = {
            station_name: stationName,
            mac_addrs: macAddress,
            status: selectM_A,
            config_change: configChange,
            stn_ver: stnVer,
            admin_db: adminDB,
            _id: stationId || undefined
        };

        try {
            console.log('endpoint, payload', payload)
            const endpoint = stationId ? "/edit_manage_station_data" : "/manage_station_data";
            const response = await urlSocket.post(endpoint, payload);
            const data = response.data;

            if (data.error) {
                console.error(data.error);
                return;
            }

            activeInactive("ALL", selectedFilter);
            setAddStationModal(false);
            setMessage("Success");
            setMesgShow(true);
        } catch (err) {
            console.error(err);
            setMessage("Error submitting data");
            setMesgShow(true);
        }
    };

    const actInactChange = async () => {
        setAlertMsg(false);
        const trimmedStationName = stationName.trim();
        const trimmedMac = macAddress.trim();
        const adminDB = JSON.parse(sessionStorage.getItem('userData') || '{}');

        try {
            const payload = {
                _id: stationId,
                station_name: trimmedStationName,
                mac_addrs: trimmedMac,
                status: selectM_A,
                config_change: configChange,
                stn_ver: stnVer,
                admin_db: adminDB
            };

            const response = await urlSocket.post('/edit_manage_station_data', payload);
            const data = response.data;

            if (data.error === "Tenant not found") {
                console.error("Tenant not found");
                return;
            }

            if (data === 'Station Name Already Exists') {
                setMessage('Station Name Already Exists');
                setMesgShow(true);
                toastError('Station Name Already Exists');
                setTimeout(() => setMessage(""), 2000);
                return;
            }

            if (data === 'Mac Address Already Exists') {
                setMessage('Mac Address Already Exists');
                setMesgShow(true);
                toastError('Mac Address Already Exists');
                setTimeout(() => setMessage(""), 2000);
                return;
            }

            // Filter data according to the selected filter
            let filteredData = data;
            if (selectedFilter === 2) filteredData = data.filter(d => d.status === 'Active');
            else if (selectedFilter === 3) filteredData = data.filter(d => d.status === 'Inactive');

            setSamplesList(filteredData);
            setStationInfo(filteredData);
            setDataLoaded(true);
            setMessage('Success');
            setMesgShow(true);
            setTimeout(() => setMessage(""), 2000);
            toastSuccess(`"${trimmedStationName}" Status Updated Successfully`, '');
            setAddStationModal(false);

        } catch (error) {
            console.error(error);
            toastWarning(`Error on "${stationName}" Updation`);
        }

        // Refresh the list after the change
        if (selectedFilter === 1) activeInactive('ALL', 1);
        else if (selectedFilter === 2) activeInactive('Active', 2);
        else if (selectedFilter === 3) activeInactive('Inactive', 3);
    };

    const devicePosition = (value, index) => {
        console.log('value', value);
        const updatedDeviceInfo = [...deviceInfoA]; // deviceInfoA is your state array
        updatedDeviceInfo[index].position = value;
        console.log('updatedDeviceInfo', updatedDeviceInfo);
        setDeviceInfoA(updatedDeviceInfo);
        setDeviceInfoB(updatedDeviceInfo); // if you need a mirrored copy
    };

    const manageComp = (data) => {
        console.log('401 data : ', data);
        sessionStorage.setItem("stationInfo", JSON.stringify(data));
        history.push('/entry_scrn_stg');
    };


    const configureChecking = (e) => {
        console.log('e400', e);
        setConfigChange(e.target.checked);
    };

    const createNew = () => {
        setAddStationModal(true);
        setStationName("");
        setMacAddress("");
        setSelectM_A("Active");
        setConfigChange(false);
        setStationId("");
        setIsMacDisabled(false);
    };

    const editStation = station => {
        setAddStationModal(true);
        setStationName(station.station_name);
        setMacAddress(station.mac_addrs);
        setSelectM_A(station.status);
        setConfigChange(station.config_change);
        setStationId(station._id);
        setStnVer(station.stn_ver);
        setIsMacDisabled(true);
    };

    // const onSearch = (search) => {
    //   console.log('search input:', search);
    //   setSearchField(search);
    //   setCurrentPage(1); // reset pagination to first page

    //   // Optional: process/filter the list immediately
    //   setTimeout(() => {
    //     dataListProcess(search);
    //   }, 100);
    // };


    const dataListProcess = () => {
        try {
            let filteredData = [...stationInfo]; // stationInfo is your full API data

            // 1️⃣ Filter by search
            if (searchField) {
                filteredData = filteredData.filter(d =>
                    d.station_name.toUpperCase().includes(searchField.toUpperCase())
                );
            }

            // 2️⃣ Sort if sorting is applied
            if (sorting.field) {
                const reversed = sorting.order === "asc" ? 1 : -1;
                filteredData.sort((a, b) => reversed * a[sorting.field].localeCompare(b[sorting.field]));
            }

            // 3️⃣ Paginate
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginated = filteredData.slice(start, end);

            // 4️⃣ Update state
            setSamplesList(paginated);
            setTotalItems(filteredData.length);
            setDataLoaded(true);
        } catch (error) {
            console.error("Error processing data list:", error);
        }
    };



    const handlePageChange = pageNumber => {
        setCurrentPage(pageNumber);
    };

    const errorHandler = (error) => {
        sessionStorage.removeItem("authUser");
        history.push("/login");
    };





    //   if (!dataLoaded) return <div>Loading...</div>;


    // <Container fluid>
    //   <Breadcrumbs title="STATION INFORMATION" />

    //   <Row className="mt-5">
    //     <Col sm={3}>
    //       <Input
    //         placeholder="Search..."
    //         value={searchField}
    //         onChange={e => setSearchField(e.target.value)}
    //       />
    //     </Col>
    //     <Col className="text-end">
    //       <Button color="primary" onClick={() => activeInactive("ALL", 1)}>ALL</Button>{" "}
    //       <Button color="success" onClick={() => activeInactive("Active", 2)}>Active</Button>{" "}
    //       <Button color="warning" onClick={() => activeInactive("Inactive", 3)}>Inactive</Button>{" "}
    //       <Button color="primary" onClick={createNew}>Add Station</Button>
    //     </Col>
    //   </Row>

    //   <Table bordered>
    //     <thead>
    //       <tr>
    //         <th>S.No.</th>
    //         <th>Station Name</th>
    //         <th>Mac Address</th>
    //         <th>Status</th>
    //         <th>Actions</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {currentItems.map((station, index) => (
    //         <tr key={station._id}>
    //           <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
    //           <td>{station.station_name}</td>
    //           <td>{station.mac_addrs}</td>
    //           <td>{station.status}</td>
    //           <td>
    //             <Button color="primary" size="sm" onClick={() => editStation(station)}>Edit</Button>
    //           </td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </Table>

    //   <PaginationComponent
    //     totalItems={filteredItems().length}
    //     itemsPerPage={itemsPerPage}
    //     currentPage={currentPage}
    //     onPageChange={handlePageChange}
    //   />

    //   <Modal isOpen={addStationModal}>
    //     <Form>
    //       <Label>Station Name:</Label>
    //       <Input value={stationName} onChange={e => setStationName(e.target.value)} />
    //       <Label>MAC Address:</Label>
    //       <Input value={macAddress} onChange={e => setMacAddress(e.target.value)} disabled={isMacDisabled} />
    //       <Label>Status:</Label>
    //       <Radio.Group value={selectM_A} onChange={e => setSelectM_A(e.target.value)}>
    //         <Space>
    //           <Radio value="Active">Active</Radio>
    //           <Radio value="Inactive">Inactive</Radio>
    //         </Space>
    //       </Radio.Group>
    //         <Label check>
    //         <Input
    //             type="checkbox"
    //             checked={configChange}
    //             onChange={e => setConfigChange(e.target.checked)}
    //         />{' '}
    //         Allow configuration change
    //         </Label>
    //       {mesgShow && <div>{message}</div>}
    //       <Button color="primary" onClick={submitForm}>Submit</Button>
    //       <Button color="secondary" onClick={() => setAddStationModal(false)}>Cancel</Button>
    //     </Form>
    //   </Modal>

    //   {alertMsg && (
    //     <SweetAlert
    //       showCancel
    //       title={`Are you sure to deactivate the station ${stationName}?`}
    //       cancelBtnBsStyle="success"
    //       confirmBtnText="Yes"
    //       cancelBtnText="No"
    //       onConfirm={() => {}}
    //       onCancel={() => setAlertMsg(false)}
    //     />
    //   )}
    // </Container>
    return dataLoaded ? (
        <React.Fragment>
            <div className="page-content">
                <MetaTags><title>Station Information</title></MetaTags>
                <Breadcrumbs title="STATION INFORMATION" />

                <Container fluid>
                    <Card>
                        <CardBody>
                            <Row className="mb-2">
                                <Col sm={3}>
                                    <div className="search-box">
                                        <div className="position-relative">
                                            <Input
                                                value={searchField}
                                                onChange={e => setSearchField(e.target.value)}
                                                placeholder="Search..."
                                            />
                                            <i className="bx bx-search-alt search-icon" />
                                        </div>
                                    </div>
                                </Col>
                                <Col>
                                    <div className="text-end">
                                        <div className="btn-group">
                                            <Button color="primary" className="w-sm btn btn-sm" outline={selectedFilter !== 1} onClick={() => activeInactive("ALL", 1)}>ALL</Button>
                                            <Button color="success" className="w-sm btn btn-sm" outline={selectedFilter !== 2} onClick={() => activeInactive("Active", 2)}>Active</Button>
                                            <Button color="warning" className="w-sm btn btn-sm" outline={selectedFilter !== 3} onClick={() => activeInactive("Inactive", 3)}>Inactive</Button>
                                            <Button color="primary" className="w-sm btn btn-sm d-flex align-items-center" onClick={createNew}>
                                                <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Station
                                            </Button>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <div className="table-responsive">
                                    <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                                        <thead className="table-light">
                                            <tr>
                                                <th>S. No.</th>
                                                <th>Station Name</th>
                                                <th>Mac Address</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((station, index) => (
                                                <tr key={station._id}>
                                                    <td style={{ backgroundColor: "white" }}>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                                    <td style={{ backgroundColor: "white" }}>{station.station_name}</td>
                                                    <td style={{ backgroundColor: "white" }}>{station.mac_addrs}</td>
                                                    <td style={{ backgroundColor: "white" }}>{station.status}</td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
                                                            <Button color="primary" className="btn btn-sm" onClick={() => editStation(station)} id={`edit-${station._id}`}>Edit</Button>
                                                            <UncontrolledTooltip placement="top" target={`edit-${station._id}`}>Edit Station</UncontrolledTooltip>
                                                            {station.status !== "Inactive" && (
                                                                <>
                                                                    <Button color="primary" className="btn btn-sm" onClick={() => manageComp(station)} id={`manage-${station._id}`}>Manage Components</Button>
                                                                    <UncontrolledTooltip placement="top" target={`manage-${station._id}`}>Manage Components Info</UncontrolledTooltip>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>




                                    {/* </Table> */}
                                    {/* <Row>
  <div className="table-responsive">
    <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
      <thead className="table-light">
        <tr>
          <th>S. No.</th>
          <th>Station Name</th>
          <th>Mac Address</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {dataLoaded === false ? (
          // Spinner while loading
          <tr>
            <td colSpan={5} className="text-center py-5">
              <div
                className="d-flex flex-column align-items-center justify-content-center"
                style={{ height: '50vh' }}
              >
                <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                <span className="text-muted mt-2">Loading stations...</span>
              </div>
            </td>
          </tr>
        ) : currentItems.length > 0 ? (
          // Render data rows
          currentItems.map((station, index) => (
            <tr key={station._id}>
              <td style={{ backgroundColor: "white" }}>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
              <td style={{ backgroundColor: "white" }}>{station.station_name}</td>
              <td style={{ backgroundColor: "white" }}>{station.mac_addrs}</td>
              <td style={{ backgroundColor: "white" }}>{station.status}</td>
              <td style={{ backgroundColor: "white" }}>
                <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
                  <Button
                    color="primary"
                    className="btn btn-sm"
                    onClick={() => editStation(station)}
                    id={`edit-${station._id}`}
                  >
                    Edit
                  </Button>
                  <UncontrolledTooltip placement="top" target={`edit-${station._id}`}>
                    Edit Station
                  </UncontrolledTooltip>
                  {station.status !== "Inactive" && (
                    <>
                      <Button
                        color="primary"
                        className="btn btn-sm"
                        onClick={() => manageComp(station)}
                        id={`manage-${station._id}`}
                      >
                        Manage Components
                      </Button>
                      <UncontrolledTooltip placement="top" target={`manage-${station._id}`}>
                        Manage Components Info
                      </UncontrolledTooltip>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))
        ) : (
          // No record message
          <tr>
            <td colSpan={5} className="text-center py-5">
              <span className="text-muted">No record found</span>
            </td>
          </tr>
        )}
      </tbody>
    </Table> */}
                                    {/* </div>? */}

                                    <PaginationComponent
                                        totalItems={filteredItems().length}
                                        itemsPerPage={itemsPerPage}
                                        currentPage={currentPage}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            </Row>

                            {samplesList.length === 0 && (
                                <div className="container" style={{ position: "relative", height: "20vh" }}>
                                    <div className="text-center" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                                        <h5 className="text-secondary">No Records found</h5>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Container>

                <Modal isOpen={addStationModal}>
                    <div className="modal-header">
                        <h5 className="modal-title mt-0">Enter Station Details</h5>
                        <button type="button" className="close" onClick={() => setAddStationModal(false)}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <Form>
                            <div className="row mb-4">
                                <Col sm={12}>
                                    <Label>Station Name:</Label>
                                    <Input value={stationName} onChange={e => setStationName(e.target.value)} maxLength={40} />
                                </Col>
                            </div>
                            <div className="row mb-4">
                                <Col sm={12}>
                                    <Label>Mac Address:</Label>
                                    <Input value={macAddress} onChange={e => setMacAddress(e.target.value)} maxLength={32} disabled={isMacDisabled} />
                                </Col>
                            </div>
                            <div className="row mb-4">
                                <Col sm={12}>
                                    <Label>Status:</Label>
                                    <Radio.Group value={selectM_A} onChange={selectActiveInactive}>
                                        <Space>
                                            {activeInactiveOptions.map((data, idx) => (
                                                <div key={idx} className="pay_cards" style={{ background: selectM_A !== data && "white" }}>
                                                    <Radio value={data}>{data}</Radio>
                                                </div>
                                            ))}
                                        </Space>
                                    </Radio.Group>
                                </Col>
                            </div>
                            <div className="row mb-4">
                                <Col sm={12}>
                                    <Checkbox checked={configChange} onChange={configureChecking}>
                                        Allow Inspection User to Change Configuration in Station
                                    </Checkbox>
                                </Col>
                            </div>
                            <div className="row justify-content-end">
                                <Col sm={9}>
                                    <div className="text-left">{mesgShow && <Label style={{ color: message !== "Success" ? "red" : "green" }}>{message}</Label>}</div>
                                    <div className="text-end">
                                        <Button color="primary" onClick={submitForm}>Submit</Button>{" "}
                                        <Button color="secondary" onClick={() => setAddStationModal(false)}>Cancel</Button>
                                    </div>
                                </Col>
                            </div>
                        </Form>
                    </div>
                </Modal>

                {alertMsg && (
                    <SweetAlert
                        showCancel
                        title={`Are you sure to deactivate the station ${stationName}? This will remove the component relationship.`}
                        cancelBtnBsStyle="success"
                        confirmBtnText="Yes"
                        cancelBtnText="No"
                        onConfirm={() => actInactChange()}
                        onCancel={cancelDeactivation}
                    />
                )}
            </div>
        </React.Fragment>
    ) : null;

};

export default StationInformation;



//Bharani
// import React, { Component } from "react";
// import MetaTags from 'react-meta-tags';
// import PropTypes from "prop-types"
// import {
//     Card,
//     Col,
//     Container,
//     Row,
//     CardBody,
//     CardTitle,
//     Label,
//     Button,
//     Form,
//     Input,
//     InputGroup, Modal, Table,
//     UncontrolledTooltip
// } from "reactstrap";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import Select from 'react-select';
// import { Radio, Space, Checkbox } from 'antd';
// // import 'antd/dist/antd.css';
// import toastr from "toastr";
// import SearchField from "react-search-field";
// import SweetAlert from 'react-bootstrap-sweetalert';
// import _ from 'lodash';
// import urlSocket from "./urlSocket";
// import PaginationComponent from "./PaginationComponent";
// import Breadcrumbs from "components/Common/Breadcrumb";


// // import Device from './Camera'

// class StationInfo extends Component {
//     _isMounted = false;
//     constructor(props) {
//         super(props);
//         this.state = {
//             dataloaded: false,
//             addStationModal: false,
//             tbIndex: 0,
//             intervalId: '',
//             samples_list: [],
//             station_info: [],
//             device_info: [],
//             device_info_a: [],
//             device_info_b: [],
//             sorting: { field: "", order: "" },
//             items_per_page_stock: 100,
//             currentPage_stock: 1,
//             mesg_show: false,
//             alertMsg: false,
//             selectedFilter: 1,
//             SearchField: '',
//             config_change: '',
//             active_inactive: ['Active', 'Inactive'],
//             device_position: [{ label: 'Top' },
//             { label: 'Bottom' },
//             { label: 'Right' },
//             { label: 'Left' }
//             ],
//             // position: { label: 'Top' },
//             selectM_A: 'Active',
//             station_name: '',
//             message: '',
//             mac_address: '',
//             station_id: '',
//             stn_ver: '',
//             deviceId: '',
//             search: '',
//             obj: {},

//             // pagination
//             currentPage: 1,
//             itemsPerPage: 10,

//             isMacDisabled: true,
//         }
//     }

//     componentDidMount() {
//         // this._isMounted = true;
//         // this.device_find()
//         //console.log('position', this.state.device_position)
//         this.setState({ selectedFilter: 1 })
//         this.active_inactive('ALL', 1)
//     }
//     // componentWillUnmount = async () => {
//     //     this._isMounted = false;
//     //     clearInterval(this.state.intervalId)
//     // }
//     // device_find = async () => {
//     //     let intervalId = setInterval(() => {
//     //         navigator.mediaDevices.enumerateDevices().then(devices =>
//     //             this.handledevice(devices)
//     //         )
//     //      }, 300)
//     //      this.setState({intervalId})
//     // }

//     // handledevice = (devices) => {
//     //     console.log('devices77', devices)
//     //     let device_info = devices.filter(({kind}) => kind === 'videoinput')
//     //     console.log('deviceinfo1044', device_info)

//     //     if(this.state.device_info_b.length !== 0 ){
//     //         device_info.map((device_a, index) => {
//     //             console.log('device_a1046', device_a)
//     //             let position_data = this.state.device_info_b.filter((device_b) => {
//     //                  return device_b.deviceId === device_a.deviceId
//     //             })
//     //             // let position_data = _.filter(this.state.device_info_b, e => {
//     //             //     return e.deviceId === device_a.deviceId
//     //             // })
//     //             console.log('position_data782', position_data)
//     //             if (position_data[0].position !== undefined){
//     //                 device_info[index].position = position_data[0].position
//     //             }
//     //         })
//     //         // console.log('first785', data)
//     //         this.setState({device_info_a: device_info})
//     //         console.log('this.state.device_info_athos.stite.', this.state.device_info_a)
//     //     }
//     //     else{
//     //         this.setState({device_info_a:device_info})
//     //     }
//     // }

//     // submitData = (data) => {
//     //     console.log('data63', data)
//     //     setTimeout(() => { this.setState({ device_info: data }) }, 100)
//     // }

//     active_inactive = (data, selectedFilter) => {
//         let active = data
//         // let search = " "
//         console.log('active', data, selectedFilter)
//         this.setState({ selectedFilter, alertMsg: false, SearchField: '' })
//         console.log('first61', this.state.SearchField)
//         try {
//             urlSocket.post('/station_info', { 'status': active },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     if (data.error === "Tenant not found") {
//                         console.log("data error", data.error);
//                         this.error_handler(data.error);
//                     }
//                     else {
//                         console.log("is_active", data)
//                         if (data.length === 0 || data === null || data === undefined) {
//                             this.setState({ samples_list: [], station_info: [], dataloaded: true })
//                         } else {
//                             console.log(`object`, data[0].comp_code)
//                             this.setState({ samples_list: data, station_info: data, dataloaded: true })
//                         }
//                     }
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//         }
//         this.setState({ refresh: true })
//     }

//     cancel_deactivation = () => {
//         this.setState({ alertMsg: false })
//     }

//     // stationInfo = () => {
//     //     try {
//     //         axios.post('https://172.16.1.91:5000/station_info',
//     //             { mode: 'no-cors' })
//     //             .then((response) => {
//     //                 let data = response.data
//     //                 console.log('samples_list', data)
//     //                 this.setState({ samples_list: data, station_info:data, dataloaded: true })
//     //             })
//     //             .catch((error) => {
//     //                 console.log(error)
//     //             })
//     //     } catch (error) {
//     //         console.log("----", error)
//     //     }
//     // }
//     //     var nietos = [];
//     // var obj = {};
//     // obj["01"] = nieto.label;
//     // obj["02"] = nieto.value;
//     // nietos.push(obj);

//     selectActive_inactive = (e) => {
//         console.log('first', e.target.value)
//         this.setState({ selectM_A: e.target.value })
//     }

//     toastSuccess = (title, message) => {
//         // let title = "Success"
//         toastr.options.closeDuration = 8000
//         toastr.options.positionClass = "toast-bottom-right"
//         toastr.success(message, title)
//     }

//     toastWarning = (message) => {
//         let title = "Failed"
//         toastr.options.closeDuration = 8000
//         toastr.options.positionClass = "toast-bottom-right"
//         toastr.warning('', message)
//     }

//     toastError = (message) => {
//         let title = "Failed"
//         toastr.options.closeDuration = 8000
//         toastr.options.positionClass = "toast-bottom-right"
//         toastr.error(message, title)
//     }

//     submitForm = () => {
//         console.log('sbmited')
//         let station_name = this.state.station_name.trim()
//         let mac_addrs = this.state.mac_address.trim()
//         let status = this.state.selectM_A
//         let config_change = this.state.config_change;
//         let adminDB = JSON.parse(sessionStorage.getItem('userData'));
//         console.log('adminDb', adminDB)

//         const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
//         // let other_info = this.state.device_info_b
//         // console.log('other_info176', other_info)
//         // let device = this.state.device
//         // console.log('device178', device)

//         if (station_name === '') {
//             this.setState({ message: "enter the station name", mesg_show: true })
//             setTimeout(() => {
//                 this.setState({ message: "" })
//             }, 2000);
//             this.toastError("enter the station name")
//             // alert('enter the station name')
//         }
//         else if (mac_addrs === '') {
//             this.setState({ message: "enter the mac address", mesg_show: true })
//             setTimeout(() => {
//                 this.setState({ message: "" })
//             }, 2000);
//             this.toastError("enter the mac address")
//             // alert('enter the mac address')
//         }
//         else if (!macRegex.test(mac_addrs)) {  // ❌ Invalid MAC format
//             this.setState({ message: "Invalid MAC Address format", mesg_show: true });
//             setTimeout(() => this.setState({ message: "" }), 2000);
//             this.toastError("Invalid MAC Address format");
//         }
//         else if (station_name !== undefined && mac_addrs !== undefined) {
//             if (this.state.station_id !== '' && this.state.station_id !== undefined) {
//                 let _id = this.state.station_id
//                 let stn_ver = this.state.stn_ver
//                 console.log('_id157', _id, status)
//                 if (status === 'Inactive') {
//                     this.setState({ alertMsg: true })
//                 }
//                 else {
//                     console.log('submitForm ', station_name, mac_addrs, status, config_change)
//                     try {
//                         urlSocket.post('/edit_manage_station_data', { '_id': _id, 'station_name': station_name, 'mac_addrs': mac_addrs, 'status': status, 'config_change': config_change, 'stn_ver': stn_ver,'admin_db': adminDB },
//                             { mode: 'no-cors' })
//                             .then((response) => {
//                                 let data = response.data
//                                 console.log('response', data)
//                                 if (data.error === "Tenant not found") {
//                                     console.log("data error", data.error);
//                                     this.error_handler(data.error);
//                                 }
//                                 else {
//                                     if (data === 'Station Name Already Exists') {
//                                         this.setState({ message: 'Station Name Already Exists', mesg_show: true })
//                                         setTimeout(() => {
//                                             this.setState({ message: "" })
//                                         }, 2000);
//                                         this.toastError('Station Name Already Exists')
//                                     }
//                                     else if (data === "Mac Address Already Exists") {
//                                         this.setState({ message: 'Mac Address Already Exists', mesg_show: true })
//                                         setTimeout(() => {
//                                             this.setState({ message: "" })
//                                         }, 2000);
//                                         this.toastError('Mac Address Already Exists')
//                                     }
//                                     else {
//                                         if (this.state.selectedFilter === 1) {
//                                             this.setState({ samples_list: data, station_info: data, dataloaded: true });
//                                         } else if (this.state.selectedFilter === 2) {
//                                             const activeData = data.filter(data1 => data1.status === 'Active');
//                                             this.setState({ samples_list: activeData, station_info: activeData, dataloaded: true });
//                                         }
//                                         else if (this.state.selectedFilter === 3) {
//                                             const InactiveData = data.filter(data1 => data1.status === 'Inactive');
//                                             this.setState({ samples_list: InactiveData, station_info: InactiveData, dataloaded: true });
//                                         }
//                                         this.setState({ message: 'Success', mesg_show: true, isMacDisabled: true })
//                                         setTimeout(() => {
//                                             this.setState({ message: "" })
//                                         }, 2000);
//                                         this.toastSuccess(`"${station_name}" Updated Succesfully`, '')
//                                         this.setState({ addStationModal: false })
//                                     }
//                                 }

//                             })
//                             .catch((error) => {
//                                 console.log(error);
//                                 this.toastWarning(`Error on "${station_name}" Updation`)
//                             })
//                     } catch (error) {
//                         console.log("----", error)
//                     }
//                 }
//             }
//             else {
//                 try {
//                     urlSocket.post('/manage_station_data', { 'station_name': station_name, 'mac_addrs': mac_addrs, 'status': status, 'config_change': config_change,'admin_db': adminDB },
//                         { mode: 'no-cors' })
//                         .then((response) => {
//                             let data = response.data
//                             if (data.error === "Tenant not found") {
//                                 console.log("data error", data.error);
//                                 this.error_handler(data.error);
//                             }
//                             else {
//                                 console.log('response', data)
//                                 if (data === 'Station Name Already Exists') {
//                                     this.setState({ message: 'Station Name Already Exists', mesg_show: true })
//                                     setTimeout(() => {
//                                         this.setState({ message: "" })
//                                     }, 2000);
//                                     this.toastError('Station Name Already Exists')
//                                 }
//                                 else if (data === "Mac Address Already Exists") {
//                                     this.setState({ message: 'Mac Address Already Exists', mesg_show: true })
//                                     setTimeout(() => {
//                                         this.setState({ message: "" })
//                                     }, 2000);
//                                     this.toastError('Mac Address Already Exists')
//                                 }
//                                 else {
//                                     if (this.state.selectedFilter === 1) {
//                                         this.setState({ samples_list: data, station_info: data, dataloaded: true });
//                                     } else if (this.state.selectedFilter === 2) {
//                                         const activeData = data.filter(data1 => data1.status === 'Active');
//                                         this.setState({ samples_list: activeData, station_info: activeData, dataloaded: true });
//                                     }
//                                     else if (this.state.selectedFilter === 3) {
//                                         const InactiveData = data.filter(data1 => data1.status === 'Inactive');
//                                         this.setState({ samples_list: InactiveData, station_info: InactiveData, dataloaded: true });
//                                     }
//                                     this.setState({ message: 'Success' })
//                                     setTimeout(() => {
//                                         this.setState({ message: "" })
//                                     }, 2000);
//                                     this.toastSuccess(`"${station_name}" Created Succesfully`, '')
//                                     this.setState({ addStationModal: false })
//                                 }
//                             }

//                         })
//                         .catch((error) => {
//                             console.log(error);
//                             this.toastWarning(`Error on "${station_name}" Updation`)
//                         })
//                 } catch (error) {
//                     console.log("----", error)
//                 }
//             }
//         }
//     }

//     actInactChange = () => {
//         this.setState({ alertMsg: false })
//         let station_name = this.state.station_name.trim()
//         let mac_addrs = this.state.mac_address.trim()
//         let status = this.state.selectM_A
//         let _id = this.state.station_id
//         let config_change = this.state.config_change
//         let stn_ver = this.state.stn_ver
//         let adminDB = JSON.parse(sessionStorage.getItem('userData'));
//         try {
//             urlSocket.post('/edit_manage_station_data', { '_id': _id, 'station_name': station_name, 'mac_addrs': mac_addrs, 'status': status, 'config_change': config_change, 'stn_ver': stn_ver,'admin_db': adminDB },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('response', data)
//                     if (data.error === "Tenant not found") {
//                         console.log("data error", data.error);
//                         this.error_handler(data.error);
//                     }
//                     else {
//                         if (data === 'Station Name Already Exists') {
//                             this.setState({ message: 'Station Name Already Exists', mesg_show: true })
//                             setTimeout(() => {
//                                 this.setState({ message: "" })
//                             }, 2000);
//                             this.toastError('Station Name Already Exists')
//                         }
//                         else if (data === "Mac Address Already Exists") {
//                             this.setState({ message: 'Mac Address Already Exists', mesg_show: true })
//                             setTimeout(() => {
//                                 this.setState({ message: "" })
//                             }, 2000);
//                             this.toastError('Mac Address Already Exists')
//                         }
//                         else {
//                             if (this.state.selectedFilter === 1) {
//                                 this.setState({ samples_list: data, station_info: data, dataloaded: true });
//                             } else if (this.state.selectedFilter === 2) {
//                                 const activeData = data.filter(data1 => data1.status === 'Active');
//                                 this.setState({ samples_list: activeData, station_info: activeData, dataloaded: true });
//                             }
//                             else if (this.state.selectedFilter === 3) {
//                                 const InactiveData = data.filter(data1 => data1.status === 'Inactive');
//                                 this.setState({ samples_list: InactiveData, station_info: InactiveData, dataloaded: true });
//                             }
//                             this.setState({ message: 'Success', mesg_show: true })
//                             setTimeout(() => {
//                                 this.setState({ message: "" })
//                             }, 2000);
//                             this.toastSuccess(`"${station_name}" Status Updated Succesfully`, '')
//                             this.setState({ addStationModal: false })
//                         }
//                     }

//                 })
//                 .catch((error) => {
//                     console.log(error);
//                     this.toastWarning(`Error on "${station_name}" Updation`)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//         if (this.state.selectedFilter === 1) {
//             this.active_inactive('ALL', 1)
//         }
//         else if (this.state.selectedFilter === 2) {
//             this.active_inactive('Active', 2)
//         }
//         else if (this.state.selectedFilter === 3) {
//             this.active_inactive('Inactive', 3)
//         }
//     }

//     // deviceInfo = (e) => {
//     //     console.log('e322', e.label)
//     //     this.setState({ deviceId: { label: e.label } })
//     // }

//     device_position = (e, index, device) => {
//         console.log('e', e)
//         let device_info = [...this.state.device_info_a]
//         device_info[index].position = e
//         console.log('device_info1048', device_info)
//         this.setState({ device_info_a: device_info, device_info_b: device_info })
//     }

//     manageComp = (data) => {
//         console.log('401 data : ', data)
//         sessionStorage.removeItem("stationInfo")
//         sessionStorage.setItem("stationInfo", JSON.stringify(data));

//         this.props.history.push('/entry_scrn');
//     }

//     configure_checking = (e) => {
//         console.log('e400', e)
//         this.setState({ config_change: e.target.checked })
//     }

//     createNew = () => {
//         this.setState({
//             addStationModal: true,
//             station_name: '',
//             mac_address: '',
//             selectM_A: 'Active',
//             config_change: false,
//             station_id: '',
//             isMacDisabled: false
//         })
//     }

//     editStation = (station) => {
//         console.log('first', station)
//         this.setState({
//             addStationModal: true,
//             station_name: station.station_name,
//             mac_address: station.mac_addrs,
//             selectM_A: station.status,
//             config_change: station.config_change,
//             station_id: station._id,
//             stn_ver: station.stn_ver,
//             isMacDisabled: true
//         })
//     }

//     onSearch = (search) => {
//         console.log('e', search)
//         this.setState({ search, SearchField: search, currentPage_stock: 1 })
//         setTimeout(() => {
//             this.dataListProcess()
//         }, 100);
//     }

//     dataListProcess = () => {
//         try {
//             let { station_info, search, sorting, currentPage_stock, items_per_page_stock } = this.state
//             console.log('serach_componentList', station_info, search, sorting)
//             if (search) {
//                 station_info = station_info.filter(d => d.station_name.toUpperCase().includes(search.toUpperCase()))
//                 //   console.log('serach_componentList123', station_info)
//             }
//             if (sorting.field) {
//                 const reversed = sorting.order === "asc" ? 1 : -1
//                 station_info = station_info.sort((a, b) => reversed * a[sorting.field].localeCompare(b[sorting.field]))
//             }
//             let d = station_info.slice((currentPage_stock - 1) * items_per_page_stock, (currentPage_stock - 1) * items_per_page_stock + items_per_page_stock)
//             this.setState({ samples_list: d, totalItems_stock: station_info.length, dataloaded: true })
//             // console.log('this.state.', this.state.componentList, this.state.totalItems_stock)
//         } catch (error) {
//         }
//     }

//     handlePageChange = (pageNumber) => {
//         this.setState({ currentPage: pageNumber });
//     };

//     error_handler = (error) => {
//     sessionStorage.removeItem("authUser");
//     this.props.history.push("/login");
//   }


//     render() {
//         const { samples_list } = this.state;

//         // pagination
//         const { currentPage, itemsPerPage } = this.state;   // expandedRow, searchQuery,

//         // Calculate indices for slicing the component list
//         const indexOfLastItem = currentPage * itemsPerPage;
//         const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//         const currentItems = samples_list.slice(indexOfFirstItem, indexOfLastItem);

//         if (this.state.dataloaded) {
//             return (
//                 <React.Fragment>
//                     <div className="page-content">
//                         <MetaTags>
//                             <title>Station Information</title>
//                         </MetaTags>
//                         <Breadcrumbs
//                             title="STATION INFORMATION"
//                         />
//                         <Container fluid>
//                             <Card>
//                                 <CardBody>
//                                     <Row className="mb-2">
//                                         <Col sm={3}>
//                                             <div className="search-box ">
//                                                 <div className="position-relative">
//                                                     <Input
//                                                         onChange={(e) => this.onSearch(e.target.value)}
//                                                         id="search-user"
//                                                         type="text"
//                                                         className="form-control"
//                                                         placeholder="Search..."
//                                                         value={this.state.SearchField}
//                                                     />
//                                                     <i className="bx bx-search-alt search-icon" />
//                                                 </div>
//                                             </div>
//                                         </Col>
//                                         <Col>
//                                             <div className="text-end">
//                                                 <div className="btn-group">
//                                                     <Button color="primary" className="w-sm btn btn-sm" outline={this.state.selectedFilter !== 1} onClick={() => { this.active_inactive("ALL", 1) }}> ALL </Button>
//                                                     <Button color="success" className="w-sm btn btn-sm" outline={this.state.selectedFilter !== 2} onClick={() => { this.active_inactive("Active", 2) }}> Active </Button>
//                                                     <Button color="warning" className="w-sm btn btn-sm" outline={this.state.selectedFilter !== 3} onClick={() => { this.active_inactive("Inactive", 3) }}> Inactive </Button>
//                                                     <Button color="primary" className="w-sm btn btn-sm d-flex align-items-center" onClick={() => this.createNew()} >
//                                                         <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Station
//                                                     </Button>
//                                                 </div>
//                                             </div>
//                                         </Col>
//                                     </Row>
//                                     <Row>
//                                         <div className='table-responsive'>
//                                             <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
//                                                 <thead className="table-light">
//                                                     <tr>
//                                                         <th>S. No.</th>
//                                                         <th>Station Name</th>
//                                                         <th>Mac Address</th>
//                                                         <th>Status</th>
//                                                         <th>Actions</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {
//                                                         currentItems.map((station, index) => (
//                                                             <tr key={index}>
//                                                                 <td style={{ backgroundColor: "white" }}>{index + 1 + ((currentPage - 1) * 10)}</td>
//                                                                 <td style={{ backgroundColor: "white" }}>{station.station_name}</td>
//                                                                 <td style={{ backgroundColor: "white" }}>{station.mac_addrs}</td>
//                                                                 <td style={{ backgroundColor: "white" }}>{station.status}</td>
//                                                                 <td style={{ backgroundColor: "white" }}>
//                                                                     <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
//                                                                         <>
//                                                                             <Button color="primary" className='btn btn-sm' onClick={() => this.editStation(station)} id={`edit-${station._id}`}>
//                                                                                 Edit
//                                                                             </Button>
//                                                                             <UncontrolledTooltip placement="top" target={`edit-${station._id}`}>
//                                                                                 Edit Station
//                                                                             </UncontrolledTooltip>
//                                                                         </>

//                                                                         {
//                                                                             station.status !== 'Inactive' ?
//                                                                                 <>
//                                                                                     <Button color="primary" className='btn btn-sm' onClick={() => this.manageComp(station)} id={`manage-${station._id}`}>
//                                                                                         Manage Components
//                                                                                     </Button>
//                                                                                     <UncontrolledTooltip placement="top" target={`manage-${station._id}`}>
//                                                                                         Manage Components Info
//                                                                                     </UncontrolledTooltip>
//                                                                                 </>
//                                                                                 : null
//                                                                         }
//                                                                     </div>
//                                                                 </td>
//                                                             </tr>
//                                                         ))
//                                                     }
//                                                 </tbody>
//                                             </Table>
//                                             <PaginationComponent
//                                                 totalItems={samples_list.length}
//                                                 itemsPerPage={itemsPerPage}
//                                                 currentPage={currentPage}
//                                                 onPageChange={this.handlePageChange}
//                                             />

//                                         </div>
//                                     </Row>
//                                     {
//                                         this.state.samples_list.length === 0 ?
//                                             <div className="container" style={{ position: 'relative', height: '20vh' }}>
//                                                 <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} >
//                                                     <h5 className="text-secondary">No Records found</h5>
//                                                 </div>
//                                             </div> : null
//                                     }

//                                 </CardBody>
//                             </Card>
//                         </Container>


//                         <Modal
//                             isOpen={this.state.addStationModal}
//                         // toggle={this.tog_standard}
//                         >
//                             <div className="modal-header">
//                                 <h5 className="modal-title mt-0" id="myModalLabel">
//                                     Enter Station Details
//                                 </h5>
//                                 <button
//                                     type="button"
//                                     onClick={() =>
//                                         this.setState({ addStationModal: false })
//                                     }
//                                     className="close"
//                                     data-dismiss="modal"
//                                     aria-label="Close"
//                                 >
//                                     <span aria-hidden="true">&times;</span>
//                                 </button>
//                             </div>
//                             <div className="modal-body">
//                                 <Form>
//                                     <div className="row mb-4">
//                                         <Col sm={12}>
//                                             <Label>Station Name:</Label>
//                                             <Input
//                                                 type="text"
//                                                 className="form-control"
//                                                 id="example-number-input"
//                                                 placeholder="Enter Your"
//                                                 maxLength="40"
//                                                 value={this.state.station_name}
//                                                 onChange={(e) => this.setState({ station_name: e.target.value })}
//                                             />
//                                         </Col>
//                                     </div>
//                                     <div className="row mb-4">
//                                         <Col sm={12}>
//                                             <Label>Mac Address:</Label>
//                                             <Input
//                                                 type="text"
//                                                 className="form-control"
//                                                 id="horizontal-compname-Input"
//                                                 placeholder="Enter Your"
//                                                 maxLength="32"
//                                                 value={this.state.mac_address}
//                                                 onChange={(e) => this.setState({ mac_address: e.target.value })}
//                                                 disabled={this.state.isMacDisabled}
//                                             />
//                                         </Col>
//                                     </div>

//                                     <div className="row mb-4">
//                                         <Col sm={12}>
//                                             <Label>Status:</Label>{' '}
//                                             <Radio.Group onChange={this.selectActive_inactive} value={this.state.selectM_A}>
//                                                 <Space >
//                                                     {
//                                                         this.state.active_inactive.map((data, index) => (
//                                                             <div className='pay_cards' key={index} style={{ background: (this.state.selectM_A !== data) && 'white' }}>
//                                                                 <Radio value={data}>{data}</Radio>
//                                                             </div>
//                                                         ))
//                                                     }
//                                                 </Space>
//                                             </Radio.Group>
//                                         </Col>
//                                     </div>

//                                     <div className="row mb-4">
//                                         <Col sm={12}>
//                                             <Checkbox
//                                                 checked={this.state.config_change}
//                                                 onChange={(e) => this.configure_checking(e)}
//                                             >Allow Inspection User to Change Configuration in Station</Checkbox>
//                                         </Col>
//                                     </div>

//                                     <div className="row justify-content-end">
//                                         <Col sm={9}>
//                                             <div className="text-Left">
//                                                 {
//                                                     this.state.mesg_show ?
//                                                         this.state.message !== 'Success' ?
//                                                             <div style={{ color: this.state.message ? 'red' : null }}>
//                                                                 <Label>
//                                                                     {
//                                                                         this.state.message
//                                                                     }
//                                                                 </Label>
//                                                             </div> :
//                                                             <div style={{ color: this.state.message ? 'green' : null }}>
//                                                                 <Label>
//                                                                     {
//                                                                         this.state.message
//                                                                     }
//                                                                 </Label>
//                                                             </div> : null
//                                                 }
//                                             </div>
//                                             <div className="text-end">
//                                                 {/* <Link to="Camera"> */}
//                                                 <Button
//                                                     //type="submit"
//                                                     color="primary"
//                                                     className="w-md"
//                                                     onClick={() => { this.submitForm() }}
//                                                 >
//                                                     Submit
//                                                 </Button>
//                                                 {/* </Link> */}

//                                             </div>
//                                         </Col>
//                                     </div>
//                                 </Form>
//                             </div>
//                         </Modal>
//                         {this.state.alertMsg ?
//                             <SweetAlert
//                                 showCancel
//                                 title={
//                                     <Label style={{ fontSize: 20 }}>
//                                         Are you sure to deactivate the station {this.state.station_name}
//                                         <br />
//                                         This will remove the component relationship.
//                                     </Label>
//                                 }
//                                 cancelBtnBsStyle="success"
//                                 confirmBtnText="Yes"
//                                 cancelBtnText="No"
//                                 onConfirm={() => this.actInactChange()}
//                                 // onCancel={() => this.active_inactive('ALL', 1)}
//                                 onCancel={() => this.cancel_deactivation()}
//                                 closeOnClickOutside={false}
//                             >
//                             </SweetAlert> : null
//                         }
//                     </div>
//                 </React.Fragment>
//             );
//         }
//         else {
//             return null
//         }
//     }
// }
// StationInfo.propTypes = {
//     history: PropTypes.any.isRequired,
// };
// export default StationInfo;