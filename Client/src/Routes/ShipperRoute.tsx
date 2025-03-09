import { Routes, Route } from 'react-router-dom'
import Profile from '../pages/shipper/Profile';
import ShipperProtectedRoute from '../ProtectedRoutes/ShipperProtectedRote';

function ShipperRoute() {


  return (
    
    <Routes>
        <Route element={<ShipperProtectedRoute/>}>
            <Route path='/profile' element={<Profile/>}/>
        </Route>
    </Routes>

  )
}

export default ShipperRoute