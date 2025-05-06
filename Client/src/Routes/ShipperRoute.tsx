import { Routes, Route } from 'react-router-dom'
import Profile from '../pages/shipper/Profile';
import ShipperProtectedRoute from '../ProtectedRoutes/ShipperProtectedRote';
import PostLoad from '../pages/shipper/PostLoad';
import ShipperBids from '../pages/shipper/ShipperBids';
import MyLoads from '../pages/shipper/MyLoads';
import Sucess from '../pages/shipper/Sucess';
import Failed from '../pages/shipper/Failed';
import Trips from '../pages/shipper/Trips';
import Directory from '../pages/shipper/Directory';
import TruckBoard from '../pages/shipper/TruckBoard';
import NotFound from '../pages/common/NotFound';

function ShipperRoute() {


  return (
    
    <Routes>
        <Route element={<ShipperProtectedRoute/>}>
            <Route path='/profile' element={<Profile/>}/>
            <Route path='/postLoad' element={<PostLoad/>}/>
            <Route path='/bids' element={< ShipperBids/>}/>
            <Route path='/myLoads' element={< MyLoads/>}/>
            <Route path='/success' element={<Sucess/>}/>
            <Route path='/failed' element={<Failed/>}/>
            <Route path='/trips' element={<Trips/>}/>
            <Route path='/directory' element={<Directory/>}/>
            <Route path='/truckBoard' element={<TruckBoard/>}/>
            <Route path='*' element={<NotFound/>}/>
        </Route>
    </Routes>

  )
}

export default ShipperRoute