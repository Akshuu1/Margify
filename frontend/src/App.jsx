import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import Home from './pages/Home'
import { Login } from './pages/Login'
import { Signup } from './pages/SignUp'
import { SearchLocation } from './pages/SearchLocation'
import { RoutesPage } from './pages/RoutesPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
      <Route path = '/' element={<Home />} />
      <Route path = '/login' element = {<Login />} />
      <Route path = '/signup' element = {<Signup />} />
      <Route path='/search' element={<SearchLocation />} />
      <Route path='/routes' element={<RoutesPage />} />
      </Routes>
  </ BrowserRouter>
  )
}
export default App
