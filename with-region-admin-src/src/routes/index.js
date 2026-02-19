import React from "react";
import { Redirect } from "react-router-dom";

// Pages Component
import Chat from "../pages/Chat/Chat";

// Pages File Manager
import FileManager from "../pages/FileManager/index";

// Pages Calendar
import Calendar from "../pages/Calendar/index";
//Pages camera
import Camera from "../pages/Camera/index";
import negative from "../pages/Camera/negative";
//Pages testing
import Testing from "../pages/Testing/index";
// import CRUDComponent from "../pages/Component/index"
import CRUDComponent from "../pages/AdminInspection/compInfo"
import Configuration from "../pages/AdminInspection/training_config"
import CameraPreview from "pages/AdminInspection/camera_preview";
import ManageModel from "../pages/AdminInspection/manageModel"
import ManageModelVersions from "../pages/AdminInspection/modelVerInfo"
import ModelCreation from "../pages/AdminInspection/modelCreation"
import AdminAccuracyTesting from "../pages/AdminInspection/adminAccTesting"
import modelAccuracyTesting from "pages/AdminInspection/modelAccuracyTesting";
import profileCrud from "../pages/AdminInspection/profileCrud";
import profileCreation from "../pages/AdminInspection/profileCreation"
import CalculateAcceptanceRationGallery from "../pages/AdminInspection/CalculateAcceptanceRationGallery";
import stageprofileRatioHandler_Inspection from "../pages/AdminInspection/stageprofileRatioHandler_Inspection";
import profileRatioHandler from "pages/AdminInspection/profileRatioHandler";


import EntryScrn from "../pages/AdminInspection/entry_scrn"
import EntryScrn_stg from "../pages/AdminInspection/entry_scrn_stg"

import StationInfo from "../pages/AdminInspection/station_list"
import StationInfo_stg from "../pages/AdminInspection/station_list_stg"
import StationReport from "../pages/AdminInspection/station_wise_report"
import StationData from "../pages/AdminInspection/station_data"
import StationData_stg from "../pages/AdminInspection/station_data_stg"

import CompLog from "../pages/AdminInspection/comp_log"
import Log from "../pages/AdminInspection/log"
// import Training from "../pages/Component/training"
import LoginAdmin from "../pages/Component/login_admin"
import CompInfo from "../pages/Component/comp_list"
import Negtraining from "../pages/Component/negtraining"
// import Inspection from "../pages/Component/testing"
import InspectionReport from "../pages/Component/inspectionResult"
import TimeWiseReport from "../pages/AdminInspection/timeWise"
// import TimeWiseReport from "../pages/Component/timeWise"
import DeviceInfo from "../pages/Component/connected_device"

// Region Selection
import WebcamPreview from "pages/_RegionSelection/WebcamPreview";

// User profile
import UserProfile from "../pages/Authentication/UserProfile";

//Tasks
import TasksList from "../pages/Tasks/tasks-list";
import TasksKanban from "../pages/Tasks/tasks-kanban";
import TasksCreate from "../pages/Tasks/tasks-create";

//Projects
import ProjectsGrid from "../pages/Projects/projects-grid";
import ProjectsList from "../pages/Projects/projects-list";
import ProjectsOverview from "../pages/Projects/ProjectOverview/projects-overview";
import ProjectsCreate from "../pages/Projects/projects-create";

//Ecommerce Pages
import EcommerceProducts from "../pages/Ecommerce/EcommerceProducts/index";
import EcommerceProductDetail from "../pages/Ecommerce/EcommerceProducts/EcommerceProductDetail";
import EcommerceOrders from "../pages/Ecommerce/EcommerceOrders/index";
import EcommerceCustomers from "../pages/Ecommerce/EcommerceCustomers/index";
import EcommerceCart from "../pages/Ecommerce/EcommerceCart";
import EcommerceCheckout from "../pages/Ecommerce/EcommerceCheckout";
import EcommerceShops from "../pages/Ecommerce/EcommerceShops/index";
import EcommerceAddProduct from "../pages/Ecommerce/EcommerceAddProduct";

//Email
import EmailInbox from "../pages/Email/email-inbox";
import EmailRead from "../pages/Email/email-read";
import EmailBasicTemplte from "../pages/Email/email-basic-templte";
import EmailAlertTemplte from "../pages/Email/email-template-alert";
import EmailTemplateBilling from "../pages/Email/email-template-billing";

