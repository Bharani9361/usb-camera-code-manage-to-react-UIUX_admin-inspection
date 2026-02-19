import React, { useState, useEffect, useRef } from "react";
import MetaTags from 'react-meta-tags';
import {
  Card,
  Col,
  Container,
  Row,
  CardBody,
  CardTitle,
  Label,
  Button,
  Form,
  Input,
  InputGroup, Modal, Table,
  Spinner, ModalBody, FormGroup, ModalFooter
} from "reactstrap";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import { Image } from 'antd';
import { Radio, Space, Checkbox, Progress } from 'antd';
import SearchField from "react-search-field";

import urlSocket from "./urlSocket";
import ImageUrl from "./imageUrl";
import { img_url } from "./imageUrl";
import Swal from "sweetalert2";
import Breadcrumbs from "components/Common/Breadcrumb";
import { toastWarning } from "./ToastComponent";
import FullScreenLoader from "components/Common/FullScreenLoader";

const CRUDComponent = () => {
  const history = useHistory();
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // State variables
  const [dataloaded, setDataloaded] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [component_name, setComponentName] = useState("");
  const [component_code, setComponentCode] = useState("");
  const [batch_id, setBatchId] = useState("");
  const [addCompModal, setAddCompModal] = useState(false);
  const [image_data, setImageData] = useState([]);
  const [stationList, setStationList] = useState([]);
  const [label_list, setLabelList] = useState([]);
  const [manual_auto_option] = useState(['Manual', 'Auto']);
  const [detection_method] = useState(['ML', 'DL']);
  const [selectM_A] = useState('Manual');
  const [timer, setTimer] = useState(10);
  const [SearchField, setSearchField] = useState('');
  const [items_per_page_stock] = useState(100);
  const [currentPage_stock, setCurrentPageStock] = useState(1);
  const [sorting] = useState({ field: "", order: "" });
  const [search_componentList, setSearchComponentList] = useState([]);
  const [componentList, setComponentList] = useState([]);
  const [progress, setProgress] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDataIndex, setCurrentDataIndex] = useState(null);
  const [modalDetectionType, setModalDetectionType] = useState('ML');
  const [modalSelectedRegions, setModalSelectedRegions] = useState([]);
  const [users] = useState([]);
  const [showValidationMsg, setShowValidationMsg] = useState(false);
  const [barcode_check_type] = useState({
    0: 'only With Correct Barcode',
    1: 'with Both Correct & Incorrect'
  });
  const [detectionType] = useState(['ML', 'DL',]); // 'Smart Object Locator'
  const [IsSynching, setIsSynching] = useState(false);
  const [is_loading_models, setIsLoadingModels] = useState(false);
  const [stationStages, setStationStages] = useState([]);

  // Effects
  // useEffect(async () => {
  //   await getStationInfo();
  //   sessionStorage.removeItem('showSidebar');
  //   sessionStorage.setItem('showSidebar', false);
  //   label_config();

  //   return () => {
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current);
  //     }
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //     }
  //   };
  // }, []);

  // Effects
  useEffect(() => {
    let isMounted = true; // flag to avoid state updates if unmounted

    async function init() {
      try {
        await getStationInfo();
        if (!isMounted) return; // prevent updates if unmounted

        sessionStorage.removeItem('showSidebar');
        sessionStorage.setItem('showSidebar', false);
        label_config();
      } catch (error) {
        console.error(error);
      }
    }

    init(); // call the async function
        // cronJobstart();


    return () => {
      isMounted = false; // mark unmounted
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


  const label_config = () => {
    try {
      urlSocket.post('/config', { mode: 'no-cors' })
        .then((response) => {
          let data = response.data;
        })
    } catch (error) {
      // Handle error
    }
  };

  // const cronJobstart = async () => {
  //   try {
  //     const response = await urlSocket.post('/cron_job_call', { mode: 'no-cors' });
  //     console.log('responseresponse', response)
  //     // if (response.data.error === "Tenant not found") {
  //     //   error_handler(response.data.error);
  //     // } else {
  //     //   statusinfo(response.data);

  //     // }
  //   } catch (error) {
  //     console.log(error);
  //   }

  // };

  const getStationInfo = () => {
    const data = JSON.parse(sessionStorage.getItem("stationInfo"));
    console.log('data51data', data);

    if (data[0].config_change === false) {
      setStationList(data);
      setDisabled(true);
      setDataloaded(true);
    } else if (data[0].config_change === true) {
      setStationList(data);
      setDisabled(false);
      setDataloaded(true);
    }
    compInfo(data);

  };

  const compInfo = async (stationInfo) => {
    console.log('this.state.progress104', progress,stationInfo);
    try {
      urlSocket.post('/comp_filterData', { mode: 'no-cors' })
        .then((response) => {
            console.log('response', response)
          let data = response.data;
          console.log('frontend info', data.length);
          if (data.length > 0 && stationInfo!== undefined)  {
            datacomplete(data,stationInfo);
          }
        })
        .catch((error) => {
          console.log('err', error);
        });
    } catch (error) {
      console.log("error", error);
    }
  };

  const test_filterData = async (data) => {
    console.log('data134', data)
    setIsSynching(true);
    try {
      const payload = {};
      const response = await urlSocket.post('/test_api', payload, { mode: 'no-cors' });
      console.log('response', response)

      let datas = response.data;
      console.log('detailes88', datas);
      if (datas === 'ok') {
        active_filterData(data);
        setSearchField('');
      } else {
        toastWarning('Unable to Reach Admin', '');
        setIsSynching(false);
      }
    } catch (error) {
      console.log('/test_api - unable to reach admin server');
      toastWarning('Unable to Reach Admin', '');
      setIsSynching(false);
    }
  };

  // const comp_list = async () => {
  //   try {
  //     urlSocket.post('/comp_filterData', { mode: 'no-cors' })
  //       .then((response) => {
  //         let data = response.data;
  //         console.log('detailes74', data);
  //         configuration(data, false);
  //       })
  //       .catch((error) => {
  //         console.log('err', error);
  //       });
  //   } catch (error) {
  //     console.log("error", error);
  //   }
  // };

  const getStationDetails = async () => {
    urlSocket.post('/getstationInfo', { mode: 'no-cors' })
      .then((response) => {
        let datas = response.data;
        console.log('/getstationInfo ', response.data);
        if (datas.length > 0) {
          sessionStorage.removeItem("stationInfo");
          sessionStorage.setItem("stationInfo", JSON.stringify(datas));

          setDisabled(datas[0].config_change ? false : true);

          window.dispatchEvent(new Event("storage"));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const configuration = async (data, isOnline = false) => {
    let station_id = stationList[0]?._id;
    try {
      urlSocket.post('/conf_filterData', { 'data': data, 'station_id': station_id }, { mode: 'no-cors' })
        .then(async (response) => {
          console.log('response250', response)
          let confData = response.data;

          setComponentList(confData);
          setSearchComponentList(confData);
          setDataloaded(true);
          if (isOnline) {
            await getStationDetails();
            await datasetDownload();
          } else {
            console.log('admin offline\ngot station_comp_info offline data');
          }
        })
        .catch((error) => {
          console.log('err', error);
        });
    } catch (error) {
      console.log("error", error);
    }
  };

  const datacomplete = (data, stationInfo) => {
    console.log('data218', data, stationInfo, stationList)
    const station_id =
      stationList?.[0]?._id ||
      stationInfo?.[0]?._id ||
      null;

    if (!station_id) {
      console.error("No station_id found");
      return;
    }
    
    console.log('station_id', station_id)
    try {
      urlSocket.post('/conf_filterData', { 'data': data, 'station_id': station_id }, { mode: 'no-cors' })
        .then((response) => {
          let confData = response.data;
          console.log('data257 ', confData);
          setComponentList(confData);
          setSearchComponentList(confData);
          setDataloaded(true);
        })
        .catch((error) => {
          console.log('err', error);
        });
    } catch (error) {
      console.log("error", error);
    }
  };

  const active_filterData = async (data) => {
    console.log('data169', data)
    let station_id = data[0]?._id;
    try {
      const response = await urlSocket.post('/active_filterData', { 'station_id': station_id }, { mode: 'no-cors' });
      let activeData = response.data;
      console.log('/active_filterData', activeData);
      configuration(activeData, true);
    } catch (error) {
      console.log("----", error);
    } finally {
      setIsSynching(false);
    }
  };

  const sync_stn_comp_info = () => {
    try {
      urlSocket.post('/sync_stn_comp_info', { mode: 'no-cors' })
        .then((response) => {
          let data = response.data;
          console.log('detailes97', data);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log("----", error);
    }
  };

  // const testingComp = async (datas) => {
  //   console.log('datas', datas)
  //   setIsLoadingModels(true);
  //   if (!Array.isArray(datas.datasets)) {
  //     datas.datasets = [];
  //   }

  //   if (datas.qrbar_check && !datas.qrbar_check_type) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Barcode Checking Type Required',
  //       confirmButtonText: 'OK',
  //     });
  //     setIsLoadingModels(false);
  //     return;
  //   }

  //   const { comp_name, comp_code, _id } = datas;

  //   try {
  //     const response = await urlSocket.post('/create_batch', { comp_name, comp_code, comp_id: _id }, { mode: 'no-cors' });
  //     console.log('response289', response)

  //     const newBatchId = response.data.batch_id;
  //     const stationsStage = response.data.stations;
  //     console.log('stationsStage', stationsStage)
  //        const sortedStations = stationsStage.map(station => {
  //       if (station.stage_profiles_order && station.stage_profiles) {
  //           const sortedProfiles = {};
  //           station.stage_profiles_order.forEach(key => {
  //               if (station.stage_profiles[key]) {
  //                   sortedProfiles[key] = station.stage_profiles[key];
  //               }
  //           });
  //           station.stage_profiles = sortedProfiles;
  //       }
  //       return station;
  //   });
    
  //   setStationStages(sortedStations);
  //     console.log('batch_id', newBatchId);
  //     setBatchId(newBatchId);
  //     // setStationStages(stationsStage);
  //     setComponentCode(comp_code);
  //     setComponentName(comp_name);

  //     const station = stationList?.[0] || {};

  

  //     const compData = {
  //       ...datas,                
  //       component_name: datas.comp_name,
  //       component_code: datas.comp_code,
  //       batch_id: newBatchId,
  //       station_id: station._id,
  //       station_name: station.station_name,
  //     };


  //     if ('qrOrBar_code' in datas) {
  //       compData.qrOrBar_code = datas.qrOrBar_code;
  //     }

  //     if (datas.detection_type === 'Smart Object Locator') {
  //       compData.selected_regions = datas.selected_regions || [];
  //       compData.rectangles = datas.rectangles || [];
  //     }

  //     console.log('compData:', compData);

  //     sessionStorage.setItem('compData', JSON.stringify(compData));
  //     sessionStorage.setItem('componentData', JSON.stringify(componentList));
  //     sessionStorage.setItem('stationCompStages', JSON.stringify(stationsStage));

  //   //   history.push('/inspect');
  //   if(compData?.inspection_method === 'Sequential'){
  //     history.push('/inspectiontestingstagesequential');
  //   }else{
  //     history.push('/inspecttestingstage');
  //   }

  //   } catch (error) {
  //     console.error('Error in create_batch:', error);
  //   } finally {
  //     setIsLoadingModels(false);
  //   }
  // };





  const testingComp = async (datas) => {
    console.log('datas', datas)
    setIsLoadingModels(true);
    if (!Array.isArray(datas.datasets)) {
      datas.datasets = [];
    }

    if (datas.qrbar_check && !datas.qrbar_check_type) {
      Swal.fire({
        icon: 'warning',
        title: 'Barcode Checking Type Required',
        confirmButtonText: 'OK',
      });
      setIsLoadingModels(false);
      return;
    }

    const { comp_name, comp_code, _id } = datas;

    try {
      const response = await urlSocket.post('/create_batch', { comp_name, comp_code, comp_id: _id }, { mode: 'no-cors' });
      console.log('response289', response)

      const newBatchId = response.data.batch_id;
      const stationsStage = response.data.stations;
      
      // Reconstruct stage_profiles in correct order
      const orderedStations = stationsStage.map(station => {
        if (station.stage_profiles_order && station.stage_profiles) {
          const orderedProfiles = {};
          station.stage_profiles_order.forEach(stageKey => {
            if (station.stage_profiles[stageKey]) {
              orderedProfiles[stageKey] = station.stage_profiles[stageKey];
            }
          });
          return {
            ...station,
            stage_profiles: orderedProfiles
          };
        }
        return station;
      });
      
      console.log('orderedStations', orderedStations)
      setBatchId(newBatchId);
      setStationStages(orderedStations);
      setComponentCode(comp_code);
      setComponentName(comp_name);

      const station = stationList?.[0] || {};

      const compData = {
        ...datas,                
        component_name: datas.comp_name,
        component_code: datas.comp_code,
        batch_id: newBatchId,
        station_id: station._id,
        station_name: station.station_name,
      };

      if ('qrOrBar_code' in datas) {
        compData.qrOrBar_code = datas.qrOrBar_code;
      }

      if (datas.detection_type === 'Smart Object Locator') {
        compData.selected_regions = datas.selected_regions || [];
        compData.rectangles = datas.rectangles || [];
      }

      console.log('compData:', compData);

      sessionStorage.setItem('compData', JSON.stringify(compData));
      sessionStorage.setItem('componentData', JSON.stringify(componentList));
      sessionStorage.setItem('stationCompStages', JSON.stringify(orderedStations));

      if(compData?.inspection_method === 'Sequential'){
        history.push('/inspectiontestingstagesequential');
      }else{
        history.push('/inspecttestingstage');
      }

    } catch (error) {
      console.error('Error in create_batch:', error);
    } finally {
      setIsLoadingModels(false);
    }
};
  const selectManual_auto = (e, data, value, idx, str) => {
    console.log('first220', e, data, value, idx, str);
    if (str === '1') {
      const newCompList = [...componentList];
      newCompList[idx].radio_checked = e.target.checked;
      newCompList[idx].inspection_type = value;
      setComponentList(newCompList);
      setSearchComponentList(newCompList);
      try {
        let station_id = stationList[0]?._id;
        urlSocket.post('/manual_auto', { 'comp_id': data._id, 'station_id': station_id, 'inspection_type': newCompList[idx].inspection_type }, { mode: 'no-cors' })
          .then((response) => {
            let respData = response.data;
            console.log('inspection_type', respData);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log("----", error);
      }
    }
    console.log('first226', componentList);
  };




  const selectCaptureMode = (value, data, idx) => {
    console.log('value, data, idx', value, data, idx)
  const newCompList = [...componentList];
  newCompList[idx].capture_mode = value;
  setComponentList(newCompList);
  setSearchComponentList(newCompList);

  try {
    let station_id = stationList[0]?._id;
    urlSocket.post('/capture_mode', {
      comp_id: data._id,
      station_id,
      capture_mode: value
    })
    .then((response) => {
      console.log('capture_mode', response.data);
    })
    .catch(console.log);
  } catch (error) {
    console.log("----", error);
  }
};


  const detectionMethod = (e, data, value, idx, str) => {
    console.log('first220', e, data, value, idx, str);
    if (str === '1') {
      const newCompList = [...componentList];
      newCompList[idx].detect_selection = e.target.checked;
      newCompList[idx].detection_type = value;
      setComponentList(newCompList);
      setSearchComponentList(newCompList);
      try {
        let station_id = stationList[0]?._id;
        urlSocket.post('/detectioMethod', { 'comp_id': data._id, 'station_id': station_id, 'detection_type': newCompList[idx].detection_type }, { mode: 'no-cors' })
          .then((response) => {
            let respData = response.data;
            console.log('inspection_type', respData);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log("----", error);
      }
    }
    console.log('first226', componentList);
  };

  const countdown = (e, data, idx, str) => {
    console.log('first232', e, idx, str);
    let station_id = stationList[0]?._id;
    if (str === '2') {
      const newCompList = [...componentList];
      newCompList[idx].timer = Number(e);
      setComponentList(newCompList);
      setSearchComponentList(newCompList);
      try {
        urlSocket.post('/timer', { 'comp_id': data._id, 'station_id': station_id, 'timer': newCompList[idx].timer }, { mode: 'no-cors' })
          .then((response) => {
            let respData = response.data;
            console.log('config', respData);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log("----", error);
      }
    }
    console.log('first238', componentList);
  };

  const qr_checking = (e, data, idx, str) => {
    console.log('242', e, idx, str);
    let station_id = stationList[0]?._id;
    if (str === '1') {
      const newCompList = [...componentList];
      newCompList[idx].qr_checking = e.target.checked;
      if (newCompList[idx].qr_checking === false) {
        newCompList[idx].qruniq_checking = false;
        newCompList[idx].qr_checking = e.target.checked;
      }
      setComponentList(newCompList);
      setSearchComponentList(newCompList);

      try {
        urlSocket.post('/qr_check', { 'comp_id': data._id, 'station_id': station_id, 'qr_checking': newCompList[idx].qr_checking, 'qruniq_checking': newCompList[idx].qruniq_checking }, { mode: 'no-cors' })
          .then((response) => {
            let respData = response.data;
            console.log('config', respData);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log("----", error);
      }
    }
    console.log('first238', componentList);
  };

  const objDetectSelect = (e, data, idx, str) => {
    let station_id = stationList[0]?._id;
    if (str === '1') {
      const newCompList = [...componentList];
      newCompList[idx].detect_selection = e.target.checked;
      setComponentList(newCompList);
      setSearchComponentList(newCompList);
    }
    console.log('first238', componentList);
  };

  const handleObjDetectType = (e, data, index) => {
    const selectedOption = e.target.value;
    console.log('data803 ', e, data, index);

    const newCompList = [...componentList];
    newCompList[index].detection_type = e.target.value;
    setComponentList(newCompList);
  };

  const qrbar_check = (e, data, idx, str) => {
    console.log('242', e, idx, str);
    if (str === '1') {
      const newCompList = [...componentList];
      newCompList[idx].qrbar_check = e.target.checked;
      setComponentList(newCompList);
      setSearchComponentList(newCompList);
    }
    console.log('first238', componentList);
  };

  const qr_uniq_checking = (e, data, idx, str) => {
    console.log('242', e, idx, str);
    let station_id = stationList[0]?._id;
    if (str === '1') {
      const newCompList = [...componentList];
      newCompList[idx].qruniq_checking = e.target.checked;
      if (newCompList[idx].qr_checking === false || newCompList[idx].qr_checking === undefined) {
        newCompList[idx].qr_checking = true;
        newCompList[idx].qruniq_checking = e.target.checked;
      }
      setComponentList(newCompList);
      setSearchComponentList(newCompList);

      try {
        urlSocket.post('/qruniq_check', { 'comp_id': data._id, 'station_id': station_id, 'qr_checking': newCompList[idx].qr_checking, 'qruniq_checking': newCompList[idx].qruniq_checking }, { mode: 'no-cors' })
          .then((response) => {
            let respData = response.data;
            console.log('config', respData);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log("----", error);
      }
    }
    console.log('first238', componentList);
  };

  const getImage = (data1) => {
    console.log('getImage data1', data1);
    if (data1 !== undefined) {
      let baseurl = img_url;
      let data2 = data1.filter((data) => {
        return data.type === 'ok';
      });

      if (data2.length > 0) {
        let replace = data2[0].image_path.replaceAll("\\", "/");
        let result = replace;
        let output = baseurl + result;
        return output;
      }
    } else {
      return null;
    }
  };

  const logComp = (data) => {
    if (data.datasets === undefined) {
      data.datasets = [];
    }
    let { comp_name, comp_code, _id } = data;

    let datas = {
      component_name: comp_name,
      component_code: comp_code,
      datasets: data.datasets,
      status: data.status,
      positive: data.positive,
      negative: data.negative,
      posble_match: data.posble_match,
      _id,
      station_id: stationList[0]?._id,
      station_name: stationList[0]?.station_name,
    };
    sessionStorage.removeItem("compData");
    sessionStorage.setItem("compData", JSON.stringify(datas));

    setComponentCode(comp_code);
    setComponentName(comp_name);
  };

  const onSearch = (search) => {
    console.log('e607', search);
    setSearchField(search);
    setCurrentPageStock(1);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      dataListProcess();
    }, 100);
  };

  const dataListProcess = () => {
    try {
      let { search_componentList: searchCompList, SearchField: search, sorting: sort, currentPage_stock: currPage, items_per_page_stock: itemsPerPage } = { search_componentList, SearchField: search, sorting, currentPage_stock: currPage, items_per_page_stock };
      let filteredList = [...searchCompList];

      if (search) {
        filteredList = filteredList.filter(d =>
          d.comp_name.toUpperCase().includes(search.toUpperCase()) ||
          d.comp_code.toUpperCase().includes(search.toUpperCase())
        );
      }
      if (sort.field) {
        const reversed = sort.order === "asc" ? 1 : -1;
        filteredList = filteredList.sort((a, b) => reversed * a[sort.field].localeCompare(b[sort.field]));
      }
      let paginated = filteredList.slice((currPage - 1) * itemsPerPage, (currPage - 1) * itemsPerPage + itemsPerPage);
      setComponentList(paginated);
      // totalItems_stock not used, but if needed: setTotalItemsStock(filteredList.length);
      setDataloaded(true);
    } catch (error) {
      // Handle error
    }
  };

  const openDetectionModal = (rowData, index) => {
    console.log('this.state.componentList757', componentList,rowData, index);
    setModalVisible(true);
    setCurrentDataIndex(index);
    setModalDetectionType(rowData.detection_type || 'ML');
    setModalSelectedRegions(rowData?.selected_regions || []);
    setShowValidationMsg(false);
  };

  const handleModalConfirm = () => {
    console.log('firstfirstfirst', modalDetectionType, modalSelectedRegions, currentDataIndex, componentList);  
    // const { modalDetectionType: type, modalSelectedRegions: regions, currentDataIndex: index, componentList: compList } = { modalDetectionType: type, modalSelectedRegions: regions, currentDataIndex: index, componentList: compList };

    if (modalDetectionType === 'Smart Object Locator' && modalSelectedRegions.length === 0) {
      setShowValidationMsg(true);
      return;
    }

    const updated = [...componentList];
    console.log("users", updated);
    updated[currentDataIndex].detection_type = modalDetectionType;
    updated[currentDataIndex].selected_regions = modalDetectionType === 'Smart Object Locator' ? modalSelectedRegions : [];

    setComponentList(updated);
    setModalVisible(false);
    setCurrentDataIndex(null);
    setModalDetectionType(null);
    setModalSelectedRegions([]);
    setShowValidationMsg(false);
  };

  const datasetDownload = async () => {
    progressSts();
    const startTime = new Date().getTime();
    try {
      const response = await urlSocket.post('/download_filterData', { mode: 'no-cors' });
      let data = response.data;
      console.log('details322', data);
      let status = data.status;

      if (status === 'dataset downloaded') {
        let datasetList = data.datasetList;
        datacomplete(datasetList);
      } else if (status === 'invalid data') {
        let datasetList = data.datasetList;
        datacomplete(datasetList);
      } else {
        // setErrorLoading(true);
        let datasetList = data.datasetList;
        datacomplete(datasetList);
      }
    } catch (error) {
      console.log('err', error);
    }
  };

  const progressSts = () => {
    intervalRef.current = setInterval(() => {
      urlSocket.post('/download_progress', { mode: 'no-cors' })
        .then((response) => {
          let data = response.data;
          console.log('details261', data);
          let updatedProgress = [...progress];
          let anyDownloadCompleted = false;
          data.forEach((info, index) => {
            console.log('info265', info.download_sts);
            if (info.download_sts === undefined) {
              updatedProgress[index] = 0;
            } else {
              updatedProgress[index] = info.download_sts;
              setProgress(updatedProgress);
            }
            if (info.download_sts === 100 && !anyDownloadCompleted) {
              anyDownloadCompleted = true;
            }
          });
          if (updatedProgress.every(percent => percent === 100)) {
            clearInterval(intervalRef.current);
            setProgress([]);
          }
        })
        .catch((error) => {
          console.log('err', error);
        });
         return null;  
    }, 3000);
  };






  const handleQRBarcodeCheckType = (e, data, index) => {
    const selectedOption = e.target.value;
    console.log('data803 ', e, data, index);

    const newCompList = [...componentList];
    newCompList[index].qrbar_check_type = parseInt(e.target.value);
    setComponentList(newCompList);
  };

  const barcode_printAvl = (e, data, idx, str) => {
    console.log('print_Sts 854', e, idx, str);
    let station_id = stationList[0]?._id;
    const newCompList = [...componentList];
    newCompList[idx].barcode_print = e.target.checked;
    if (newCompList[idx].barcode_print === false || newCompList[idx].barcode_print === undefined) {
      newCompList[idx].barcode_print = true;
      newCompList[idx].barcode_print = e.target.checked;
    }
    setComponentList(newCompList);
    setSearchComponentList(newCompList);

    console.log('first238', componentList);
  };

  if (dataloaded) {
    return (
      <React.Fragment>
        {is_loading_models ? <FullScreenLoader /> : null}
        <div className="page-content">
          <MetaTags>
            <title>Component Information</title>
          </MetaTags>
          <Breadcrumbs title="COMPONENT INFORMATION" />
          <Container fluid>
            <Card>
              <CardBody>
                <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
                  <Col xs="12" lg="auto" className="text-center">
                    <div className="search-box">
                      <div className="position-relative">
                        <Input
                          onChange={(e) => onSearch(e.target.value)}
                          id="search-user"
                          type="text"
                          className="form-control"
                          placeholder="Search name or code..."
                          value={SearchField}
                        />
                        <i className="bx bx-search-alt search-icon" />
                      </div>
                    </div>
                  </Col>

                  <Col xs="12" lg="auto" className="text-center">
                    <Button className="w-lg btn btn-sm" color='primary'
                      onClick={() => test_filterData(stationList)}
                      disabled={IsSynching}
                    >
                      {IsSynching ?
                        <div className="d-flex align-items-center"><Spinner size="sm" className="me-2" /> Syncing Component</div>
                        :
                        <>Component Sync</>}

                    </Button>
                  </Col>
                </Row>
                {componentList.length === 0 ?
                  <div className="container" style={{ position: 'relative', height: '20vh' }}>
                    <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      <h5 className="text-secondary">No Records Found</h5>
                    </div>
                  </div>
                  :
                    <div className="table-responsive">
                      <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                        <thead className="table-light">
                          <tr>
                            <th>S. No.</th>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Images</th>
                            <th>Profile Name</th>
                            <th>Capture Image mode</th>

                            <th>Inspection Mode</th>

                            <th>Detection Method</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        {
                          console.log('componentList', componentList)
                        }
                        <tbody>
                          {componentList.map((data, index) => (
                            <tr key={index}>
                              <td style={{ backgroundColor: "white" }}>{index + 1}</td>
                              <td style={{ backgroundColor: "white" }}>{data.comp_name}</td>
                              <td style={{ backgroundColor: "white" }}>{data.comp_code}</td>
                              <td style={{ backgroundColor: "white" }}>
                                {data.image_sync === 0 ?
                                  <div>
                                    <Space wrap size="middle">
                                      <Progress size="small" type="circle" percent={progress[index] !== undefined ? progress[index] : 0} format={(percent) => `${percent}% Done`} />
                                    </Space>
                                  </div>
                                  :
                                  <Row>
                                    <Image
                                      style={{ borderRadius: '8px' }}
                                      width={100}
                                      src={data.datasets === undefined ? "" : data.datasets.length !== 0 ? getImage(data.datasets) : ""}
                                    />
                                  </Row>
                                }
                              </td>
                              <td style={{ backgroundColor: "white" }}>{data.profile_name}</td>
                              {/* <td style={{ backgroundColor: "white" }}>sequential and non sequential</td> */}
                              <td style={{ backgroundColor: "white" }}>
                                <Radio.Group
                                  value={data.inspection_method}
                                  onChange={(e) => selectCaptureMode(e.target.value, data, index)}
                                  disabled={true}
                                >
                                  <Space>
                                    <Radio value="Sequential">Sequential</Radio>
                                    <Radio value="Non-Sequential">Non-Sequential</Radio>
                                  </Space>
                                </Radio.Group>
                              </td>


                              <td style={{ backgroundColor: "white" }}>
                                {manual_auto_option.map((data1, idx) => (
                                  <Radio.Group
                                    key={idx}
                                    value={(JSON.parse(data.radio_checked) === true && data.inspection_type === data1) ? true : false || undefined}
                                    disabled={disabled}
                                  >
                                    <Space>
                                      <div className='pay_cards'>
                                        <Radio
                                          onChange={(e) => selectManual_auto(e, data, data1, index, '1')}
                                          value={
                                            (JSON.parse(data.radio_checked) === true && data.inspection_type === data1)
                                              ? true
                                              : false}
                                          disabled={disabled}
                                        >
                                          {data1}
                                        </Radio>
                                      </div>
                                    </Space>
                                  </Radio.Group>
                                ))}
                                <div>
                                  {data.inspection_type === 'Auto' &&
                                    <Row>
                                      <Col sm={5}>
                                        <label>
                                          Countdown (in sec):
                                        </label>
                                        <div>
                                          <input
                                            className="form-control"
                                            type="number"
                                            defaultValue={data.timer}
                                            id="example-number-input"
                                            disabled={disabled}
                                            min="0"
                                            onChange={(e) => countdown(e.target.value, data, index, '2')}
                                          />
                                        </div>
                                      </Col>
                                    </Row>
                                  }
                                </div>
                              </td>
                              <td style={{ backgroundColor: "white" }}>
                                <div className="align-items-start" style={{ cursor: "pointer", userSelect: 'none' }}>
                                  <Checkbox
                                    checked={data?.detect_selection || false}
                                    disabled={disabled}
                                    onChange={(e) => objDetectSelect(e, data, index, '1')}
                                  >
                                    Enable Object Detection
                                  </Checkbox>
                                  {data?.detect_selection && (
                                    <div style={{ marginTop: 8 }} className='d-flex flex-column'>
                                      <Label >
                                        Method: <strong>{data.detection_type || "Not selected"}</strong>
                                      </Label>
                                      {data.detection_type === 'Smart Object Locator' && (
                                        <Label style={{ color: '#555' }}>
                                          Regions: {data.selected_regions?.length > 0 ? data.selected_regions.join(', ') : 'None'}
                                        </Label>
                                      )}
                                      <span
                                        onClick={() => openDetectionModal(data, index)}
                                        style={{ marginTop: 4, display: 'inline-block', color: '#007bff', cursor: 'pointer' }}
                                      >
                                        ✎ Edit
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td style={{ backgroundColor: "white" }}>
                                {data.image_sync !== 0 &&
                                  <Button className="w-md btn btn-sm" color="primary" id="inspButton" onClick={() => testingComp(data)}>Inspect</Button>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                }
              </CardBody>
            </Card>
          </Container>
          {modalVisible && (
            <Modal isOpen={modalVisible} toggle={() => setModalVisible(false)}>
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
                        {componentList?.[currentDataIndex]?.rectangles?.map((region, idx) => (
                          <FormGroup check key={idx}>
                            <Label check>
                              <Input
                                type="checkbox"
                                checked={modalSelectedRegions.includes(region.name)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  let updated = [...modalSelectedRegions];
                                  if (isChecked) {
                                    updated.push(region.name);
                                  } else {
                                    updated = updated.filter(r => r !== region.name);
                                  }
                                  setModalSelectedRegions(updated);
                                  setShowValidationMsg(false);
                                }}
                              />{' '}
                              {region.name}
                            </Label>
                          </FormGroup>
                        ))}

                        {showValidationMsg && (
                          <div style={{ color: 'red', marginTop: 8 }}>
                            *Please select at least one region for Smart Object Locator to work.
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
          )}
        </div>
      </React.Fragment>
    );
  } else {
    return null;
  }
};

export default CRUDComponent;






// import React, { Component } from "react";
// import MetaTags from 'react-meta-tags';
// import PropTypes from "prop-types"
// import {
//   Card,
//   Col,
//   Container,
//   Row,
//   CardBody,
//   CardTitle,
//   Label,
//   Button,
//   Form,
//   Input,
//   InputGroup, Modal, Table,
//   Spinner, ModalBody, FormGroup, ModalFooter
// } from "reactstrap";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { Image } from 'antd';
// import { Radio, Space, Checkbox, Spin, Progress, Switch } from 'antd';
// import { LoadingOutlined } from '@ant-design/icons'
// import SearchField from "react-search-field";
// import { img_url } from "./imageUrl";

// // commented this due to ant design version upgrade from 4.x to 5.8.4
// // import 'antd/dist/antd.css';


// import urlSocket from "./urlSocket";
// import ImageUrl from "./imageUrl";
// import Swal from "sweetalert2";
// import Breadcrumbs from "components/Common/Breadcrumb";
// import { toastWarning } from "./ToastComponent";
// import FullScreenLoader from "components/Common/FullScreenLoader";

// // import CardComp from './Components/CardComp'
// class CRUDComponent extends Component {

//   constructor(props) {
//     super(props);
//     this.state = {
//       dataloaded: false,
//       disabled: false,
//       component_name: "",
//       component_code: "",
//       batch_id: "",
//       addCompModal: false,
//       image_data: [],
//       stationList: [],
//       label_list: [],
//       manual_auto_option: ['Manual', 'Auto'],
//       detection_method: ['ML', 'DL'],
//       selectM_A: 'Manual',
//       timer: 10,
//       SearchField: '',
//       items_per_page_stock: 100,
//       currentPage_stock: 1,
//       sorting: { field: "", order: "" },
//       search_componentList: [],
//       componentList: [],
//       progress: [],
//       modalVisible: false,
//       currentDataIndex: null,
//       modalDetectionType: 'ML',
//       modalSelectedRegions: [],
//       users: [],
//       showValidationMsg: false,

//       barcode_check_type: {
//         0: 'only With Correct Barcode',
//         1: 'with Both Correct & Incorrect'
//       },
//       detectionType: ['ML', 'DL',], //'Smart Object Locator'

//       IsSynching: false,

//       is_loading_models: false,
//     }
//     this.datasetDownload = this.datasetDownload.bind(this);
//     this.datacomplete = this.datacomplete.bind(this);
//   }

//   componentDidMount() {
//     this.getStationInfo()
//     sessionStorage.removeItem('showSidebar')
//     sessionStorage.setItem('showSidebar', false)
//     this.label_config()
//     // document.addEventListener('keydown', this.handleKeyDown);
//   }


//   label_config = () => {
//     try {
//       urlSocket.post('/config',
//         { mode: 'no-cors' })
//         .then((response) => {
//           let data = response.data
//           // console.log('detailes88', data)
//           // this.setState({ config_data: data, config_positive:data[0].positive, config_negative:data[0].negative, config_posble_match:data[0].posble_match })
//         })
//     } catch (error) {

//     }
//   }

//   getStationInfo = () => {

//     var data = JSON.parse(sessionStorage.getItem("stationInfo"))
//     console.log('data51', data)

//     this.compInfo(data);
//     if (data[0].config_change === false) {
//       // console.log('if', data[0].config_change)
//       this.setState({ stationList: data, disabled: true, dataloaded: true })
//     }
//     else if (data[0].config_change === true) {
//       // console.log('else', data[0].config_change)
//       this.setState({ stationList: data, disabled: false, dataloaded: true })
//     }
//     // console.log('this.state.dataloaded98', this.state.stationList,)
//   }

//   compInfo = async (stationInfo) => {
//     console.log('this.state.progress104', this.state.progress)
//     try {
//       urlSocket.post('/comp_filterData',
//         { mode: 'no-cors' })
//         .then((response) => {
//           let data = response.data
//           console.log('frontend info', data)
//           if (data.length > 0) {
//             this.datacomplete(data)
//           }
//           // else {
//           //     // this.test_filterData(stationInfo)
//           // }
//         })
//         .catch((error) => {
//           console.log('err', error)
//         })
//     } catch (error) {
//       console.log("error", error)
//     }
//   }

//   test_filterData = async (data) => {
//     // console.log('data', data)
//     this.setState({ IsSynching: true })
//     try {
//       const payload = {}
//       const response = await urlSocket.post('/test_api', payload, { mode: 'no-cors' });

//       let datas = response.data
//       console.log('detailes88', datas)
//       //this.setState({ componentList: data, dataloaded: true })
//       if (datas === 'ok') {
//         this.active_filterData(data)
//         this.setState({ SearchField: '' })
//         // this.sync_network_test()
//       }
//       else {
//         toastWarning('Unable to Reach Admin', '');
//         this.setState({ IsSynching: false })
//         // this.comp_list()
//       }

//       // 
//       // urlSocket.post('/test_api',
//       //     { mode: 'no-cors' })
//       //     .then((response) => {
//       //         let datas = response.data
//       //         // console.log('detailes88', datas)
//       //         //this.setState({ componentList: data, dataloaded: true })
//       //         if (datas === 'ok') {
//       //             this.active_filterData(data)
//       //             this.setState({ SearchField: '' })
//       //             // this.sync_network_test()
//       //         }
//       //         else {
//       //             this.comp_list()
//       //         }
//       //     })
//       //     .catch((error) => {
//       //         console.log(error)
//       //         this.comp_list()
//       //     })
//     } catch (error) {
//       console.log('/test_api - unable to reach admin server');
//       toastWarning('Unable to Reach Admin', '');
//       this.setState({ IsSynching: false })
//       // this.comp_list()
//     }
//   }

//   comp_list = async () => {
//     try {
//       urlSocket.post('/comp_filterData',
//         { mode: 'no-cors' })
//         .then((response) => {
//           let data = response.data
//           console.log('detailes74', data)
//           //this.setState({ componentList: data, dataloaded: true })
//           this.configuration(data, false)
//         })
//         .catch((error) => {
//           console.log('err', error)
//         })
//     } catch (error) {
//       console.log("error", error)
//     }
//   }

//   getStationDetails = async () => {
//     urlSocket.post('/getstationInfo', { mode: 'no-cors' })
//       .then((response) => {
//         let datas = response.data;
//         console.log('/getstationInfo ', response.data)
//         if (datas.length > 0) {
//           sessionStorage.removeItem("stationInfo")
//           sessionStorage.setItem("stationInfo", JSON.stringify(datas));

//           this.setState({ disabled: datas[0].config_change ? false : true })

//           window.dispatchEvent(new Event("storage"));

//         }
//       })
//       .catch((error) => {
//         console.log(error)
//       })
//   }

//   configuration = (data, isOnline = false) => {
//     let station_id = this.state.stationList[0]._id
//     try {
//       urlSocket.post('/conf_filterData', { 'data': data, 'station_id': station_id },
//         { mode: 'no-cors' })
//         .then((response) => {
//           let data = response.data
//           this.setState({
//             componentList: data,
//             search_componentList: data,
//             dataloaded: true
//           }, async () => {
//             if (isOnline) {
//               await this.getStationDetails();
//               await this.datasetDownload();
//             } else {
//               console.log('admin offline\ngot station_comp_info offline data')
//             }
//           })
//           // this.datasetDownload()
//         })
//         .catch((error) => {
//           console.log('err', error)
//         })
//     } catch (error) {
//       console.log("error", error)
//     }
//   }



//   // datasetDownload = () => {
//   //     console.log('315', 'hello ....')
//   //     const startTime = new Date().getTime();
//   //      const timeout = setInterval(() => { 
//   //         urlSocket.post('/download_filterData',
//   //         { mode: 'no-cors' })
//   //         .then((response) => {
//   //             let data = response.data
//   //             console.log('detailes322', data)
//   //             let status = data.status
//   //             if(status === 'dataset downloaded'){   
//   //                    let datasetList = data.datasetList                       
//   //                    this.datacomplete(datasetList)
//   //             }
//   //             else if (status === 'invalid data'){
//   //                 let datasetList = data.datasetList
//   //                 clearTimeout(timeout)
//   //                 this.datacomplete(datasetList)
//   //             }
//   //             else {
//   //                 this.setState({error_loading: true})
//   //                 this.datacomplete(datasetList)
//   //             }              
//   //         })
//   //         .catch((error) => {
//   //             console.log('err', error)
//   //         })   
//   //       }, 2000)

//   //       const progressInterval = setInterval(() => {
//   //         const currentTime = new Date().getTime();
//   //         const elapsedTime = currentTime - startTime;
//   //         const totalTime = 2000; // Total time of the download request (ms)
//   //         let progress = Math.min((elapsedTime / totalTime) * 100, 100); // Cap progress at 100%
//   //         if (progress >= 100) {
//   //             progress = 100;
//   //             clearInterval(progressInterval); // Stop the progress function
//   //         }
//   //         console.log('progress224', progress)
//   //         // this.setState({ downloadProgress: progress });
//   //     }, 100);;
//   // }





//   datacomplete = (data) => {
//     let station_id = this.state.stationList[0]._id
//     try {
//       urlSocket.post('/conf_filterData', { 'data': data, 'station_id': station_id },
//         { mode: 'no-cors' })
//         .then((response) => {
//           let data = response.data
//           console.log('data257 ', data)
//           this.setState({ componentList: data, search_componentList: data, dataloaded: true })
//           // this.datasetDownload()
//         })
//         .catch((error) => {
//           console.log('err', error)
//         })
//     } catch (error) {
//       console.log("error", error)
//     }
//   }

//   active_filterData = async (data) => {
//     // console.log('data270', data)
//     let station_id = data[0]._id
//     try {
//       const response = await urlSocket.post('/active_filterData', { 'station_id': station_id }, { mode: 'no-cors' });
//       let data = response.data;
//       console.log('/active_filterData', data)
//       this.configuration(data, true)
//       // this.setState({ componentList: data, dataloaded: true })
//     } catch (error) {
//       console.log("----", error)
//     } finally {
//       this.setState({ IsSynching: false })
//     }
//   }

//   sync_stn_comp_info = () => {
//     try {
//       urlSocket.post('/sync_stn_comp_info',
//         { mode: 'no-cors' })
//         .then((response) => {
//           let data = response.data
//           console.log('detailes97', data)
//         })
//         .catch((error) => {
//           console.log(error)
//         })
//     } catch (error) {
//       console.log("----", error)
//     }
//   }

//   // sync_network_test = async () => {
//   //     try {
//   //         urlSocket.post('/test_api',
//   //             { mode: 'no-cors' })
//   //             .then((response) => {
//   //                 let datas = response.data
//   //                 console.log('detailes88', datas)
//   //                 if (datas === 'ok') {
//   //                     this.sync_stn_comp_info()
//   //                 }
//   //                 else {
//   //                     console.log('first', 'first')
//   //                     this.comp_list()
//   //                 }
//   //             })
//   //             .catch((error) => {
//   //                 console.log(error)
//   //                 this.comp_list()
//   //             })
//   //     } catch (error) {
//   //         console.log("----", error)
//   //     }
//   // }



//   // ************** craete the batch id *********** //

//   testingComp = async (datas) => {
//     this.setState({ is_loading_models: true });
//     // Ensure datasets is always an array
//     if (!Array.isArray(datas.datasets)) {
//       datas.datasets = [];
//     }

//     // Validate barcode checking type if qrbar_check is true
//     if (datas.qrbar_check && !datas.qrbar_check_type) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Barcode Checking Type Required',
//         confirmButtonText: 'OK',
//       });
//       return;
//     }

//     const { comp_name, comp_code, _id } = datas;

//     try {
//       const response = await urlSocket.post(
//         '/create_batch',
//         { comp_name, comp_code, comp_id: _id },
//         { mode: 'no-cors' }
//       );

//       const batch_id = response.data;
//       console.log('batch_id', batch_id);
//       this.setState({ batch_id, component_code: comp_code, component_name: comp_name, _id });

//       const station = this.state.stationList?.[0] || {};

//       // Construct data to store in sessionStorage
//       const compData = {
//         component_name: comp_name,
//         component_code: comp_code,
//         positive: datas.positive,
//         negative: datas.negative,
//         posble_match: datas.posble_match,
//         datasets: datas.datasets,
//         inspection_type: datas.inspection_type,
//         timer: datas.timer,
//         qr_checking: datas.qr_checking,
//         qruniq_checking: datas.qruniq_checking,
//         detect_selection: datas.detect_selection,
//         detection_type: datas.detection_type,
//         background: datas.background,
//         zoom_value: datas.zoom_value,
//         qrbar_check: datas.qrbar_check,
//         qrbar_check_type: datas.qrbar_check_type,
//         _id,
//         batch_id,
//         station_id: station._id,
//         station_name: station.station_name,
//       };

//       if ('qrOrBar_code' in datas) {
//         compData.qrOrBar_code = datas.qrOrBar_code;
//       }

//       if (datas.detection_type === 'Smart Object Locator') {
//         compData.selected_regions = datas.selected_regions || [];
//         compData.rectangles = datas.rectangles || [];
//       }

//       console.log('compData:', compData);

//       // Store component data in session storage
//       sessionStorage.setItem('compData', JSON.stringify(compData));
//       sessionStorage.setItem('componentData', JSON.stringify(this.state.componentList));

//       this.props.history.push('/inspect');
//     } catch (error) {
//       console.error('Error in create_batch:', error);
//     } finally {
//       this.setState({ is_loading_models: false });
//     }
//   };
//   // testingComp = (datas) => {
//   //     console.log('data325 ', datas, typeof datas, Object.keys(datas).length)
//   //     let conf_list = this.state.label_list;

//   //     console.log('data371 ', datas, datas.qrbar_check, datas.qrbar_check_type);

//   //     if (datas.datasets === undefined) {
//   //         datas.datasets = []
//   //     }
//   //     if (datas.qrbar_check === true && 
//   //         (datas.qrbar_check_type === undefined || datas.qrbar_check_type === null || datas.qrbar_check_type === "")) {
//   //         // if(datas.qrbar_check_type === undefined || datas.qrbar_check_type === null) {
//   //             Swal.fire({
//   //                 icon: 'warning',
//   //                 title: 'Barcode Checking Type Required',
//   //                 confirmButtonText: 'OK',
//   //             });
//   //         // }
//   //     } else {
//   //         // console.log(`datas`, datas)
//   //         let { comp_name, comp_code, _id } = datas
//   //         try {
//   //             // console.log('datas109', datas)
//   //             urlSocket.post('/create_batch', { 'comp_name': comp_name, 'comp_code': comp_code, 'comp_id': _id },
//   //                 { mode: 'no-cors' })
//   //                 .then((response) => {
//   //                     let data = response.data
//   //                     // console.log("batch_id", data)
//   //                     this.setState({ batch_id: data })
//   //                     let datass = {
//   //                         component_name: comp_name,
//   //                         component_code: comp_code,
//   //                         positive: datas.positive,
//   //                         negative: datas.negative,
//   //                         posble_match: datas.posble_match,
//   //                         datasets: datas.datasets,
//   //                         inspection_type: datas.inspection_type,
//   //                         timer: datas.timer,
//   //                         qr_checking: datas.qr_checking,
//   //                         qruniq_checking: datas.qruniq_checking,
//   //                         detect_selection: datas.detect_selection,
//   //                         detection_type: datas.detection_type,
//   //                         background: datas.background,

//   //                         zoom_value: datas.zoom_value,

//   //                         qrbar_check: datas.qrbar_check,
//   //                         qrbar_check_type: datas.qrbar_check_type,
//   //                         _id,
//   //                         batch_id: this.state.batch_id,
//   //                         station_id: this.state.stationList[0]._id,
//   //                         station_name: this.state.stationList[0].station_name
//   //                     }

//   //                     if ('qrOrBar_code' in datas) {
//   //                         datass.qrOrBar_code = datas.qrOrBar_code
//   //                     }

//   //                     // console.log('datass:::', datass)
//   //                     sessionStorage.removeItem("compData")
//   //                     sessionStorage.setItem("compData", JSON.stringify(datass));

//   //                     console.log('componentData index ', this.state.componentList);
//   //                     sessionStorage.removeItem('componentData');
//   //                     sessionStorage.setItem('componentData', JSON.stringify(this.state.componentList));
//   //                     // sessionStorage.removeItem('showSidebar')
//   //                     // sessionStorage.setItem('showSidebar', true)
//   //                     console.log('sessionStorage.showSidebar >>> ', sessionStorage.showSidebar)
//   //                     this.props.history.push("/inspect")
//   //                 })
//   //                 .catch((error) => {
//   //                     console.log(error)
//   //                 })
//   //         } catch (error) {
//   //         }
//   //         // if(this.state.batch_id !== "" && this.state.batch_id !==undefined){
//   //         // }  
//   //         this.setState({ component_code: comp_code, component_name: comp_name, _id });
//   //     }
//   // }

//   selectManual_auto = (e, data, value, idx, str) => {
//     console.log('first220', e, data, value, idx, str)
//     let compList = [...this.state.componentList]
//     if (str === '1') {
//       compList[idx].radio_checked = e.target.checked
//       compList[idx].inspection_type = value
//       this.setState({ componentList: compList, search_componentList: compList, })
//       try {
//         let station_id = this.state.stationList[0]._id
//         // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
//         urlSocket.post('/manual_auto', { 'comp_id': data._id, 'station_id': station_id, 'inspection_type': compList[idx].inspection_type },
//           { mode: 'no-cors' })
//           .then((response) => {
//             let data = response.data
//             console.log('inspection_type', data)
//             // this.sync_network_test()
//           })
//           .catch((error) => {
//             console.log(error)
//           })
//       } catch (error) {
//         console.log("----", error)
//       }
//     }
//     console.log('first226', this.state.componentList)
//   }


//   detectionMethod = (e, data, value, idx, str) => {
//     console.log('first220', e, data, value, idx, str)
//     let compList = [...this.state.componentList]
//     if (str === '1') {
//       compList[idx].detect_selection = e.target.checked
//       compList[idx].detection_type = value
//       this.setState({ componentList: compList, search_componentList: compList, })
//       try {
//         let station_id = this.state.stationList[0]._id
//         // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
//         urlSocket.post('/detectioMethod', { 'comp_id': data._id, 'station_id': station_id, 'detection_type': compList[idx].detection_type },
//           { mode: 'no-cors' })
//           .then((response) => {
//             let data = response.data
//             console.log('inspection_type', data)
//             // this.sync_network_test()
//           })
//           .catch((error) => {
//             console.log(error)
//           })
//       } catch (error) {
//         console.log("----", error)
//       }
//     }
//     console.log('first226', this.state.componentList)
//   }

//   countdown = (e, data, idx, str) => {
//     console.log('first232', e, idx, str)
//     let compList = [...this.state.componentList]
//     let station_id = this.state.stationList[0]._id
//     if (str === '2') {
//       compList[idx].timer = Number(e)
//       this.setState({ componentList: compList, search_componentList: compList, })
//       try {
//         urlSocket.post('/timer', { 'comp_id': data._id, 'station_id': station_id, 'timer': compList[idx].timer },
//           { mode: 'no-cors' })
//           .then((response) => {
//             let data = response.data
//             console.log('config', data)
//             //this.setState({timer:data[0].countdown})
//             // this.setState({ config_data: data })
//             // window.location.reload(false);  
//             // this.sync_network_test()
//           })
//           .catch((error) => {
//             console.log(error)
//           })
//       } catch (error) {
//         console.log("----", error)
//       }
//     }
//     console.log('first238', this.state.componentList)
//   }

//   qr_checking = (e, data, idx, str) => {
//     console.log('242', e, idx, str)
//     let compList = [...this.state.componentList]
//     let station_id = this.state.stationList[0]._id
//     if (str === '1') {
//       compList[idx].qr_checking = e.target.checked
//       if (compList[idx].qr_checking === false) {
//         compList[idx].qruniq_checking = false
//         compList[idx].qr_checking = e.target.checked
//       }
//       this.setState({ componentList: compList, search_componentList: compList, })

//       try {
//         urlSocket.post('/qr_check', { 'comp_id': data._id, 'station_id': station_id, 'qr_checking': compList[idx].qr_checking, 'qruniq_checking': compList[idx].qruniq_checking },
//           { mode: 'no-cors' })
//           .then((response) => {
//             let data = response.data
//             console.log('config', data)
//             //this.setState({timer:data[0].countdown})
//             // this.setState({ config_data: data })
//             // window.location.reload(false);     
//             // this.sync_network_test()
//           })
//           .catch((error) => {
//             console.log(error)
//           })
//       } catch (error) {
//         console.log("----", error)
//       }
//     }
//     console.log('first238', this.state.componentList)
//   }

//   objDetectSelect = (e, data, idx, str) => {
//     let compList = [...this.state.componentList]
//     let station_id = this.state.stationList[0]._id
//     if (str === '1') {
//       compList[idx].detect_selection = e.target.checked;
//       this.setState({ componentList: compList, search_componentList: compList, })
//     }
//     console.log('first238', this.state.componentList);
//   }

//   handleObjDetectType = (e, data, index) => {
//     const selectedOption = e.target.value;
//     console.log('data803 ', e, data, index);

//     let compList = [...this.state.componentList]
//     compList[index].detection_type = e.target.value; // Convert value to integer
//     this.setState({ componentList: compList })
//   }

//   qrbar_check = (e, data, idx, str) => {
//     console.log('242', e, idx, str)
//     let compList = [...this.state.componentList]
//     let station_id = this.state.stationList[0]._id
//     if (str === '1') {
//       compList[idx].qrbar_check = e.target.checked
//       // if (compList[idx].qr_checking === false) {
//       //     compList[idx].qruniq_checking = false
//       //     compList[idx].qr_checking = e.target.checked
//       // }
//       this.setState({ componentList: compList, search_componentList: compList, })

//       // try {
//       //     urlSocket.post('/qr_check', { 'comp_id': data._id, 'station_id': station_id, 'qr_checking': compList[idx].qr_checking, 'qruniq_checking': compList[idx].qruniq_checking },
//       //         { mode: 'no-cors' })
//       //         .then((response) => {
//       //             let data = response.data
//       //             console.log('config', data)
//       //             //this.setState({timer:data[0].countdown})
//       //             // this.setState({ config_data: data })
//       //             // window.location.reload(false);     
//       //             // this.sync_network_test()
//       //         })
//       //         .catch((error) => {
//       //             console.log(error)
//       //         })
//       // } catch (error) {
//       //     console.log("----", error)
//       // }
//     }
//     console.log('first238', this.state.componentList)
//   }

//   qr_uniq_checking = (e, data, idx, str) => {
//     console.log('242', e, idx, str)
//     let compList = [...this.state.componentList]
//     let station_id = this.state.stationList[0]._id
//     if (str === '1') {
//       compList[idx].qruniq_checking = e.target.checked
//       if (compList[idx].qr_checking === false || compList[idx].qr_checking === undefined) {
//         compList[idx].qr_checking = true
//         compList[idx].qruniq_checking = e.target.checked
//       }
//       this.setState({ componentList: compList, search_componentList: compList, })

//       try {
//         urlSocket.post('/qruniq_check', { 'comp_id': data._id, 'station_id': station_id, 'qr_checking': compList[idx].qr_checking, 'qruniq_checking': compList[idx].qruniq_checking },
//           { mode: 'no-cors' })
//           .then((response) => {
//             let data = response.data
//             console.log('config', data)
//             //this.setState({timer:data[0].countdown})
//             // this.setState({ config_data: data })
//             // window.location.reload(false);    
//             // this.sync_network_test()
//           })
//           .catch((error) => {
//             console.log(error)
//           })
//       } catch (error) {
//         console.log("----", error)
//       }
//     }
//     console.log('first238', this.state.componentList)
//   }


//   // ************** get image data url ********* //
//   getImage = (data1) => {
//     console.log('getImage data1', data1);
//     if (data1 !== undefined) {
//       let baseurl = img_url
//       let data2 = data1.filter((data) => {
//         return data.type === 'ok'
//       })


//       // let output = ""
//       if (data2.length > 0) {
//         let replace = data2[0].image_path.replaceAll("\\", "/");
//         let result = replace
//         let output = baseurl + result
//         // console.log('data539', output)
//         return output
//       }
//     }
//     else {
//       return null
//     }
//   }

//   //    ***************** log for component **************//

//   logComp = (data) => {
//     // console.log('data144', data)
//     // console.log('first', data)
//     if (data.datasets === undefined) {
//       data.datasets = []
//     }
//     let { comp_name, comp_code, _id } = data

//     let datas = {
//       component_name: comp_name,
//       component_code: comp_code,
//       datasets: data.datasets,
//       status: data.status,
//       positive: data.positive,
//       negative: data.negative,
//       posble_match: data.posble_match,
//       _id,
//       station_id: this.state.stationList[0]._id,
//       station_name: this.state.stationList[0].station_name
//     }
//     // console.log('datas', datas)
//     sessionStorage.removeItem("compData")
//     sessionStorage.setItem("compData", JSON.stringify(datas))

//     this.setState({ component_code: comp_code, component_name: comp_name, _id })
//   }

//   onSearch = (search) => {
//     console.log('e607', search)
//     // clearTimeout(this.state.timeout)
//     this.setState({ search, SearchField: search, currentPage_stock: 1 })
//     setTimeout(() => {
//       this.dataListProcess()
//     }, 100);
//   }

//   dataListProcess = () => {
//     try {
//       let { search_componentList, search, sorting, currentPage_stock, items_per_page_stock } = this.state
//       // console.log('serach_componentList', search_componentList, search, sorting)

//       if (search) {
//         search_componentList = search_componentList.filter(d =>
//           d.comp_name.toUpperCase().includes(search.toUpperCase()) ||
//           d.comp_code.toUpperCase().includes(search.toUpperCase())
//         )
//         //   console.log('serach_componentList123', search_componentList)
//       }
//       if (sorting.field) {
//         const reversed = sorting.order === "asc" ? 1 : -1
//         search_componentList = search_componentList.sort((a, b) => reversed * a[sorting.field].localeCompare(b[sorting.field]))
//       }
//       let d = search_componentList.slice((currentPage_stock - 1) * items_per_page_stock, (currentPage_stock - 1) * items_per_page_stock + items_per_page_stock)
//       this.setState({ componentList: d, totalItems_stock: search_componentList.length, dataloaded: true })
//       // console.log('this.state.', this.state.componentList, this.state.totalItems_stock)
//     } catch (error) {
//     }
//   }

//   openDetectionModal = (rowData, index) => {
//     console.log('this.state.componentList757', this.state.componentList)
//     this.setState({
//       modalVisible: true,
//       currentDataIndex: index,
//       modalDetectionType: rowData.detection_type || 'ML',
//       modalSelectedRegions: rowData?.selected_regions || [],
//       showValidationMsg: false
//     });

//     // You can use `rectangles` here if needed later in state or logic
//   };
//   handleModalConfirm = () => {
//     const {
//       modalDetectionType,
//       modalSelectedRegions,
//       currentDataIndex,
//       componentList,
//     } = this.state;


//     if (modalDetectionType === 'Smart Object Locator' && modalSelectedRegions.length === 0) {
//       this.setState({ showValidationMsg: true });
//       return;
//     }

//     const updated = [...componentList];
//     console.log("users", updated)
//     updated[currentDataIndex].detection_type = modalDetectionType;
//     updated[currentDataIndex].selected_regions =
//       modalDetectionType === 'Smart Object Locator' ? modalSelectedRegions : [];

//     this.setState({
//       componentList: updated,
//       modalVisible: false,
//       currentDataIndex: null,
//       modalDetectionType: null,
//       modalSelectedRegions: [],
//       showValidationMsg: false,
//     });
//   };

//   // datasetDownload = async () => { old one properly wokring
//   //     // console.log('315', 'hello ....');
//   //     // this.progress();
//   //     const startTime = new Date().getTime();
//   //     const intervalId = setInterval(async () => {
//   //         try {
//   //             const response = await urlSocket.post('/download_filterData', { mode: 'no-cors' });
//   //             let data = response.data;
//   //             console.log('details322', data);
//   //             let status = data.status;

//   //             if (status === 'dataset downloaded') {
//   //                 let datasetList = data.datasetList;
//   //                 this.datacomplete(datasetList);
//   //                 // clearInterval(intervalId); 
//   //             } else if (status === 'invalid data') {
//   //                 let datasetList = data.datasetList;
//   //                 this.datacomplete(datasetList);
//   //                 clearInterval(intervalId); // Stop interval if invalid data is received
//   //             } else {
//   //                 this.setState({error_loading: true})
//   //                 this.datacomplete(datasetList)
//   //             }
//   //         } catch (error) {
//   //             console.log('err', error);
//   //             clearInterval(intervalId); // Stop interval on error
//   //         }
//   //     }, 2000);
//   // }

//   // progress =()=>{ //old one
//   //     const timeout = setInterval(() => { 
//   //         urlSocket.post('/download_progress',
//   //         { mode: 'no-cors' })
//   //         .then((response) => {
//   //             let data = response.data
//   //             console.log('detailes261', data)
//   //             let length = data.length - 1
//   //             data.map((info, index) => {
//   //                 console.log('info265', info.download_sts)
//   //                 if (info.download_sts === undefined) {
//   //                     this.setState({ progress: 0 })
//   //                 }
//   //                 else {
//   //                     this.setState({ progress[index]: info.download_sts })
//   //                 }
//   //             })
//   //             if (data[length].download_sts === 100) {
//   //                 clearTimeout(timeout)
//   //                 this.setState({ progress: 0 });
//   //             }
//   //         })
//   //         .catch((error) => {
//   //             console.log('err', error)
//   //         })   
//   //       }, 2000)
//   // }

//   // progress = () => {  // new one
//   //     const timeout1 = setInterval(() => { 
//   //         urlSocket.post('/download_progress', { mode: 'no-cors' })
//   //             .then((response) => {
//   //                 let data = response.data;
//   //                 console.log('details261', data);
//   //                 let length = data.length;
//   //                 let updatedProgress = [...this.state.progress];

//   //                 data.forEach((info, index) => {
//   //                     console.log('info265', info.download_sts);
//   //                     if (info.download_sts === undefined) {
//   //                         updatedProgress[index] = 0;
//   //                     } else {
//   //                         updatedProgress[index] = info.download_sts;
//   //                     }
//   //                 });

//   //                 this.setState({ progress: updatedProgress });

//   //                 // Check if all downloads are complete
//   //                 if (data.every(info => info.download_sts === 100)) {
//   //                     clearTimeout(timeout1);
//   //                 }
//   //             })
//   //             .catch((error) => {
//   //                 console.log('err', error);
//   //             });   
//   //     }, 2000);
//   // }

//   datasetDownload = async () => {
//     // console.log('315', 'hello ....');
//     this.progress();
//     const startTime = new Date().getTime();
//     try {
//       const response = await urlSocket.post('/download_filterData', { mode: 'no-cors' });
//       let data = response.data;
//       console.log('details322', data);
//       let status = data.status;

//       if (status === 'dataset downloaded') {
//         let datasetList = data.datasetList;
//         this.datacomplete(datasetList);
//         // clearInterval(intervalId); 
//       } else if (status === 'invalid data') {
//         let datasetList = data.datasetList;
//         this.datacomplete(datasetList);
//       } else {
//         this.setState({ error_loading: true })
//         this.datacomplete(datasetList)
//       }
//     } catch (error) {
//       console.log('err', error);
//     }

//   }




//   progress = () => {
//     const timeout1 = setInterval(() => {
//       urlSocket.post('/download_progress', { mode: 'no-cors' })
//         .then((response) => {
//           let data = response.data;
//           console.log('details261', data);
//           let updatedProgress = [...this.state.progress];
//           let anyDownloadCompleted = false;
//           data.forEach((info, index) => {
//             console.log('info265', info.download_sts);
//             if (info.download_sts === undefined) {
//               updatedProgress[index] = 0;
//             } else {
//               updatedProgress[index] = info.download_sts;
//               this.setState({ progress: updatedProgress });
//             }
//             if (info.download_sts === 100 && !anyDownloadCompleted) {
//               anyDownloadCompleted = true;
//             }
//           });
//           // Check if all downloads are complete
//           if (updatedProgress.every(percent => percent === 100)) {
//             clearInterval(timeout1);
//             this.setState({ progress: [] }) // Changed clearTimeout to clearInterval
//           }
//         })
//         .catch((error) => {
//           console.log('err', error);
//         });
//     }, 5000);
//   }

//   handleQRBarcodeCheckType = (e, data, index) => {
//     const selectedOption = e.target.value;
//     console.log('data803 ', e, data, index);

//     let compList = [...this.state.componentList]
//     compList[index].qrbar_check_type = parseInt(e.target.value); // Convert value to integer
//     this.setState({ componentList: compList })
//   }


//   barcode_printAvl = (e, data, idx, str) => {
//     console.log('print_Sts 854', e, idx, str)
//     let compList = [...this.state.componentList]
//     let station_id = this.state.stationList[0]._id
//     compList[idx].barcode_print = e.target.checked
//     if (compList[idx].barcode_print === false || compList[idx].barcode_print === undefined) {
//       compList[idx].barcode_print = true
//       compList[idx].barcode_print = e.target.checked
//     }
//     this.setState({ componentList: compList, search_componentList: compList, })


//     //     try {
//     //         urlSocket.post('/qruniq_check', { 'comp_id': data._id, 'station_id': station_id, 'qr_checking': compList[idx].qr_checking, 'qruniq_checking': compList[idx].qruniq_checking },
//     //             { mode: 'no-cors' })
//     //             .then((response) => {
//     //                 let data = response.data
//     //                 console.log('config', data)
//     //                 //this.setState({timer:data[0].countdown})
//     //                 // this.setState({ config_data: data })
//     //                 // window.location.reload(false);    
//     //                 // this.sync_network_test()
//     //             })
//     //             .catch((error) => {
//     //                 console.log(error)
//     //             })
//     //     } catch (error) {
//     //         console.log("----", error)
//     //     }
//     // }
//     console.log('first238', this.state.componentList)
//   }

//   render() {
//     if (this.state.dataloaded) {
//       return (
//         <React.Fragment>
//           {
//             this.state.is_loading_models ?
//               <FullScreenLoader />
//               : null
//           }
//           <div className="page-content">
//             <MetaTags>
//               <title>Component Information</title>
//             </MetaTags>
//             <Breadcrumbs title="COMPONENT INFORMATION" />
//             <Container fluid>
//               <Card>
//                 <CardBody>
//                   <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
//                     {/* Search Field */}
//                     <Col xs="12" lg="auto" className="text-center">
//                       <div className="search-box">
//                         <div className="position-relative">
//                           <Input
//                             onChange={(e) => this.onSearch(e.target.value)}
//                             id="search-user"
//                             type="text"
//                             className="form-control"
//                             placeholder="Search name or code..."
//                             value={this.state.SearchField}
//                           />
//                           <i className="bx bx-search-alt search-icon" />
//                         </div>
//                       </div>
//                     </Col>

//                     <Col xs="12" lg="auto" className="text-center">
//                       <Button className="w-lg btn btn-sm" color='primary'
//                         onClick={() => this.test_filterData(this.state.stationList)}
//                         disabled={this.state.IsSynching}
//                       >
//                         {this.state.IsSynching ?
//                           <div className="d-flex align-items-center"><Spinner size="sm" className="me-2" /> Syncing Component</div>
//                           :
//                           <>Component Sync</>}

//                       </Button>
//                     </Col>
//                   </Row>
//                   {
//                     this.state.componentList.length === 0 ?
//                       <div className="container" style={{ position: 'relative', height: '20vh' }}>
//                         <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} >
//                           <h5 className="text-secondary">No Records Found</h5>
//                         </div>
//                       </div>
//                       :
//                       <div className="table-responsive">
//                         <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
//                           <thead className="table-light">
//                             <tr>
//                               <th>S. No.</th>
//                               <th>Name</th>
//                               <th>Code</th>
//                               <th>Images</th>
//                               <th>Profile Name</th>
//                               <th>Inspection Mode</th>
//                               <th>Detection Method</th>
//                               {/* <th>Barcode Check</th> */}
//                               {/* <th>Barcode Print</th> */}
//                               {/* <th>Qr Check</th>
//                                             <th>Qr Uniqness Check</th> */}
//                               <th>Actions</th>
//                               {/* <th>Log Info</th> */}
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {
//                               this.state.componentList.map((data, index) => (
//                                 <tr key={index}>
//                                   <td style={{ backgroundColor: "white" }}>{index + 1}</td>
//                                   <td style={{ backgroundColor: "white" }}>{data.comp_name}</td>
//                                   <td style={{ backgroundColor: "white" }}>{data.comp_code}</td>
//                                   <td style={{ backgroundColor: "white" }}>
//                                     {
//                                       data.image_sync === 0 ?
//                                         <div>
//                                           <Space wrap size="middle">
//                                             <Progress size="small" type="circle" percent={this.state.progress[index] !== undefined ? this.state.progress[index] : 0} format={(percent) => `${percent}% Done`} />
//                                           </Space>
//                                         </div>
//                                         :
//                                         <Row>
//                                           {
//                                             <Image
//                                               style={{ borderRadius: '8px' }}
//                                               width={100}
//                                               src={data.datasets === undefined ? "" : data.datasets.length !== 0 ? this.getImage(data.datasets) : ""}
//                                             />
//                                             // <img src={this.getImage(data.datasets)} style={{ width: 100, height: 'auto' }} />
//                                             // <img src="https://vinusimages.co/wp-content/uploads/2018/10/EG7A2390.jpgA_.jpg" style={{ width: 100, height: 'auto' }} />
//                                           }
//                                         </Row>
//                                     }

//                                   </td>
//                                   <td style={{ backgroundColor: "white" }}>{data.profile_name}</td>
//                                   <td style={{ backgroundColor: "white" }}>
//                                     {
//                                       this.state.manual_auto_option.map((data1, idx) => (
//                                         <Radio.Group
//                                           key={idx}
//                                           value={(JSON.parse(data.radio_checked) === true && data.inspection_type === data1) ? true : false || undefined}
//                                           disabled={this.state.disabled}
//                                         >
//                                           <Space >
//                                             <div className='pay_cards'>
//                                               <Radio
//                                                 onChange={(e) => this.selectManual_auto(e, data, data1, index, '1')}
//                                                 value={
//                                                   (JSON.parse(data.radio_checked) === true && data.inspection_type === data1)
//                                                     ? true
//                                                     : false}
//                                                 disabled={this.state.disabled}
//                                               >
//                                                 {data1}
//                                               </Radio>
//                                             </div>
//                                           </Space>
//                                         </Radio.Group>
//                                       ))
//                                     }
//                                     <div>
//                                       {
//                                         data.inspection_type === 'Auto' &&
//                                         <Row>
//                                           <Col sm={5}>
//                                             <label>
//                                               Countdown (in sec):
//                                             </label>
//                                             <div>
//                                               <input
//                                                 className="form-control"
//                                                 type="number"
//                                                 defaultValue={data.timer}
//                                                 id="example-number-input"
//                                                 disabled={this.state.disabled}
//                                                 min="0"//changed by rani
//                                                 onChange={(e) => this.countdown(e.target.value, data, index, '2')}
//                                               />
//                                             </div>
//                                           </Col>
//                                         </Row>
//                                       }
//                                     </div>
//                                   </td>
//                                   {/* detection method */}
//                                   {/* only ML and DL */}
//                                   {/* <td>
//                                                         {
//                                                             this.state.detection_method.map((data1, idx) => (
//                                                                 <Radio.Group 
//                                                                     key={idx} 
//                                                                     value={(JSON.parse(data.detect_selection) === true && data.detection_type === data1) ? true : false || undefined} 
//                                                                     disabled={this.state.disabled}
//                                                                 >                                                                   
//                                                                     <Space >
//                                                                         <div className='pay_cards'>
//                                                                             <Radio 
//                                                                                 onChange={(e) => this.detectionMethod(e, data, data1, index, '1')} 
//                                                                                 value={
//                                                                                     (JSON.parse(data.detect_selection) === true && data.detection_type === data1)
//                                                                                     ? true 
//                                                                                     : false} 
//                                                                                 disabled={this.state.disabled}
//                                                                             >
//                                                                                 {data1}
//                                                                             </Radio>
//                                                                         </div>
//                                                                     </Space>
//                                                                 </Radio.Group>
//                                                             ))
//                                                         }
//                                                     </td> */}
//                                   {/* detect or not with ML and DL */}
//                                   <td style={{ backgroundColor: "white" }}>
//                                     {/* <div className="d-flex justify-content-start align-items-start">
//                                                                             <Checkbox
//                                                                                 checked={data?.detect_selection || false}
//                                                                                 disabled={this.state.disabled}
//                                                                                 onChange={(e) => this.objDetectSelect(e, data, index, '1')}
//                                                                             ></Checkbox>
//                                                                             {
//                                                                                 data?.detect_selection === true &&
//                                                                                 <div className="ms-3">
//                                                                                     <Radio.Group
//                                                                                         onChange={(e) => this.handleObjDetectType(e, data, index)}
//                                                                                         value={data.detection_type} // Assuming selectedOption is a state variable that holds the selected option
//                                                                                         disabled={this.state.disabled}
//                                                                                     >
//                                                                                         {
//                                                                                             this.state.detectionType.map((type, typeId) => (
//                                                                                                 <div key={typeId}>
//                                                                                                     <Radio value={type}>{type}</Radio>
//                                                                                                 </div>
//                                                                                             ))
//                                                                                         }
//                                                                                     </Radio.Group>
//                                                                                 </div>
//                                                                             }

//                                                                         </div> */}
//                                     <div className="align-items-start" style={{ cursor: "pointer", userSelect: 'none' }}>
//                                       <Checkbox
//                                         checked={data?.detect_selection || false}
//                                         disabled={this.state.disabled}
//                                         onChange={(e) => this.objDetectSelect(e, data, index, '1')}
//                                       >
//                                         Enable Object Detection
//                                       </Checkbox>
//                                       {data?.detect_selection && (
//                                         <div style={{ marginTop: 8 }} className='d-flex flex-column'>
//                                           <Label>
//                                             Method: <strong>{data.detection_type || "Not selected"}</strong>
//                                           </Label>
//                                           {data.detection_type === 'Smart Object Locator' && (
//                                             <Label style={{ color: '#555' }}>
//                                               Regions: {data.selected_regions?.length > 0 ? data.selected_regions.join(', ') : 'None'}
//                                             </Label>
//                                           )}
//                                           <span
//                                             onClick={() => this.openDetectionModal(data, index)}
//                                             style={{ marginTop: 4, display: 'inline-block', color: '#007bff', cursor: 'pointer' }}
//                                           >
//                                             ✎ Edit
//                                           </span>
//                                         </div>
//                                       )}
//                                     </div>
//                                   </td>
//                                   {/* barcode check */}
//                                   {/* <td>
//                                                         <Checkbox
//                                                             checked={data?.qrbar_check || false}
//                                                             // disabled={this.state.disabled || data.qrOrBar_code == null || data.qrOrBar_code == undefined}
//                                                             disabled={!data.qrOrBar_code}
//                                                             onChange={(e) => this.qrbar_check(e, data, index, '1')}
//                                                         ></Checkbox>
                                                       
//                                                         {
//                                                             data?.qrbar_check === true &&
//                                                             <div>
//                                                                 <Radio.Group
//                                                                     onChange={(e) => this.handleQRBarcodeCheckType(e, data, index)}
//                                                                     value={data.qrbar_check_type} // Assuming selectedOption is a state variable that holds the selected option
//                                                                     disabled={this.state.disabled}
//                                                                 >
//                                                                     {
//                                                                         Object.entries(this.state.barcode_check_type).map(([key, value]) => (
//                                                                             <div key={key}>
//                                                                                 <Radio value={parseInt(key)}>{value}</Radio>
//                                                                             </div>
//                                                                         ))
//                                                                     }
//                                                                 </Radio.Group>
//                                                             </div>
//                                                         }
//                                                     </td> */}
//                                   {/* <td>
//                                                         <Checkbox
//                                                          checked ={data?.barcode_print || false}
//                                                          onChange={(e) => this.barcode_printAvl(e, data, index, '1')}
//                                                         ></Checkbox>
//                                                     </td> */}
//                                   {/* <td>
//                                                         <Checkbox
//                                                             checked={data?.qr_checking || false}
//                                                             disabled={this.state.disabled}
//                                                             onChange={(e) => this.qr_checking(e, data, index, '1')}
//                                                         ></Checkbox>
//                                                     </td>
//                                                     <td>
//                                                         <Checkbox
//                                                             checked={data?.qruniq_checking || false}
//                                                             disabled={this.state.disabled}
//                                                             onChange={(e) => this.qr_uniq_checking(e, data, index, '1')}
//                                                         ></Checkbox>
//                                                     </td> */}
//                                   <td style={{ backgroundColor: "white" }}>
//                                     {
//                                       data.image_sync !== 0 &&
//                                       <Button className="w-md btn btn-sm" color="primary" id="inspButton" onClick={() => this.testingComp(data)}>Inspect</Button>
//                                     }
//                                   </td>
//                                   {/* <td><Link to="/compLog"><Button onClick={() => this.logComp(data)}>Log</Button></Link></td> */}
//                                   {/* <td> <Link to="/inspect"><Button onClick={() => this.editComp(data)}>Inspect</Button></Link></td> */}
//                                 </tr>
//                               ))
//                             }
//                           </tbody>
//                         </Table>
//                       </div>
//                   }

//                 </CardBody>
//               </Card>
//             </Container>
//             {this.state.modalVisible && (
//               <Modal isOpen={this.state.modalVisible} toggle={() => this.setState({ modalVisible: false })}>
//                 <ModalBody>
//                   <h6 className='fw-bold'>Choose Object Detection Method</h6>
//                   {this.state.detectionType.map((type, i) => (
//                     <FormGroup check key={i}>
//                       <Label check>
//                         <Input
//                           type="radio"
//                           name="detectMethod"
//                           value={type}
//                           checked={this.state.modalDetectionType === type}
//                           onChange={(e) => this.setState({ modalDetectionType: e.target.value })}
//                         />{' '}
//                         {type}
//                       </Label>
//                     </FormGroup>
//                   ))}

//                   {this.state.modalDetectionType === 'Smart Object Locator' && (
//                     <div style={{ marginTop: '1rem' }}>
//                       <div
//                         style={{
//                           backgroundColor: '#f1f1f1',
//                           padding: '12px',
//                           borderRadius: '5px',
//                           border: '1px solid #ccc',
//                           marginBottom: '10px'
//                         }}
//                       >
//                         <p style={{ marginBottom: 4 }}>
//                           This mode automatically locates components even if they are <strong>not in their fixed positions</strong>.
//                           Useful when objects <strong>shift/move inside the test image</strong>.
//                         </p>

//                         <div className='p-2 rounded' style={{ backgroundColor: 'white', border: '1px solid #ccc' }}>
//                           <p><strong>Select regions where movement might happen:</strong></p>
//                           {this.state.componentList?.[this.state.currentDataIndex]?.rectangles?.map((region, idx) => (
//                             <FormGroup check key={idx}>
//                               <Label check>
//                                 <Input
//                                   type="checkbox"
//                                   checked={this.state.modalSelectedRegions.includes(region.name)}
//                                   onChange={(e) => {
//                                     const isChecked = e.target.checked;
//                                     let updated = [...this.state.modalSelectedRegions];
//                                     if (isChecked) {
//                                       updated.push(region.name);
//                                     } else {
//                                       updated = updated.filter(r => r !== region.name);
//                                     }
//                                     this.setState({ modalSelectedRegions: updated, showValidationMsg: false });
//                                   }}
//                                 />{' '}
//                                 {region.name}
//                               </Label>
//                             </FormGroup>
//                           ))}

//                           {this.state.showValidationMsg && (
//                             <div style={{ color: 'red', marginTop: 8 }}>
//                               *Please select at least one region for Smart Object Locator to work.
//                             </div>
//                           )}
//                         </div>
//                         <p style={{ fontStyle: 'italic' }}>
//                           You can uncheck regions where components always stay fixed.
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </ModalBody>

//                 <ModalFooter>
//                   <Button size='sm' color="secondary" onClick={() => this.setState({ modalVisible: false })}>
//                     Cancel
//                   </Button>
//                   <Button size='sm' color="primary" onClick={this.handleModalConfirm}>
//                     Confirm
//                   </Button>
//                 </ModalFooter>
//               </Modal>
//             )}
//           </div>
//         </React.Fragment>
//       );
//     }
//     else {
//       return null
//     }
//   }
// }
// CRUDComponent.propTypes = {
//   history: PropTypes.any.isRequired,
// };
// export default CRUDComponent;