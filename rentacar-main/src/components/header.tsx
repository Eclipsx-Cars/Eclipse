import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { FaBars, FaTimes } from "react-icons/fa";
import '../css/Header.css'

interface HeaderProps {
    sidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed }) => {
    const { isLoggedIn, setLoggedIn, isAdmin, isDriver } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        setLoggedIn(false, false, false);
        window.location.replace("/");
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    let marginLeft = "0px";
    if (sidebarCollapsed != null) {
        marginLeft = sidebarCollapsed ? "60px" : "250px";
    }

    return (
        <header className="absolute top-0 left-0 right-0 bg-black z-10 luxury-header" style={{ marginLeft }}>
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Luxury styled links */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="luxury-link">Home</Link>
                    <Link to="/cars" className="luxury-link">Cars</Link>
                    <Link to="/RequestDriverJob" className="luxury-link">Request Driver</Link>
                    {isAdmin && (
                        <Link to="/Adminpanel" className="luxury-link">Admin Panel</Link>
                    )}
                    {isDriver && (
                        <Link to="/DriversDashboard" className="luxury-link">Drivers Dashboard</Link>
                    )}
                </div>

                <div className="hidden md:flex items-center space-x-6">
                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" className="luxury-link">Profile</Link>
                            <button onClick={handleLogout} className="luxury-link">Sign out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/signin" className="luxury-link">Sign in</Link>
                            <Link to="/register" className="luxury-button">Register</Link>
                        </>
                    )}
                </div>

                <div className="md:hidden">
                    <button onClick={toggleMenu}>
                        {isMenuOpen ? (
                            ""
                        ) : (
                            <FaBars className="text-2xl text-white" />
                        )}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-20 md:hidden">
                    <div className="flex flex-col h-full justify-center items-center space-y-6">
                        <Link to="/" className="luxury-link" onClick={toggleMenu}>
                            Home
                        </Link>
                        <Link to="/cars" className="luxury-link" onClick={toggleMenu}>
                            Cars
                        </Link>
                        {isAdmin && (
                            <Link to="/Adminpanel" className="luxury-link" onClick={toggleMenu}>
                                Admin Panel
                            </Link>
                        )}
                        {isLoggedIn ? (
                            <>
                                <Link to="/profile" className="luxury-link" onClick={toggleMenu}>
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        toggleMenu();
                                    }}
                                    className="luxury-link"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/signin" className="luxury-link" onClick={toggleMenu}>
                                    Sign in
                                </Link>
                                <Link to="/register" className="luxury-button" onClick={toggleMenu}>
                                    Register
                                </Link>
                            </>
                        )}
                        <button onClick={toggleMenu} className="luxury-link">
                            <FaTimes className="text-2xl text-white" />
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
