import React, { createContext, useState, useContext } from 'react';
import PropTypes from "prop-types";

// Create the context
export const RegionsContext = createContext();

// Create a provider component to wrap your app
export const RegionsProvider = ({ children }) => {
  const [selectedRegions, setSelectedRegions] = useState([]);
  
  const [selectedMeasurement, setSelectedMeasurement] = useState({});

  const [pointDataexist, setPointDataExist] = useState(false)


  // Update selected regions
  const updateRegions = (regions) => {
    // console.log('regions ', regions)
    setSelectedRegions(regions);
  };

  return (
    <RegionsContext.Provider value={{
      selectedRegions, setSelectedRegions, updateRegions, setSelectedMeasurement, selectedMeasurement,
      pointDataexist, setPointDataExist
    }}>
      {children}
    </RegionsContext.Provider>
  );
};

RegionsProvider.propTypes = {
    children: PropTypes.any.isRequired,  // Validates that `children` is a valid React node
};