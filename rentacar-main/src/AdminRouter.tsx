import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminPanel from "./components/AdminPanel";
import DriverJobPage from "./components/DriverJobPage";
import RentalCarsPage from "./components/RentalCarsPage";
import UserPage from "./components/UserPage";


const AdminRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminPanel />} />
            <Route path="/Driverjobs" element={<DriverJobPage />} />
            <Route path ="/Rentalcars" element={<RentalCarsPage />} />
            <Route path ="/Userpage" element={<UserPage />} />
        </Routes>
    );
};

export default AdminRouter;