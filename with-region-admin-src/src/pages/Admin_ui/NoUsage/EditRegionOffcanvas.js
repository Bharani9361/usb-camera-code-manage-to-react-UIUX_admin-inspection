import React, { useState } from "react";
import { Offcanvas, Button, FormGroup, Label, Input } from "reactstrap";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import PropTypes from "prop-types";

const EditRegionOffcanvas = ({ isOpen, toggle, selectedRegion, regions, updateRegions }) => {
  const [originalRegion, setOriginalRegion] = useState(null);

  // Validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Region Name is required")
      .matches(/^\S*$/, "No whitespace allowed")
      .test("unique-name", "Region Name already exists", (value) => {
        return !regions.some((region, index) => region.name === value && index !== selectedRegion);
      }),
    x0: Yup.number().test(
      "decimal-limit",
      "Max 14 decimals allowed",
      (value) => !value || value.toString().split(".")[1]?.length <= 14
    ),
    x1: Yup.number().test(
      "decimal-limit",
      "Max 14 decimals allowed",
      (value) => !value || value.toString().split(".")[1]?.length <= 14
    ),
    y0: Yup.number().test(
      "decimal-limit",
      "Max 14 decimals allowed",
      (value) => !value || value.toString().split(".")[1]?.length <= 14
    ),
    y1: Yup.number().test(
      "decimal-limit",
      "Max 14 decimals allowed",
      (value) => !value || value.toString().split(".")[1]?.length <= 14
    ),
  });

  const handleReset = (resetForm) => {
    resetForm({ values: originalRegion });
  };

  const handleCancel = () => {
    toggle();
  };

  const handleApply = (values) => {
    const updatedRegions = [...regions];
    updatedRegions[selectedRegion] = values;
    updateRegions(updatedRegions);
    toggle();
  };

  React.useEffect(() => {
    if (selectedRegion !== null) {
      setOriginalRegion({ ...regions[selectedRegion] });
    }
  }, [selectedRegion]);

  return (
    <Offcanvas isOpen={isOpen} toggle={toggle}>
      <div className="p-3">
        <h4>Edit Region</h4>
        {originalRegion && (
          <Formik
            initialValues={originalRegion}
            validationSchema={validationSchema}
            onSubmit={(values) => handleApply(values)}
          >
            {({ errors, touched, resetForm }) => (
              <Form>
                <FormGroup>
                  <Label for="name">Region Name</Label>
                  <Field
                    name="name"
                    as={Input}
                    type="text"
                    invalid={touched.name && !!errors.name}
                  />
                  {touched.name && errors.name && (
                    <div className="text-danger">{errors.name}</div>
                  )}
                </FormGroup>
                {["x0", "x1", "y0", "y1"].map((field) => (
                  <FormGroup key={field}>
                    <Label for={field}>{field.toUpperCase()}</Label>
                    <Field
                      name={field}
                      as={Input}
                      type="number"
                      invalid={touched[field] && !!errors[field]}
                    />
                    {touched[field] && errors[field] && (
                      <div className="text-danger">{errors[field]}</div>
                    )}
                  </FormGroup>
                ))}
                <div className="d-flex justify-content-between mt-3">
                  <Button color="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    color="warning"
                    onClick={() => handleReset(resetForm)}
                  >
                    Reset
                  </Button>
                  <Button type="submit" color="primary">
                    Apply
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </Offcanvas>
  );
};

EditRegionOffcanvas.propTypes = {
  isOpen: PropTypes.any.isRequired, 
  toggle: PropTypes.any.isRequired, 
  selectedRegion: PropTypes.any.isRequired, 
  regions: PropTypes.any.isRequired, 
  updateRegions: PropTypes.any.isRequired
}

export default EditRegionOffcanvas;
