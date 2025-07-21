import { Routes, Route } from 'react-router-dom'
import TransporterProtectedRoute from '../ProtectedRoutes/TransporterProtectedRoute'
import { Suspense, lazy } from 'react'

const Profile = lazy(() => import('../pages/Transporter/Profile'))
const RegisterTruck = lazy(() => import('../pages/Transporter/RegisterTruck'))
const LoadBoard = lazy(() => import('../pages/Transporter/LoadBoard'))
const MyTrucks = lazy(() => import('../pages/Transporter/MyTrucks'))
const MyBids = lazy(() => import('../pages/Transporter/MyBids'))
const Success = lazy(() => import('../pages/Transporter/Success'))
const Failed = lazy(() => import('../pages/Transporter/Failed'))
const Trips = lazy(() => import('../pages/Transporter/Trips'))
const Directory = lazy(() => import('../pages/Transporter/Directory'))
const Network = lazy(() => import('../pages/Transporter/Network'))
const Subscription = lazy(() => import('../pages/Transporter/Subscription'))
const SubscriptionSuccess = lazy(() => import('../pages/Transporter/SubscriptionSuccess'))
const SubscriptionFailed = lazy(() => import('../pages/Transporter/SubscriptionFailed'))
const PaymentHistory = lazy(() => import('../pages/Transporter/PaymentHistory'))
const Chat = lazy(() => import('../pages/Transporter/Chat'))
const Wallet = lazy(() => import('../pages/Transporter/Wallet'))
const NotFound = lazy(() => import('../pages/common/NotFound'))

function TransporterRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<TransporterProtectedRoute />}>
          <Route path='/profile' element={<Profile />} />
          <Route path='/registerTruck' element={<RegisterTruck />} />
          <Route path='/loadBoard' element={<LoadBoard />} />
          <Route path='/myTrucks' element={<MyTrucks />} />
          <Route path='/myBids' element={<MyBids />} />
          <Route path='/success' element={<Success />} />
          <Route path='/failed' element={<Failed />} />
          <Route path='/trips' element={<Trips />} />
          <Route path='/directory' element={<Directory />} />
          <Route path='/network' element={<Network />} />
          <Route path='/subscription' element={<Subscription />} />
          <Route path='/subscription-success' element={<SubscriptionSuccess />} />
          <Route path='/subscription-failed' element={<SubscriptionFailed />} />
          <Route path='/paymentHistory' element={<PaymentHistory />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/wallet' element={<Wallet />} />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default TransporterRoute
