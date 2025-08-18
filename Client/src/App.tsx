import React from 'react';
import { Route, Routes } from 'react-router-dom'
import './App.css'
const CommonRoutes = React.lazy(() => import('./Routes/CommonRoutes'));
import { Toaster } from 'react-hot-toast';
const TransporterRoute = React.lazy(() => import('./Routes/TransporterRoute'));
const AdminRoutes = React.lazy(() => import('./Routes/AdminRoutes'));
const ShipperRoute = React.lazy(() => import('./Routes/ShipperRoute'));

function App() {
  
  return (
    <>
    <Toaster />
      <Routes>
        <Route path='/*' element={<CommonRoutes/>}/>
        <Route path='/transporter/*' element={<TransporterRoute/>}/>
        <Route path='/admin/*' element={<AdminRoutes/>}/>
        <Route path='/shipper/*' element={<ShipperRoute/>}/>
      </Routes>
    </>
  )
}

export default App
