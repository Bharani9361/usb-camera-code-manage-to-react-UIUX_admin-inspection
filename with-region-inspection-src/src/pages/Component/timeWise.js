import React, { useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import PropTypes from 'prop-types';
import {
  Col,
  Container,
  Row,
  CardTitle,
  Button,
  Table,
  Modal,
  CardBody,
  CardText,
  Card,
  ButtonGroup
} from 'reactstrap';

import { DatePicker } from 'antd';
import urlSocket from './urlSocket';
import Select from 'react-select';

import { img_url } from './imageUrl';
import Breadcrumbs from 'components/Common/Breadcrumb';
import PaginationComponent from 'components/Common/PaginationComponent';
import { filter, min } from 'lodash';

const { RangePicker } = DatePicker;



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

  const [regionResults, setRegionResults] = useState([]);

  const [originalData, setOriginalData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [imageSrc, setImageSrc] = useState('');

  const [isRegionImageView, setIsRegionImageView] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [stageOptions, setStageOptions] = useState([]);
  const [cameraOptions, setCameraOptions] = useState([]);

  const [selectedStages, setSelectedStages] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState([]);

  const [selectedLevel, setSelectedLevel] = useState('stages');
  const [selectedStatus, setSelectedStatus] = useState('');

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

    return Array.from(stageMap.values());
  };

  useEffect(() => {
    if (originalData.length > 0) {
      const stages = getStageOptions(originalData);
      const stagesWithAll = [{ label: 'All Stages', value: 'all' }, ...stages];
      setStageOptions(stagesWithAll);
    }
  }, [originalData]);

  const getCameraOptions = (data, selectedStageValues) => {
    const cameraMap = new Map();
    const isAllSelected = selectedStageValues.includes('all');

    data.forEach(item => {
      item.stage_camera_result?.forEach(stage => {
        if (isAllSelected || selectedStageValues.includes(stage.stage_code)) {
          const key = `${stage.stage_code}-${stage.camera_label}`;
          cameraMap.set(key, {
            label: stage.camera_label,
            value: key,
            stage_code: stage.stage_code
          });
        }
      });
    });

    const cameras = Array.from(cameraMap.values());

    if (cameras.length > 0) {
      return [{ label: 'All Cameras', value: 'all' }, ...cameras];
    }

    return cameras;
  };

  const onStageSelect = selected => {
    const stages = selected || [];
    const hasAll = stages.some(s => s.value === 'all');
    const previousHadAll = selectedStages.some(s => s.value === 'all');

    let finalStages = stages;

    if (hasAll && !previousHadAll) {
      finalStages = stages.filter(s => s.value === 'all');
    } else if (hasAll && stages.length > 1) {
      finalStages = stages.filter(s => s.value !== 'all');
    }

    setSelectedStages(finalStages);

    const stageValues = finalStages.map(s => s.value);
    const cameraList = getCameraOptions(originalData, stageValues);
    setCameraOptions(cameraList);

    setSelectedCameras([]);
    setCurrentPage(1);
    fetchFilteredData(selectedStatus, selectedLevel, finalStages, []);
  };

  const onCameraSelect = selected => {
    const cameras = selected || [];
    const hasAll = cameras.some(c => c.value === 'all');
    const previousHadAll = selectedCameras.some(c => c.value === 'all');

    let finalCameras = cameras;

    if (hasAll && !previousHadAll) {
      finalCameras = cameras.filter(c => c.value === 'all');
    } else if (hasAll && cameras.length > 1) {
      finalCameras = cameras.filter(c => c.value !== 'all');
    }

    setSelectedCameras(finalCameras);
    setCurrentPage(1);
    fetchFilteredData(
      selectedStatus,
      selectedLevel,
      selectedStages,
      finalCameras
    );
  };

  const getRegionResultsForStageCamera = (stageCode, cameraLabel) => {
    const matchingRegion = regionResults.find(
      region =>
        region.stage_code === stageCode && region.camera_label === cameraLabel
    );
    console.log('matchingRegion', matchingRegion)

    return matchingRegion?.region_results || [];
  };

  const getImage = data1 => {
    if (data1 !== undefined && data1 !== null) {
      let baseurl =
        typeof img_url === 'object'
          ? img_url.url || img_url.baseUrl || ''
          : img_url;
      let imagePath = '';

      if (Array.isArray(data1) && data1.length > 0) {
        imagePath = data1[0].captured_image;
      } else if (typeof data1 === 'string') {
        imagePath = data1;
      } else {
        return null;
      }

      let replace = imagePath.replace(/\\/g, '/');
      let output = img_url + replace;
      return output;
    } else {
      return null;
    }
  };

  useEffect(() => {
    const timeData = JSON.parse(sessionStorage.getItem('timeWiseData'));
    console.log('timeData', timeData)
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
        console.log('Response data:', data);

        let inspectResults = [];
        let regionResultsData = [];

        if (data.region_results && Array.isArray(data.region_results)) {
          inspectResults = data.inspect_result;
          regionResultsData = data.region_results || [];
        } else if (Array.isArray(data)) {
          inspectResults = data;
          regionResultsData = data[0]?.region_results || [];
        }

        console.log('Inspect Results:', inspectResults);
        console.log('Region Results:', regionResultsData);

        setRegionResults(regionResultsData);
        setOriginalData(inspectResults);
        setTimeWiseFilterData(inspectResults);

        if (inspectResults.length > 0) {
          setCompName(inspectResults[0].comp_name);
          setCompCode(inspectResults[0].comp_code);
          setDate(inspectResults[0].date);
          setStationId(inspectResults[0].station_id);
        }

        setDataLoaded(true);
      })
      .catch(error => console.log(error));
  };

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

      const hasAllStages = stageFilters.some(s => s.value === 'all');
      if (stageFilters.length > 0 && !hasAllStages) {
        requestBody.selected_stages = stageFilters.map(s => s.value);
      }

      const hasAllCameras = cameraFilters.some(c => c.value === 'all');
      if (cameraFilters.length > 0 && !hasAllCameras) {
        requestBody.selected_cameras = cameraFilters.map(c => c.label);
      }

      console.log('Request Body:', requestBody);

      const response = await urlSocket.post('/result_filterData', requestBody);
      console.log('response312', response)

      let filteredResults = [];
      if (response.data) {
        if (
          response.data.inspect_result &&
          Array.isArray(response.data.inspect_result)
        ) {
          filteredResults = response.data.inspect_result;
          if (response.data.region_results) {
            setRegionResults(response.data.region_results);
          }
        } else if (Array.isArray(response.data)) {
          filteredResults = response.data;
        }
      }

      setTimeWiseFilterData(filteredResults);
    } catch (err) {
      console.log(err);
    }
  };

  const statusFilter = (status, filterValue) => {
    setSelectedStatus(status);
    setSelectedFilter(filterValue);
    setCurrentPage(1);
    fetchFilteredData(status, selectedLevel, selectedStages, selectedCameras);
    // console.log('status, selectedLevel, selectedStages, selectedCameras', status, selectedLevel, selectedStages, selectedCameras)
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

  // NEW: Create separate flattened data for captured images only
  const getFlattenedCapturedImages = () => {
    const flattened = [];

    filteredData.forEach(data => {
      const stages = Array.isArray(data.stage_camera_result)
        ? data.stage_camera_result
        : [];

      stages.forEach(stage => {
        const imagesForCamera = (
          Array.isArray(data.captured_image) ? data.captured_image : []
        ).filter(
          img =>
            img.camera_label === stage.camera_label &&
            img.stage_code === stage.stage_code
        );

        imagesForCamera.forEach(imgObj => {
          flattened.push({
            ...data,
            currentStage: stage,
            currentCamera: stage.camera_label,
            imageType: 'captured',
            imageData: imgObj.captured_image,
            regionResult: null
          });
        });
      });
    });

    return flattened;
  };

  // NEW: Create separate flattened data for region images only
  const getFlattenedRegionImages = () => {
    const flattened = [];

    filteredData.forEach(data => {
      const stages = Array.isArray(data.stage_camera_result)
        ? data.stage_camera_result
        : [];

      stages.forEach(stage => {
        const regionResultsForCamera = getRegionResultsForStageCamera(
          stage.stage_code,
          stage.camera_label
        );

        regionResultsForCamera.forEach(region => {
          flattened.push({
            ...data,
            currentStage: stage,
            currentCamera: stage.camera_label,
            imageType: 'region',
            imageData: region.output_img,
            regionResult: region
          });
        });
      });
    });

    return flattened;
  };

  const onNext = () => {
    // Use appropriate flattened data based on current view
    const flattenedData = isRegionImageView
      ? getFlattenedRegionImages()
      : getFlattenedCapturedImages();

    let index = tempIndex + 1;

    if (index < flattenedData.length) {
      let selectedData = flattenedData[index];
      setModalData(selectedData);
      setImageSrc(getImage(selectedData.imageData));
      setTempIndex(index);
    }
  };

  const onPrev = () => {
    // Use appropriate flattened data based on current view
    const flattenedData = isRegionImageView
      ? getFlattenedRegionImages()
      : getFlattenedCapturedImages();

    let index = tempIndex - 1;

    if (index >= 0) {
      let selectedData = flattenedData[index];
      setModalData(selectedData);
      setImageSrc(getImage(selectedData.imageData));
      setTempIndex(index);
    }
  };

  const filteredData = Array.isArray(timeWiseFilterData)
    ? timeWiseFilterData
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  if (!dataLoaded) return null;

  return (
    <div className='page-content'>
      <Container fluid>
        <Card>
          <CardBody>
            <div className='d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2'>
              <div>
                <CardTitle className='mb-0'>
                  <span className='me-2 font-size-12'>Component Name:</span>
                  {compName}
                </CardTitle>
                <CardText className='mb-0'>
                  <span className='me-2 font-size-12'>Component Code:</span>
                  {compCode}
                </CardText>
                <CardText className='mb-0'>
                  <span className='me-2 font-size-12'>Date:</span> {date}
                </CardText>
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
              <div className='text-center' style={{ height: '20vh' }}>
                <h5 className='text-secondary'>No Records Found</h5>
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
                      {/* <th>Region Result</th>
                      <th>Region Output Images</th> */}
                      <th>Overall Result</th>
                    </tr>
                  </thead>


                  <tbody>
                    {(() => {
                      let rowSerial = 1;

                      // Group items by inspected_ontime
                      const groupedByTime = currentItems.reduce((acc, data) => {
                        const key = data.inspected_ontime;
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(data);
                        return acc;
                      }, {});
                      console.log('groupedByTime', groupedByTime)

                      return Object.entries(groupedByTime).flatMap(
                        ([time, items]) => {
                          const serial = rowSerial++;

                          // Calculate rowSpan for the group
                          const totalRows = items.reduce(
                            (sum, d) =>
                              sum + (d.stage_camera_result?.length || 0),
                            0
                          );

                          // Determine overall result for this group (NG if any stage is NG, else OK)
                          const overallResult = items.some(d =>
                            d.stage_camera_result?.some(
                              stage =>
                                stage.result?.trim().toUpperCase() === 'NG'
                            )
                          )
                            ? 'NG'
                            : 'OK';

                          return items.flatMap((data, dataIndex) => {
                            const stages = Array.isArray(
                              data.stage_camera_result
                            )
                              ? data.stage_camera_result
                              : [];
                            const images = Array.isArray(data.captured_image)
                              ? data.captured_image
                              : [];

                            console.log('stages', stages)

                            return stages.map((stage, stageIndex) => {
                              const imagesForCamera = images.filter(
                                img =>
                                  img.camera_label === stage.camera_label &&
                                  img.stage_code === stage.stage_code
                              );

                              const regionResultsForCamera =
                                getRegionResultsForStageCamera(
                                  stage.stage_code,
                                  stage.camera_label
                                );

                              return (
                                <tr key={`${time}-${dataIndex}-${stageIndex}`}>
                                  {/* Serial and Time */}
                                  {stageIndex === 0 && dataIndex === 0 && (
                                    <>
                                      <td rowSpan={totalRows}>{serial}</td>
                                      <td rowSpan={totalRows}>{time}</td>
                                    </>
                                  )}

                                  {/* Stage Info */}
                                  <td>{stage.stage_name || '-'}</td>
                                  <td>{stage.stage_code || '-'}</td>
                                  <td>{stage.camera_label}</td>
                                  <td
                                    style={{
                                      color:
                                        stage.result?.trim().toUpperCase() ===
                                          'NG'
                                          ? 'red'
                                          : stage.result
                                            ?.trim()
                                            .toUpperCase() === 'OK'
                                            ? 'green'
                                            : 'black'
                                    }}
                                  >
                                    {stage.result}
                                  </td>

                                  {/* Captured Images */}
                                  <td>
                                    {imagesForCamera.map((imgObj, j) => {
                                      const capturedImages =
                                        getFlattenedCapturedImages();
                                      const capturedImageIndex =
                                        capturedImages.findIndex(
                                          item =>
                                            item.currentStage?.stage_code ===
                                            stage.stage_code &&
                                            item.currentCamera ===
                                            stage.camera_label &&
                                            item.imageData ===
                                            imgObj.captured_image
                                        );

                                      return (
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
                                            setModalData({
                                              ...data,
                                              currentStage: stage,
                                              currentCamera: stage.camera_label,
                                              imageType: 'captured',
                                              imageData: imgObj.captured_image,
                                              regionResult: null
                                            });
                                            setTempIndex(capturedImageIndex);
                                            setImageSrc(
                                              getImage(imgObj.captured_image)
                                            );
                                            setIsRegionImageView(false);
                                          }}
                                          alt='captured'
                                        />
                                      );
                                    })}
                                  </td>

                                  {/* Region Result */}
                                  {/* <td>
                                    {regionResultsForCamera.length > 0 ? (
                                      regionResultsForCamera.map(
                                        (region, idx) => (
                                          <div
                                            key={idx}
                                            style={{ marginBottom: 5 }}
                                          >
                                            <strong>
                                              {region.rectangles?.name ||
                                                'Region'}
                                              :
                                            </strong>{' '}
                                            <span
                                              style={{
                                                color:
                                                  region.result?.toUpperCase() ===
                                                    'NG'
                                                    ? 'red'
                                                    : region.result?.toUpperCase() ===
                                                      'OK'
                                                      ? 'green'
                                                      : 'black',
                                                fontWeight: 'bold'
                                              }}
                                            >
                                              {region.result}
                                            </span>
                                          </div>
                                        )
                                      )
                                    ) : (
                                      <span className='text-muted'>-</span>
                                    )}
                                  </td> */}

                                  {/* Region Output Images */}
                                  {/* <td>
                                    {regionResultsForCamera.length > 0 ? (
                                      regionResultsForCamera.map(
                                        (region, idx) => {
                                          const regionImages =
                                            getFlattenedRegionImages();
                                          const regionImageIndex =
                                            regionImages.findIndex(
                                              item =>
                                                item.currentStage
                                                  ?.stage_code ===
                                                stage.stage_code &&
                                                item.currentCamera ===
                                                stage.camera_label &&
                                                item.regionResult?.rectangles
                                                  ?.name ===
                                                region.rectangles?.name
                                            );

                                          return (
                                            <img
                                              key={idx}
                                              src={getImage(region.output_img)}
                                              style={{
                                                width: 'auto',
                                                height: 100,
                                                marginRight: 10,
                                                marginBottom: 5,
                                                cursor: 'pointer',
                                                border: '1px solid #ddd'
                                              }}
                                              onClick={() => {
                                                setShowModal(true);
                                                setModalData({
                                                  ...data,
                                                  currentStage: stage,
                                                  currentCamera:
                                                    stage.camera_label,
                                                  imageType: 'region',
                                                  imageData: region.output_img,
                                                  regionResult: region
                                                });
                                                setTempIndex(regionImageIndex);
                                                setImageSrc(
                                                  getImage(region.output_img)
                                                );
                                                setIsRegionImageView(true);
                                              }}
                                              alt={`region-${region.rectangles?.name}`}
                                            />
                                          );
                                        }
                                      )
                                    ) : (
                                      <span className='text-muted'>-</span>
                                    )}
                                  </td> */}

                                  {/* Overall Result - show only once per group */}
                                  {stageIndex === 0 && dataIndex === 0 && (
                                    <td
                                      rowSpan={totalRows}
                                      style={{
                                        color:
                                          overallResult === 'NG'
                                            ? 'red'
                                            : 'green',
                                        fontWeight: 'bold',
                                        textAlign: 'center'
                                      }}
                                    >
                                      {overallResult}
                                    </td>
                                  )}
                                </tr>
                              );
                            });
                          });
                        }
                      );
                    })()}
                  </tbody>


                </Table>

                {/* Pagination Component would go here */}
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
      <Modal size='lg' isOpen={showModal} centered>
        <div className='modal-header'>
          <h5>
            {isRegionImageView
              ? 'Region Image Details'
              : 'Captured Image Details'}
          </h5>
          <Button className='close' onClick={() => setShowModal(false)}>
            ×
          </Button>
        </div>

        <div className='modal-body'>
          <div className='text-center'>
            <img className='img-fluid' src={imageSrc} alt='inspection' />
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
                    modalData.currentStage?.result?.trim().toUpperCase() ===
                      'NG' ||
                      modalData.result === 'No Objects Detected' ||
                      modalData.result === 'notok'
                      ? 'red'
                      : 'green'
                }}
              >
                {' '}
                <b>{modalData.currentStage?.result || modalData.result}</b>
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

          {modalData.currentStage && (
            <Row className='mt-2'>
              <Col sm={6}>
                Stage: <b>{modalData.currentStage.stage_name}</b> (
                {modalData.currentStage.stage_code})
              </Col>
              <Col sm={6} className='text-end'>
                Camera: <b>{modalData.currentCamera}</b>
              </Col>
            </Row>
          )}

          {modalData.regionResult && (
            <Row className='mt-2'>
              <Col sm={12}>
                <strong>Region:</strong>{' '}
                {modalData.regionResult.rectangles?.name}
                <br />
                <strong>Result:</strong>{' '}
                <span
                  style={{
                    color:
                      modalData.regionResult.result?.toUpperCase() === 'NG'
                        ? 'red'
                        : 'green'
                  }}
                >
                  {modalData.regionResult.result}
                </span>{' '}
                (Value: {modalData.regionResult.value})
              </Col>
            </Row>
          )}

          {/* PREV/NEXT BUTTONS */}
          <Row className='mt-4'>
            <Col md={6}>
              {tempIndex !== 0 && <Button onClick={onPrev}>Previous</Button>}
            </Col>

            <Col md={6} className='text-end'>
              {(() => {
                const totalImages = isRegionImageView
                  ? getFlattenedRegionImages().length
                  : getFlattenedCapturedImages().length;
                return (
                  tempIndex < totalImages - 1 && (
                    <Button onClick={onNext}>Next</Button>
                  )
                );
              })()}
            </Col>
          </Row>
        </div>

        <Row>
          <Col className='text-center'>
            ({tempIndex + 1} /{' '}
            {isRegionImageView
              ? getFlattenedRegionImages().length
              : getFlattenedCapturedImages().length}
            )
          </Col>
        </Row>
      </Modal>
    </div>
  );
};


Report.propTypes = {
  history: PropTypes.any.isRequired
};

export default Report;
