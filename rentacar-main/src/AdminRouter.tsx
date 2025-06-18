import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminPanel from "./components/AdminPanel";
import DriverJobPage from "./components/DriverJobPage";
import RentalCarsPage from "./components/RentalCarsPage";
import UserPage from "./components/UserPage";
import Messages from "./components/Messages";


const AdminRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminPanel />} />
            <Route path="/Driverjobs" element={<DriverJobPage />} />
            <Route path ="/Rentalcars" element={<RentalCarsPage />} />
            <Route path ="/Userpage" element={<UserPage />} />
            <Route path ="/Messages" element={<Messages />} />
        </Routes>
    );
};

export default AdminRouter;