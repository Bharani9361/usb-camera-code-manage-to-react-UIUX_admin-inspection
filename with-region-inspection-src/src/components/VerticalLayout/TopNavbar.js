import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    Button,
    Collapse
} from 'reactstrap';
import './TopNavbar.css';

const TopNavbar = ({
    stationName,
    onToggleSidebar,
    onSwitchToAdmin,
    onSyncResults,
    onFullScreen
}) => {
    const [showMobileActions, setShowMobileActions] = useState(false);

    const toggleMobileActions = () => {
        setShowMobileActions(!showMobileActions);
    };

    return (
        <>
            <Navbar
                color="white"
                light
                className="px-3 py-2 shadow-sm d-flex justify-content-between align-items-center"
                expand="md"
                style={{ borderBottom: '1px solid #e0e0e0', height: '70px' }}
            >
                {/* Sidebar Toggle + Station Name */}
                <div className="d-flex align-items-center gap-3">
                    <i
                        className="bx bx-menu fs-3 text-primary"
                        onClick={onToggleSidebar}
                        style={{ cursor: 'pointer' }}
                    ></i>
                    <NavbarBrand className="mb-0 fw-bold text-primary">
                        <i className="bx bx-server me-1"></i>
                        {stationName}
                    </NavbarBrand>
                </div>

                {/* Desktop Right Section */}
                <Nav className="d-none d-md-flex align-items-center gap-2" navbar>
                    <NavItem>
                        <Button
                            color="primary"
                            size="sm"
                            className="d-flex justify-content-center align-items-center gap-1 w-md"
                            onClick={onSwitchToAdmin}
                        >
                            <i className="bx bx-user-circle fs-5"></i>
                            <span>Admin</span>
                        </Button>
                    </NavItem>

                    <NavItem>
                        <Button
                            color="primary"
                            size="sm"
                            className="d-flex justify-content-center align-items-center gap-1 w-md"
                            onClick={onSyncResults}
                        >
                            <i className="bx bx-sync fs-5"></i>
                            <span>Result Syxx</span>
                        </Button>
                    </NavItem>

                    <NavItem>
                        <Button
                            color="white"
                            size="sm"
                            className="border d-flex align-items-center rounded-circle"
                            onClick={onFullScreen}
                            style={{ width: '36px', height: '36px' }}
                        >
                            <i className="bx bx-fullscreen fs-5 text-primary"></i>
                        </Button>
                    </NavItem>
                </Nav>

                {/* Mobile Toggle Button */}
                <Button
                    color="primary"
                    size="sm"
                    className="d-md-none"
                    onClick={toggleMobileActions}
                >
                    <i className={`bx ${showMobileActions ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
                </Button>
            </Navbar>

            {/* Mobile Dropdown Menu */}
            <Collapse isOpen={showMobileActions} className="d-md-none px-3 pb-2 mt-4">
                <div className="d-flex flex-column gap-2 justify-content-center align-items-center">
                    <Button
                        color="primary"
                        size="sm"
                        className="d-flex align-items-center gap-1 w-md justify-content-center"
                        onClick={onSwitchToAdmin}
                    >
                        <i className="bx bx-user-circle fs-5"></i>
                        <span>Admin</span>
                    </Button>

                    <Button
                        color="primary"
                        size="sm"
                        className="d-flex align-items-center gap-1 w-md justify-content-center"
                        onClick={onSyncResults}
                    >
                        <i className="bx bx-sync fs-5"></i>
                        <span>Result Sync</span>
                    </Button>

                    <Button
                        color="white"
                        size="sm"
                        className="border d-flex align-items-center"
                        onClick={onFullScreen}
                        style={{ width: '36px', height: '36px' }}
                    >
                        <i className="bx bx-fullscreen fs-5 text-primary"></i>
                    </Button>
                </div>
            </Collapse>
        </>
    );
};

TopNavbar.propTypes = {
    stationName: PropTypes.string.isRequired,
    onToggleSidebar: PropTypes.func.isRequired,
    onSwitchToAdmin: PropTypes.func.isRequired,
    onSyncResults: PropTypes.func.isRequired,
    onFullScreen: PropTypes.func.isRequired
};

export default TopNavbar;
