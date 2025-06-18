import React from 'react';
import {Route, Routes} from "react-router-dom";
import DriversDashboard from "./components/DriversDashboard";
import Messages from "./components/Messages";

const DriverRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<DriversDashboard />} />
            <Route path="/Messages" element={<Messages />} />
        </Routes>
    );
};

export default DriverRouter;