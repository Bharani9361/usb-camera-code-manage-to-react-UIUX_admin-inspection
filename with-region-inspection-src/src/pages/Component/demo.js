

<>
    <Modal title="Image" centered visible={this.state.showModal} onOk={() => this.setState({ showModal: false })} onCancel={() => this.setState({ showModal: false })} width={1000}                                                        >
        <div className="text-center">
            <img src={this.state.image_src} />
        </div>
        <Row>
            <br />
            <div>
                <Row>
                    <Col md={6} className="text-start">
                        Component Name: <b>{this.state.comp_name}</b>
                    </Col>
                    <Col md={6} className="text-end">
                        Result:
                        <span style={{ color: (this.state.modal_data.result === ("No Objects Detected") || this.state.modal_data.result === "notok") ? "red" : "green" && (this.state.modal_data.result === "Possible Match") ? "orange" : "green" }}>
                            {this.state.modal_data.result}
                        </span>
                    </Col>
                </Row>
                <Row>
                    <Col md={6} className="text-start">Component Code: <b>{this.state.comp_code}</b> </Col>
                    <Col md={6} className="text-end">Date: <b>{this.state.modal_data.date}  {" "} </b> {""}Time: <b>{this.state.modal_data.inspected_ontime}</b>
                    </Col>
                </Row>
            </div>
        </Row>
        <Row>
            <Col md={6} className="text-start">
                {
                    this.state.temp_index !== 0 && <Button onClick={() => this.onGotoPrevImg()} >Previous</Button>
                }
            </Col>
            <Col md={6} className="text-end">
                {
                    this.state.timeWise_filterdata.length !== this.state.temp_index + 1 &&
                    <Button onClick={() => this.onGotoNxtImg()} >Next
                        {/* {this.state.timeWise_filterdata.length}, {this.state.temp_index} */}
                    </Button>
                }
            </Col>
        </Row>
        <Row>
            <Col md={12} className="text-center">
                ( {this.state.temp_index + 1} / {this.state.timeWise_filterdata.length})
            </Col>
        </Row>
    </Modal>

    <Col sm={6}>
        <Space direction="vertical" size={12}
            style={{
                gap: '0px',
                background: 'gray',
                padding: '6px',
                borderRadius: '10px',
            }}
        >
            <Row
                style={{
                    padding: '10px',
                    color: 'white',
                    fontWeight: 'bold',
                }}
            >
                <Col>Start Date</Col>
                <Col>End Date</Col>
            </Row>
            <RangePicker
                presets={[
                    {
                        label: <span aria-label="Current Time to End of Day">Today</span>,
                        value: () => [dayjs(), dayjs().endOf('day')], // 5.8.0+ support function
                    },
                    ...this.rangePresets,
                ]}
                // defaultValue={[dayjs(), dayjs().endOf('day')]}
                defaultValue={this.state.defaultValue}
                showTime
                format="YYYY-MM-DD"
                onChange={this.onRangeChange}
                onOk={() => this.showComp(this.setState({
                    showTable2: false,
                    tbIndex: 0
                }))}
            />
        </Space>
    </Col>

    {/* Old Code */}
    
    <Col sm={6}>
        <Space direction="vertical" size={12}>
            <Row>
                <Col className="mx-2"  >Start Date</Col>
                <Col  >End Date</Col>
            </Row>
            <RangePicker
                presets={[
                    {
                        label: <span aria-label="Current Time to End of Day">Today</span>,
                        value: () => [dayjs(), dayjs().endOf('day')], // 5.8.0+ support function
                    },
                    ...this.rangePresets,
                ]}
                // defaultValue={[dayjs(), dayjs().endOf('day')]}
                defaultValue={this.state.defaultValue}
                showTime
                format="YYYY-MM-DD"
                onChange={this.onRangeChange}
                onOk={() => this.showComp(this.setState({
                    showTable2: false,
                    tbIndex: 0
                }))}
            />
        </Space>
    </Col>
    
</>