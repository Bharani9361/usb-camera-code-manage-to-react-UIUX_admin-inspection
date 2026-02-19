import React from "react";
import { Select, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import PropTypes from 'prop-types';

const { Option } = Select;
const { Title } = Typography;

const ProductList = ({ products, selectedItems, handleSelect }) => {
  const handleDropdownChange = (value) => {
    if (!selectedItems.includes(value)) {
      handleSelect(value);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <Title level={4}>Select Sensors</Title>
      <Select
        showSearch
        style={{ width: 300 }}
        placeholder="Choose Sensor"
        value="Choose Sensor"
        optionFilterProp="children"
        onChange={handleDropdownChange}
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
        dropdownRender={(menu) => (
          <div>
            {menu}
            {/* <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px",
                borderTop: "1px solid #f0f0f0",
                color: "green",
                fontSize: "12px",
              }}
            >
              <CheckCircleOutlined style={{ marginRight: "8px" }} />
              Selected Sensors: {selectedItems.length}/4
            </div> */}
          </div>
        )}
        // disabled={selectedItems.length >= 4}
      >
        {products
          .filter((product) => !selectedItems.includes(product.id))
          .map((product) => (
            <Option key={product.id} value={product.id}>
              {product.name}
            </Option>
          ))}
      </Select>
    </div>
  );
};

ProductList.propTypes = {
    products: PropTypes.any.isRequired,
    selectedItems: PropTypes.any.isRequired,
    handleSelect: PropTypes.any.isRequired,
}

export default ProductList;
