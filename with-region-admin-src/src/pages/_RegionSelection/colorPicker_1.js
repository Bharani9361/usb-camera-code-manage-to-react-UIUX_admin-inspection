import React, { useState } from 'react';
import { Button, InputGroup } from 'reactstrap';
import PropTypes from 'prop-types';

const ColorPicker_1 = ({ selectedColor, setSelectedColor }) => {
    // const [selectedColor, setSelectedColor] = useState('');

    const predefinedColors = ['red', 'green', 'blue', 'yellow', 'orange', 'white', 'black'];
    // const predefinedColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000'];

    const handleColorClick = (color) => {
        setSelectedColor(color);
    };

    const handleCustomColorChange = (event) => {
        setSelectedColor(event.target.value);
    };

    return (
        <div>
            <InputGroup>
                {
                    predefinedColors.map((color, index) => (
                        <Button key={index} 
                            className='mx-1' 
                            style={{
                                backgroundColor: color, 
                                width: '30px', 
                                height: '30px', 
                                borderRadius: '50%',
                                cursor: 'pointer',
                                border: selectedColor === color ? '2px solid black' : '1px solid #ccc',
                            }}
                            onClick={() => handleColorClick(color)}
                        ></Button>
                    ))
                }
            </InputGroup>
            {/* <div style={{ display: 'flex', marginBottom: '10px' }}>
                {predefinedColors.map((color, index) => (
                    <div
                        key={index}
                        onClick={() => handleColorClick(color)}
                        style={{
                            backgroundColor: color,
                            width: '40px',
                            height: '40px',
                            margin: '5px',
                            cursor: 'pointer',
                            border: selectedColor === color ? '2px solid black' : '1px solid #ccc',
                        }}
                    />
                ))}
                <input
                    type="color"
                    onChange={handleCustomColorChange}
                    style={{
                        width: '40px',
                        height: '40px',
                        margin: '5px',
                        cursor: 'pointer',
                        border: selectedColor && !predefinedColors.includes(selectedColor) ? '2px solid black' : '1px solid #ccc',
                    }}
                />
            </div>
            <div>
                Selected Color: <span style={{ color: selectedColor }}>{selectedColor}</span>
            </div> */}
        </div>
    );
};

ColorPicker_1.propTypes = {
    selectedColor: PropTypes.string.isRequired,
    setSelectedColor: PropTypes.func.isRequired,
};


export default ColorPicker_1;
