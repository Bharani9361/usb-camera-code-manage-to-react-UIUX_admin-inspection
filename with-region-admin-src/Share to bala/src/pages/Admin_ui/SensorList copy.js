import React from "react";
import { Card, List, Button, Row, Col } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PropTypes from 'prop-types';
import { Label } from "reactstrap";

const SensorList = ({ sensors, viewMode, onDelete, onEdit }) => {
    return viewMode === "grid" ? (
      <Row gutter={[16, 16]}>
        {sensors.map((sensor) => (
          <Col key={sensor.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={sensor.name}
              extra={
                <>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => onEdit(sensor)}
                    style={{ marginRight: "8px" }}
                  />
                  <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(sensor.id)} />
                </>
              }
            >
             <span>Model Name: <Label>{sensor.model_name}</Label></span>
             <br/>
             <span>Description: <Label>{sensor.description}</Label></span>
            </Card>
          </Col>
        ))}
      </Row>
    ) : (
      <List
        bordered
        dataSource={sensors}
        renderItem={(sensor) => (
          <List.Item
            key={sensor.id}
            actions={[
              <Button
                key="edit"
                icon={<EditOutlined />}
                onClick={() => onEdit(sensor)}
              />,
              <Button 
                key="delete"
                danger icon={<DeleteOutlined />} onClick={() => onDelete(sensor.id)} />,
            ]}
          >
            <List.Item.Meta title={sensor.name}  description={sensor.description} />
          </List.Item>
        )}
      />
    );
  };

SensorList.propTypes = {
    sensors: PropTypes.any.isRequired,
    viewMode: PropTypes.any.isRequired,
    onDelete: PropTypes.any.isRequired,
    onEdit: PropTypes.any.isRequired,
}

export default SensorList;


// Jose Anna UI changed code

// import React from "react";
// import { Card, List, Button, Row, Col, Avatar } from "antd";
// import PropTypes from 'prop-types';

// const SensorList = ({ sensors, viewMode, onDelete, onEdit }) => {
//     return viewMode === "grid" ? (
//       <Row gutter={[16, 16]}>
//         {sensors.map((sensor) => (
//           <Col key={sensor.id} xs={24} sm={12} md={8} lg={6}>
//             <Card
//               hoverable
//               title={sensor.name}
//               extra={
//                 <> 
//                   <Button icon={<i className="bx bx-edit" />} onClick={() => onEdit(sensor)} style={{ marginRight: "5px" }} />
//                   <Button danger icon={<i className="bx bx-trash" />} onClick={() => onDelete(sensor.id)} />
//                 </>
//               }
//               style={{border: '1px solid #e9e9e9'}}
//             >
//               <p>{sensor.description}</p>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     ) : (
//       <List
//         bordered
//         itemLayout="horizontal"
//         dataSource={sensors}
//         renderItem={(sensor) => (
//           <List.Item
//             key={sensor.id}
//             actions={[
//               <Button
//                 key="edit"
//                 icon={<i className="bx bx-edit" />}
//                 onClick={() => onEdit(sensor)}
//                 style={{ marginRight: 8 }}
//               />,
//               <Button
//                 key="delete"
//                 danger
//                 icon={<i className="bx bx-trash" />}
//                 onClick={() => onDelete(sensor.id)}
//               />,
//             ]}
//           >
//             <List.Item.Meta
//               avatar={<Avatar size={40} icon={<i className="bx bx-edit" />} />}
//               title={sensor.name}
//               description={sensor.description}
//             />
//           </List.Item>
//         )}
//       />
//     );
// };

// SensorList.propTypes = {
//     sensors: PropTypes.array.isRequired,
//     viewMode: PropTypes.string.isRequired,
//     onDelete: PropTypes.func.isRequired,
//     onEdit: PropTypes.func.isRequired,
// };

// export default SensorList;

// Before - 21-12-24
// import React from "react";
// import { Card, List, Button, Row, Col } from "antd";
// import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
// import PropTypes from 'prop-types';

// const SensorList = ({ sensors, viewMode, onDelete, onEdit }) => {
//     return viewMode === "grid" ? (
//       <Row gutter={[16, 16]}>
//         {sensors.map((sensor) => (
//           <Col key={sensor.id} xs={24} sm={12} md={8} lg={6}>
//             <Card
//               title={sensor.name}
//               extra={
//                 <>
//                   <Button
//                     icon={<EditOutlined />}
//                     onClick={() => onEdit(sensor)}
//                     style={{ marginRight: "8px" }}
//                   />
//                   <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(sensor.id)} />
//                 </>
//               }
//             >
//               {sensor.description}
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     ) : (
//       <List
//         bordered
//         dataSource={sensors}
//         renderItem={(sensor) => (
//           <List.Item
//             key={sensor.id}
//             actions={[
//               <Button
//                 key="edit"
//                 icon={<EditOutlined />}
//                 onClick={() => onEdit(sensor)}
//               />,
//               <Button 
//                 key="delete"
//                 danger icon={<DeleteOutlined />} onClick={() => onDelete(sensor.id)} />,
//             ]}
//           >
//             <List.Item.Meta title={sensor.name} description={sensor.description} />
//           </List.Item>
//         )}
//       />
//     );
//   };

// SensorList.propTypes = {
//     sensors: PropTypes.any.isRequired,
//     viewMode: PropTypes.any.isRequired,
//     onDelete: PropTypes.any.isRequired,
//     onEdit: PropTypes.any.isRequired,
// }

// export default SensorList;
