import React, { Component } from "react"
import PropTypes from 'prop-types'
import { Link } from "react-router-dom"
import { Card, CardBody, CardFooter, Col, DropdownMenu, DropdownToggle, UncontrolledDropdown, Label } from "reactstrap"
// import moment from 'moment'
import { Switch } from 'antd';
import SweetAlert from "react-bootstrap-sweetalert"

class CardContact extends Component {
  constructor(props) {
    super(props)
    this.state = {


    }
  }


  

  render() {
      let {comp_name} = this.props.data
      console.log(`comp_name`, comp_name)
    return (
      <React.Fragment>
        <Col xl="4" sm="6"   >
          <div >
            <Card >
              <CardBody style={{ minHeight: 150 }}>
                <div className="float-end ms-2">
                  <UncontrolledDropdown className="mb-2" direction="left">
                    <DropdownToggle color="white" className="font-size-16 text-muted dropdown-toggle" tag="a" ><i className="mdi mdi-dots-horizontal"></i></DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <Link className="dropdown-item" to="#" onClick={() => {}} >Edit Questions</Link>
                      {/* {
                        <>
                          <Link className="dropdown-item" to="#" onClick={() => {}}>Rename Question Bank</Link>
                          <Link className="dropdown-item text-danger" to="#" onClick={() => {}}>Delete</Link>
                        </>
                      } */}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
                <div className="my-2">
                  <h5 className="font-size-15 mb-1">
                    <div className={"text-primary text-uppercase"}>{comp_name}</div>
                  </h5>
                </div>

              </CardBody>
              <CardFooter className={"border-top bg-gradient bg-secondary"}>
              </CardFooter>
            </Card>
          </div>
        </Col>
        {
          this.state.qus_status_change && <SweetAlert title="Are you sure?" warning showCancel confirmBtnBsStyle="success" cancelBtnBsStyle="danger" onConfirm={() => { this.chengeQusbankStatus() }} onCancel={() => { this.chengeQusbankStatusCancel() }} >Do you want to make this <span style={{ fontWeight: 600 }}>{this.state.ques_bank_name}</span> Inactive</SweetAlert>
        }
      </React.Fragment>
    )
  }
}

// CardContact.propTypes = {
//   user: PropTypes.object
// }

export default CardContact

