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
        <Route path='*' element={<NotFound/>}/>
      </Route>
    </Routes>
    
  )
}

export default TransporterRoute