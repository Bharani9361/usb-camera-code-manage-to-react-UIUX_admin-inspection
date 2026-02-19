import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Card, CardBody, Button } from "reactstrap";
import { Image, Popconfirm } from "antd";
import { DeleteTwoTone } from "@ant-design/icons";
import { useHistory } from "react-router-dom";

import AdminTestingOptions from './RegionFunctions/AdminTestingOptions';
import Swal from "sweetalert2";

import { image_url } from "./imageUrl";
import urlSocket from "./urlSocket";

const AdminGallery = ({
  adminGalleryData,
  compCode,
  complist,
  config,
  initvalue
}) => {
  const [allImages, setAllImages] = useState([]);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [showTestingOptions, setShowTestingOptions] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState(null);
  const [testSamples, setTestSamples] = useState(0);


  console.log("allImages", allImages)
  console.log("testSamples", testSamples);
  console.log('compModelVerInfoforadmin', complist)

  const history = useHistory();


  const ImageUrl = image_url;
  useEffect(() => {
    console.log("hiiiiiiiiiiiii")
    const loadTrainingConfig = async () => {
      try {
        const res = await urlSocket.post("/training_config");
        const data = res.data;
        console.log("training config data:", data);

        if (data.status) {
          setTestSamples(Number(data.test_samples));
          setTrainingConfig(data.config);
        }
      } catch (err) {
        console.log("Error:", err);
      }
    };

    loadTrainingConfig();
  }, []);


  useEffect(() => {
    if (adminGalleryData) {
      const formatted = Array.isArray(adminGalleryData)
        ? adminGalleryData
        : Object.values(adminGalleryData).flat();

      setAllImages(formatted);
    }
  }, [adminGalleryData]);

  if (
    !adminGalleryData ||
    (Array.isArray(adminGalleryData) && adminGalleryData.length === 0) ||
    (typeof adminGalleryData === "object" &&
      Object.keys(adminGalleryData).length === 0)
  ) {
    return (
      <h6 className="text-center my-3">No images available in Admin Gallery</h6>
    );
  }


  const showImage = (output_img) => {
    let pathToUse = output_img;

    if (!pathToUse) return "";

    // Remove root prefix
    if (pathToUse.startsWith("Vs_inspection/")) {
      pathToUse = pathToUse.replace(/^Vs_inspection\//, "");
    }

    const encodedPath = encodeURI(pathToUse);
    return `${ImageUrl}${encodedPath}?t=${Date.now()}`;
  };


  const onDeleteImage = async (img) => {
    try {
      await urlSocket.post("/deleteAdminImage", {
        s3_path: img.s3_path,
        filename: img.filename,
        comp_name: img.comp_name,
        stage_name: img.stage_name,
        camera_label: img.camera_label,
        insp_local_path: img.insp_local_path,
      });

      setAllImages((prev) => prev.filter((i) => i.s3_path !== img.s3_path));

      alert("Image deleted successfully");
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };


  const closeAdminTestOptions = () => {
    setShowTestingOptions(false);
  };

  const continueAdminTest = (selected_options) => {
    console.log('selected_options', selected_options)
    setShowTestingOptions(false);

    const data = JSON.parse(JSON.stringify(selectedVersions));
    goToAdminTestingPage(data, selected_options);
  };

  const getSelectedImagesPerCamera = (images, test_samples) => {
    const grouped = {};

    images.forEach(img => {
      if (!grouped[img.camera_label]) grouped[img.camera_label] = [];
      grouped[img.camera_label].push(img);
    });

    let finalImages = [];

    Object.keys(grouped).forEach(camera => {
      const imgs = grouped[camera].slice(0, test_samples);
      finalImages = [...finalImages, ...imgs];
    });

    return finalImages;
  };


  const goToAdminTestingPage = (version_data, options = {}) => {
    console.log('options', options, version_data);
    const versionDataArray = Array.isArray(version_data) ? version_data : [version_data];

    if (versionDataArray[0].result_mode === "ok") {
      Swal.fire({
        title: "This is an OK Model",
        text: "Test only with OK images to get better accuracy",
        icon: "info",
        confirmButtonText: "OK"
      });
    } else if (versionDataArray[0].result_mode === "ng") {
      Swal.fire({
        title: "This is an NG Model",
        text: "Test only with NG images to get better accuracy",
        icon: "warning",
        confirmButtonText: "OK"
      });
    }

    const selectedImages = getSelectedImagesPerCamera(allImages, testSamples);

    let count = initvalue;

    let values = {
      config: config,
      testCompModelVerInfo: versionDataArray,
      batch_no: count++,
      page: 'StageModelCreation',
      allImages: selectedImages
    };

    if (options?.testing_mode?.length > 0) {
      values.overall_testing = false;
      values.region_wise_testing = false;

      if (options.testing_mode.length >= 2) {
        values.option = 'Entire Component with Regions';
        values.overall_testing = true;
        values.region_wise_testing = true;
      } else if (options.testing_mode.includes("component_testing")) {
        values.option = 'Entire Component';
        values.overall_testing = true;
      } else if (options.testing_mode.includes("region_testing")) {
        values.option = 'Regions Only';
        values.region_wise_testing = true;
      }

      if (options?.testing_mode.includes("region_testing")) {
        values.detection_type = options.detection_type;
        values.regions = options.regions;
      }
    }

    console.log('valuevaluess', values);

    sessionStorage.removeItem("modelData");
    localStorage.setItem('modelData', JSON.stringify(values));

    history.push('/StageAdminAccTesting_isnp');
  };









  const startAdminTest_insp = async (data, model) => {
    console.log("startAdminTest", data);

    const test_samples = testSamples;

    console.log("test_samples:", test_samples);

    if (!test_samples || test_samples <= 0) {
      alert("Invalid test_samples value in config!");
      return;
    }

    const details = JSON.parse(sessionStorage.getItem("managestageData"));
    const model_info = details.modelInfo;

    const allowedCameras = complist.map((c) => c.camera.label);

    const filteredImages = allImages.filter((img) =>
      allowedCameras.includes(img.camera_label)
    );

    const camCount = filteredImages.reduce((acc, img) => {
      acc[img.camera_label] = (acc[img.camera_label] || 0) + 1;
      return acc;
    }, {});

    console.log("Camera Wise Image Count:", camCount);

    for (const cam of allowedCameras) {
      const count = camCount[cam] || 0;

      if (count < test_samples) {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Images",
          text: `${cam} requires at least ${test_samples} images. Only ${count} found.`,
        });

        return;
      }
    }

    const ask_testing_type = (Array.isArray(data) ? data : [data]).some((item) =>
      model_info.some((model) => model._id === item.model_id)
    );

    if (ask_testing_type) {
      setSelectedVersions(data);
      setShowTestingOptions(true);
    } else {
      goToAdminTestingPage(data);
    }
  };

  const allowedCameras = complist.map(c => c.camera.label);

  const filtered = allImages.filter(img => allowedCameras.includes(img.camera_label));

  const groupedByCamera = filtered.reduce((acc, img) => {
    const label = img.camera_label || "Unknown Camera";
    if (!acc[label]) acc[label] = [];
    acc[label].push(img);
    return acc;
  }, {});

  console.log("groupedByCamera", groupedByCamera);


  const ImageCard = React.memo(({ img, idx }) => (

    <Col xs={6} sm={2} md={3} lg={2} xl={1} className='mt-2'>

      <Card
        style={{
          borderRadius: "6px",
          marginBottom: "6px",
          boxShadow: "0 0 2px rgba(0,0,0,0.1)",
        }}
      >
        <CardBody
          style={{
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "3px",
            }}
          >
            <Popconfirm
              placement="rightBottom"
              title="Delete this image?"
              onConfirm={() => onDeleteImage(img)}
              okText="Yes"
            >
              <DeleteTwoTone
                twoToneColor="red"
                style={{ fontSize: "14px", cursor: "pointer" }}
              />
            </Popconfirm>
          </div>

          <Image
            src={showImage(img.s3_path)}
            alt={img.filename}
            style={{
              width: "100%",
              borderRadius: "4px",
              objectFit: "cover",
            }}
          />

          <div style={{ fontSize: "10px", marginTop: "4px", color: "#666" }}>
            <div>Filename: {img.filename}</div>
            {img.date && <div>{new Date(img.date).toLocaleString()}</div>}
          </div>
        </CardBody>
      </Card>
    </Col>
  ));
  ImageCard.displayName = "ImageCard";

  ImageCard.propTypes = {
    img: PropTypes.shape({
      s3_path: PropTypes.string.isRequired,
      filename: PropTypes.string.isRequired,
      date: PropTypes.string,
    }).isRequired,
    idx: PropTypes.number.isRequired,
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <Button
          className="btn-success btn-sm"
          onClick={() => startAdminTest_insp(complist)}
        >
          Start Admin Accuracy Test
        </Button>

      </div>



      {
        showTestingOptions ?
          <AdminTestingOptions
            isOpen={showTestingOptions}
            toggle={closeAdminTestOptions}
            onContinue={continueAdminTest}
            rectangles={complist?.rectangles}
            selectedVersiondata={complist}
            page={'AdminGallery'}
          />
          : null
      }

      {/* GALLERY */}
      <Row style={{ marginLeft: "-3px", marginRight: "-3px" }}>
        {Object.keys(groupedByCamera).map((label, index) => (
          <Card
            key={index}
            className="mb-4"
            style={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                padding: "10px 16px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h5
                style={{
                  fontWeight: "600",
                  color: "#374151",
                  margin: 0,
                  fontSize: "17px",
                  textTransform: "capitalize",
                  letterSpacing: "0.3px",
                }}
              >
                {label}
              </h5>
            </div>

            <CardBody style={{ padding: "14px 10px" }}>
              <Row style={{ marginLeft: "-4px", marginRight: "-4px" }}>
                {groupedByCamera[label].map((img, idx) => (
                  <ImageCard key={idx} img={img} idx={idx} />
                ))}
              </Row>
            </CardBody>
          </Card>
        ))}
      </Row>
    </>
  );
};

AdminGallery.propTypes = {
  adminGalleryData: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
    .isRequired,
  versionList: PropTypes.array,
  compName: PropTypes.string,
  compCode: PropTypes.string,
  stageName: PropTypes.string,
  Model_Name: PropTypes.string,
  complist: PropTypes.any,
  config: PropTypes.any,
  initvalue: PropTypes.any,

};

export default AdminGallery;
