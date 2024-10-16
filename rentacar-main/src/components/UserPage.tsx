import React, { useState, useContext } from "react";
import UserList from "./UserList";
import Footer from './Footer';
import { AuthContext } from "../context/authContext";
import Sidebar from "./Sidebar";
import Header from "./header";
import "../css/FooterFitsPage.css";  // Assuming similar styling is used

const UserPage: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { isAdmin } = useContext(AuthContext);  // Fetching isAdmin status

    const handleSidebarToggle = (collapsed: boolean) => {
        setIsSidebarCollapsed(collapsed);
    };

    return (
        <div style={{ marginTop: '30px' }} className="flex-container min-h-screen flex flex-col">
            {isAdmin ? (
                <div>
                    <Sidebar onToggle={handleSidebarToggle} />
                    <div className="min-h-screen bg-gray-800 text-white SizeScreen">
                        <Header sidebarCollapsed={isSidebarCollapsed} />
                        <main className="flex-grow bg-gray-800 text-white p-4 flex-box">
                            <h1 className="text-4xl font-bold py-8 text-center">Admin Panel - Users</h1>

                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-center">Users</h2>
                                <UserList />
                            </div>
                        </main>
                        <Footer />
                    </div>
                </div>
            ) : (
                <h1 className="text-4xl font-bold py-8 text-center">You are not authorized to view this page.</h1>
            )}
        </div>
    );
};

export default UserPage;
