import React, { useState } from "react";
import { Layout, Typography } from "antd";
import ProductList from "./ProductList";
import SelectedItems from "../SensorOp/SensorSetup";
import { productsData } from "../SensorOp/data";
import "./ProductSelection.css";

const { Title } = Typography;

const ProductSelection = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelect = (id) => {
    if (!selectedItems.includes(id)) {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleRemove = (id) => {
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
  };

  return (
    <Layout className="app">
      <Layout.Content>
        <SelectedItems
          products={productsData}
        />
        {/* <ProductList
          products={productsData}
          selectedItems={selectedItems}
          handleSelect={handleSelect}
        />
        <SelectedItems
          selectedItems={selectedItems}
          products={productsData}
          handleRemove={handleRemove}
        /> */}
      </Layout.Content>
    </Layout>
  );
};

export default ProductSelection;
