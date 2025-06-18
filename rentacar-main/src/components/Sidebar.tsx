import React, { Component } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Sidebar.css';
import {
    FaBars,
    FaTimes,
    FaHome,
    FaBriefcase,
    FaEnvelope,
    FaUser,
    FaCar,
    FaComments
} from "react-icons/fa";

interface SidebarState {
    isSidebarCollapsed: boolean;
    isMobileView: boolean;
}

interface SidebarProps {
    onToggle: (collapsed: boolean) => void;
    isDriver?: boolean;
}

// Wrapper for useLocation
const withRouter = (WrappedComponent: any) => (props: any) => {
    const location = useLocation();
    return <WrappedComponent {...props} location={location} />;
};

class Sidebar extends Component<SidebarProps & { location: any }, SidebarState> {
    constructor(props: SidebarProps & { location: any }) {
        super(props);
        this.state = {
            isSidebarCollapsed: false,
            isMobileView: false,
        };
    }

    componentDidMount() {
        this.checkMobileView();
        window.addEventListener('resize', this.checkMobileView);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.checkMobileView);
    }

    checkMobileView = () => {
        this.setState({
            isMobileView: window.innerWidth < 768,
        });
    };

    handleSidebarToggle = () => {
        this.setState((prevState) => {
            const isCollapsed = !prevState.isSidebarCollapsed;
            this.props.onToggle(isCollapsed);
            return { isSidebarCollapsed: isCollapsed };
        });
    };

    render() {
        const { isSidebarCollapsed } = this.state;
        const { isDriver } = this.props;
        const buttonIcon = isSidebarCollapsed ? <FaBars /> : <FaTimes />;

        return (
            <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                {!isSidebarCollapsed && (
                    <div className="sidebar-header">
                        <h3>{isDriver ? 'Driver Dashboard' : 'Admin Dashboard'}</h3>
                    </div>
                )}

                <ul className="list-unstyled components">
                    {isDriver ? (
                        // Driver Menu Items
                        <>
                            <li>
                                <Link to="/DriversDashboard">
                                    {isSidebarCollapsed ? (
                                        <FaBriefcase />
                                    ) : (
                                        'Available Jobs'
                                    )}
                                </Link>
                            </li>
                            <li>
                                <Link to="/DriversDashboard/Messages">
                                    {isSidebarCollapsed ? (
                                        <FaEnvelope />
                                    ) : (
                                        'Messages'
                                    )}
                                </Link>
                            </li>
                        </>
                    ) : (
                        // Admin Menu Items
                        <>
                            <li>
                                <Link to="/AdminPanel">
                                    {isSidebarCollapsed ? <FaHome /> : 'Admin Home'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/AdminPanel/Driverjobs">
                                    {isSidebarCollapsed ? <FaBriefcase /> : 'Driver Jobs'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/AdminPanel/Rentalcars">
                                    {isSidebarCollapsed ? <FaCar /> : 'Cars'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/AdminPanel/Userpage">
                                    {isSidebarCollapsed ? <FaUser /> : 'Users'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/AdminPanel/Messages">
                                    {isSidebarCollapsed ? <FaComments /> : 'Messages'}
                                </Link>
                            </li>
                        </>
                    )}
                </ul>

                <div className="corner-button">
                    <button
                        onClick={this.handleSidebarToggle}
                        className={`responsive-button ${isSidebarCollapsed ? 'closed' : 'open'}`}
                    >
                        {buttonIcon}
                    </button>
                </div>
            </div>
        );
    }
}

export default withRouter(Sidebar);