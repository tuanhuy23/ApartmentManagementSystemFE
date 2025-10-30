import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/User/Login";
import ChangePassword from "./pages/User/ChangePassword";
import UserProfile from "./pages/User/UserProfile";
import Users from "./pages/Users/Users";
import UserForm from "./pages/Users/UserForm";
import ApartmentBuildings from "./pages/ApartmentBuildings/ApartmentBuildings";
import ApartmentBuildingForm from "./pages/ApartmentBuildings/ApartmentBuildingForm";
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
      <Route path="/403" element={<Forbidden403 />} />
      <Route path="/404" element={<NotFound404 />} />
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}