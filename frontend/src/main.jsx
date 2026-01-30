import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { AuthContextProvider } from './context/AuthContext'
import { AppointmentsContextProvider } from './context/AppointmentContext.jsx'
import { AvailabilitiesContextProvider } from './context/AvailabilityContext.jsx'
import { UsersContextProvider } from './context/UsersContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthContextProvider>
      <UsersContextProvider>
        <AppointmentsContextProvider>
        <AvailabilitiesContextProvider>
          <App />
        </AvailabilitiesContextProvider>
      </AppointmentsContextProvider>
      </UsersContextProvider>
    </AuthContextProvider>
  </BrowserRouter>,

)
