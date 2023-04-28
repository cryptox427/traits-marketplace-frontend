import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'


const Home = lazy(() => import('./pages/home'))
const LiveTrade = lazy(() => import('./pages/LiveTrade'))
const Trade = lazy(() => import('./pages/trade'))
const WithDraw = lazy(() => import('./pages/withdraw'))
const Breeding = lazy(() => import('./pages/breeding'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route index path="/" element={<Home />} />
            <Route index path="/post" element={<LiveTrade />} />
            <Route index path="/trade" element={<Trade />} />
            <Route index path="/my-post" element={<WithDraw />} />
            <Route index path="/breeding" element={<Breeding />} />
          </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
