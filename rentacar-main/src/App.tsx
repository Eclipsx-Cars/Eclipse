import React from 'react';
import { BrowserRouter, Route, Routes} from "react-router-dom";
import './App.css';

import LandingPage from './components/landingPage';
import About from './components/about'
import CarDetails from './components/CarDetails';
import Cars from './components/Cars';
import Register from './components/Register';
import DriverRegistration from "./components/DriverRegistration";
import Signin from './components/Signin';
import Profile from './components/profile';
import AuthProvider from './context/authContext';
import DriversDashboard from './components/DriversDashboard';

import DemoLogin from './components/DemoLogin';
import AdminRouter from "./AdminRouter";
import RequestDriverJob from "./components/RequestDriverJob";
import CheckoutPage from "./components/CheckoutPage";
import PaymentFormPage from "./components/PaymentFormPage";


function App() {
  return (
    <AuthProvider  >

      <BrowserRouter>
        <div className='relative'>

          <div className="grid grid-rows-layout min-h-screen">
            <div className="row-content">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/Adminpanel/*" element={<AdminRouter />} />
                <Route path="/DriversDashboard" element={<DriversDashboard />} />
                <Route path="/About" element={<About />} />
                <Route path="/Cars" element={<Cars />} />
                <Route path="/Checkout" element={<CheckoutPage />} />
                <Route path="/RequestDriverJob" element={<RequestDriverJob />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/driver-registration" element={<DriverRegistration />} />
                <Route path="/Signin" element={<Signin />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/Payment" element={<PaymentFormPage />} />
                <Route path="/demo-login" element={<DemoLogin />} />
                <Route path="/cars/:carId" element={<CarDetails />} />
              </Routes>
            </div>
          </div>
        </div>
      </BrowserRouter >
    </AuthProvider >
  );
}

export default App;
