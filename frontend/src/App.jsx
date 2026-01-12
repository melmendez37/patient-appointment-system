import {Routes, Route} from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardLayout from './pages/dashboard/DashboardLayout.jsx'
import ViewAppointments from './pages/dashboard/ViewAppointments.jsx'
import ViewSchedules from './pages/dashboard/ViewSchedules.jsx'
import ViewProfile from './pages/dashboard/ViewProfile.jsx'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<HomePage />}/>
      <Route path='/login' element={<LoginPage />}/>
      <Route path='/dashboard' element={<DashboardLayout/>}>
        <Route path='appointments' element={<ViewAppointments/>}/>
        <Route path='schedules' element={<ViewSchedules/>}/>
        <Route path='profile' element={<ViewProfile/>}/>
      </Route>
    </Routes>
  )
}

export default App