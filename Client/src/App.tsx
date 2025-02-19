
import { Route, Routes } from 'react-router-dom'
import './App.css'
import CommonRoutes from './Routes/CommonRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  
  return (
    <>
    <Toaster />
      <Routes>
        <Route path='/*' element={<CommonRoutes/>}/>
      </Routes>
    </>
  )
}

export default App
