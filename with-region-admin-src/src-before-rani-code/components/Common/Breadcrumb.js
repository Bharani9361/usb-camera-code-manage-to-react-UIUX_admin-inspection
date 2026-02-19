import React, { Component } from 'react';
import PropTypes from 'prop-types'; // Import prop-types
import { Row, Col, Breadcrumb, BreadcrumbItem, Button } from "reactstrap";

class Breadcrumbs extends Component {

    render() {
        return (
            <React.Fragment>
                <Row className="mb-3">
                    <Col xs={this.props.isBackButtonEnable ? 9 : 12}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">{this.props.title}</div>                    
                        </div>
                    </Col>
                    {
                        this.props.isBackButtonEnable &&
                        <Col xs={3} className='d-flex align-items-center justify-content-end'>
                            <button className='btn btn-outline-primary btn-sm me-2' color="primary" onClick={() => this.props.gotoBack()}>Back <i className="mdi mdi-arrow-left"></i></button>
                        </Col>
                    }
                </Row>
            </React.Fragment>
        );
    }
}

// Define prop types for the component
Breadcrumbs.propTypes = {
    title: PropTypes.string.isRequired, // title should be a string and is required
    isBackButtonEnable: PropTypes.bool, // isBackButtonEnable should be a boolean (optional)
    gotoBack: PropTypes.func, // gotoBack should be a function (optional)
};

export default Breadcrumbs;


// import React, { Component } from "react";
// import PropTypes from "prop-types";
// import { Link } from "react-router-dom";
// import { Breadcrumb, BreadcrumbItem, Col, Row } from "reactstrap";

// class Breadcrumbs extends Component {
//   render() {
//     return (
//       <React.Fragment>
//         <Row>
//           <Col xs="12">
//             <div className="page-title-box d-sm-flex align-items-center justify-content-between">
//               <h4 className="mb-0 font-size-18">{this.props.breadcrumbItem}</h4>
//               <div className="page-title-right">
//                 <Breadcrumb listClassName="m-0">
//                   <BreadcrumbItem>
//                     <Link to="#">{this.props.title}</Link>
//                   </BreadcrumbItem>
//                   <BreadcrumbItem active>
//                     <Link to="#">{this.props.breadcrumbItem}</Link>
//                   </BreadcrumbItem>
//                 </Breadcrumb>
//               </div>
//             </div>
//           </Col>
//         </Row>
//       </React.Fragment>
//     )
//   }
// }

// Breadcrumbs.propTypes = {
//   breadcrumbItem: PropTypes.string,
//   title: PropTypes.string
// }

// export default Breadcrumbs
