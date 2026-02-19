import React, { useState, useEffect } from 'react';
import urlSocket from 'pages/AdminInspection/urlSocket';
import { Container, Card, CardBody, Row, Col, Table, Button, ListGroup, ListGroupItem, Input } from 'reactstrap';
import { useHistory } from 'react-router-dom'; 
import MetaTags from 'react-meta-tags'; // Import MetaTags
import Breadcrumbs from "components/Common/Breadcrumb";
 // Import Breadcrumbs component (adjust the path based on your project structure)
const StationLog = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [stationInfo, setStationInfo] = useState(null);
  const [logData, setLogData] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const stationInfodata = JSON.parse(sessionStorage.getItem('stationInfo'));
    console.log('stationData:', stationInfodata);
    if (stationInfodata) {
      setStationInfo(stationInfodata);
    }
  }, []);

  useEffect(() => {
    if (stationInfo) {
      fetchStationLog(stationInfo);
    }
  }, [stationInfo]);

  const fetchStationLog = async (stationInfodata) => {
    try {
      console.log('Payload sent to /stationlog_info:', stationInfodata);
      const response = await urlSocket.post('/stationlog_info', { station_id: stationInfodata.station_id });
      console.log('Full response:', response);

      setLogData(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching station log:', error);
      setError('Failed to fetch station log');
    }
  };

  const filterLogs = () => {
    if (!searchQuery) return logData;

    return logData.filter((data) =>
      Object.values(data).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const renderDetails = (details) => {
    if (details) {
      const entries = Object.entries(details);
      const chunkEntries = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return chunks;
      };

      const groupedEntries = chunkEntries(entries, 4);

      return (
        <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #e9e9e9', borderRadius: '5px', padding: '10px' }}>
          {groupedEntries.map((group, rowIndex) => (
            <Row key={rowIndex} className="g-1">
              {group.map(([key, value], colIndex) => (
                <Col xs={12} sm={6} md={3} key={colIndex}>
                  <ListGroup>
                    <ListGroupItem className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ fontWeight: 'bold', color: '#555' }}>{key}:</span>
                      <span className="badge badge-soft-success">{value}</span>
                    </ListGroupItem>
                  </ListGroup>
                </Col>
              ))}
            </Row>
          ))}
        </div>
      );
    }
    return <div>No Details Available</div>;
  };
  const back = () => {
    history.push('/station_list');
  };

  return (
    <div className="page-content">
      <Container fluid>
        <MetaTags>
          <title>LogInfo | RunOut Admin</title>
        </MetaTags>

        <Breadcrumbs
          title="LOG INFO"
          isBackButtonEnable={true}
          gotoBack={back}
        />
        <Card>
          <CardBody>
            <Row>
              <Col>
               
                <div className="table-responsive">
                  <Table
                    className="table mb-0 align-middle table-nowrap table-check"
                    bordered
                  >
                    <thead className="table-light">
                      <tr>
                        <th>Date & Time</th>
                        <th>User</th>
                        <th>Station Name</th>
                        <th>Screen</th>
                        <th>Action</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {console.log(logData, "logData")}
                      {filterLogs().length > 0 ? (
                        filterLogs().map((data, index) => (
                          <React.Fragment key={index}>
                            <tr onClick={() => toggleRow(index)}>
                              <td
                                style={{
                                  backgroundColor:
                                    expandedRow === index ? "#d6d9f9" : "white",
                                }}
                              >
                                {new Date(data.date_time).toLocaleString()}
                              </td>
                              <td
                                style={{
                                  backgroundColor:
                                    expandedRow === index ? "#d6d9f9" : "white",
                                }}
                              >
                                {data.user_info}
                              </td>
                              <td
                                style={{
                                  backgroundColor:
                                    expandedRow === index ? "#d6d9f9" : "white",
                                }}
                              >
                                {data.station_name}
                              </td>
                              <td
                                style={{
                                  backgroundColor:
                                    expandedRow === index ? "#d6d9f9" : "white",
                                }}
                              >
                                {data.screen_name}
                              </td>
                              <td
                                style={{
                                  backgroundColor:
                                    expandedRow === index ? "#d6d9f9" : "white",
                                }}
                              >
                                {data.action}
                              </td>
                              <td style={{ backgroundColor: expandedRow === index ?  '#d6d9f9' :  "white" }}>

                                  <Button
                                    color={
                                      expandedRow === index ? "info" : "primary"
                                    }
                                    size="sm"
                                    className="d-flex align-items-center"
                                    onClick={() => toggleRow(index)} // Add this to trigger the row expansion toggle
                                  >
                                    {expandedRow === index
                                      ? "Hide Info"
                                      : "View Info"}
                                  </Button>
                                </td>
                           
                            </tr>
                            {expandedRow === index && (
                              <tr>
                                <td
                                  colSpan="7"
                                  style={{
                                    backgroundColor:
                                      expandedRow === index
                                        ? "#d6d9f9"
                                        : "white",
                                    border: "1px solid lightgrey",
                                  }}
                                >
                                  {renderDetails(data.report_data[0])}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6">No data available</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default StationLog;

