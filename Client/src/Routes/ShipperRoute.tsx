import   { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ShipperProtectedRoute from '../ProtectedRoutes/ShipperProtectedRote';

// Lazy load shipper pages
const Profile = lazy(() => import('../pages/shipper/Profile'));
const PostLoad = lazy(() => import('../pages/shipper/PostLoad'));
const ShipperBids = lazy(() => import('../pages/shipper/ShipperBids'));
const MyLoads = lazy(() => import('../pages/shipper/MyLoads'));
const Sucess = lazy(() => import('../pages/shipper/Sucess'));
const Failed = lazy(() => import('../pages/shipper/Failed'));
const Trips = lazy(() => import('../pages/shipper/Trips'));
const Directory = lazy(() => import('../pages/shipper/Directory'));
const TruckBoard = lazy(() => import('../pages/shipper/TruckBoard'));
const Subscription = lazy(() => import('../pages/shipper/Subscription'));
const SubscriptionSuccess = lazy(() => import('../pages/shipper/SubscriptionSuccess'));
const SubscriptionFailed = lazy(() => import('../pages/shipper/SubscriptionFailed'));
const Chat = lazy(() => import('../pages/shipper/Chat'));
const PaymentHistory = lazy(() => import('../pages/shipper/PaymentHistory'));
const NotFound = lazy(() => import('../pages/common/NotFound'));

function ShipperRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<ShipperProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/postLoad" element={<PostLoad />} />
          <Route path="/bids" element={<ShipperBids />} />
          <Route path="/myLoads" element={<MyLoads />} />
          <Route path="/success" element={<Sucess />} />
          <Route path="/failed" element={<Failed />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/truckBoard" element={<TruckBoard />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          <Route path="/subscription-failed" element={<SubscriptionFailed />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/paymentHistory" element={<PaymentHistory />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default ShipperRoute;
