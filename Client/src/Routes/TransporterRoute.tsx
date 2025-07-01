import { Routes, Route } from 'react-router-dom'
import Profile from '../pages/Transporter/Profile'
import TransporterProtectedRoute from '../ProtectedRoutes/TransporterProtectedRoute'
import RegisterTruck from '../pages/Transporter/RegisterTruck'
import LoadBoard from '../pages/Transporter/LoadBoard'
import MyTrucks from '../pages/Transporter/MyTrucks'
import MyBids from '../pages/Transporter/MyBids'
import Success from '../pages/Transporter/Success'
import Failed from '../pages/Transporter/Failed'
import Trips from '../pages/Transporter/Trips'
import Directory from '../pages/Transporter/Directory'
import NotFound from '../pages/common/NotFound'
import Network from '../pages/Transporter/Network'
import Subscription from '../pages/Transporter/Subscription'
import SubscriptionSuccess from '../pages/Transporter/SubscriptionSuccess'
import SubscriptionFailed from '../pages/Transporter/SubscriptionFailed'
import PaymentHistory from '../pages/Transporter/PaymentHistory'
import Chat from '../pages/Transporter/Chat'
import Wallet from '../pages/Transporter/Wallet'

function TransporterRoute() {
  return (
   
    <Routes>
      <Route element={<TransporterProtectedRoute/>}>

        <Route path='/profile' element={<Profile/>} />
        <Route path='/registerTruck' element={<RegisterTruck/>}/>  
        <Route path='/loadBoard' element={<LoadBoard/>}/>
        <Route path='/myTrucks' element={<MyTrucks/>}/>
        <Route path='/myBids' element={<MyBids/>}/>
        <Route path='/success' element={<Success/>}/>
        <Route path='/failed' element={<Failed/>}/>
        <Route path='/trips' element={<Trips/>}/>
        <Route path='/directory' element={<Directory/>}/>
        <Route path='/network' element={<Network/>}/>
        <Route path='/subscription' element={<Subscription/>}/>
        <Route path='/subscription-success' element={<SubscriptionSuccess/>}/>
        <Route path='/subscription-failed' element={<SubscriptionFailed/>}/>
        <Route path='/paymentHistory' element={<PaymentHistory/>}/>
        <Route path='/chat' element={<Chat/>}/>
        <Route path='/wallet' element={<Wallet/>}/>
        {/* <Route path='/notification' element={< NotificationModal/>}/> */}
        <Route path='*' element={<NotFound/>}/>
      </Route>
    </Routes>
    
  )
}

export default TransporterRoute