import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import Home from './pages/Home'
import { Login } from './pages/Login'
import { Signup } from './pages/SignUp'
import { SearchLocation } from './pages/SearchLocation'
import { RoutesPage } from './pages/RoutesPage'
import { Profile } from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'


import { SavedRoutes } from './pages/SavedRoutes'
import { Navbar } from './components/Navbar'

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route element={<Profile />} path="/profile" />
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/search' element={<SearchLocation />} />
        <Route path='/routes' element={<RoutesPage />} />
        <Route path='/saved-routes' element={<SavedRoutes />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
