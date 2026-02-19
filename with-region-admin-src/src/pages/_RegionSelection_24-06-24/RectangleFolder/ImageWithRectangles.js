import React, { Component } from 'react';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';
class ImageWithRectangles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rectangles: [], // To store information about each rectangle
            selectedRectangle: null, // To keep track of which rectangle is currently selected
        };
    }

    handleAddRectangle = () => {
        const { rectangles } = this.state;
        const newRectangle = {
            id: rectangles.length + 1,
            x: 50, // Initial x position
            y: 50, // Initial y position
            width: 100, // Initial width
            height: 80, // Initial height
        };
        this.setState({ rectangles: [...rectangles, newRectangle] });
    };
      

    render() {
        const { rectangles } = this.state;
        const imageUrl = 'https://www.google.com/imgres?q=ultimate%20spiderman&imgurl=https%3A%2F%2Fprod-ripcut-delivery.disney-plus.net%2Fv1%2Fvariant%2Fdisney%2FDD54F7FCA01C567510F4581770B3D5BE411E75D7F9DB88602B9A62725A5A74A5%2Fscale%3Fwidth%3D1200%26aspectRatio%3D1.78%26format%3Dwebp&imgrefurl=https%3A%2F%2Fwww.disneyplus.com%2Fseries%2Fultimate-spider-man%2F59mrvV7yQpAk&docid=B3xpdXafEi4LuM&tbnid=rMknDNuzaZ846M&vet=12ahUKEwidlbvIvfSGAxXPxjgGHTwLBQcQM3oECHEQAA..i&w=1200&h=675&hcb=2&ved=2ahUKEwidlbvIvfSGAxXPxjgGHTwLBQcQM3oECHEQAA'; // Replace with your image URL

        return (
            <div className='page-content'>
                {/* Placeholder for the image and rectangles */}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={imageUrl} alt="Example Image" />
                    {/* Render rectangles here */}
                </div>
                <div>
                    <button onClick={this.handleAddRectangle}>Add Rectangle</button>
                </div>
                {rectangles.map(rectangle => (
                    <ResizableBox
                        key={rectangle.id}
                        width={rectangle.width}
                        height={rectangle.height}
                        style={{
                            position: 'absolute',
                            left: rectangle.x,
                            top: rectangle.y,
                            border: '1px solid #000',
                            background: 'rgba(0,0,0,0.3)',
                        }}
                        onResize={(event, { size }) => {
                            // Update rectangle size
                            const updatedRectangles = rectangles.map(rect => {
                                if (rect.id === rectangle.id) {
                                    return { ...rect, width: size.width, height: size.height };
                                }
                                return rect;
                            });
                            this.setState({ rectangles: updatedRectangles });
                        }}
                    >
                        {/* Content inside resizable box */}
                        <div style={{ width: '100%', height: '100%' }}></div>
                    </ResizableBox>
                ))}
                {/* Additional UI for controls can be added here */}
                <div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={imageUrl} alt="Example Image" style={{ maxWidth: '100%', height: 'auto' }} />
                        {rectangles.map(rectangle => (
                            <Draggable
                                key={rectangle.id}
                                bounds="parent"
                                defaultPosition={{ x: rectangle.x, y: rectangle.y }}
                                onStop={(event, data) => {
                                    // Update rectangle position
                                    const updatedRectangles = rectangles.map(rect => {
                                        if (rect.id === rectangle.id) {
                                            return { ...rect, x: data.x, y: data.y };
                                        }
                                        return rect;
                                    });
                                    this.setState({ rectangles: updatedRectangles });
                                }}
                            >
                                <ResizableBox
                                    width={rectangle.width}
                                    height={rectangle.height}
                                    style={{
                                        position: 'absolute',
                                        border: '1px solid #000',
                                        background: 'rgba(0,0,0,0.3)',
                                    }}
                                    onResize={(event, { size }) => {
                                        // Update rectangle size
                                        const updatedRectangles = rectangles.map(rect => {
                                            if (rect.id === rectangle.id) {
                                                return { ...rect, width: size.width, height: size.height };
                                            }
                                            return rect;
                                        });
                                        this.setState({ rectangles: updatedRectangles });
                                    }}
                                >
                                    {/* Content inside resizable box */}
                                    <div style={{ width: '100%', height: '100%' }}></div>
                                </ResizableBox>
                            </Draggable>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
      
}

export default ImageWithRectangles;
