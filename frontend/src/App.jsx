import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './layouts/DashboardLayout'

import PatientDashboard from './pages/patient/PatientDashboard'
import FindDoctors from './pages/patient/FindDoctors'
import DoctorProfile from './pages/patient/DoctorProfile'
import MyAppointments from './pages/patient/MyAppointments'
import PatientPrescriptions from './pages/patient/PatientPrescriptions'
import Profile from './pages/shared/Profile'

import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import Availability from './pages/doctor/Availability'
import Patients from './pages/doctor/Patients'
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions'
import NotFound from './pages/NotFound'
import Spinner from './components/LoadingSpinner'

function Protected({ children, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'DOCTOR' ? '/doctor' : '/patient'} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Patient area */}
      <Route path="/patient" element={<Protected role="PATIENT"><DashboardLayout role="patient" /></Protected>}>
        <Route index element={<PatientDashboard />} />
        <Route path="doctors" element={<FindDoctors />} />
        <Route path="doctors/:doctorId" element={<DoctorProfile />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Doctor area */}
      <Route path="/doctor" element={<Protected role="DOCTOR"><DashboardLayout role="doctor" /></Protected>}>
        <Route index element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="availability" element={<Availability />} />
        <Route path="patients" element={<Patients />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