//Invoices
import InvoicesList from "../pages/Invoices/invoices-list";
import InvoiceDetail from "../pages/Invoices/invoices-detail";

// Authentication related pages
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import ForgetPwd from "../pages/Authentication/ForgetPassword";

// Inner Authentication
import Login1 from "../pages/AuthenticationInner/Login";
import Login2 from "../pages/AuthenticationInner/Login2";
import Register1 from "../pages/AuthenticationInner/Register";
import Register2 from "../pages/AuthenticationInner/Register2";
import Recoverpw from "../pages/AuthenticationInner/Recoverpw";
import Recoverpw2 from "../pages/AuthenticationInner/Recoverpw2";
import ForgetPwd1 from "../pages/AuthenticationInner/ForgetPassword";
import ForgetPwd2 from "../pages/AuthenticationInner/ForgetPwd2";
import LockScreen from "../pages/AuthenticationInner/auth-lock-screen";
import LockScreen2 from "../pages/AuthenticationInner/auth-lock-screen-2";
import ConfirmMail from "../pages/AuthenticationInner/page-confirm-mail";
import ConfirmMail2 from "../pages/AuthenticationInner/page-confirm-mail-2";
import EmailVerification from "../pages/AuthenticationInner/auth-email-verification";
import EmailVerification2 from "../pages/AuthenticationInner/auth-email-verification-2";
import TwostepVerification from "../pages/AuthenticationInner/auth-two-step-verification";
import TwostepVerification2 from "../pages/AuthenticationInner/auth-two-step-verification-2";

// Dashboard
import Dashboard from "../pages/Dashboard/index";
import DashboardSaas from "../pages/Dashboard-saas/index";
import DashboardCrypto from "../pages/Dashboard-crypto/index";
import DashboardBlog from "../pages/Dashboard-blog/index";

//Crypto
import CryptoWallet from "../pages/Crypto/CryptoWallet/crypto-wallet";
import CryptoBuySell from "../pages/Crypto/crypto-buy-sell";
import CryptoExchange from "../pages/Crypto/crypto-exchange";
import CryptoLending from "../pages/Crypto/crypto-lending";
import CryptoOrders from "../pages/Crypto/CryptoOrders/crypto-orders";
import CryptoKYCApplication from "../pages/Crypto/crypto-kyc-application";
import CryptoIcoLanding from "../pages/Crypto/CryptoIcoLanding/index";

// Charts
import ChartApex from "../pages/Charts/Apexcharts";
import ChartistChart from "../pages/Charts/ChartistChart";
import ChartjsChart from "../pages/Charts/ChartjsChart";
import EChart from "../pages/Charts/EChart";
import SparklineChart from "../pages/Charts/SparklineChart";
import ChartsKnob from "../pages/Charts/charts-knob";
import ReCharts from "../pages/Charts/ReCharts";

// Maps
import MapsGoogle from "../pages/Maps/MapsGoogle";
import MapsVector from "../pages/Maps/MapsVector";
import MapsLeaflet from "../pages/Maps/MapsLeaflet";

//Icons
import IconBoxicons from "../pages/Icons/IconBoxicons";
import IconDripicons from "../pages/Icons/IconDripicons";
import IconMaterialdesign from "../pages/Icons/IconMaterialdesign";
import IconFontawesome from "../pages/Icons/IconFontawesome";

//Tables
import BasicTables from "../pages/Tables/BasicTables";
import DatatableTables from "../pages/Tables/DatatableTables";
import ResponsiveTables from "../pages/Tables/ResponsiveTables";
import EditableTables from "../pages/Tables/EditableTables";
import DragDropTables from "../pages/Tables/DragDropTables";

// Forms
import FormElements from "../pages/Forms/FormElements/index";
import FormLayouts from "../pages/Forms/FormLayouts";
import ComponentAdd from "../pages/Forms/Component_Add";
import CompAdd from "../pages/Forms/CompAdd";
import FormAdvanced from "../pages/Forms/FormAdvanced";
import FormEditors from "../pages/Forms/FormEditors";
import FormValidations from "../pages/Forms/FormValidations";
import FormMask from "../pages/Forms/FormMask";
import FormRepeater from "../pages/Forms/FormRepeater";
import FormUpload from "../pages/Forms/FormUpload";
import FormWizard from "../pages/Forms/FormWizard";
import FormXeditable from "../pages/Forms/FormXeditable";
import DualListbox from "../pages/Forms/DualListbox";

