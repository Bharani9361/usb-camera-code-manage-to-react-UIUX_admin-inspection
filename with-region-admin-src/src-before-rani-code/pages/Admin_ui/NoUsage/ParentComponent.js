import React, { useState } from 'react';
import { Offcanvas, OffcanvasHeader, OffcanvasBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const ParentComponent = () => {
  const [regions, setRegions] = useState([
    { name: 'Region1', x0: 0.0, x1: 1.0, y0: 0.0, y1: 1.0 },
    { name: 'Region2', x0: 1.0, x1: 2.0, y0: 1.0, y1: 2.0 },
  ]);
  const [originalRegion, setOriginalRegion] = useState(null);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const toggleOffcanvas = () => {
    setIsOffcanvasOpen(!isOffcanvasOpen);
  };

  const handleEditClick = (index) => {
    setOriginalRegion({ ...regions[index] });
    setSelectedRegionIndex(index);
    toggleOffcanvas();
  };

  const renderEditRegionOffcanvas = () => {
    const validationSchema = Yup.object({
      name: Yup.string()
        .required('Region name is required')
        .matches(/^\S*$/, 'Whitespace is not allowed')
        .notOneOf(
          regions.map((region) => region.name),
          'Region name must be unique'
        ),
      x0: Yup.number().required('x0 is required').max(99999999, 'x0 is too large').test('max-decimal', 'Max 14 decimal places', (value) => {
        if (value === undefined) return true;
        const decimalPart = value.toString().split('.')[1];
        return decimalPart ? decimalPart.length <= 14 : true;
      }),
      x1: Yup.number().required('x1 is required').max(99999999, 'x1 is too large').test('max-decimal', 'Max 14 decimal places', (value) => {
        if (value === undefined) return true;
        const decimalPart = value.toString().split('.')[1];
        return decimalPart ? decimalPart.length <= 14 : true;
      }),
      y0: Yup.number().required('y0 is required').max(99999999, 'y0 is too large').test('max-decimal', 'Max 14 decimal places', (value) => {
        if (value === undefined) return true;
        const decimalPart = value.toString().split('.')[1];
        return decimalPart ? decimalPart.length <= 14 : true;
      }),
      y1: Yup.number().required('y1 is required').max(99999999, 'y1 is too large').test('max-decimal', 'Max 14 decimal places', (value) => {
        if (value === undefined) return true;
        const decimalPart = value.toString().split('.')[1];
        return decimalPart ? decimalPart.length <= 14 : true;
      }),
    });

    const formik = useFormik({
      initialValues: originalRegion || {},
      validationSchema,
      enableReinitialize: true,
      onSubmit: (values) => {
        const updatedRegions = [...regions];
        updatedRegions[selectedRegionIndex] = values;
        setRegions(updatedRegions);
        setOriginalRegion(null);
        setSelectedRegionIndex(null);
        toggleOffcanvas();
      },
    });

    const handleCancel = () => {
      const updatedRegions = [...regions];
      updatedRegions[selectedRegionIndex] = { ...originalRegion };
      setRegions(updatedRegions);
      setOriginalRegion(null);
      setSelectedRegionIndex(null);
      toggleOffcanvas();
    };

    const handleReset = () => {
      formik.resetForm();
    };

    return (
      <Offcanvas isOpen={isOffcanvasOpen} toggle={toggleOffcanvas} direction="start">
        <OffcanvasHeader toggle={toggleOffcanvas}>Edit Region</OffcanvasHeader>
        <OffcanvasBody>
          <Form onSubmit={formik.handleSubmit}>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formik.values.name || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={formik.touched.name && Boolean(formik.errors.name)}
              />
              {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
            </FormGroup>
            <FormGroup>
              <Label for="x0">x0</Label>
              <Input
                id="x0"
                name="x0"
                type="number"
                value={formik.values.x0 || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={formik.touched.x0 && Boolean(formik.errors.x0)}
              />
              {formik.touched.x0 && formik.errors.x0 && <div className="text-danger">{formik.errors.x0}</div>}
            </FormGroup>
            <FormGroup>
              <Label for="x1">x1</Label>
              <Input
                id="x1"
                name="x1"
                type="number"
                value={formik.values.x1 || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={formik.touched.x1 && Boolean(formik.errors.x1)}
              />
              {formik.touched.x1 && formik.errors.x1 && <div className="text-danger">{formik.errors.x1}</div>}
            </FormGroup>
            <FormGroup>
              <Label for="y0">y0</Label>
              <Input
                id="y0"
                name="y0"
                type="number"
                value={formik.values.y0 || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={formik.touched.y0 && Boolean(formik.errors.y0)}
              />
              {formik.touched.y0 && formik.errors.y0 && <div className="text-danger">{formik.errors.y0}</div>}
            </FormGroup>
            <FormGroup>
              <Label for="y1">y1</Label>
              <Input
                id="y1"
                name="y1"
                type="number"
                value={formik.values.y1 || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={formik.touched.y1 && Boolean(formik.errors.y1)}
              />
              {formik.touched.y1 && formik.errors.y1 && <div className="text-danger">{formik.errors.y1}</div>}
            </FormGroup>
            <div className="d-flex justify-content-end">
              <Button type="button" color="secondary" onClick={handleReset} className="me-2">
                Reset
              </Button>
              <Button type="button" color="danger" onClick={handleCancel} className="me-2">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Apply
              </Button>
            </div>
          </Form>
        </OffcanvasBody>
      </Offcanvas>
    );
  };

  return (
    <div>
      <h3>Regions</h3>
      <ul>
        {regions.map((region, index) => (
          <li key={index}>
            {region.name} ({region.x0}, {region.x1}, {region.y0}, {region.y1})
            <Button color="link" onClick={() => handleEditClick(index)}>
              Edit
            </Button>
          </li>
        ))}
      </ul>
      {renderEditRegionOffcanvas()}
    </div>
  );
};

export default ParentComponent;
