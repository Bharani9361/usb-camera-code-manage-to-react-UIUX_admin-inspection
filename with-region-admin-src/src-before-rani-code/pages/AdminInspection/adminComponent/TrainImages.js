import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardBody, CardTitle, Col, Row } from 'reactstrap';
import { Checkbox, Image, Popconfirm } from 'antd';
import { DeleteTwoTone } from '@ant-design/icons';
import urlSocket from '../urlSocket';
import Swal from 'sweetalert2';

import { image_url } from '../imageUrl';
let img_url = image_url;

const TrainImages = ({ versionData, setVersionData }) => {
    const [selectedImages, setSelectedImages] = useState([]);
    const [img_paths, setImg_paths] = useState([]);
    console.log('data12 ', versionData);

    const handleCheckboxChange = (item, ver) => {
        const index = selectedImages.indexOf(item);

        if (index === -1) {
            // If not already selected, add to the array
            setSelectedImages([...selectedImages, item]);
            setImg_paths([...img_paths, item.image_path]);
        } else {
            // If already selected, remove from the array
            const updatedSelectedImages = [...selectedImages];
            updatedSelectedImages.splice(index, 1);

            const updatedPaths = [...img_paths];
            updatedPaths.splice(index, 1);
            setSelectedImages(updatedSelectedImages);
            setImg_paths(updatedPaths);
        }
    };

    const deleteImageClick = async (image) => {
        try {
            const response = await urlSocket.post('api1/delete_sift_train_image', {
                'version_id': versionData._id,
                'dataset_image_path': image.image_path
            }, { mode: 'no-cors' });

            setVersionData(response.data);
        } catch (error) {
            console.log('Error Info: ', error);
        }
    }

    const selectAllImages = (items) => {
        const allSelected = selectedImages.length === items.length;
        const updatedSelectedImages = allSelected ? [] : items;

        let std_img_paths = [];
        updatedSelectedImages.map((item, itemId) => {
            std_img_paths.push(item.image_path);
        });

        setSelectedImages(updatedSelectedImages);
        setImg_paths(std_img_paths);
    }

    const handleDeleteSelectedImages = async () => {
        // Check if there are no images selected
        if (img_paths.length === 0) {
            Swal.fire({
                title: 'No items selected',
                icon: 'info',
                timer: 1500,
                showConfirmButton: false,
            });
            return; // Exit the function if no images are selected
        }

        // Show confirmation dialog
        Swal.fire({
            title: `Delete ${img_paths.length} item${img_paths.length > 1 ? 's' : ''}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                // If yes
                imgDeletion()
            } else {
                // User clicked Cancel, do nothing or handle accordingly
            }
        });
    };

    const imgDeletion = async () => {
        // const {
        //     selectedImages, compModelVerInfo,
        //     lable_name, selectedList
        // } = this.state;

        console.log('Deleting selected images:', img_paths);
        try {

            const formData = new FormData();
            formData.append('_id', versionData._id);
            // formData.append('labelName', lable_name);
            formData.append('img_paths', JSON.stringify(img_paths));
            // formData.append('type', this.state.type);
            // formData.append('position', this.state.position);
            const response = await urlSocket.post('api1/delete_selected_train_image', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            });
            console.log('data121 ', response.data);
            setVersionData(response.data.comp_model_ver_info_list[0])

            // this.setState({
            //     response_message: response.data.message,
            //     compModelVerInfo: response.data.comp_model_ver_info_list,
            //     images_length: response.data.img_count
            // });

            // // Refresh the gallery data
            // await this.imgGlry();

            // if (selectedList.length !== 0) {
            //     // Filter groupedData based on selectedList
            //     const { imgGlr: updatedImgGlr } = this.state;
            //     const filteredGroupedData = selectedList.reduce((acc, itemList) => {
            //         const version = itemList.value;
            //         const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
            //         acc[version] = itemsForVersion;
            //         return acc;
            //     }, {});

            //     // Update state with filtered data
            //     this.setState({ groupedData: filteredGroupedData });
            // }

            // setTimeout(() => {
            //     this.setState({ response_message: "" });
            // }, 1000);
        } catch (error) {
            console.log('error', error);
        }

        setSelectedImages([]);
        setImg_paths([]);
        // // Clear selectedImages array after deletion
        // this.setState({ selectedImages: [], img_paths: [] });
    }

    return (
        versionData &&
        <React.Fragment>
            <CardTitle className='my-3'>Sift Train Images</CardTitle>
            {
                versionData && versionData.sift_train_datasets &&
                <div className='d-flex justify-content-between align-items-center'>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                            style={{
                                borderColor: 'slategray',
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderRadius: '7px',
                                height: '20px',
                                width: '20px',
                                marginRight: '5px', // Add margin if needed
                            }}
                            checked={versionData.sift_train_datasets.length && selectedImages.length === versionData.sift_train_datasets.length}
                            onChange={() => {
                                selectAllImages(versionData.sift_train_datasets);
                            }}
                        />
                        <span>Select All</span>
                    </div>
                    <Button color='danger' onClick={() => handleDeleteSelectedImages()}>
                        Delete
                    </Button>
                </div>
            }

            <Row>
                {versionData?.sift_train_datasets?.map((image, index) => (
                    <Col sm={3} md={3} lg={3} key={index}>
                        <Card className='mt-2' style={{ borderRadius: '7px', border: '2px solid green' }}>
                            <div style={{ fontWeight: 'bold', textAlign: 'left', whiteSpace: 'pre' }}>
                                <Checkbox style={{
                                    borderColor: 'slategray',
                                    // borderWidth: '2px', borderStyle: 'solid', borderRadius: '7px', height: '20px', width: '20px'
                                }}
                                    className='ms-1'
                                    checked={selectedImages.includes(image)}
                                    onChange={() => handleCheckboxChange(image, versionData.model_ver)}
                                />
                                {'  '}
                                {index + 1}
                            </div>
                            <CardBody style={{ padding: '7px', borderRadius: '7px' }}>
                                <Image src={`${img_url}${image.image_path}`} alt='Image not there' />
                                <div style={{ textAlign: 'right' }}>
                                    <Popconfirm placement="rightBottom" title="Do you want to delete?"
                                        onConfirm={() => deleteImageClick(image)}
                                        okText="Yes"
                                    >
                                        <DeleteTwoTone twoToneColor="red" style={{ fontSize: '18px', background: 'white', borderRadius: '5px' }} />
                                    </Popconfirm>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                ))
                }

            </Row>
        </React.Fragment>

    )
};

TrainImages.propTypes = {
    versionData: PropTypes.any.isRequired, // Change 'any' to the appropriate type
    setVersionData: PropTypes.any.isRequired, // Change 'any' to the appropriate type
};

export default TrainImages;