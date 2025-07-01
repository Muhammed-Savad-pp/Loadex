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
import Subscription from '../pages/shipper/Subscription';
import SubscriptionSuccess from '../pages/shipper/SubscriptionSuccess';
import SubscriptionFailed from '../pages/shipper/SubscriptionFailed';
import Chat from '../pages/shipper/Chat';
import PaymentHistory from '../pages/shipper/PaymentHistory';

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
            <Route path='/subscription' element={<Subscription/>}/>
            <Route path='/subscription-success' element={<SubscriptionSuccess/>}/>
            <Route path='/subscription-failed' element={<SubscriptionFailed/>}/>
            <Route path='/chat' element={<Chat/>}/>
            <Route path='/paymentHistory' element={<PaymentHistory/>}/>

            <Route path='*' element={<NotFound/>}/>
        </Route>
    </Routes>

  )
}

export default ShipperRoute