//Ui
import UiAlert from "../pages/Ui/UiAlert";
import UiButtons from "../pages/Ui/UiButtons";
import UiCards from "../pages/Ui/UiCards";
import UiCarousel from "../pages/Ui/UiCarousel";
import UiColors from "../pages/Ui/UiColors";
import UiDropdown from "../pages/Ui/UiDropdown";
import UiGeneral from "../pages/Ui/UiGeneral";
import UiGrid from "../pages/Ui/UiGrid";
import UiImages from "../pages/Ui/UiImages";
import UiLightbox from "../pages/Ui/UiLightbox";
import UiModal from "../pages/Ui/UiModal";
import UiProgressbar from "../pages/Ui/UiProgressbar";
import UiSweetAlert from "../pages/Ui/UiSweetAlert";
import UiTabsAccordions from "../pages/Ui/UiTabsAccordions";
import UiTypography from "../pages/Ui/UiTypography";
import UiVideo from "../pages/Ui/UiVideo";
import UiSessionTimeout from "../pages/Ui/UiSessionTimeout";
import UiRating from "../pages/Ui/UiRating";
import UiRangeSlider from "../pages/Ui/UiRangeSlider";
import UiNotifications from "../pages/Ui/ui-notifications";
import UiToast from "../pages/Ui/UiToast";
import UiOffCanvas from "../pages/Ui/UiOffCanvas";
import Breadcrumb from "../pages/Ui/UiBreadcrumb";
import UiPlaceholders from "../pages/Ui/UiPlaceholders";

//Pages
import PagesStarter from "../pages/Utility/pages-starter";
import PagesMaintenance from "../pages/Utility/pages-maintenance";
import PagesComingsoon from "../pages/Utility/pages-comingsoon";
import PagesTimeline from "../pages/Utility/pages-timeline";
import PagesFaqs from "../pages/Utility/pages-faqs";
import PagesPricing from "../pages/Utility/pages-pricing";
import Pages404 from "../pages/Utility/pages-404";
import Pages500 from "../pages/Utility/pages-500";

//Contacts
import ContactsGrid from "../pages/Contacts/contacts-grid";
import ContactsList from "../pages/Contacts/ContactList/contacts-list";
import ContactsProfile from "../pages/Contacts/ContactsProfile/contacts-profile";

//Blog
import BlogList from "../pages/Blog/BlogList/index";
import BlogGrid from "../pages/Blog/BlogGrid/index";
import BlogDetails from "../pages/Blog/BlogDetails";
import Tested from "../pages/Component/testing";
import Method_1 from "pages/_RegionSelection/method_1";
import Method_2 from "pages/_RegionSelection/method_2";
import Method_3 from "pages/_RegionSelection/method_3";
import Method_4 from "pages/_RegionSelection/method_4";
import Method_6 from "pages/_RegionSelection/method_6";
import PreviewWithNameEdit from "pages/_RegionSelection/Completed/PreviewWithNameEdit";
import RectanglePositionChange from "pages/_RegionSelection/Completed/rectanglePositionChange_1_slow";
import ColorPicker_1 from "pages/_RegionSelection/colorPicker_1";

import StaticCamera_1 from "pages/AdminInspection/TestingComponent/StaticCamera_1";
import ModelInfoConfig from "pages/AdminInspection/adminComponent/ModelInfoConfig";

import CameraPage from "pages/AdminInspection/CameraConfig/CameraPage";
import FileExplorer from "pages/AdminInspection/S3FileViewer";



