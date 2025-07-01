
import { Route, Routes } from 'react-router-dom'
import './App.css'
import CommonRoutes from './Routes/CommonRoutes';
import { Toaster } from 'react-hot-toast';
import TransporterRoute from './Routes/TransporterRoute';
import AdminRoutes from './Routes/AdminRoutes';
import ShipperRoute from './Routes/ShipperRoute';

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
