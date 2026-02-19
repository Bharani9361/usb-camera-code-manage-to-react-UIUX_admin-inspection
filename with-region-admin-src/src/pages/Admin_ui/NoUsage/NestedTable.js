import React from "react";
import "./NestedTable.css"

const NestedTable = () => {
    return (
        <table className="custom-table" border="1">
            <thead>
                <tr>
                    <th rowSpan="2">Column 1</th>
                    <th rowSpan="2">Column 2</th>
                    <th colSpan="3">Nested Columns</th>
                </tr>
                <tr>
                    <th>Nested 1</th>
                    <th>Nested 2</th>
                    <th>Nested 3</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Row 1 Col 1</td>
                    <td>Row 1 Col 2</td>
                    <td>Nested Row 1 Col 1</td>
                    <td>Nested Row 1 Col 2</td>
                    <td>Nested Row 1 Col 3</td>
                </tr>
                <tr>
                    <td>Row 2 Col 1</td>
                    <td>Row 2 Col 2</td>
                    <td>Nested Row 2 Col 1</td>
                    <td>Nested Row 2 Col 2</td>
                    <td>Nested Row 2 Col 3</td>
                </tr>
            </tbody>
        </table>
    );
};

export default NestedTable;
