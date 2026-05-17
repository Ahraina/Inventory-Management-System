import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { seedData } from './data/store'


import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

import AdminScan from './pages/AdminScan'
import AdminRequests from './pages/AdminRequests'
import AdminReturns from './pages/AdminReturns'
import AdminInventory from './pages/AdminInventory'

import UserRequest from './pages/UserRequest'
import UserMyRequests from './pages/UserMyRequests'
import UserReturns from './pages/UserReturns'
import UserInventory from './pages/UserInventory'

seedData()

function PrivateRoute({ children, role }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/" />

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/scan' : '/user/request'} />
  }

  return children
}

export default function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin/scan" element={
            <PrivateRoute role="admin"><AdminScan /></PrivateRoute>
          } />
          <Route path="/admin/requests" element={
            <PrivateRoute role="admin"><AdminRequests /></PrivateRoute>
          } />
          <Route path="/admin/returns" element={
            <PrivateRoute role="admin"><AdminReturns /></PrivateRoute>
          } />
          <Route path="/admin/inventory" element={
            <PrivateRoute role="admin"><AdminInventory /></PrivateRoute>
          } />

          <Route path="/user/request" element={
            <PrivateRoute role="user"><UserRequest /></PrivateRoute>
          } />
          <Route path="/user/my-requests" element={
            <PrivateRoute role="user"><UserMyRequests /></PrivateRoute>
          } />
          <Route path="/user/returns" element={
            <PrivateRoute role="user"><UserReturns /></PrivateRoute>
          } />
          <Route path="/user/inventory" element={
            <PrivateRoute role="user"><UserInventory /></PrivateRoute>
          } />

          <Route path="/settings" element={
            <PrivateRoute><Settings /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><Profile /></PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}