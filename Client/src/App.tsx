
import { Route, Routes } from 'react-router-dom'
import './App.css'
import CommonRoutes from './Routes/CommonRoutes'

function App() {
  
  return (
    <>
      <Routes>
        <Route path='/*' element={<CommonRoutes/>}/>
      </Routes>
    </>
  )
}

export default App
