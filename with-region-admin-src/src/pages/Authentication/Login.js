// correctly working code for a login page in React with Redux, Formik, and Yup validation

// import React, { Component } from "react";
// import PropTypes from "prop-types";
// import { Alert, Card, CardBody, Col, Container, Row, Label } from "reactstrap";
// // Redux
// import { connect } from "react-redux";
// import { Link, withRouter } from "react-router-dom";
// import { Formik, Field, Form, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import MetaTags from 'react-meta-tags';
// import { apiError, loginUser, socialLogin } from "../../store/actions";
// // import backgroundImage from "../../assets/images/img-3.jpg";
// // import backgroundImage from "../../assets/images/img-3.jpg";
// // import backgroundImage from "../../assets/images/bg-auth-overlay.png";
// import eparamparalogo from '../../assets/images/eparampara_logo.png'
// import './Login.css'

// class Login extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {};
//   }

//   componentDidMount() {
//     this.props.apiError("");
//   }

//   signIn = (res, type) => {
//     const { socialLogin } = this.props;
//     if (type === "google" && res) {
//       const postData = {
//         name: res.profileObj.name,
//         email: res.profileObj.email,
//         token: res.tokenObj.access_token,
//         idToken: res.tokenId,
//       };
//       socialLogin(postData, this.props.history, type);
//     } else if (type === "facebook" && res) {
//       const postData = {
//         name: res.name,
//         email: res.email,
//         token: res.accessToken,
//         idToken: res.tokenId,
//       };
//       socialLogin(postData, this.props.history, type);
//     }
//   };

//   //handleGoogleLoginResponse
//   googleResponse = response => {
//     this.signIn(response, "google");
//   };

//   //handleTwitterLoginResponse
//   twitterResponse = () => { };

//   //handleFacebookLoginResponse
//   facebookResponse = response => {
//     this.signIn(response, "facebook");
//   };

//   render() {
//     return (
//       <React.Fragment>

//         <MetaTags>
//           <title>Vision App | Admin</title>
//         </MetaTags>

//         <div className="login-page" >
//           <Container fluid className="vh-100">
//             <Row className="h-100">
//               <Col className="d-flex align-items-center justify-content-center">
//                 <div className="auth-content p-4 rounded">
//                   <div className="text-center mb-4">

//                     <div className="text-center my-4">
//                       <h5 className="fw-bold">VISION APP - ADMIN</h5>
//                       <p className="mt-2 font-size-11">Sign in to continue to Vision App - Admin</p>
//                     </div>
//                   </div>

//                   <Formik
//                     enableReinitialize={true}
//                     initialValues={{
//                       email: (this.state && this.state.email) || "",
//                       password: (this.state && this.state.password) || ""
//                     }}
//                     validationSchema={Yup.object().shape({
//                       email: Yup.string().required("Please Enter Your Email"),
//                       password: Yup.string().required("Please Enter Valid Password"),
//                     })}
//                     onSubmit={values => { this.props.loginUser(values, this.props.history); }}
//                   >
//                     {({ errors, status, touched }) => (

//                       <Form className="form-horizontal">
//                         <div className="mb-3">
//                           <Label for="email" className="form-label">
//                             Email
//                           </Label>
//                           <Field
//                             name="email"
//                             type="text"
//                             placeholder="enter your email"
//                             className={
//                               "form-control" +
//                               (errors.email && touched.email
//                                 ? " is-invalid"
//                                 : "")
//                             }
//                           />
//                           <ErrorMessage
//                             name="email"
//                             component="div"
//                             className="invalid-feedback"
//                           />
//                         </div>
//                         <div className="mb-3">
//                           <Label for="password" className="form-label">
//                             Password
//                           </Label>
//                           <div className="input-group auth-pass-inputgroup">
//                             <Field
//                               name="password"
//                               type="password"
//                               placeholder="enter your password"
//                               autoComplete="true"
//                               className={
//                                 "form-control" +
//                                 (errors.password && touched.password
//                                   ? " is-invalid"
//                                   : "")
//                               }
//                             />
//                             <button
//                               className="btn btn-light "
//                               type="button"
//                               id="password-addon"
//                             >
//                               <i className="mdi mdi-eye-outline"></i>
//                             </button>
//                           </div>
//                           <ErrorMessage
//                             name="password"
//                             component="div"
//                             className="invalid-feedback"
//                           />
//                         </div>

                        

//                         <div className="mt-3 d-grid">
//                           <button
//                             className="btn btn-primary btn-block"
//                             type="submit"
//                           >
//                             Log In
//                           </button>
//                         </div>


//                       </Form>
//                     )}
//                   </Formik>
//                   {/* <div className="text-center mt-4">
//                     <p>Designed & Developed by <br /><span className="fw-bold text-primary">eParampara Technologies</span></p>
//                   </div> */}
//                   <div className="text-center my-4">
//                     <p className="font-size-10">Designed & Developed by</p>
//                     <img src={eparamparalogo} alt="eParampara Logo" style={{ maxWidth: "120px" }} />
//                   </div>


//                 </div>
//               </Col>
//             </Row>
//           </Container>
//         </div>




//       </React.Fragment>
//     );
//   }
// }

// Login.propTypes = {
//   apiError: PropTypes.any,
//   error: PropTypes.any,
//   history: PropTypes.object,
//   loginUser: PropTypes.func,
//   socialLogin: PropTypes.func,
// };

// const mapStateToProps = state => {
//   const { error } = state.Login;
//   return { error };
// };

// export default withRouter(
//   connect(mapStateToProps, { loginUser, apiError, socialLogin })(Login)
// );



import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Container, Form, Row, Input, Label, FormGroup, FormFeedback, Spinner, Button, Alert,InputGroup } from "reactstrap";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import auditvista_logo from "../../assets/images/eparampara_logo.png";
// import background_image from "../../../assets/auditvista/digital_3.jpg"
import background_image from '../../assets/images/aideah_logo.png'
import vision_app_bg from '../../assets/images/vision_app/vision_app_bg.jpg';

// import { userAuthenticate, verifyShortName, saveBranch, setauthLoad, setInvalidCredentials, setaccActivationErr, confirmNewPwd, setInvalidErrMsg, setShowBranch, setAuthInfo } from "pages/toolkitStore/Auditvista/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { LoadingOutlined, EditOutlined } from '@ant-design/icons'
// import Amplify, { Auth } from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';
// import urlSocket from "../../../helpers/urlSocket";
import urlSocket from "pages/AdminInspection/urlSocket";
import { OtpInput } from 'reactjs-otp-input';
import CryptoJS from 'crypto-js'
// import { setDbInfoSlicer } from "pages/toolkitStore/Auditvista/Slice/authSlice";

import "./Login.css";

let cognitser = CognitoUser;

