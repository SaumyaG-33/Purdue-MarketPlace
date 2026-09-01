import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import RequireAdmin from './components/RequireAdmin'

import Landing from './pages/client/Landing'
import Categories from './pages/client/Categories'
import CategoryBrowse from './pages/client/CategoryBrowse'
import AvailabilityProviders from './pages/client/AvailabilityProviders'
import ServiceListing from './pages/client/ServiceListing'
import PickTime from './pages/client/PickTime'
import BookingRequest from './pages/client/BookingRequest'
import Confirmed from './pages/client/Confirmed'

import Login from './pages/auth/Login'
import MyAccount from './pages/account/MyAccount'
import ReportIssue from './pages/account/ReportIssue'
import About from './pages/About'

import Provide from './pages/provider/Provide'
import Availability from './pages/provider/Availability'
import Calendar from './pages/provider/Calendar'
import Appointments from './pages/provider/Appointments'
import AppointmentDetail from './pages/provider/AppointmentDetail'

import ApplicationsQueue from './pages/admin/ApplicationsQueue'
import ReviewApplication from './pages/admin/ReviewApplication'
import FeedbackReports from './pages/admin/FeedbackReports'
import Suspensions from './pages/admin/Suspensions'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/browse/:categoryId" element={<CategoryBrowse />} />
          <Route path="/browse/:categoryId/:serviceId" element={<AvailabilityProviders />} />
          <Route path="/listing/:providerId" element={<ServiceListing />} />
          <Route path="/listing/:providerId/book/:serviceId" element={<PickTime />} />
          <Route path="/booking-request" element={<BookingRequest />} />
          <Route path="/confirmed" element={<Confirmed />} />

          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/account/report" element={<ReportIssue />} />
          <Route path="/about" element={<About />} />

          <Route path="/provide" element={<Provide />} />
          <Route path="/provider/availability" element={<Availability />} />
          <Route path="/provider/calendar" element={<Calendar />} />
          <Route path="/provider/appointments" element={<Appointments />} />
          <Route path="/provider/appointments/:bookingId" element={<AppointmentDetail />} />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <ApplicationsQueue />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/applications/:applicationId"
            element={
              <RequireAdmin>
                <ReviewApplication />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <RequireAdmin>
                <FeedbackReports />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/suspensions"
            element={
              <RequireAdmin>
                <Suspensions />
              </RequireAdmin>
            }
          />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