//Bharani 
//Camera set position
import CameraSetPosition from "pages/CameraSetup/CameraSetPosition";
// import Cameramanualsetup from "pages/CameraSetup/Cameramanualsetup";
import ManageStages from "pages/AdminInspection/ManageStages";
import StageManageModel from "pages/AdminInspection/stageManageModel";
import { components } from "react-select/dist/react-select.cjs.prod";
import Stagelog from "pages/AdminInspection/Stagelog";
import StageModelVerInfo from "pages/AdminInspection/StageModelVerInfo";
import StageModelCreation from "pages/AdminInspection/StageModelCreation";
import StageAdminAccTesting from "pages/AdminInspection/StageAdminAccTesting";
import StageImgCap from "pages/AdminInspection/StageImgCap";
import StageProfileCrud from "pages/AdminInspection/stageprofilecrud";
import StageProfileRatioHandler from "pages/AdminInspection/stageprofileRatioHandler";
import StageStationInfoTable from "pages/AdminInspection/StageStationInfoTable";
import StageStationData from "pages/AdminInspection/StageStationData";
import StageAdminAccTesting_isnp from "pages/AdminInspection/StageAdminAccTesting_isnp";
import PcConfigList from "pages/AdminInspection/PcConfigList";



const authProtectedRoutes = [
  { path: "/dashboard", component: Dashboard },
  { path: "/dashboard-saas", component: DashboardSaas },
  { path: "/dashboard-crypto", component: DashboardCrypto },
  { path: "/dashboard-blog", component: DashboardBlog },

  //Crypto
  { path: "/crypto-wallet", component: CryptoWallet },
  { path: "/crypto-buy-sell", component: CryptoBuySell },
  { path: "/crypto-exchange", component: CryptoExchange },
  { path: "/crypto-lending", component: CryptoLending },
  { path: "/crypto-orders", component: CryptoOrders },
  { path: "/crypto-kyc-application", component: CryptoKYCApplication },

  //profile
  { path: "/profile", component: UserProfile },

  //chat
  { path: "/chat", component: Chat },

  //File Manager
  { path: "/apps-filemanager", component: FileManager },

  //calendar
  { path: "/calendar", component: Calendar },
  //Camera
  { path: "/camera", component: Camera },
  { path: "/comp_info", component: CRUDComponent },
  { path: "/config", component: Configuration },
  { path: "/camera_preview", component: CameraPreview },
  { path: "/manageModel", component: ManageModel },
  { path: "/modelVerInfo", component: ManageModelVersions },
  { path: "/modelCreation", component: ModelCreation },
  { path: "/adminAccTesting", component: AdminAccuracyTesting },
  { path: "/modelAccuracyTesting", component: modelAccuracyTesting },
  { path: "/profileCrud", component: profileCrud },  //this is created by me
  { path: "/profileCreation", component: profileCreation },
  { path: "/CalculateAcceptanceRationGallery", component: CalculateAcceptanceRationGallery },
  { path: "/stageprofileRatioHandler_Inspection", component: stageprofileRatioHandler_Inspection },
  { path: "/profile-ratio-handler", component: profileRatioHandler },
  { path: "/profile-ratio-handler-stg", component: StageProfileRatioHandler },
  { path: "/pcConfigList", component: PcConfigList },





  // { path: "/training", component: Training },
  { path: "/log", component: Log },
  { path: "/entry_scrn", component: EntryScrn },
  { path: "/entry_scrn_stg", component: EntryScrn_stg },

  { path: "/station_list", component: StationInfo },
  { path: "/station_list_stg", component: StationInfo_stg },
  { path: "/station_report", component: StationReport },
  { path: "/station_data", component: StationData },
  { path: "/station_data_stg", component: StationData_stg },


  { path: "/comp_list", component: CompInfo },
  { path: "/login_admin", component: LoginAdmin },
  { path: "/comp_log", component: CompLog },
  { path: "/negtraining", component: Negtraining },
  { path: "/negative", component: negative },
  { path: "/connected_device", component: DeviceInfo },

  //testing
  // { path: "/inspect", component: Inspection },
  { path: "/inspectResult", component: InspectionReport },
  { path: "/time_wise_report", component: TimeWiseReport },

  // Region Selection
  { path: "/region_selection", component: WebcamPreview },
  { path: "/method_1", component: Method_1 },
  { path: "/method_2", component: Method_2 }, // rectanlge showed in UI (very faster)
  { path: "/method_3", component: Method_3 },
  { path: "/method_4", component: Method_4 },
  { path: "/method_5", component: PreviewWithNameEdit },
  { path: "/method_6", component: Method_6 }, // original one
  { path: "/method_7", component: RectanglePositionChange },
  { path: "/color_pic_1", component: ColorPicker_1 },
  { path: "/static_camera_1", component: StaticCamera_1 },

  // Model Info Config
  { path: "/model-info-config", component: ModelInfoConfig },



  //Ecommerce
  // { path: "/ecommerce-products/:id", component: EcommerceProducts },
  { path: "/ecommerce-products", component: EcommerceProducts },
  { path: "/ecommerce-product-details/:id", component: EcommerceProductDetail },

  { path: "/ecommerce-orders", component: EcommerceOrders },
  { path: "/ecommerce-customers", component: EcommerceCustomers },
  { path: "/ecommerce-cart", component: EcommerceCart },
  { path: "/ecommerce-checkout", component: EcommerceCheckout },
  { path: "/ecommerce-shops", component: EcommerceShops },
  { path: "/ecommerce-add-product", component: EcommerceAddProduct },

  //Email
  { path: "/email-inbox", component: EmailInbox },
  { path: "/email-read", component: EmailRead },
  { path: "/email-template-basic", component: EmailBasicTemplte },
  { path: "/email-template-alert", component: EmailAlertTemplte },
  { path: "/email-template-billing", component: EmailTemplateBilling },

  //Invoices
  { path: "/invoices-list", component: InvoicesList },
  { path: "/invoices-detail", component: InvoiceDetail },
  { path: "/invoices-detail/:id", component: InvoiceDetail },

  // Tasks
  { path: "/tasks-list", component: TasksList },
  { path: "/tasks-kanban", component: TasksKanban },
  { path: "/tasks-create", component: TasksCreate },

  //Projects
  { path: "/projects-grid", component: ProjectsGrid },
  { path: "/projects-list", component: ProjectsList },
  { path: "/projects-overview", component: ProjectsOverview },
  { path: "/projects-overview/:id", component: ProjectsOverview },
  { path: "/projects-create", component: ProjectsCreate },

  // Contacts
  { path: "/contacts-grid", component: ContactsGrid },
  { path: "/contacts-list", component: ContactsList },
  { path: "/contacts-profile", component: ContactsProfile },

  //Blog
  { path: "/blog-list", component: BlogList },
  { path: "/blog-grid", component: BlogGrid },
  { path: "/blog-details", component: BlogDetails },

  //Charts
  { path: "/apex-charts", component: ChartApex },
  { path: "/chartist-charts", component: ChartistChart },
  { path: "/chartjs-charts", component: ChartjsChart },
  { path: "/e-charts", component: EChart },
  { path: "/sparkline-charts", component: SparklineChart },
  { path: "/charts-knob", component: ChartsKnob },
  { path: "/re-charts", component: ReCharts },

  // Icons
  { path: "/icons-boxicons", component: IconBoxicons },
  { path: "/icons-dripicons", component: IconDripicons },
  { path: "/icons-materialdesign", component: IconMaterialdesign },
  { path: "/icons-fontawesome", component: IconFontawesome },

  // Tables
  { path: "/tables-basic", component: BasicTables },
  { path: "/tables-datatable", component: DatatableTables },
  { path: "/tables-responsive", component: ResponsiveTables },
  { path: "/tables-editable", component: EditableTables },
  { path: "/tables-dragndrop", component: DragDropTables },

  // Maps
  { path: "/maps-google", component: MapsGoogle },
  { path: "/maps-vector", component: MapsVector },
  { path: "/maps-leaflet", component: MapsLeaflet },

  // Forms
  { path: "/form-elements", component: FormElements },
  { path: "/form-layouts", component: FormLayouts },
  { path: "/Component_Add", component: ComponentAdd },
  { path: "/CompAdd", component: CompAdd },


  { path: "/form-advanced", component: FormAdvanced },
  { path: "/form-editors", component: FormEditors },
  { path: "/form-mask", component: FormMask },
  { path: "/form-repeater", component: FormRepeater },
  { path: "/form-uploads", component: FormUpload },
  { path: "/form-wizard", component: FormWizard },
  { path: "/form-validation", component: FormValidations },
  { path: "/form-xeditable", component: FormXeditable },
  { path: "/dual-listbox", component: DualListbox },

  // Ui
  { path: "/ui-alerts", component: UiAlert },
  { path: "/ui-buttons", component: UiButtons },
  { path: "/ui-cards", component: UiCards },
  { path: "/ui-carousel", component: UiCarousel },
  { path: "/ui-colors", component: UiColors },
  { path: "/ui-dropdowns", component: UiDropdown },
  { path: "/ui-general", component: UiGeneral },
  { path: "/ui-grid", component: UiGrid },
  { path: "/ui-images", component: UiImages },
  { path: "/ui-lightbox", component: UiLightbox },
  { path: "/ui-modals", component: UiModal },
  { path: "/ui-progressbars", component: UiProgressbar },
  { path: "/ui-sweet-alert", component: UiSweetAlert },
  { path: "/ui-tabs-accordions", component: UiTabsAccordions },
  { path: "/ui-typography", component: UiTypography },
  { path: "/ui-video", component: UiVideo },
  { path: "/ui-session-timeout", component: UiSessionTimeout },
  { path: "/ui-rating", component: UiRating },
  { path: "/ui-rangeslider", component: UiRangeSlider },
  { path: "/ui-notifications", component: UiNotifications },
  { path: "/ui-toasts", component: UiToast },
  { path: "/ui-offcanvas", component: UiOffCanvas },
  { path: "/ui-breadcrumb", component: Breadcrumb },
  { path: "/ui-placeholders", component: UiPlaceholders },
  //Utility
  { path: "/pages-starter", component: PagesStarter },
  { path: "/pages-timeline", component: PagesTimeline },
  { path: "/pages-faqs", component: PagesFaqs },
  { path: "/pages-pricing", component: PagesPricing },

  { path: "/s3_folders", component: FileExplorer },

  // this route should be at the end of all other routes
  // eslint-disable-next-line react/display-name
  { path: "/", exact: true, component: () => <Redirect to="/comp_info" /> },

  //Bharani - Camera Set Position
  { path: "/Camera-setposition", component: CameraSetPosition },
  // { path: "/Camera-manual-setup", component: Cameramanualsetup },

  { path: "/manageStages", component: ManageStages },
  { path: "/stageManageModel", component: StageManageModel },
  { path: "/stagelog", component: Stagelog },
  { path: "/StageModelVerInfo", component: StageModelVerInfo },
  { path: "/StageModelCreation", component: StageModelCreation },
  { path: "/StageAdminAccTesting", component: StageAdminAccTesting },
  { path: "/StageImgCap", component: StageImgCap },
  { path: "/StageProfileCrud", component: StageProfileCrud },
  { path: "/StageStationInfoTable", component: StageStationInfoTable },
  { path: "/StageStationData", component: StageStationData },
  { path: "/StageAdminAccTesting_isnp", component: StageAdminAccTesting_isnp },




];

