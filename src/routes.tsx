import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/User/Login";
import UserProfile from "./pages/User/UserProfile";
import Users from "./pages/Users/Users";
import UserForm from "./pages/Users/UserForm";
import Roles from "./pages/Roles/Roles";
import RoleForm from "./pages/Roles/RoleForm";
import ApartmentBuildings from "./pages/ApartmentBuildings/ApartmentBuildings";
import ApartmentBuildingForm from "./pages/ApartmentBuildings/ApartmentBuildingForm";
import AuthGuard from "./components/AuthGuard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
      <Route path="/roles" element={
        <AuthGuard>
          <Roles />
        </AuthGuard>
      } />
      <Route path="/roles/create" element={
        <AuthGuard>
          <RoleForm />
        </AuthGuard>
      } />
      <Route path="/roles/edit/:roleId" element={
        <AuthGuard>
          <RoleForm />
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