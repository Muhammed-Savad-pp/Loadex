import { Routes, Route } from 'react-router-dom'
import Profile from '../pages/Transporter/Profile'
import TransporterProtectedRoute from '../ProtectedRoutes/TransporterProtectedRoute'
import RegisterTruck from '../pages/Transporter/RegisterTruck'

function TransporterRoute() {
  return (
   
    <Routes>
      <Route element={<TransporterProtectedRoute/>}>
        <Route path='/profile' element={<Profile/>} />
        <Route path='/registerTruck' element={<RegisterTruck/>}/>  
      </Route>
        
    </Routes>
    
  )
}

export default TransporterRoute