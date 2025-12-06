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
import Roles from "./pages/Roles/Roles";
import Forbidden403 from "./pages/Error/Forbidden403";
import NotFound404 from "./pages/Error/NotFound404";
import AuthGuard from "./components/AuthGuard";
import ApartmentBuildingGuard from "./components/ApartmentBuildingGuard";
import PermissionGuard from "./components/PermissionGuard";

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
            <PermissionGuard permission="Permissions.UserPermissions">
              <Users />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/users/create" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.UserPermissions">
              <UserForm />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/users/edit/:userId" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.UserPermissions">
              <UserForm />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartment-buildings" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.ApartmentBuildingPermissions">
              <ApartmentBuildings />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartment-buildings/create" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.ApartmentBuildingPermissions">
              <ApartmentBuildingForm />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartment-buildings/edit/:id" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.ApartmentBuildingPermissions">
              <ApartmentBuildingForm />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartments" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.ApartmentPermissions">
              <Apartments />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartments/create" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.ApartmentPermissions">
              <ApartmentForm />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/apartments/:apartmentId" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.ApartmentPermissions">
              <ApartmentDetail />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/fee-configuration" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.FeeConfigurationPermissions">
              <FeeConfiguration />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/billing-cycle" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.FeeConfigurationPermissions">
              <BillingCycleSetting />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/announcements" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.NotificationPermissions">
              <Announcements />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/announcements/create" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.NotificationPermissions">
              <AnnouncementForm />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/requests" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.RequestPermissions">
              <Requests />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/requests/create" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.RequestPermissions">
              <RequestForm />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/requests/:id" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.RequestPermissions">
              <RequestDetail />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/:apartmentBuildingId/roles" element={
        <AuthGuard>
          <ApartmentBuildingGuard>
            <PermissionGuard permission="Permissions.RolePermissions">
              <Roles />
            </PermissionGuard>
          </ApartmentBuildingGuard>
        </AuthGuard>
      } />
      <Route path="/403" element={<Forbidden403 />} />
      <Route path="/404" element={<NotFound404 />} />
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}