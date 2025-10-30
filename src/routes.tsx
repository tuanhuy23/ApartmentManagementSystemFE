import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/User/Login";
import ChangePassword from "./pages/User/ChangePassword";
import UserProfile from "./pages/User/UserProfile";
import Users from "./pages/Users/Users";
import UserForm from "./pages/Users/UserForm";
import ApartmentBuildings from "./pages/ApartmentBuildings/ApartmentBuildings";
import ApartmentBuildingForm from "./pages/ApartmentBuildings/ApartmentBuildingForm";
import AuthGuard from "./components/AuthGuard";

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
      <Route path="/users" element={
        <AuthGuard>
          <Users />
        </AuthGuard>
      } />
      <Route path="/users/create" element={
        <AuthGuard>
          <UserForm />
        </AuthGuard>
      } />
      <Route path="/users/edit/:userId" element={
        <AuthGuard>
          <UserForm />
        </AuthGuard>
      } />
      <Route path="/apartment-buildings" element={
        <AuthGuard>
          <ApartmentBuildings />
        </AuthGuard>
      } />
      <Route path="/apartment-buildings/create" element={
        <AuthGuard>
          <ApartmentBuildingForm />
        </AuthGuard>
      } />
      <Route path="/apartment-buildings/edit/:id" element={
        <AuthGuard>
          <ApartmentBuildingForm />
        </AuthGuard>
      } />
    </Routes>
  );
}