//CHiran

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Input, Modal, Form, Label, Card, CardBody, UncontrolledTooltip } from "reactstrap";
import { Radio, Space } from "antd";
import axios from "axios";
import Breadcrumbs from "components/Common/Breadcrumb";
import PaginationComponent from "./PaginationComponent";
import SweetAlert from "react-bootstrap-sweetalert";
import { Checkbox } from "antd";
import { MetaTags } from "react-meta-tags";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import urlSocket from "./urlSocket";
import { Select } from "antd";

import { Spinner } from "reactstrap";

import { useHistory } from "react-router-dom/cjs/react-router-dom";

const StationInformation = () => {

    const [samplesList, setSamplesList] = useState([]);
    const [stationInfo, setStationInfo] = useState([]);
    const [PcData, setPcData] = useState([]);
    const [pcNames, setPcNames] = useState([]);
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
    const activeInactiveOptions = ["Active", "Inactive"];
    const [splitView, setSplitView] = useState({});

    console.log('pcNames', pcNames)
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
        setDataLoaded(false);
        setSelectedFilter(filter);
        setSearchField("");

        try {
            const response = await urlSocket.post("/station_info", { status });
            let data = response.data || [];
            console.log('data89', data)

            if (filter === 2) data = data.filter(d => d.status === "Active");
            else if (filter === 3) data = data.filter(d => d.status === "Inactive");

            setSamplesList(data);
            setStationInfo(data);
        } catch (err) {
            console.error(err);
            setSamplesList([]);
            setStationInfo([]);
        } finally {
            setDataLoaded(true);
        }
    };
    const getPcListData = async () => {
        try {
            const response = await urlSocket.get("/pc_list_info");
            const data = response.data || [];
            console.log('PC Config List Data :>> ', data);
            setPcData(data);
            // You can set this data to state if needed
        } catch (err) {
            console.error('Error fetching PC Config List Data :>> ', err);
        }
    }


    useEffect(() => {
        activeInactive("ALL", 1);
        getPcListData()
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
        if (pcNames.length === 0) {
            setMessage("Select at least one PC Name");
            setMesgShow(true);
            return;
        }
        if (!macRegex.test(macAddress)) {
            setMessage("Invalid MAC address format");
            setMesgShow(true);
            return;
        }

        const adminDB = JSON.parse(sessionStorage.getItem("userData") || "{}");
        console.log('adminDB :>> ', adminDB);

        const payload = {
            sub_station: pcNames,
            station_name: stationName,
            mac_addrs: macAddress,
            status: selectM_A,
            config_change: configChange,
            stn_ver: stnVer,
            admin_db: adminDB,
            _id: stationId || undefined
        };

        try {
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

    const manageComp = (station) => {
        console.log('Manage Components data:', station);
        const stationData = { ...station, mode: 'inspection' }; // Add mode
        sessionStorage.setItem("stationInfo", JSON.stringify(stationData));
        history.push('/entry_scrn');
    };

    const manage_train_Comp = (station) => {
        console.log('Training Mode data:', station);
        const stationData = { ...station }; // Add mode
        sessionStorage.setItem("stationInfo", JSON.stringify(stationData));
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
        setPcNames(
            station.sub_station_data.map(item => ({
                id: item.id,
                name: item.name
            }))
        );
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


    const setSplitViewMode = async (stationId, newSplit) => {
        setSplitView((prev) => ({
            ...prev,
            [stationId]: newSplit,
        }));

        try {
            const res = await urlSocket.post("/api/stage/update_station_split", {
                station_id: stationId,
                split: newSplit,
            });
            console.log('res452', res)
            console.log(`✅ Split set to ${newSplit ? "true" : "false"} in backend:`, res.data);
        } catch (err) {
            console.error("❌ Failed to update split:", err);
        }
    };



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
                            {
                                console.log('currentItems', currentItems)
                            }

                            <Row>
                                <div className="table-responsive">
                                    <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                                        <thead className="table-light">
                                            <tr>
                                                <th>S. No.</th>
                                                <th>Station Name</th>
                                                <th>Mac Address</th>
                                                <th>Status</th>
                                                <th>Sub Station List</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((station, index) => (
                                                <tr key={station._id}>
                                                    <td style={{ backgroundColor: "white" }}>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                                    <td style={{ backgroundColor: "white" }}>{station.station_name}</td>
                                                    {/* <td style={{ backgroundColor: "white" }}>{station.sub_station_data}</td> */}





                                                    <td style={{ backgroundColor: "white" }}>{station.mac_addrs}</td>
                                                    <td style={{ backgroundColor: "white" }}>{station.status}</td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        <ul style={{ margin: 0, paddingLeft: "20px" }}>
                                                            {station.sub_station_data.map(s => (
                                                                <li key={s.id}>{s.name}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {station.sub_station_data && station.sub_station_data.length > 1 ? (
                                                            <div className="d-flex flex-column gap-2">
                                                                {/* Split/Combined Toggle - Only show for multiple substations */}
                                                                <div className="d-inline-flex border rounded-pill bg-light shadow-sm" style={{ width: 'fit-content' }}>
                                                                    {/* Split Button */}
                                                                    <div
                                                                        className={`px-3 py-1 ${(splitView[station._id] ?? station.split)
                                                                            ? "bg-primary text-white border rounded-pill"
                                                                            : "text-muted bg-light cursor-pointer"
                                                                            }`}
                                                                        onClick={() => {
                                                                            if (!(splitView[station._id] ?? station.split)) {
                                                                                setSplitViewMode(station._id, true);
                                                                            }
                                                                        }}
                                                                        style={{ cursor: (splitView[station._id] ?? station.split) ? 'default' : 'pointer' }}
                                                                    >
                                                                        <i className="bx bx-git-branch me-1"></i> Split
                                                                    </div>

                                                                    {/* Combined Button */}
                                                                    <div
                                                                        className={`px-3 py-1 ${!(splitView[station._id] ?? station.split)
                                                                            ? "bg-primary text-white border rounded-pill"
                                                                            : "text-muted bg-light cursor-pointer"
                                                                            }`}
                                                                        onClick={() => {
                                                                            if (splitView[station._id] ?? station.split) {
                                                                                setSplitViewMode(station._id, false);
                                                                            }
                                                                        }}
                                                                        style={{ cursor: !(splitView[station._id] ?? station.split) ? 'default' : 'pointer' }}
                                                                    >
                                                                        <i className="bx bx-link me-1"></i> Combined
                                                                    </div>
                                                                </div>

                                                                {/* Action Buttons - Split or Combined View */}
                                                                {(splitView[station._id] ?? station.split) ? (
                                                                    // Split View: Each substation gets its own card
                                                                    station.sub_station_data.map((subStation, idx) => (
                                                                        <div key={subStation.id} className="p-3 rounded-3 shadow-sm bg-white mb-2 border">
                                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                                <span className="fw-semibold d-flex align-items-center gap-2">
                                                                                    <i className="bx bx-building text-primary fs-5"></i> {subStation.name}
                                                                                </span>
                                                                            </div>

                                                                            <div className="d-flex flex-wrap gap-2">
                                                                                <Button
                                                                                    color="primary"
                                                                                    size="sm"
                                                                                    onClick={() => editStation(station, subStation)}
                                                                                    id={`edit-${station._id}-${idx}`}
                                                                                >
                                                                                    <i className="bx bx-edit-alt me-1"></i> Edit
                                                                                </Button>
                                                                                <UncontrolledTooltip placement="top" target={`edit-${station._id}-${idx}`}>
                                                                                    Edit Station
                                                                                </UncontrolledTooltip>

                                                                                {station.status !== "Inactive" && (
                                                                                    <>
                                                                                        <Button
                                                                                            color="primary"
                                                                                            size="sm"
                                                                                            onClick={() => manageComp(station, subStation)}
                                                                                            id={`manage-${station._id}-${idx}`}
                                                                                        >
                                                                                            <i className="bx bx-briefcase me-1"></i> Manage Components
                                                                                        </Button>
                                                                                        <UncontrolledTooltip placement="top" target={`manage-${station._id}-${idx}`}>
                                                                                            Manage Components Info
                                                                                        </UncontrolledTooltip>

                                                                                        <Button
                                                                                            color="primary"
                                                                                            size="sm"
                                                                                            onClick={() => manage_train_Comp(station, subStation)}
                                                                                            id={`Training-${station._id}-${idx}`}
                                                                                        >
                                                                                            <i className="bx bx-graduation-cap me-1"></i> Training Mode
                                                                                        </Button>
                                                                                        <UncontrolledTooltip placement="top" target={`Training-${station._id}-${idx}`}>
                                                                                            Assigning To Training Mode
                                                                                        </UncontrolledTooltip>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    // Combined View: Single card for all substations
                                                                    <div className="p-3 rounded-3 shadow-sm bg-white border">
                                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                                            <span className="fw-semibold d-flex align-items-center gap-2">
                                                                                <i className="bx bx-building text-primary fs-5"></i>
                                                                                {station.sub_station_data.length} Substations
                                                                            </span>
                                                                        </div>

                                                                        <div className="d-flex flex-wrap gap-2">
                                                                            <Button
                                                                                color="primary"
                                                                                size="sm"
                                                                                onClick={() => editStation(station)}
                                                                                id={`edit-${station._id}`}
                                                                            >
                                                                                <i className="bx bx-edit-alt me-1"></i> Edit
                                                                            </Button>
                                                                            <UncontrolledTooltip placement="top" target={`edit-${station._id}`}>
                                                                                Edit Station
                                                                            </UncontrolledTooltip>

                                                                            {station.status !== "Inactive" && (
                                                                                <>
                                                                                    <Button
                                                                                        color="primary"
                                                                                        size="sm"
                                                                                        onClick={() => manageComp(station)}
                                                                                        id={`manage-${station._id}`}
                                                                                    >
                                                                                        <i className="bx bx-briefcase me-1"></i> Manage Components
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`manage-${station._id}`}>
                                                                                        Manage Components Info
                                                                                    </UncontrolledTooltip>

                                                                                    <Button
                                                                                        color="primary"
                                                                                        size="sm"
                                                                                        onClick={() => manage_train_Comp(station)}
                                                                                        id={`Training-${station._id}`}
                                                                                    >
                                                                                        <i className="bx bx-graduation-cap me-1"></i> Training Mode
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`Training-${station._id}`}>
                                                                                        Assigning To Training Mode
                                                                                    </UncontrolledTooltip>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            // Single substation or no substations: Just show buttons directly
                                                            <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
                                                                <Button color="primary" className="btn btn-sm" onClick={() => editStation(station)} id={`edit-${station._id}`}>
                                                                    Edit
                                                                </Button>
                                                                <UncontrolledTooltip placement="top" target={`edit-${station._id}`}>
                                                                    Edit Station
                                                                </UncontrolledTooltip>
                                                                {station.status !== "Inactive" && (
                                                                    <>
                                                                        <Button color="primary" className="btn btn-sm" onClick={() => manageComp(station)} id={`manage-${station._id}`}>
                                                                            Manage Components
                                                                        </Button>
                                                                        <UncontrolledTooltip placement="top" target={`manage-${station._id}`}>
                                                                            Manage Components Info
                                                                        </UncontrolledTooltip>
                                                                        <Button color="primary" className="btn btn-sm" onClick={() => manage_train_Comp(station)} id={`Training-${station._id}`}>
                                                                            Assigning To Training Mode
                                                                        </Button>
                                                                        <UncontrolledTooltip placement="top" target={`Training-${station._id}`}>
                                                                            Assigning To Training Mode
                                                                        </UncontrolledTooltip>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>






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
                                    <Label>Sub Station List :</Label>

                                    <Select
                                        mode="multiple"
                                        style={{ width: "100%" }}
                                        placeholder="Select PC Names"
                                        value={pcNames.map(item => item.id)}
                                        onChange={(selectedIds) => {
                                            const selectedObjects = selectedIds.map(id => {
                                                const matched = PcData.find(pc => pc._id === id);
                                                return {
                                                    id: id,
                                                    name: matched?.pc_name || ""
                                                };
                                            });
                                            setPcNames(selectedObjects);
                                        }}
                                        // disabled={isMacDisabled}
                                        options={PcData.map(pc => ({
                                            label: pc.pc_name,
                                            value: pc._id
                                        }))}
                                    />
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

