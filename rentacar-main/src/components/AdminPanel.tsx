import React, { useState, useEffect, useContext } from "react";
import ReservationList from "./Reservationlist";
import Footer from './Footer';
import { AuthContext } from "../context/authContext";
import Sidebar from "./Sidebar";
import '../css/AdminPanel.css'
import "../css/FooterFitsPage.css";
import Header from "./header";

const AdminPanel: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [reservations, setReservations] = useState([]);
    const { isAdmin } = useContext(AuthContext);

    const handleSidebarToggle = (collapsed: boolean) => {
        setIsSidebarCollapsed(collapsed);
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations`);
        if (response.ok) {
            const data = await response.json();
            setReservations(data);
        }
    };

    return (
        <div className="admin-panel-container">
            {isAdmin ? (
                <>
                    <Sidebar onToggle={handleSidebarToggle} />
                    <div className="main-content bg-gray-800 text-white SizeScreen">
                        <Header sidebarCollapsed={isSidebarCollapsed}/>
                        <h1 className="text-4xl font-bold py-8 text-center">Admin Panel</h1>

                        <div className="w-full">
                            <h2 className="text-2xl font-bold text-center">Reservations</h2>
                            <ReservationList reservations={reservations}/>
                        </div>
                    </div>
                    <div className="footer-container">
                        <Footer/>
                    </div>
                </>
            ) : (
                <h1 className="text-4xl font-bold py-8 text-center">You are not authorized to view this page.</h1>
            )}
        </div>
    );
};

export default AdminPanel;