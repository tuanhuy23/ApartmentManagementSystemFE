import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/User/Login";
import ChangePassword from "./pages/User/ChangePassword";
import UserProfile from "./pages/User/UserProfile";
import Users from "./pages/Users/Users";
import UserForm from "./pages/Users/UserForm";
import ApartmentBuildings from "./pages/ApartmentBuildings/ApartmentBuildings";
import ApartmentBuildingForm from "./pages/ApartmentBuildings/ApartmentBuildingForm";
import ApartmentDetail from "./pages/Apartment/ApartmentDetail";
import Apartments from "./pages/Apartment/Apartments";
import ApartmentForm from "./pages/Apartment/ApartmentForm";
import FeeConfiguration from "./pages/FeeConfiguration/FeeConfiguration";
import BillingCycleSetting from "./pages/BillingCycle/BillingCycleSetting";
import Announcements from "./pages/Announcement/Announcements";
import AnnouncementForm from "./pages/Announcement/AnnouncementForm";
import Requests from "./pages/Request/Requests";
import RequestForm from "./pages/Request/RequestForm";
import RequestDetail from "./pages/Request/RequestDetail";
import Forbidden403 from "./pages/Error/Forbidden403";
import NotFound404 from "./pages/Error/NotFound404";
import AuthGuard from "./components/AuthGuard";
import ApartmentBuildingGuard from "./components/ApartmentBuildingGuard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/" element={
        <AuthGuard>
          <Home />
        </AuthGuard>
      } />
      <Route path="/profile" element={
        <AuthGuard>
          <UserProfile />
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <Home />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/users" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <Users />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/users/create" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <UserForm />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/users/edit/:userId" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <UserForm />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartment-buildings" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <ApartmentBuildings />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartment-buildings/create" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <ApartmentBuildingForm />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartment-buildings/edit/:id" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <ApartmentBuildingForm />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartments" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <Apartments />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartments/create" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <ApartmentForm />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartments/:apartmentId" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <ApartmentDetail />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/fee-configuration" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <FeeConfiguration />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/billing-cycle" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <BillingCycleSetting />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/announcements" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <Announcements />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/announcements/create" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <AnnouncementForm />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/requests" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <Requests />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/requests/create" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <RequestForm />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/requests/:id" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <RequestDetail />
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/403" element={<Forbidden403 />} />
      <Route path="/404" element={<NotFound404 />} />
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}