const publicRoutes = [
  { path: "/logout", component: Logout },
  { path: "/login", component: Login },
  { path: "/forgot-password", component: ForgetPwd },
  { path: "/register", component: Register },

  { path: "/pages-maintenance", component: PagesMaintenance },
  { path: "/pages-comingsoon", component: PagesComingsoon },
  { path: "/pages-404", component: Pages404 },
  { path: "/pages-500", component: Pages500 },
  { path: "/crypto-ico-landing", component: CryptoIcoLanding },

  // Authentication Inner
  { path: "/pages-login", component: Login1 },
  { path: "/pages-login-2", component: Login2 },

  { path: "/pages-register", component: Register1 },
  { path: "/pages-register-2", component: Register2 },

  { path: "/page-recoverpw", component: Recoverpw },
  { path: "/pages-recoverpw-2", component: Recoverpw2 },

  { path: "/pages-forgot-pwd", component: ForgetPwd1 },
  { path: "/pages-forgot-pwd-2", component: ForgetPwd2 },

  { path: "/auth-lock-screen", component: LockScreen },
  { path: "/auth-lock-screen-2", component: LockScreen2 },
  { path: "/page-confirm-mail", component: ConfirmMail },
  { path: "/page-confirm-mail-2", component: ConfirmMail2 },
  { path: "/auth-email-verification", component: EmailVerification },
  { path: "/auth-email-verification-2", component: EmailVerification2 },
  { path: "/auth-two-step-verification", component: TwostepVerification },
  { path: "/auth-two-step-verification-2", component: TwostepVerification2 },
];

export { authProtectedRoutes, publicRoutes };