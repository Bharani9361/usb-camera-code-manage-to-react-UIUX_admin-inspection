import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, Button } from 'reactstrap';
import { Image, Popconfirm, Spin } from 'antd';
import { ArrowLeftOutlined, DeleteTwoTone } from '@ant-design/icons';
import urlSocket from './urlSocket';
import { image_url } from './imageUrl';
import PropTypes from 'prop-types';

// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

import { useLocation } from 'react-router-dom';

const AcceptanceRatioGallery = props => {
  const { history } = props;

  const location = useLocation();
  const componentList = location.state?.componentList || [];

  console.log('componentListfromprofile', componentList);

  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const ImageUrl = image_url;
  const compname = componentList.current_comp_info.comp_name; // selected component
  console.log('compname', compname);

  useEffect(() => {
    if (componentList.current_comp_info) {
      sessionStorage.setItem(
        'current_comp_info',
        JSON.stringify(componentList.current_comp_info)
      );
    }
    if (componentList.current_profile) {
      sessionStorage.setItem(
        'current_profile',
        JSON.stringify(componentList.current_profile)
      );
    }
  }, [componentList]);

  // const getProfileTestGallery = async () => {
  //   try {
  //     setLoading(true);

  //     const response = await urlSocket.post('/fetchProfileTestGallery');
  //     console.log('Fetched Gallery:', response.data.images);

  //     const formatted = Object.values(response.data.images || {}).flat();

  //     setGalleryData(formatted);
  //   } catch (err) {
  //     console.error('Error loading gallery:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getProfileTestGallery = async () => {
    try {
      setLoading(true);

      const comp =
        componentList[0] || componentList.current_comp_info.comp_name; // selected component

      // const stageName = Object.keys(comp.stage_profiles)[0]; // e.g. POSSIBLE1

      // const selectedCamera = selectedCamLabel;

      const filters = {
        comp_name: compname
        // stage_name: stageName
        // camera_label: selectedCamera
      };

      console.log('Sending filters:', filters);

      const response = await urlSocket.post(
        '/fetchProfileTestGallery',
        filters
      );

      console.log('Filtered Gallery:', response.data.images);

      setGalleryData(response.data.images || []);
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfileTestGallery();
  }, []);

  const showImage = path => {
    if (!path) return '';

    let finalPath = path;

    if (finalPath.startsWith('Vs_inspection/')) {
      finalPath = finalPath.replace('Vs_inspection/', '');
    }

    const encoded = encodeURI(finalPath);
    return `${ImageUrl}${encoded}?t=${Date.now()}`;
  };

  const onDeleteImage = async img => {
    try {
      const response = await urlSocket.post('/deleteProfileTestImage', {
        s3_path: img.s3_path,
        filename: img.filename,
        comp_name: img.comp_name,
        comp_code: img.comp_code,
        stage_name: img.stage_name,
        stage_code: img.stage_code,
        camera_label: img.camera_label,
        insp_local_path: img.insp_local_path
      });

      console.log('response', response);

      if (response.data.message == 'Image deleted successfully') {
        setGalleryData(prev => prev.filter(i => i.s3_path !== img.s3_path));
        // toast.success('Image Deleted Successfully');
      } else {
        // toast.error('Error Deleting Image');
        alert('Image deleted');

      }
    } catch (err) {
      console.error('Delete Error:', err);
      alert('Delete failed');
      // toast.error('Error Deleting Image');
    }
  };

  //   const ImageCardcomp = ({ img }) => (
  //     <Col xs='4' sm='3' md='2' lg='1' style={{ padding: '1px' }}>
  //       <Card
  //         style={{
  //           borderRadius: '6px',
  //           boxShadow: '0 0 3px rgba(0,0,0,0.15)',
  //           width: '120px',
  //           margin: 'auto',
  //           marginTop: '2px'
  //         }}
  //       >
  //         <CardBody
  //           style={{
  //             padding: '4px',
  //             border: '1px solid #ddd',
  //             borderRadius: '6px'
  //           }}
  //         >
  //           <div
  //             style={{
  //               display: 'flex',
  //               justifyContent: 'flex-end',
  //               marginBottom: '3px'
  //             }}
  //           >
  //             <Popconfirm
  //               placement='rightBottom'
  //               title='Delete this image?'
  //               onConfirm={() => onDeleteImage(img)}
  //               okText='Yes'
  //             >
  //               <DeleteTwoTone
  //                 twoToneColor='red'
  //                 style={{ fontSize: '14px', cursor: 'pointer' }}
  //               />
  //             </Popconfirm>
  //           </div>

  //           <Image
  //             src={showImage(img.s3_path)}
  //             alt={img.filename}
  //             style={{
  //               width: '100%',
  //               height: '85px',
  //               objectFit: 'cover',
  //               borderRadius: '4px'
  //             }}
  //           />

  //           <div style={{ fontSize: '9px', marginTop: '3px', color: '#555' }}>
  //             <div>
  //               <b>{img.camera_label}</b>
  //             </div>
  //             <div>{img.filename}</div>
  //           </div>
  //         </CardBody>
  //       </Card>
  //     </Col>
  //   );

  const ImageCardcomp = ({ img }) => (
    <Col xs={6} sm={2} md={3} lg={2} xl={1} className='mb-2'>
      <Card
        style={{
          borderRadius: '6px',
          boxShadow: '0 0 3px rgba(0,0,0,0.15)',
          width: '100%'
        }}
      >
        <CardBody
          style={{
            padding: '4px',
            border: '1px solid #ddd',
            borderRadius: '6px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '3px'
            }}
          >
            <Popconfirm
              placement='rightBottom'
              title='Delete this image?'
              onConfirm={() => onDeleteImage(img)}
              okText='Yes'
            >
              <DeleteTwoTone
                twoToneColor='red'
                style={{ fontSize: '14px', cursor: 'pointer' }}
              />
            </Popconfirm>
          </div>

          <Image
            src={showImage(img.s3_path)}
            alt={img.filename}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />

          <div style={{ fontSize: '9px', marginTop: '3px', color: '#555' }}>
            <div>
              <b>{img.camera_label}</b>
            </div>
            <div>{img.filename}</div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );

  const ImageCard = React.memo(ImageCardcomp);

  ImageCardcomp.propTypes = {
    img: PropTypes.shape({
      s3_path: PropTypes.string,
      insp_local_path: PropTypes.string,
      filename: PropTypes.string,
      camera_label: PropTypes.string,
      comp_name: PropTypes.string,
      stage_name: PropTypes.string
    }).isRequired
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '100px'
        }}
      >
        <button
          color='primary'
          //   className='btn-sm mx-3'
          className='btn btn-outline-primary btn-sm mx-3'
          onClick={() => window.history.back()}
        >
          <i className='mdi mdi-arrow-left'></i> Back
        </button>

        <h3 className='text-primary m-0' style={{ fontFamily: 'sans-serif' }}>
          Acceptance Ratio Gallery
        </h3>

        <Button
          color='success'
          className='btn-sm mx-3'
          onClick={() =>
            history.push(`/stageprofileRatioHandler_Inspection`, {
              galleryData: galleryData
            })
          }
        >
          Upload Images
        </Button>
      </div>
      {/* <Row
        style={{ marginLeft: '-5px', marginRight: '-5px', marginTop: '20px' }}
      > */}
      <div style={{ marginTop: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Spin tip='Loading Images...' size='large' />
          </div>
        ) : galleryData && galleryData.length > 0 ? (
          <Row
            style={{
              marginLeft: '-2px',
              marginRight: '-2px',
              marginTop: '20px'
            }}
          >
            {galleryData.map((img, index) => (
              <ImageCard key={index} img={img} />
            ))}
          </Row>
        ) : (
          <h6 className='text-center my-3'>No images found</h6>
        )}
      </div>
      {/* <ToastContainer
        position='top-right'
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      /> */}
      ;
    </>
  );
};

AcceptanceRatioGallery.propTypes = { history: PropTypes.any.isRequired };

export default AcceptanceRatioGallery;
