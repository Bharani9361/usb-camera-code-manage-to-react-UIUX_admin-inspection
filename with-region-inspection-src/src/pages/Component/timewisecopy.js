const Report = ({ history }) => {
  const [showTable2, setShowTable2] = useState(false);
  const [tempIndex, setTempIndex] = useState(0);
  const [filterCompName, setFilterCompName] = useState('');
  const [filterCompCode, setFilterCompCode] = useState('');
  const [positive, setPositive] = useState('');
  const [negative, setNegative] = useState('');
  const [possibleMatch, setPossibleMatch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [compName, setCompName] = useState('');
  const [compCode, setCompCode] = useState('');
  const [date, setDate] = useState('');
  const [stationId, setStationId] = useState('');
  const [okCount, setOkCount] = useState(0);
  const [notOkCount, setNotOkCount] = useState(0);
  const [noObjCount, setNoObjCount] = useState(0);
  const [incorrectObj, setIncorrectObj] = useState(0);

  const [configPositive, setConfigPositive] = useState('');
  const [configNegative, setConfigNegative] = useState('');

  const [dateWiseData, setDateWiseData] = useState(null);
  const [timeWiseFilterData, setTimeWiseFilterData] = useState([]);

  // NEW: Store the original unfiltered data
  const [originalData, setOriginalData] = useState([]);

  const [dataLoaded, setDataLoaded] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [imageSrc, setImageSrc] = useState('');

  const [selectedFilter, setSelectedFilter] = useState(0);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [stageOptions, setStageOptions] = useState([]);
  const [cameraOptions, setCameraOptions] = useState([]);

  const [selectedStages, setSelectedStages] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCameras]);

  const getStageOptions = data => {
    const stageMap = new Map();

    data.forEach(item => {
      item.stage_camera_result?.forEach(stage => {
        stageMap.set(stage.stage_code, {
          label: stage.stage_name,
          value: stage.stage_code
        });
      });
    });

    console.log('stageMap.values()', stageMap.values());

    return Array.from(stageMap.values());
  };

  // FIXED: Use originalData instead of timeWiseFilterData for stage options
  useEffect(() => {
    if (originalData.length > 0) {
      const stages = getStageOptions(originalData);
      console.log('Generated stage options:', stages);

      setStageOptions(stages);
    }
  }, [originalData]);

  const getCameraOptions = (data, selectedStageValues) => {
    const cameraMap = new Map();

    data.forEach(item => {
      item.stage_camera_result?.forEach(stage => {
        if (selectedStageValues.includes(stage.stage_code)) {
          const key = `${stage.stage_code}-${stage.camera_label}`;
          cameraMap.set(key, {
            label: stage.camera_label,
            value: key,
            stage_code: stage.stage_code
          });
        }
      });
    });

    return Array.from(cameraMap.values());
  };

  const onStageSelect = selected => {
    console.log('Selected stages:', selected);

    const stages = selected || [];
    setSelectedStages(stages);

    const stageValues = stages.map(s => s.value);
    console.log('stageValues', stageValues);

    // FIXED: Use originalData for camera options
    const cameraList = getCameraOptions(originalData, stageValues);
    setCameraOptions(cameraList);

    setSelectedCameras([]);

    setCurrentPage(1);
    fetchFilteredData(selectedStatus, selectedLevel, stages, []);
  };

  const onCameraSelect = selected => {
    console.log('Selected cameras:', selected);
    const cameras = selected || [];
    setSelectedCameras(cameras);

    // Auto-apply filter when camera changes
    setCurrentPage(1);
    fetchFilteredData(selectedStatus, selectedLevel, selectedStages, cameras);
  };

  const getImage = data1 => {
    console.log('dddddddddddddd', data1);
    if (data1 !== undefined && data1 !== null) {
      let baseurl =
        typeof img_url === 'object'
          ? img_url.url || img_url.baseUrl || ''
          : img_url;
      let imagePath = '';

      if (Array.isArray(data1) && data1.length > 0) {
        imagePath = data1[0].captured_image;
        console.log('imagePath_array', imagePath);
      } else if (typeof data1 === 'string') {
        imagePath = data1;
      } else {
        console.log('Unexpected data format:', data1);
        return null;
      }

      console.log('imagePath', imagePath);
      console.log('baseurl', baseurl);
      let replace = imagePath.replace(/\\/g, '/');
      let output = img_url + replace;
      console.log('output', output);
      return output;
    } else {
      return null;
    }
  };

  useEffect(() => {
    const timeData = JSON.parse(sessionStorage.getItem('timeWiseData'));
    const dateData = JSON.parse(sessionStorage.getItem('dateWiseData'));
    setDateWiseData(dateData);

    setOkCount(timeData.ok);
    setNotOkCount(timeData.notok);
    setNoObjCount(timeData.no_obj);
    setIncorrectObj(timeData.incorrect_obj);

    setConfigPositive(timeData.config_positive);
    setConfigNegative(timeData.config_negative);

    fetchLabelData(timeData);
    fetchTimeWiseFilteredData(timeData);
  }, []);

  const fetchLabelData = timeWiseData => {
    urlSocket
      .post('/comp_Data', {
        comp_name: timeWiseData.comp_name,
        comp_code: timeWiseData.comp_code
      })
      .then(res => {
        setPositive(res.data[0].positive);
        setNegative(res.data[0].negative);
      })
      .catch(err => console.log(err));
  };

  const fetchTimeWiseFilteredData = timeWiseData => {
    urlSocket
      .post('/timeWise_filterData', {
        comp_name: timeWiseData.comp_name,
        comp_code: timeWiseData.comp_code,
        station_id: timeWiseData.station_id,
        date: timeWiseData.date
      })
      .then(response => {
        const data = response.data;

        // FIXED: Store original data separately
        setOriginalData(data);
        setTimeWiseFilterData(data);

        setCompName(data[0].comp_name);
        setCompCode(data[0].comp_code);
        setDate(data[0].date);
        setStationId(data[0].station_id);
        setDataLoaded(true);
        console.log('timewisedata', data);
      })
      .catch(error => console.log(error));
  };

  const [selectedLevel, setSelectedLevel] = useState('stages');

  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchFilteredData = async (
    status,
    level,
    stageFilters = [],
    cameraFilters = []
  ) => {
    try {
      const requestBody = {
        comp_name: compName,
        comp_code: compCode,
        date,
        station_id: stationId,
        result: status,
        level: level
      };

      // Add stage filters if selected
      if (stageFilters.length > 0) {
        requestBody.selected_stages = stageFilters.map(s => s.value);
      }

      // Add camera filters if selected
      if (cameraFilters.length > 0) {
        requestBody.selected_cameras = cameraFilters.map(c => c.label);
      }

      console.log('Request Body:', requestBody);

      const response = await urlSocket.post('/result_filterData', requestBody);

      if (!response.data || response.data.length === 0) {
        setTimeWiseFilterData([]);
      } else {
        setTimeWiseFilterData(response.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const statusFilter = (status, filterValue) => {
    setSelectedStatus(status);
    setSelectedFilter(filterValue);
    setCurrentPage(1);

    fetchFilteredData(status, selectedLevel, selectedStages, selectedCameras);
  };

  const backButton = () => {
    sessionStorage.setItem(
      'dateWiseData',
      JSON.stringify({
        startDate: dateWiseData.startDate,
        endDate: dateWiseData.endDate,
        comp_name: dateWiseData.comp_name,
        comp_code: dateWiseData.comp_code
      })
    );
    history.push('/inspectResult');
  };

  const onNext = () => {
    let index = tempIndex + 1;
    let selectedData = filteredData[index];
    setModalData(selectedData);
    setImageSrc(getImage(selectedData.captured_image));
    setTempIndex(index);
  };

  const onPrev = () => {
    let index = tempIndex - 1;
    let selectedData = filteredData[index];
    setModalData(selectedData);
    setImageSrc(getImage(selectedData.captured_image));
    setTempIndex(index);
  };

  const filteredData = timeWiseFilterData;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  if (!dataLoaded) return null;

  return (
    <div className='page-content'>
      <MetaTags>
        <title>Inspection Result Details</title>
      </MetaTags>

      <Breadcrumbs
        title='INSPECTION RESULT'
        isBackButtonEnable={true}
        gotoBack={backButton}
      />

      <Container fluid>
        <Card>
          <CardBody>
            <div className='d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2'>
              <div>
                <CardTitle className='mb-0'>
                  <span className='me-2 font-size-12'>Component Name :</span>
                  {compName}
                </CardTitle>
                <CardText className='mb-0'>
                  <span className='me-2 font-size-12'>Component Code :</span>
                  {compCode}
                </CardText>
                <CardText className='mb-0'>
                  <span className='me-2 font-size-12'>Date:</span> {date}
                </CardText>
              </div>

              <div className='d-flex align-items-center gap-1'>
                <div>
                  <Select
                    options={stageOptions}
                    value={selectedStages}
                    onChange={onStageSelect}
                    isMulti
                    placeholder='Select Stages'
                    className='custom-select-width'
                    closeMenuOnSelect={false}
                  />
                </div>

                {selectedStages.length > 0 && (
                  <div>
                    <Select
                      options={cameraOptions}
                      value={selectedCameras}
                      onChange={onCameraSelect}
                      isMulti
                      placeholder='Select Cameras'
                      className='custom-select-width'
                    />
                  </div>
                )}
              </div>

              <div>
                <ButtonGroup className='d-flex flex-wrap flex-lg-nowrap w-100'>
                  <Button
                    color='primary'
                    outline={selectedFilter !== 0}
                    onClick={() => statusFilter('', 0)}
                    className='flex-fill text-nowrap px-2 px-lg-3'
                  >
                    Total ({okCount + notOkCount + noObjCount + incorrectObj})
                  </Button>

                  <Button
                    color='primary'
                    outline={selectedFilter !== 1}
                    onClick={() => statusFilter(positive, 1)}
                    className='flex-fill text-nowrap px-2 px-lg-3'
                  >
                    {configPositive} ({okCount})
                  </Button>

                  <Button
                    color='primary'
                    outline={selectedFilter !== 2}
                    onClick={() => statusFilter(negative, 2)}
                    className='flex-fill text-nowrap px-2 px-lg-3'
                  >
                    {configNegative} ({notOkCount})
                  </Button>

                  <Button
                    color='primary'
                    outline={selectedFilter !== 3}
                    onClick={() => statusFilter('No Object Found', 3)}
                    className='flex-fill text-nowrap px-2 px-lg-3'
                  >
                    No Object Found ({noObjCount})
                  </Button>

                  <Button
                    color='primary'
                    outline={selectedFilter !== 4}
                    onClick={() => statusFilter('Incorrect Object', 4)}
                    className='flex-fill text-nowrap px-2 px-lg-3'
                  >
                    Incorrect Object ({incorrectObj})
                  </Button>
                </ButtonGroup>
              </div>
            </div>

            {filteredData.length === 0 ? (
              <div className='text-center ' style={{ height: '20vh' }}>
                <h5 className='text-secondary '>No Records Found</h5>
              </div>
            ) : (
              <div className='table-responsive'>
                <Table
                  className='table mb-0 align-middle table-nowrap table-check'
                  bordered
                >
                  <thead className='table-light'>
                    <tr>
                      <th>S. No.</th>
                      <th>Time</th>
                      <th>Stage Names</th>
                      <th>Stage Code</th>
                      <th>Camera</th>
                      <th>Result</th>
                      <th>Captured Image</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(() => {
                      let rowSerial = 1;

                      return currentItems.flatMap((data, dataIndex) => {
                        const stages = Array.isArray(data.stage_camera_result)
                          ? data.stage_camera_result
                          : [];

                        const images = Array.isArray(data.captured_image)
                          ? data.captured_image
                          : [];

                        return stages.map((stage, stageIndex) => {
                          const serial = rowSerial++;

                          const imagesForCamera = images.filter(
                            img => img.camera_label === stage.camera_label
                          );

                          return (
                            <tr key={`${dataIndex}-${stageIndex}`}>
                              <td>{serial}</td>

                              <td>{data.inspected_ontime}</td>

                              <td>{stage.stage_name || '-'}</td>

                              <td>{stage.stage_code || '-'}</td>

                              <td>{stage.camera_label}</td>

                              <td
                                style={{
                                  color:
                                    stage.result?.trim().toUpperCase() === 'NG'
                                      ? 'red'
                                      : stage.result?.trim().toUpperCase() ===
                                        'OK'
                                      ? 'green'
                                      : 'black'
                                }}
                              >
                                {stage.result}
                              </td>

                              <td>
                                {imagesForCamera.map((imgObj, j) => (
                                  <img
                                    key={j}
                                    src={getImage(imgObj.captured_image)}
                                    style={{
                                      width: 'auto',
                                      height: 100,
                                      marginRight: 10,
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                      setShowModal(true);
                                      setModalData(data);
                                      setTempIndex(serial - 1);
                                      setImageSrc(
                                        getImage(imgObj.captured_image)
                                      );
                                    }}
                                  />
                                ))}
                              </td>
                            </tr>
                          );
                        });
                      });
                    })()}
                  </tbody>
                </Table>

                <PaginationComponent
                  totalItems={filteredData.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </Container>

      {/* IMAGE MODAL */}
      <Modal size='l' isOpen={showModal} centered>
        <div className='modal-header'>
          <h5>Image</h5>
          <Button className='close' onClick={() => setShowModal(false)}>
            ×
          </Button>
        </div>

        <div className='modal-body'>
          <div className='text-center'>
            <img className='img-fluid' src={imageSrc} alt='captured' />
          </div>

          <Row className='mt-4'>
            <Col sm={6}>
              Component Name: <b>{compName}</b>
            </Col>

            <Col sm={6} className='text-end'>
              Result:
              <span
                style={{
                  color:
                    modalData.result === 'No Objects Detected' ||
                    modalData.result === 'notok'
                      ? 'red'
                      : 'green'
                }}
              >
                {modalData.result}
              </span>
            </Col>
          </Row>

          <Row>
            <Col sm={6}>
              Component Code: <b>{compCode}</b>
            </Col>

            <Col sm={6} className='text-end'>
              Date: <b>{modalData.date}</b> Time:{' '}
              <b>{modalData.inspected_ontime}</b>
            </Col>
          </Row>

          {/* PREV/NEXT BUTTONS */}
          <Row className='mt-4'>
            <Col md={6}>
              {tempIndex !== 0 && <Button onClick={onPrev}>Previous</Button>}
            </Col>

            <Col md={6} className='text-end'>
              {filteredData.length !== tempIndex + 1 && (
                <Button onClick={onNext}>Next</Button>
              )}
            </Col>
          </Row>
        </div>

        <Row>
          <Col className='text-center'>
            ({tempIndex + 1} / {filteredData.length})
          </Col>
        </Row>
      </Modal>
    </div>
  );
};
