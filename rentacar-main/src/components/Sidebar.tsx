import React, { Component } from 'react';
import '../css/Sidebar.css';
import {FaBars, FaTimes, FaHome, FaBriefcase, FaEnvelope, FaUser, FaCar} from "react-icons/fa";

interface SidebarState {
    isSidebarCollapsed: boolean;
    isMobileView: boolean;
}

interface SidebarProps {
    onToggle: (collapsed: boolean) => void;
}

interface SidebarState {
    isSidebarCollapsed: boolean;
    isMobileView: boolean;
}

class Sidebar extends Component<SidebarProps, SidebarState> {
    constructor(props: SidebarProps) {
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
        const { isSidebarCollapsed, isMobileView } = this.state;
        const buttonIcon = isSidebarCollapsed ? <FaBars /> : <FaTimes />;

        return (
            <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                {!isSidebarCollapsed && (
                    <div className="sidebar-header">
                        <h3>Admin Dashboard</h3>
                    </div>
                )}
                <ul className="list-unstyled components">
                    <li>
                        <a href="/AdminPanel">
                            {isSidebarCollapsed ? <FaHome /> : 'Admin Home'}
                        </a>
                    </li>
                    <li>
                        <a href="/AdminPanel/Driverjobs">
                            {isSidebarCollapsed ? <FaBriefcase /> : 'Driver Jobs'}
                        </a>
                    </li>
                    <li>
                        <a href="/AdminPanel/Rentalcars">
                            {isSidebarCollapsed ? <FaCar /> : 'Cars'}
                        </a>
                    </li>
                    <li>
                        <a href="/AdminPanel/Userpage">
                            {isSidebarCollapsed ? <FaUser /> : 'Users'}
                        </a>
                    </li>
                    <li>
                        <a href="/">
                            {isSidebarCollapsed ? <FaEnvelope /> : 'Driver Messenger'}
                        </a>
                    </li>
                </ul>

                <div className="corner-button">
                    <button
                        onClick={this.handleSidebarToggle}
                        className={`responsive-button ${
                            isSidebarCollapsed ? 'closed' : 'open'
                        }`}
                    >
                        {buttonIcon}
                    </button>
                </div>
            </div>
        );
    }
}

export default Sidebar;