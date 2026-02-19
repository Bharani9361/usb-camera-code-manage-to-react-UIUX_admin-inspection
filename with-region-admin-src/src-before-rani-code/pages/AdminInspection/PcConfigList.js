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
import { set } from "lodash";
// const urlSocket = axios.create({ baseURL: "http://your-api-url.com" }); // replace with your API URL

const PcConfigList = () => {

    const [samplesList, setSamplesList] = useState([]);
    const [stationInfo, setStationInfo] = useState([]);
    const [pcInfo, setPcInfo] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(1);
    const [searchField, setSearchField] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [addStationModal, setAddStationModal] = useState(false);
    const [pcName, setPcName] = useState("");
    const [pcCode, setPcCode] = useState("");
    const [stationName, setStationName] = useState("");
    const [macAddress, setMacAddress] = useState("");
    const [selectM_A, setSelectM_A] = useState("Active");
    const [configChange, setConfigChange] = useState(false);
    const [stationId, setStationId] = useState("");
    const [pcId, setPcId] = useState("");
    const [stnVer, setStnVer] = useState("");
    const [isMacDisabled, setIsMacDisabled] = useState(false);

    const [message, setMessage] = useState("");
    const [mesgShow, setMesgShow] = useState(false);
    const [deviceInfoA, setDeviceInfoA] = useState([]);
    const [deviceInfoB, setDeviceInfoB] = useState([]);
    const [filter, setFilter] = useState(1);

    const activeInactiveOptions = ["Active", "Inactive"];
    const history = useHistory();



    const getPcListData = async () => {
        setDataLoaded(false);
        setSearchField("");
        try {
            const response = await urlSocket.post("/get_pc_list_data");
            let data = response.data || [];
            console.log('data83', data)
            setSamplesList(data);
            setPcInfo(data);
        }
        catch (err) {
            console.error(err);
            setSamplesList([]);
            setPcInfo([]);
        } finally {
            setDataLoaded(true);
        }
    };

    useEffect(() => {
        getPcListData()
    }, []);


    useEffect(() => {
        const filtered = pcInfo.filter(d =>
            d.pc_name.toUpperCase().includes(searchField.toUpperCase())
        );
        setSamplesList(filtered);
        setCurrentPage(1);
    }, [searchField, pcInfo]);



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

        if (!pcName.trim()) {
            setMessage("Enter the PC name");
            setMesgShow(true);
            return;
        }
        if (!pcCode.trim()) {
            setMessage("Enter the PC code");
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
        console.log('adminDB :>> ', adminDB);

        const payload = {
            pc_name: pcName,
            pc_code: pcCode,
            mac_addrs: macAddress,
            status: selectM_A,
            config_change: configChange,
            admin_db: adminDB,
            _id: pcId || undefined
        };

        try {
            const endpoint = pcId ? "/edit_pc_data" : "/pc_create_data";
            const response = await urlSocket.post(endpoint, payload);
            const data = response.data;
            console.log('data178', data)

            if (data.error) {
                console.error(data.error);
                return;
            }
            setSamplesList(data);
            // activeInactive("ALL", selectedFilter);
            setAddStationModal(false);
            setMessage("Success");
            setMesgShow(true);
        } catch (err) {
            console.error(err);
            setMessage("Error submitting data");
            setMesgShow(true);
        }
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
        setPcName("");
        setPcCode("");
        setMacAddress("");
        setSelectM_A("Active");
        setConfigChange(false);
        setPcId("");
        setIsMacDisabled(false);
    };

    const editPc = (Pc) => {
        setMessage('')
        setAddStationModal(true);
        setPcName(Pc.pc_name);
        setPcCode(Pc.pc_code);
        setMacAddress(Pc.mac_addrs);
        setSelectM_A(Pc.status);
        setConfigChange(Pc.config_change);
        setPcId(Pc._id);
        setIsMacDisabled(true);
    };

    const logPc = (Pc) => {
        console.log('   ', Pc);

    };




    const dataListProcess = () => {
        try {
            let filteredData = [...pcInfo]; // stationInfo is your full API data

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





    return dataLoaded ? (
        <React.Fragment>
            <div className="page-content">
                <MetaTags><title>Station Information</title></MetaTags>
                <Breadcrumbs title="STATION INFORMATION" />

                <Container fluid>
                    <Card>
                        <CardBody>
                            <Row className="mb-2">
                                {/* <Col sm={3}>
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
                                </Col> */}
                                <Col>
                                    <div className="text-end">
                                        <div className="btn-group">

                                            <Button color="primary" className="w-sm btn btn-sm d-flex align-items-center" onClick={createNew}>
                                                <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Pc List
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
                                                <th>Pc Name (or) Sub Station Name :</th>
                                                <th>Pc Code</th>
                                                <th>Mac Address</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((Pc, index) => (
                                                <tr key={Pc._id}>
                                                    <td style={{ backgroundColor: "white" }}>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                                    <td style={{ backgroundColor: "white" }}>{Pc.pc_name}</td>
                                                    <td style={{ backgroundColor: "white" }}>{Pc.pc_code}</td>
                                                    <td style={{ backgroundColor: "white" }}>{Pc.mac_addrs}</td>
                                                    <td style={{ backgroundColor: "white" }}>{Pc.status}</td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
                                                            <>   <Button color="primary" className="btn btn-sm" onClick={() => editPc(Pc)} id={`edit-${Pc._id}`}>Edit</Button>
                                                                <UncontrolledTooltip placement="top" target={`edit-${Pc._id}`}>Edit Pc Details</UncontrolledTooltip>
                                                            </>
                                                            <>
                                                                <Button color="primary" className="btn btn-sm" onClick={() => logPc(Pc)} id={`edit-${Pc._id}`}>Log Info</Button>
                                                                <UncontrolledTooltip placement="top" target={`edit-${Pc._id}`}>Log Information</UncontrolledTooltip>
                                                            </>
                                                        </div>

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
                        <h5 className="modal-title mt-0">Enter Pc Details</h5>
                        <button type="button" className="close" onClick={() => setAddStationModal(false)}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <Form>
                            <div className="row mb-4">
                                <Col sm={12}>
                                    <Label>Pc Name (or) Sub Station Name :</Label>
                                    <Input value={pcName} onChange={e => setPcName(e.target.value)} maxLength={40} />
                                </Col>
                            </div>
                            <div className="row mb-4">
                                <Col sm={12}>
                                    <Label>Pc Code:</Label>
                                    <Input value={pcCode} onChange={e => setPcCode(e.target.value)} maxLength={40} />
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


            </div>
        </React.Fragment>
    ) : null;

};

export default PcConfigList;