const Login2 = () => {
  const [passwordShow, setPasswordShow] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [alert, setAlert] = useState({ visible: false, message: "", color: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitLoad, setsubmitLoad] = useState(false);
  const [alreadyLogged, setalreadyLogged] = useState(false)
  const [userInfo, setuserInfo] = useState(null)
  const [LoggedInfo, setLoggedInfo] = useState([])
  const [signOutSuccess, setsignOutSuccess] = useState(false)
  const [signoutLoad, setsignoutLoad] = useState(false)
  const [triggerOtp, settriggerOtp] = useState(false)
  const [Otp, setOtp] = useState("")
  const [verifyOtp, setverifyOtp] = useState(false)
  const [cognitoUser, setcognitoUser] = useState(null)
  const [message, setmessage] = useState('')
  const [alertEnable, setalertEnable] = useState(false)
  const [alertColor, setalertColor] = useState("")
  const [formikValues, setformikValues] = useState(null)
  const [dbInfo, setDbInfo] = useState(null)
  const [userPoolInfo, setUserPoolInfo] = useState({})
  const [clientData, setClientData] = useState({})
  const [dbUrl, setDbUrl] = useState({})
  const [dataLoaded, setdataLoaded] = useState(false)

  const [hasBranches, setHasBranches] = useState("")
  const [branchName, setBranchName] = useState("")
  const [showVerifyPwd, setshowVerifyPwd] = useState(false)
  const [pwdSession, setPwdSession] = useState(null)
  const [authInfo, setAuthInfo] = useState(null)
  const [showBranch, setShowBranch] = useState(false)
  const [accActivationErr, setaccActivationErr] = useState(false)
  const [invalidCredentials, setInvalidCredentials] = useState(false)
  const [invalidErrMsg, setInvalidErrMsg] = useState("")
  const [aplRequestLoading, setAplnRequestLoading] = useState(false)
  const [updateMsg, setUpdtMsg] = useState(false)
  const [signOutLoad, setsignOutLoad] = useState(false)
  const [logginIn, setLogginIn] = useState(false);



  const otpInputStyle = {
    width: '40px',
    height: '40px',
    margin: '0 5px',
    textAlign: 'center',
    fontSize: '18px',
    borderRadius: '8px',
    border: '2px solid #ccc',
    outline: 'none',
  };

  const otpFocusStyle = {
    border: '2px solid #4CAF50',
  };


  const countryCodes = [
    { code: "+1", name: "USA" },
    { code: "+44", name: "UK" },
    { code: "+91", name: "India" },
  ];

  const history = useHistory();
  const IrSlice = useSelector(state => state.IR_Slice);
  const authLoad = IrSlice.authLoad;
  document.title = `Login | eParamapara's Vision App`;

  useEffect(() => {
    const verifyExpress = async () => {
      // await dispatch(verifyShortName(history));
      try {
        const response = await urlSocket.post('/verify_short_name', { 'data': 'your_data_here' },);
        console.log('response.data', response.data)
        let clientInfo = response.data;
        if (clientInfo.message === 'short name found') {
          setdataLoaded(true)
          const userData = { 'short_name': clientInfo.data.short_name, 'database_url': clientInfo.data.database_url, 'database_name': clientInfo.data.database_name };
          sessionStorage.setItem("userData", JSON.stringify(userData));
          sessionStorage.setItem("short_name", clientInfo.data.short_name);
          setUserPoolInfo(clientInfo.userpoolinfo);
          setClientData(clientInfo.data);
          setDbUrl(clientInfo.encrypted_db_url);
        }
        else if (clientInfo.error === "Tenant not found") {
          setdataLoaded(false)
          history.push("/login");
        }
        else {
          setdataLoaded(false)
          history.push("/pages-404");
        }
      } catch (error) {
        console.error(error);
        setdataLoaded(false)
        history.push("/pages-404");
      }
    }
    verifyExpress()
  }, []);

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (/\S+@\S+\.\S+/.test(value)) {
      setIsPhone(false);
    } else if (/^\d+$/.test(value)) {
      setIsPhone(true);
      if (value.length > 10) {
        value = value.slice(0, 10);  // Limit to 10 characters
      }
    } else {
      setIsPhone(false);
    }
    validation.setFieldValue("username", value);
  };


  const newPwd = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: '',
      new_password: '',
      confrm_password: ''
    },
    validationSchema: Yup.object({
      new_password: Yup.string()
        .required("Please Enter Your New Password"),
      confrm_password: Yup.string()
        .required("Please Enter Your Confirm Password")
        .oneOf([Yup.ref('new_password'), null], "Passwords must match"),
    }),
    onSubmit: async (values) => {
      setsubmitLoad(true)
      var short_name = sessionStorage.getItem("short_name");
      values["session"] = pwdSession; // Assuming this is defined
      values["username"] = isPhone ? countryCode + String(validation.values.username) : validation.values.username; // Assuming validation is defined
      values["short_name"] = short_name;
      values["user_info"] = validation.values.username;
      // await dispatch(confirmNewPwd(values)); // Assuming confirmNewPwd is defined
      await confirmNewPwd(values); // Assuming confirmNewPwd is defined
      setsubmitLoad(false)

    }
  });

  const confirmNewPwd = async (values) => {
    try {
      const responseData = await urlSocket.post("/confrm-new-pwd", values)
      console.log('responseData.data', responseData.data)
      if (responseData.status === 200) {
        setUpdtMsg(true)
        setTimeout(() => {
          setUpdtMsg(false)
          setshowVerifyPwd(false)
        }, 3000);
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Enter Your Username"),
      password: Yup.string().required("Enter Your Password"),
    }),
    onSubmit: async (values) => {
      setLogginIn(true);
      // values["db_name"] = IrSlice.clientData.database_name;
      // values["database_url"] = IrSlice.clientData.database_url;
      // values["short_name"] = IrSlice.clientData.short_name;
      values["db_name"] = clientData.database_name;
      values["database_url"] = clientData.database_url;
      values["short_name"] = clientData.short_name;
      values["country_code"] = countryCode
      // dispatch(setauthLoad(true));
      setformikValues(values)
      var authInfo = await userAuthenticate(values, history)
      // var authInfo = await urlSocket.post("login-authenticate", values)
      // await dispatch(userAuthenticate(values, history));
      console.log(authInfo,'authInfo416');
      if (authInfo) {
        await afterLogin(authInfo)
      }
      else {
        if (authInfo === null) {
          setAlert({ visible: true, message: "Invalid Username or Password, Please Verify & Try Again.", color: "danger" });
          setTimeout(() => {
            setAlert({ visible: false, message: "Invalid Username or Password, Please Verify & Try Again.", color: "danger" });
          }, 5000);
        }
      }
      setLogginIn(false);
    }

  });

  const userAuthenticate = async (values, history) => {
    const response = await urlSocket.post("/login-authenticate", values);
    console.log('response.data', response.data)
    console.log('response.status', response.status)
    try {
      if (response.status === 200 && response.data.message === "new password required" || response.data.user_data !== undefined) {
        if (response.data.message === "new password required") {
          setshowVerifyPwd(true)
          setPwdSession(response.data.data.Session)
        }
        else {
          setshowVerifyPwd(false)
          if (response.data.branch_data.length === 0) {
            setShowBranch(true)
            setAuthInfo(response.data)
            return false
          }
          else {
            setShowBranch(false)
            return response.data;
          }
        }
      }
      else if (response.data.error === "404db") {
        setaccActivationErr(true)
        setInvalidCredentials(false)

        setTimeout(() => {
          setaccActivationErr(false)
        }, 3000);

        return null
      }
      else if (response.data.code === 204) {
        if (Object.keys(response.data.error).length === 0) {
          setInvalidCredentials(true)
          setaccActivationErr(false)
          setTimeout(() => {
            setInvalidCredentials(false)
          }, 3000);
          return null
        }
        else {
          setInvalidErrMsg(response.data.message)
          setTimeout(() => {
            setInvalidErrMsg("")
          }, 3000);
        }
      }
      else {
        history.push("/login")
        return null
      }
    }
    catch (error) {
      console.log(error, 'error');
      setAplnRequestLoading(error)
    }
  }


  const afterLogin = async (authInfo) => {
    // dispatch(setInvalidCredentials(false));
    // dispatch(setaccActivationErr(false));
    // dispatch(setInvalidErrMsg(""));
    const endDate = new Date(authInfo.client_info[0].client_configure.end_date);
    const today = new Date();
    const endDateDateOnly = endDate.toISOString().split('T')[0];
    const todayDateOnly = today.toISOString().split('T')[0];
    const isTodayOrBefore = endDateDateOnly < todayDateOnly;
    console.log('authInfo', authInfo)
    if (authInfo.role_status === true) {
      if (isTodayOrBefore || authInfo.client_info[0].status === false || authInfo.user_data.status === false) {
        Swal.fire({
          icon: 'warning',
          title: ` ${authInfo.user_data.active === "0" ? "Inactivated !" : "Expired !"}`,
          text: ` ${authInfo.user_data.active === "0" ? "Your Login is Inactivated, Contact Admin!" : "Your company package has expired. Please contact Admin for extension!"}`,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
      } else {
          sessionStorage.setItem("authUser", JSON.stringify(authInfo));
          sessionStorage.setItem('db_info', JSON.stringify(authInfo.db_info));
          sessionStorage.setItem('client_info', JSON.stringify(authInfo.client_info));
          sessionStorage.setItem('select_menu', 1)
          
          // localStorage.setItem("authUser", JSON.stringify(authInfo));
          localStorage.setItem('db_info', JSON.stringify(authInfo.db_info));
          // 
          window.dispatchEvent(new Event('db_info_set')); // Notify others
          // 
          localStorage.setItem('client_info', JSON.stringify(authInfo.client_info));
          localStorage.setItem("accessToken", authInfo.token.accessToken)
          localStorage.setItem('express-session', JSON.stringify({
            session_id: authInfo.user_data.session_id,
            device_info: authInfo.user_data.device_info,
          }))
          // history.push("/comp_info");
          console.log("before history push", authInfo.user_data)
          history.push("/comp_info");
          console.log("after history push", authInfo.user_data)

        // if (authInfo.user_data.session_id !== null && authInfo.user_data.device_info !== null && authInfo.user_data.logged_in === false) {
        //   dispatch(setDbInfoSlicer(authInfo.db_info))
        
        // }
        // else {
        //   var already_logged = []
        //   authInfo.user_data.system_info["status"] = "1"
        //   already_logged.push({
        //     hostname: "This Device",
        //     status: "0"
        //   }, authInfo.user_data.system_info)
        //   console.log("object", already_logged);
        //   setalreadyLogged(true)
        //   setLoggedInfo(already_logged)
        //   setuserInfo(authInfo.user_data)
        //   setDbInfo(authInfo.db_info)

        //   var decryptUserPoolInfo = await decryption(authInfo.client_info[0]["userPoolId"], "Pkdh347ey%3Tgs")
        //   var decryptUserPool = decryptUserPoolInfo.toString(CryptoJS.enc.Utf8);
        //   var decryptClientInfo = await decryption(authInfo.client_info[0]["clientId"], "Pkdh347ey%3Tgs")
        //   var decryptClient = decryptClientInfo.toString(CryptoJS.enc.Utf8);
        //   setUserPoolInfo({
        //     userPoolId: decryptUserPool,
        //     clientId: decryptClient,
        //   })


        // }
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Inactivated!',
        text: 'Your role status has been inactivated. Please contact Admin!',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
    }
  }


  // const afterLogin = async (authInfo) => {
  //   // dispatch(setInvalidCredentials(false));
  //   // dispatch(setaccActivationErr(false));
  //   // dispatch(setInvalidErrMsg(""));
  //   const endDate = new Date(authInfo.client_info[0].client_configure.end_date);
  //   const today = new Date();
  //   const endDateDateOnly = endDate.toISOString().split('T')[0];
  //   const todayDateOnly = today.toISOString().split('T')[0];
  //   const isTodayOrBefore = endDateDateOnly < todayDateOnly;
  //   console.log('authInfo', authInfo)
  //   if (authInfo.role_status === true) {
  //     if (isTodayOrBefore || authInfo.client_info[0].status === false || authInfo.user_data.status === false) {
  //       Swal.fire({
  //         icon: 'warning',
  //         title: ` ${authInfo.user_data.active === "0" ? "Inactivated !" : "Expired !"}`,
  //         text: ` ${authInfo.user_data.active === "0" ? "Your Login is Inactivated, Contact Admin!" : "Your company package has expired. Please contact Admin for extension!"}`,
  //         confirmButtonColor: '#3085d6',
  //         confirmButtonText: 'OK'
  //       });
  //     } else {
  //       if (authInfo.user_data.session_id !== null && authInfo.user_data.device_info !== null && authInfo.user_data.logged_in === false) {
  //         // dispatch(setDbInfoSlicer(authInfo.db_info))
  //         sessionStorage.setItem("authUser", JSON.stringify(authInfo));
  //         sessionStorage.setItem('db_info', JSON.stringify(authInfo.db_info));
  //         sessionStorage.setItem('client_info', JSON.stringify(authInfo.client_info));
  //         localStorage.setItem("accessToken", authInfo.token.accessToken)
  //         localStorage.setItem('express-session', JSON.stringify({
  //           session_id: authInfo.user_data.session_id,
  //           device_info: authInfo.user_data.device_info,
  //         }))
  //         sessionStorage.setItem('select_menu', 1)
  //         history("/dashboard");
  //       }
  //       else {
  //         var already_logged = []
  //         authInfo.user_data.system_info["status"] = "1"
  //         already_logged.push({
  //           hostname: "This Device",
  //           status: "0"
  //         }, authInfo.user_data.system_info)
  //         console.log("object", already_logged);
  //         setalreadyLogged(true)
  //         setLoggedInfo(already_logged)
  //         setuserInfo(authInfo.user_data)
  //         setDbInfo(authInfo.db_info)

  //         var decryptUserPoolInfo = await decryption(authInfo.client_info[0]["userPoolId"], "Pkdh347ey%3Tgs")
  //         var decryptUserPool = decryptUserPoolInfo.toString(CryptoJS.enc.Utf8);
  //         var decryptClientInfo = await decryption(authInfo.client_info[0]["clientId"], "Pkdh347ey%3Tgs")
  //         var decryptClient = decryptClientInfo.toString(CryptoJS.enc.Utf8);
  //         setUserPoolInfo({
  //           userPoolId: decryptUserPool,
  //           clientId: decryptClient,
  //         })


  //       }
  //     }
  //   } else {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Inactivated!',
  //       text: 'Your role status has been inactivated. Please contact Admin!',
  //       confirmButtonColor: '#3085d6',
  //       confirmButtonText: 'OK'
  //     });
  //   }
  // }



  async function decryption(data, secretKey) {
    var encrypted_userpoolId = CryptoJS.AES.decrypt(data, secretKey);
    return encrypted_userpoolId;
  }




  //   const signOutDevice = async () => {
  //     setsignoutLoad(true)
  //     try {
  //       Amplify.configure({ Auth: { region: "ap-south-1", userPoolId: userPoolInfo.userPoolId, userPoolWebClientId: userPoolInfo.clientId, } })
  //         cognitser = await Auth.signIn(isPhone ? countryCode + String(userInfo.phone_number) : String(userInfo.email_id)).then((res) => {
  //           console.log(res,'res');
  //             if (res) {
  //                 settriggerOtp(true)
  //                 setcognitoUser(res)
  //                 setsignoutLoad(false)
  //                 setmessage("Please enter OTP sent to your registered email ID. Do not share OTP with others.")
  //                 setalertColor("success")
  //                 setalertEnable(true)
  //                 fadeAlert()

  //             }
  //         })
  //             .catch(error => {
  //                 setmessage("Something has went wrong , Please try again later.")
  //                 setalertColor("danger")
  //                 setalertEnable(true)
  //                 fadeAlert()
  //             })
  //     }
  //     catch (error) {
  //       console.log(error,'error')
  //         setmessage("Something has went wrong , Please try again later.")
  //         setalertColor("danger")
  //         setalertEnable(true)
  //         fadeAlert()
  //     }
  // }




  const signOutDevice = async () => {
    setsignoutLoad(true)
    try {

      const responseData = await urlSocket.post("cog/signout-device", {
        encrypted_db_url: IrSlice.encrypted_db_url,
        username: formikValues.username,
        isPhone,
        countryCode
      })
      console.log(responseData, 'responseData');
      if (responseData.status === 200 && responseData.data.code === "200") {
        settriggerOtp(true)
        // setcognitoUser(res)
        setsignoutLoad(false)
        setmessage(`Please enter OTP sent to your registered ${isPhone ? "Phone number" : "Email"}. Do not share OTP with others.`)
        setalertColor("success")
        setalertEnable(true)
        fadeAlert()
      }
      else {
        setmessage("Something has went wrong , Please try again later.")
        setalertColor("danger")
        setalertEnable(true)
        fadeAlert()
      }


      // Amplify.configure({ Auth: { region: "ap-south-1", userPoolId: userPoolInfo.userPoolId, userPoolWebClientId: userPoolInfo.clientId, } })
      //   cognitser = await Auth.signIn(isPhone ? countryCode + String(userInfo.phone_number) : String(userInfo.email_id)).then((res) => {
      //     console.log(res,'res');
      //       if (res) {
      //           settriggerOtp(true)
      //           setcognitoUser(res)
      //           setsignoutLoad(false)
      //           setmessage("Please enter OTP sent to your registered email ID. Do not share OTP with others.")
      //           setalertColor("success")
      //           setalertEnable(true)
      //           fadeAlert()

      //       }
      //   })
      //       .catch(error => {
      //           setmessage("Something has went wrong , Please try again later.")
      //           setalertColor("danger")
      //           setalertEnable(true)
      //           fadeAlert()
      //       })
    }
    catch (error) {
      console.log(error, 'error')
      setmessage("Something has went wrong , Please try again later.")
      setalertColor("danger")
      setalertEnable(true)
      fadeAlert()
    }
  }


  const fadeAlert = () => {
    setTimeout(() => {
      setmessage("")
      setalertColor("")
      setalertEnable(false)
    }, 3000);
  }


  // const proceedLogin = async () => {

  //   if (String(Otp).length === 6) {
  //       setverifyOtp(true)

  //       try {
  //           let answer = Otp
  //           let user = cognitoUser
  //           await Auth.sendCustomChallengeAnswer(user, String(answer))
  //               .then((res) => {
  //                   if (res.signInUserSession === null) {
  //                       setmessage("Please Enter a Valid OTP")
  //                       setalertColor('danger')
  //                       setalertEnable(true)
  //                       setverifyOtp(false)
  //                       fadeAlert()

  //                   }
  //                   else {
  //                       setmessage("Signed out successfully from the other device / browser")
  //                       setalertColor('success')
  //                       setalertEnable(true)
  //                       fadeAlert()
  //                       sessionSignout()
  //                   }
  //               })

  //       } catch (error) {
  //         console.log(error,'error')
  //       }

  //   }
  // }



  const proceedLogin = async () => {

    if (String(Otp).length === 6) {
      setverifyOtp(true)

      try {

        const responseData = await urlSocket.post("cog/verify-signout-otp", {
          encrypted_db_url: IrSlice.encrypted_db_url,
          username: formikValues.username,
          isPhone,
          countryCode,
          otp: Otp
        })

        console.log(responseData, 'responseData');
        if (responseData.status === 200) {
          setmessage("Signed out successfully from the other device / browser")
          setalertColor('success')
          setalertEnable(true)
          fadeAlert()
          sessionSignout()
        }
        else {
          setmessage("Please Enter a Valid OTP")
          setalertColor('danger')
          setalertEnable(true)
          setverifyOtp(false)
          fadeAlert()
        }
      } catch (error) {
        console.log(error, 'error')
        setmessage("Please Enter a Valid OTP")
        setalertColor('danger')
        setalertEnable(true)
        setverifyOtp(false)
        fadeAlert()
      }

    }
  }


  const sessionSignout = async () => {
    try {
      urlSocket.post('handle-session/logout-session', {
        user_id: userInfo._id,
        encrypted_db_url: dbInfo.encrypted_db_url
      }).then(async (response) => {
        console.log(response, 'response');
        if (response.data.response_code === 500) {
          var authInfo
          //  = await dispatch(userAuthenticate(formikValues, history));
          if (authInfo) {
            await afterLogin(authInfo)
          }
        }
      })
    } catch (error) {
      console.log(error, 'error')
    }
  }


  const formik = useFormik({
    initialValues: {
      hasBranches: "",
      br_name: "",
    },
    validationSchema: Yup.object({
      br_name: hasBranches === "yes" ? Yup.string().required("Branch name is required.") : Yup.string()
    }),
    onSubmit: async (values) => {
      console.log("values", values);
      values["encrypted_db_url"] = IrSlice.authInfo.db_info.encrypted_db_url
      if (hasBranches === "no") {
        values["br_name"] = sessionStorage.getItem("short_name")
      }
      const savedInfo = await saveBranch(values)
      console.log(savedInfo, 'savedInfo');
      if (savedInfo.status === 200) {
        afterLogin(_.cloneDeep(IrSlice.authInfo))
        // dispatch(setShowBranch(false))
        setHasBranches("")
        formik.resetForm()
      }
    },
  });

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(23, 53, 120, 0.70)", // Adjust opacity (0.1 to 1)
  };


  if (dataLoaded) {
    return (
      <Container fluid className="vh-100 p-0">
        <Row className="h-100 g-0 m-0">
          {/* Side Image */}
          <Col
            lg="8"
            md="6"
            className="d-none d-md-block p-0 position-relative"
          >
            {/* Background Image */}
            <div
              className="w-100 h-100 d-flex align-items-center justify-content-end"
              style={{
                backgroundImage: `url(${vision_app_bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Overlay */}
              <div
                className="h-100 d-flex flex-column justify-content-center px-4"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  width: '100%',
                  textAlign: 'right',
                  position: 'relative',
                }}
              >
                <div>
                  <h3 className="text-white fw-bold mb-3">{`aideah's aioptix App`}</h3>
                  <h3 className="text-white opacity-75 mb-3">{`Smarter Inspection - Realtime Decisions - Zero Defect Products`}</h3>
                  {/* <h4 className="text-white opacity-75">Powered by AI & Automation</h4> */}
                </div>

                {/* Vertical Line */}
                <div
                  className="position-absolute"
                  style={{
                    width: '10px',
                    height: '100%',
                    backgroundColor: '#0d6efd',
                    right: 0,
                    borderRadius: '2px',
                  }}
                ></div>
              </div>
            </div>
          </Col>


          {/* Right Side */}
          <Col
            lg="4"
            md="6"
            xs="12"
            className="d-flex flex-column justify-content-center align-items-center p-4 bg-white"
          >
            <img
              src={background_image}
              alt="Logo"
              className="mb-3 img-fluid"
              style={{ maxWidth: '150px' }}
            />
            {
              alreadyLogged ?
                <div className="w-100" style={{ maxWidth: '500px' }}>
                  {/* Greeting */}
                  <div className="mb-4 text-center">
                    <p>
                      Dear{' '}
                      <span className="text-primary fw-bold">
                        {userInfo?.fullname.charAt(0).toUpperCase() + userInfo?.fullname.slice(1)}
                      </span>
                      , you need to log out of another device or browser to log in on this one.
                    </p>
                    <p>
                      Auditvista allows access from only one device or browser at a time.
                      Please sign out from the other device to continue.
                    </p>
                  </div>

                  {/* List of logged-in devices */}
                  <div className="mb-4">
                    {LoggedInfo.map((ele, idx) => (
                      <div
                        key={`device-${idx}`}
                        className="border d-flex justify-content-between align-items-center p-3 rounded mb-2"
                      >
                        <div className="d-flex align-items-center">
                          <span className="me-3">
                            {ele.status === '1' ? (
                              <i className="text-success">✔️</i>
                            ) : (
                              <i className="text-muted">🚫</i>
                            )}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{ele.hostname}</h6>
                          {ele.status === '1' && signOutSuccess ? (
                            <small className="text-success">Signed out successfully</small>
                          ) : (
                            ele.status !== '1' && (
                              <span className="badge bg-danger-subtle text-danger">Not activated</span>
                            )
                          )}
                        </div>
                        <div>
                          {ele.status === '1' && !triggerOtp && !signOutSuccess && (
                            <Button
                              size="sm"
                              color="success"
                              disabled={signoutLoad}
                              onClick={() => signOutDevice()}
                            >
                              {signoutLoad ? (
                                <Spinner size="sm" />
                              ) : (
                                <>
                                  Sign out <i className="ms-2">↩️</i>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* OTP Section */}
                  {triggerOtp && (
                    <div className="mb-4">
                      <p className="text-dark text-center">
                        Please enter the OTP sent to your registered email ID.
                        <br />
                        <strong>Do not share OTP with others.</strong>
                      </p>
                      <div className="d-flex justify-content-center mb-3">
                        <OtpInput
                          required
                          onChange={(session_otp) => setOtp(session_otp)}
                          numInputs={6}
                          separator={<span>-</span>}
                          inputStyle={otpInputStyle}
                          focusStyle={otpFocusStyle}
                          placeholder="0"
                        />
                      </div>
                      <div className="text-end">
                        <Button color="link" className="p-0" onClick={() => signOutDevice()}>
                          Resend OTP?
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-end gap-2 mb-3">
                    <Button
                      size="sm"
                      color="light"
                      onClick={() => {
                        setalreadyLogged(false);
                        setLoggedInfo([]);
                        setuserInfo(null);
                        setsignOutSuccess(false);
                        settriggerOtp(false);
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      disabled={verifyOtp || !triggerOtp}
                      onClick={() => proceedLogin()}
                    >
                      {verifyOtp && <Spinner size="sm" className="me-2" />}
                      {verifyOtp ? 'Authenticating...' : 'Continue'}
                    </Button>
                  </div>

                  {/* Alert Message */}
                  {alertEnable && <Alert color={alertColor}>{message}</Alert>}

                  {/* Footer */}
                  <div className="text-center mt-5">
                    <small className="text-muted">
                      © {new Date().getFullYear()} designed and developed by
                      <br />
                      <span className="fw-bold text-primary">aideah Data Works</span>
                    </small>
                  </div>
                </div>
                :
                <div className="w-100" style={{ maxWidth: "400px" }}>
                  {/* Logo (already above, this is the content below it) */}

                  <div className="text-center mb-4">
                    <h5 className="fw-bold">Welcome Back!</h5>
                    <p className="text-muted">{`Log in to continue aideah's aioptix App`}</p>
                  </div>

                  {showVerifyPwd ? (
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        newPwd.handleSubmit();
                        return false;
                      }}
                    >
                      <div className="mb-3">
                        <Label>Username</Label>
                        <Input
                          name="username"
                          type="text"
                          placeholder="Enter Email ID"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.username || ""}
                          disabled={validation.values.username}
                          invalid={
                            validation.touched.username && validation.errors.username
                              ? true
                              : false
                          }
                        />
                        <FormFeedback>
                          {validation.errors.username}
                        </FormFeedback>
                      </div>

                      <div className="mb-3">
                        <Label>New Password</Label>
                        <InputGroup>
                          <Input
                            name="new_password"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter New Password"
                            onChange={newPwd.handleChange}
                            onBlur={newPwd.handleBlur}
                            value={newPwd.values.new_password || ""}
                            invalid={
                              newPwd.touched.new_password && newPwd.errors.new_password
                            }
                            autoComplete="new-password"
                          />
                          <Button
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            color="secondary"
                            outline
                            type="button"
                          >
                            <i className={showNewPassword ? "mdi mdi-eye-off" : "mdi mdi-eye-outline"} />
                          </Button>
                        </InputGroup>
                        <FormFeedback>
                          {newPwd.errors.new_password}
                        </FormFeedback>
                      </div>

                      <div className="mb-3">
                        <Label>Confirm Password</Label>
                        <InputGroup>
                          <Input
                            name="confrm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Enter Confirm Password"
                            onChange={newPwd.handleChange}
                            onBlur={newPwd.handleBlur}
                            value={newPwd.values.confrm_password || ""}
                            invalid={
                              newPwd.touched.confrm_password && newPwd.errors.confrm_password
                            }
                            autoComplete="new-password"
                          />
                          <Button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            color="secondary"
                            outline
                            type="button"
                          >
                            <i className={showConfirmPassword ? "mdi mdi-eye-off" : "mdi mdi-eye-outline"} />
                          </Button>
                        </InputGroup>
                        <FormFeedback>
                          {newPwd.errors.confrm_password}
                        </FormFeedback>
                      </div>

                      <div className="d-grid mt-3">
                        <Button type="submit" color="primary" disabled={submitLoad || updateMsg}>
                          {submitLoad ? (
                            <>
                              <Spinner size="sm" /> Submitting...
                            </>
                          ) : (
                            "Submit"
                          )}
                        </Button>
                      </div>

                      {updateMsg && (
                        <Alert color="success" className="text-center mt-3">
                          Password updated successfully.
                        </Alert>
                      )}
                    </Form>
                  ) : (
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <div className="mb-3">
                        <Label>Username (Email / Phone)</Label>
                        <InputGroup>
                          {isPhone && (
                            <Input
                              type="select"
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              style={{ maxWidth: "100px" }}
                            >
                              {countryCodes.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name} ({country.code})
                                </option>
                              ))}
                            </Input>
                          )}
                          <Input
                            name="username"
                            type={isPhone ? "number" : "text"}
                            placeholder="Enter Email or Phone"
                            onChange={handleInputChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.username || ""}
                            invalid={
                              validation.touched.username && validation.errors.username
                            }
                            min={isPhone ? "0" : undefined}
                          />
                        </InputGroup>
                        <FormFeedback>
                          {validation.errors.username}
                        </FormFeedback>
                      </div>

                      <div className="mb-3">
                        <Label>Password</Label>
                        <InputGroup>
                          <Input
                            name="password"
                            type={passwordShow ? "text" : "password"}
                            placeholder="Enter Password"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.password || ""}
                            invalid={
                              validation.touched.password && validation.errors.password
                            }
                          />
                          <Button
                            onClick={() => setPasswordShow(!passwordShow)}
                            color="secondary"
                            outline
                            type="button"
                          >
                            <i className={passwordShow ? "mdi mdi-eye-off-outline" : "mdi mdi-eye-outline"} />
                          </Button>
                        </InputGroup>
                        <FormFeedback>
                          {validation.errors.password}
                        </FormFeedback>
                        <div className="text-end mt-2">
                          <Link to="/auth-recoverpw-2">Forgot password?</Link>
                        </div>
                      </div>

                      <Alert
                        color={alert.color}
                        isOpen={alert.visible}
                        toggle={() => setAlert({ ...alert, visible: false })}
                      >
                        {alert.message}
                      </Alert>

                      <div className="d-grid mt-4">
                        <Button type="submit" color="primary" disabled={authLoad || logginIn}>
                          {/* {authLoad ? (
                            <>
                              <Spinner size="sm" /> Authenticating...
                            </>
                          ) : (
                            "Log In"
                          )} */}
                          {logginIn ? (
                            <>
                              <Spinner size="sm" className="me-2" />{`Authenticating...`}
                            </>
                          ) : (
                            "Log In"
                          )}
                        </Button>
                      </div>
                    </Form>
                  )}

                  <div className="text-center mt-5">
                    <small className="text-muted">
                      © {new Date().getFullYear()} designed and developed by{" "}<br />
                      <span className="fw-bold text-primary">aideah Data Works</span>
                    </small>
                  </div>
                </div>
            }

          </Col>
        </Row>
      </Container>
      // <React.Fragment>
      //   <div className="login-page bg-white">
          
      //     <Container fluid className="p-0 " style={{ height: "100vh" }}>
      //     <Row className="g-0 " >
      //         <Col className="col-7 "
      //           style={{
      //             backgroundColor: "#173578",
      //             backgroundImage: `url(${background_image})`,
      //             backgroundSize: "cover",
      //             backgroundPosition: "center",
      //           }}>
      //           <div style={overlayStyle}></div>
      //           <div className="" style={{ position: "absolute", width: "100%", height: "100vh", display:"flex", justifyContent:"flex-end", alignItems:"center" }}>
      //             <div className=" me-5" style={{textAlign:"right"}}>  
      //                 <div className="text-white" style={{ fontSize: 40, lineHeight:1, fontWeight:300 }}>PRECISION - COMPLIANCE - INSIGHTS</div>
      //                 {/* <div className="text-white" style={{ fontSize: 50, lineHeight:1, fontWeight:800 }}>COMPLIANCE</div>
      //                 <div className="text-white" style={{ fontSize: 50, lineHeight:1, fontWeight:800 }}>INSIGHTS </div> */}
      //                 <div className="text-white" style={{ fontSize: 50, lineHeight:1.2, fontWeight:800, }}>WELCOME TO AUDITVISTA</div>
      //             </div>
      //           </div>
      //         </Col>
      //         <Col className="col-5"
      //           style={{
      //             borderRadius: 0,
      //             borderLeftStyle: "solid",
      //             borderLeftWidth: 10,
      //             borderLeftColor: "#2667ff",
      //           }}
      //         >
      //           <Row>
      //             <Col className="col-12 d-flex align-items-center ms-5 "
      //               style={{
      //                 height: "100vh",
      //                 // background: "repeating-linear-gradient(to right, rgba(0, 0, 0, 0.05) 0px, rgba(0, 0, 0, 0.05) 0px, transparent 1px, transparent 100px)",
      //                 // backgroundSize: "100% 200px", // Controls the spacing between lines
      //               }}>
      //               {
      //                 alreadyLogged ?
      //                 <div className="p-4 col-lg-8 col-md-10 col-sm-11"  >
      //                     <div className="mb-4">
      //                       <Link to="/dashboard" className="d-block card-logo">
      //                         <img src={auditvista_logo} alt="" height="30" className="logo-dark-element" />
      //                         <img src={auditvista_logo} alt="" height="30" className="logo-light-element" />
      //                       </Link>
      //                     </div>



      //                     <div className="container my-auto">
      //                       <div className="mb-4 ">
      //                         <p className="font-size-15">
      //                         {
      //                           console.log("userInfo", userInfo)
      //                         }
      //                           Dear <span className="text-primary">
      //                             {userInfo?.fullname.charAt(0).toUpperCase() + userInfo?.fullname.slice(1)}
      //                           </span>, you need to log out of another device or browser to log in on this one.
      //                         </p>
      //                         <p className="font-size-15">
      //                           Auditvista allows access from only one device or browser at a time. Please sign out from the other device to continue. Choose an option below:
      //                         </p>
      //                       </div>

      //                       <div className="list-group mb-4">
      //                         {LoggedInfo.map((ele, idx) => (
      //                           <div
      //                             key={"dvc" + idx}
      //                             className="list-group-item d-flex justify-content-between align-items-center border-secondary"
      //                           >
      //                             <div className="d-flex align-items-center">
      //                               <span className="me-3">
      //                                 {ele.status === "1" ? (
      //                                   <i className="bx bx-check-circle text-success fs-4"></i>
      //                                 ) : (
      //                                   <i className="bx bx-block text-muted fs-4"></i>
      //                                 )}
      //                               </span>
      //                             </div>

      //                             <div className="flex-grow-1">
      //                               <h6 className="mb-1 text-truncate">{ele.hostname}</h6>
      //                               {ele.status === "1" && signOutSuccess ? (
      //                                 <span className="text-success">Signed out successfully</span>
      //                               ) : (
      //                                 ele.status !== "1" && <span className="badge badge-soft-danger">Not activated</span>
      //                               )}
      //                             </div>

      //                             <div>
      //                               {ele.status === "1" && !triggerOtp && !signOutSuccess && (
      //                                 <button
      //                                   className="btn btn-sm btn-success w-sm d-flex align-items-center"
      //                                   disabled={signoutLoad}
      //                                   onClick={() => signOutDevice()}
      //                                 >
      //                                   {signoutLoad ? (
      //                                     <LoadingOutlined />
      //                                   ) : (
      //                                     <>
      //                                       Sign out <i className="bx bx-log-out-circle font-size-15 ms-2" />
      //                                     </>
      //                                   )}
      //                                 </button>
      //                               )}

      //                             </div>
      //                           </div>
      //                         ))}
      //                       </div>

      //                       {triggerOtp && (
      //                         <div className="mb-3">
      //                           <p className="font-size-15 text-dark">Please enter the OTP sent to your registered email ID. <br />Do not share OTP with others.</p>
      //                           <div className="d-flex justify-content-center mb-3">
      //                             <OtpInput
      //                               required
      //                               onChange={(session_otp) => setOtp(session_otp)}
      //                               numInputs={6}
      //                               separator={<span>-</span>}
      //                               inputStyle={otpInputStyle}
      //                               focusStyle={otpFocusStyle}
      //                               placeholder="0"
      //                             />
      //                           </div>
      //                           <div className="text-end">
      //                             <button className="btn btn-link text-decoration-none p-0" onClick={() => signOutDevice()}>
      //                               Resend OTP?
      //                             </button>
      //                           </div>
      //                         </div>
      //                       )}

      //                       <div className="d-flex justify-content-end gap-2">
      //                         <button
      //                           className="btn btn-sm btn-light"
      //                           onClick={() => {
      //                             setalreadyLogged(false);
      //                             setLoggedInfo([]);
      //                             setuserInfo(null);
      //                             setsignOutSuccess(false);
      //                             settriggerOtp(false);
      //                           }}
      //                         >
      //                           Close
      //                         </button>
      //                         <button
      //                           className="btn btn-sm btn-primary"
      //                           disabled={verifyOtp || !triggerOtp}
      //                           onClick={() => proceedLogin()}
      //                         >
      //                           {verifyOtp && <LoadingOutlined />} {verifyOtp ? "Authenticating..." : "Continue"}
      //                         </button>
      //                       </div>
      //                     </div>

      //                     {
      //                       alertEnable &&
      //                       <Alert color={alertColor} className="mt-2" >{message}</Alert>
      //                     }

      //                     <div className="mt-4 mt-md-5 text-center">
      //                       <p className="mb-0">© {new Date().getFullYear()} designed and developed by <br /><span className="text-primary fw-bold">eParampara Technologies</span></p>
      //                     </div>
      //                   </div>
      //                   :
      //                   <div className="p-4 col-lg-8 col-md-10 col-sm-11"  >
      //                     <div className="mb-4" >
      //                       <Link to="/dashboard" className="d-block card-logo">
      //                         <img src={auditvista_logo} alt="" height="30" className="logo-dark-element" />
      //                         <img src={auditvista_logo} alt="" height="30" className="logo-light-element" />
      //                       </Link>
      //                     </div>
      //                     <div className="my-auto">
      //                       <div className="mb-5">
      //                         <div className="text-dark">Welcome Back !</div>
      //                         <div className="text-dark" style={{ fontSize: 25 }}>Log in to continue to Auditvista.</div>
      //                       </div>
      //                       {
      //                         showVerifyPwd ?
      //                           <div className="mt-4">
      //                             <Form className="form-horizontal"
      //                               onSubmit={(e) => {
      //                                 e.preventDefault();
      //                                 newPwd.handleSubmit();
      //                                 return false;
      //                               }}
      //                             >
      //                               <div className="mb-3">
      //                                 <Label className="form-label">Username :</Label>
      //                                 <Input
      //                                   name="username"
      //                                   className="form-control"
      //                                   placeholder="Enter Email ID"
      //                                   type="username"
      //                                   onChange={validation.handleChange}
      //                                   onBlur={validation.handleBlur}
      //                                   value={validation.values.username || ""}
      //                                   disabled={validation.values.username}
      //                                   invalid={validation.touched.username && validation.errors.username ? true : false}
      //                                 />
      //                                 {validation.touched.username && validation.errors.username ? (
      //                                   <FormFeedback type="invalid">{validation.errors.username}</FormFeedback>
      //                                 ) : null}
      //                               </div>

      //                               <div className="mb-3">
      //                                 <Label className="form-label">New Password :</Label>
      //                                 <div className="input-group auth-pass-inputgroup">
      //                                   <Input
      //                                     name="new_password"
      //                                     className="form-control"
      //                                     placeholder="Enter New Password"
      //                                     type={showNewPassword ? "text" : "password"}
      //                                     onChange={newPwd.handleChange}
      //                                     onBlur={newPwd.handleBlur}
      //                                     value={newPwd.values.new_password || ""}
      //                                     invalid={newPwd.touched.new_password && newPwd.errors.new_password ? true : false}
      //                                     autoComplete='new-password'
      //                                   />
      //                                   <button
      //                                     onClick={() => setShowNewPassword(!showNewPassword)}
      //                                     className="btn text-dark"
      //                                     style={{ background: 'gainsboro' }}
      //                                     type="button"
      //                                     id="password-addon"
      //                                   >
      //                                     <i className={showNewPassword ? "mdi mdi-eye-off" : "mdi mdi-eye-outline"}></i>
      //                                   </button>

      //                                   {newPwd.touched.new_password && newPwd.errors.new_password ? (
      //                                     <FormFeedback type="invalid">{newPwd.errors.new_password}</FormFeedback>
      //                                   ) : null}
      //                                 </div>



      //                               </div>

      //                               <div className="mb-3">
      //                                 <Label className="form-label">Confirm Password :</Label>
      //                                 <div className="input-group auth-pass-inputgroup">
      //                                   <Input
      //                                     name="confrm_password"
      //                                     className="form-control"
      //                                     placeholder="Enter Confirm Password"
      //                                     type={showConfirmPassword ? "text" : "password"}
      //                                     onChange={newPwd.handleChange}
      //                                     onBlur={newPwd.handleBlur}
      //                                     value={newPwd.values.confrm_password || ""}
      //                                     invalid={newPwd.touched.confrm_password && newPwd.errors.confrm_password ? true : false}
      //                                     autoComplete='new-password'
      //                                   />
      //                                   <button
      //                                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      //                                     className="btn text-dark"
      //                                     style={{ background: 'gainsboro' }}
      //                                     type="button"
      //                                     id="confirm-password-addon"
      //                                   >
      //                                     <i className={showConfirmPassword ? "mdi mdi-eye-off" : "mdi mdi-eye-outline"}></i>
      //                                   </button>
      //                                   {newPwd.touched.confrm_password && newPwd.errors.confrm_password ? (
      //                                     <FormFeedback type="invalid">{newPwd.errors.confrm_password}</FormFeedback>
      //                                   ) : null}
      //                                 </div>

      //                               </div>

      //                               <div className="mt-3 text-end">
      //                                 <Button disabled={submitLoad || updateMsg} color="primary" type="submit">
      //                                   {
      //                                     submitLoad ? (
      //                                       <>
      //                                         <Spinner size={"sm"}>...</Spinner>
      //                                         <span>{' '}Submitting...</span>
      //                                       </>
      //                                     ) : (
      //                                       <>Submit</>
      //                                     )}

      //                                 </Button>
      //                               </div>
      //                               {
      //                                 updateMsg &&
      //                                 <div className="alert alert-success text-center mb-4" role="alert">Password updated successfully.</div>

      //                               }
      //                             </Form>

      //                           </div>
      //                           :
      //                           <div className="mt-4">
      //                             <Form
      //                               className="form-horizontal"
      //                               onSubmit={(e) => {
      //                                 e.preventDefault();
      //                                 validation.handleSubmit();
      //                                 return false;
      //                               }}
      //                             >
      //                               <div className="mb-3">
      //                                 <div className="mb-2">
      //                                   <Label className='m-0 '>USERNAME (E-MAIL / MOBILE NUMBER)</Label>
      //                                 </div>
      //                                 {/* <div className="font-size-12 text-secondary text-opacity-75 mb-3">Enter your mobile number or e-mail to proceed</div> */}

      //                                 <div className={`${isPhone ? 'd-flex' : ''}`} >
      //                                   {isPhone &&
      //                                     <Input
      //                                       type="select"
      //                                       className="form-control bg-light  bg-opacity-50 w-auto me-1"
      //                                       style={{ border: 0, borderRadius: 0, height: 50, borderBottom: "3px solid #2667ff" }}
      //                                       value={countryCode}
      //                                       onChange={(e) => setCountryCode(e.target.value)}
      //                                     >
      //                                       {countryCodes.map((country) => (
      //                                         <option key={country.code} value={country.code}>
      //                                           {country.name} ({country.code})
      //                                         </option>
      //                                       ))}
      //                                     </Input>
      //                                   }
      //                                   <Input
      //                                     name="username"
      //                                     className="form-control bg-light  bg-opacity-50"
      //                                     style={{ border: 0, borderRadius: 0, height: 50, borderBottom: "3px solid #2667ff", }}
      //                                     placeholder="Enter Email ID / Phone Number"
      //                                     type={`${isPhone ? 'number' : 'text'}`}
      //                                     onChange={handleInputChange}
      //                                     onBlur={validation.handleBlur}
      //                                     value={validation.values.username || ""}
      //                                     invalid={validation.touched.username && validation.errors.username ? true : false}
      //                                     min={isPhone ? "0" : undefined}
      //                                   />
      //                                   {validation.touched.username && validation.errors.username ? (
      //                                     <FormFeedback type="invalid">{validation.errors.username}</FormFeedback>
      //                                   ) : null}
      //                                 </div>
      //                               </div>

      //                               <div className="mb-3 mt-4">
                                      
      //                                 <Label className="form-label">PASSWORD</Label>
      //                                 <div className="input-group auth-pass-inputgroup">
      //                                   <Input
      //                                     name="password"
      //                                     className=" bg-light bg-opacity-50"
      //                                     style={{ border: 0, borderRadius: 0, height: 50, borderBottom: "3px solid #2667ff" }}
      //                                     value={validation.values.password || ""}
      //                                     type={passwordShow ? "text" : "password"}
      //                                     placeholder="Enter Password"
      //                                     onChange={validation.handleChange}
      //                                     onBlur={validation.handleBlur}
      //                                     invalid={validation.touched.password && validation.errors.password ? true : false}
      //                                   />
      //                                   <button onClick={() => setPasswordShow(!passwordShow)} className="btn text-dark bg-light bg-opacity-50 font-size-18" style={{ background: 'none', border: 0, borderBottom: "3px solid #2667ff" }} type="button" id="password-addon">
      //                                     <i className={`mdi ${passwordShow ? "mdi-eye-outline" : "mdi-eye-off-outline"}`}></i>
      //                                   </button>
      //                                   {validation.touched.password && validation.errors.password ? (
      //                                     <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
      //                                   ) : null}
      //                                 </div>
      //                                 <div className="float-end mt-2">
      //                                   <Link to="/auth-recoverpw-2" className="text-muted">Forgot password?</Link>
      //                                 </div>
      //                               </div>

      //                               <Alert color={alert.color} isOpen={alert.visible} toggle={() => setAlert({ ...alert, visible: false })}>
      //                                 {alert.message}
      //                               </Alert>
      //                               {IrSlice.invalidErrMsg !== "" && (
      //                                 <Alert color="danger" isOpen={true}>
      //                                   {IrSlice.invalidErrMsg}
      //                                 </Alert>
      //                               )}
      //                               {IrSlice.invalidCredentials && (
      //                                 <Alert color="danger" isOpen={true}>
      //                                   Invalid Username or Password
      //                                 </Alert>
      //                               )}
      //                               {IrSlice.accActivationErr && (
      //                                 <Alert color="danger" isOpen={true}>
      //                                   Your account is not activated.
      //                                 </Alert>
      //                               )}

      //                               <div className="mt-5 d-grid">
      //                                 <button className="btn btn-primary btn-block" type="submit" disabled={authLoad} style={{ height: 50, borderRadius: 0 }}>
      //                                   {authLoad ? (
      //                                     <>
      //                                       <Spinner size="sm">...</Spinner>
      //                                       <span>{' '}Authenticating</span>
      //                                     </>
      //                                   ) : (
      //                                     <>Log In</>
      //                                   )}
      //                                 </button>
      //                               </div>
      //                             </Form>
      //                           </div>
      //                       }
      //                     </div>

      //                     <div className="mt-4 mt-md-5 text-center">
      //                       <p className="mb-0">© {new Date().getFullYear()} designed and developed by <br /><span className="text-primary fw-bold">eParampara Technologies</span></p>
      //                     </div>
      //                   </div>
      //               }
      //             </Col>
      //           </Row>
      //         </Col>

      //       </Row>
      //     </Container>
      //   </div>
      // </React.Fragment>
    );
  }
  else {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div>Redirecting...</div>
        <Spinner color="primary" />
      </div>
    )
  };
}

export default Login2;








// import React, { Component } from "react";
// import PropTypes from "prop-types";

// import { Alert, Card, CardBody, Col, Container, Row, Label } from "reactstrap";

// // Redux
// import { connect } from "react-redux";
// import { Link, withRouter } from "react-router-dom";

// //Social Media Imports
// import { GoogleLogin } from "react-google-login";
// // import TwitterLogin from "react-twitter-auth"
// import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

// //Import config
// import { facebook, google } from "../../config";

// import { Formik, Field, Form, ErrorMessage } from "formik";
// import * as Yup from "yup";

// // actions
// import { apiError, loginUser, socialLogin } from "../../store/actions";

// // import images
// import profile from "../../assets/images/profile-img.png";
// import logo from "../../assets/images/logo.svg";
// import lightlogo from "../../assets/images/logo-light.svg";

// class Login extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {};
//   }

//   componentDidMount() {
//     this.props.apiError("");
//   }

//   signIn = (res, type) => {
//     const { socialLogin } = this.props;
//     if (type === "google" && res) {
//       const postData = {
//         name: res.profileObj.name,
//         email: res.profileObj.email,
//         token: res.tokenObj.access_token,
//         idToken: res.tokenId,
//       };
//       socialLogin(postData, this.props.history, type);
//     } else if (type === "facebook" && res) {
//       const postData = {
//         name: res.name,
//         email: res.email,
//         token: res.accessToken,
//         idToken: res.tokenId,
//       };
//       socialLogin(postData, this.props.history, type);
//     }
//   };

//   //handleGoogleLoginResponse
//   googleResponse = response => {
//     this.signIn(response, "google");
//   };

//   //handleTwitterLoginResponse
//   twitterResponse = () => {};

//   //handleFacebookLoginResponse
//   facebookResponse = response => {
//     this.signIn(response, "facebook");
//   };

//   render() {
//     return (
//       <React.Fragment>
//         <div className="home-btn d-none d-sm-block">
//           <Link to="/" className="text-dark">
//             <i className="bx bx-home h2" />
//           </Link>
//         </div>
//         <div className="account-pages my-5 pt-sm-5">
//           <Container>
//             <Row className="justify-content-center">
//               <Col md={8} lg={6} xl={5}>
//                 <Card className="overflow-hidden">
//                   <div className="bg-primary bg-soft">
//                     <Row>
//                       <Col className="col-7">
//                         <div className="text-primary p-4">
//                           <h5 className="text-primary">Welcome Back !</h5>
//                           <p>Sign in to continue to Skote.</p>
//                         </div>
//                       </Col>
//                       <Col className="col-5 align-self-end">
//                         <img src={profile} alt="" className="img-fluid" />
//                       </Col>
//                     </Row>
//                   </div>
//                   <CardBody className="pt-0">
//                     <div className="auth-logo">
//                       <Link to="/" className="auth-logo-light">
//                         <div className="avatar-md profile-user-wid mb-4">
//                           <span className="avatar-title rounded-circle bg-light">
//                             <img
//                               src={lightlogo}
//                               alt=""
//                               className="rounded-circle"
//                               height="34"
//                             />
//                           </span>
//                         </div>
//                       </Link>
//                       <Link to="/" className="auth-logo-dark">
//                         <div className="avatar-md profile-user-wid mb-4">
//                           <span className="avatar-title rounded-circle bg-light">
//                             <img
//                               src={logo}
//                               alt=""
//                               className="rounded-circle"
//                               height="34"
//                             />
//                           </span>
//                         </div>
//                       </Link>
//                     </div>
//                     <div className="p-2">
//                     {this.props.error && this.props.error ? (
//                       <Alert color="danger">{this.props.error}</Alert>
//                     ) : null}
//                       <Formik
//                         enableReinitialize={true}
//                         initialValues={{
//                           email:
//                             (this.state && this.state.email) ||
//                             "admin@themesbrand.com",
//                           password:
//                             (this.state && this.state.password) || "123456",
//                         }}
//                         validationSchema={Yup.object().shape({
//                           email: Yup.string().required(
//                             "Please Enter Your Email"
//                           ),
//                           password: Yup.string().required(
//                             "Please Enter Valid Password"
//                           ),
//                         })}
//                         onSubmit={values => {
//                           this.props.loginUser(values, this.props.history);
//                         }}
//                       >
//                         {({ errors, status, touched }) => (
                          
//                           <Form className="form-horizontal">
//                             <div className="mb-3">
//                               <Label for="email" className="form-label">
//                                 Email
//                               </Label>
//                               <Field
//                                 name="email"
//                                 type="text"
//                                 className={
//                                   "form-control" +
//                                   (errors.email && touched.email
//                                     ? " is-invalid"
//                                     : "")
//                                 }
//                               />
//                               <ErrorMessage
//                                 name="email"
//                                 component="div"
//                                 className="invalid-feedback"
//                               />
//                             </div>
//                             <div className="mb-3">
//                               <Label for="password" className="form-label">
//                                 Password
//                               </Label>
//                               <div className="input-group auth-pass-inputgroup">
//                                 <Field
//                                   name="password"
//                                   type="password"
//                                   autoComplete="true"
//                                   className={
//                                     "form-control" +
//                                     (errors.password && touched.password
//                                       ? " is-invalid"
//                                       : "")
//                                   }
//                                 />
//                                 <button
//                                   className="btn btn-light "
//                                   type="button"
//                                   id="password-addon"
//                                 >
//                                   <i className="mdi mdi-eye-outline"></i>
//                                 </button>
//                               </div>
//                               <ErrorMessage
//                               name="password"
//                               component="div"
//                               className="invalid-feedback"
//                             />
//                             </div>
                            
//                             <div className="form-check">
//                               <input
//                                 type="checkbox"
//                                 className="form-check-input"
//                                 id="customControlInline"
//                               />
//                               <label
//                                 className="form-check-label"
//                                 htmlFor="customControlInline"
//                               >
//                                 Remember me
//                               </label>
//                             </div>

//                             <div className="mt-3 d-grid">
//                               <button
//                                 className="btn btn-primary btn-block"
//                                 type="submit"
//                               >
//                                 Log In
//                               </button>
//                             </div>

//                             <div className="mt-4 text-center">
//                               <h5 className="font-size-14 mb-3">
//                                 Sign in with
//                               </h5>

//                               <ul className="list-inline">
//                                 <li className="list-inline-item">
//                                   <FacebookLogin
//                                     appId={facebook.APP_ID}
//                                     autoLoad={false}
//                                     callback={this.facebookResponse}
//                                     render={renderProps => (
//                                       <Link
//                                         to={""}
//                                         className="social-list-item bg-primary text-white border-primary"
//                                       >
//                                         <i className="mdi mdi-facebook" />
//                                       </Link>
//                                     )}
//                                   />
//                                 </li>
//                                 <li className="list-inline-item">
//                                   {google.CLIENT_ID === "" ? (
//                                     ""
//                                   ) : (
//                                     <GoogleLogin
//                                       clientId={google.CLIENT_ID}
//                                       render={renderProps => (
//                                         <Link
//                                           to={""}
//                                           className="social-list-item bg-danger text-white border-danger"
//                                         >
//                                           <i className="mdi mdi-google" />
//                                         </Link>
//                                       )}
//                                       onSuccess={this.googleResponse}
//                                       onFailure={() => {}}
//                                     />
//                                   )}
//                                 </li>
//                               </ul>
//                             </div>

//                             <div className="mt-4 text-center">
//                               <Link
//                                 to="/forgot-password"
//                                 className="text-muted"
//                               >
//                                 <i className="mdi mdi-lock me-1" /> Forgot your
//                                 password?
//                               </Link>
//                             </div>
//                           </Form>
//                         )}
//                       </Formik>
//                     </div>
//                   </CardBody>
//                 </Card>
//                 <div className="mt-5 text-center">
//                   <p>
//                     Don&apos;t have an account ?
//                     <Link to="register" className="fw-medium text-primary">
//                       Signup Now
//                     </Link>
//                   </p>
//                   <p>
//                     © {new Date().getFullYear()} Skote. Crafted with
//                     <i className="mdi mdi-heart text-danger" /> by Themesbrand
//                   </p>
//                 </div>
//               </Col>
//             </Row>
//           </Container>
//         </div>
//       </React.Fragment>
//     );
//   }
// }

// Login.propTypes = {
//   apiError: PropTypes.any,
//   error: PropTypes.any,
//   history: PropTypes.object,
//   loginUser: PropTypes.func,
//   socialLogin: PropTypes.func,
// };

// const mapStateToProps = state => {
//   const { error } = state.Login;
//   return { error };
// };

// export default withRouter(
//   connect(mapStateToProps, { loginUser, apiError, socialLogin })(Login)
// );
