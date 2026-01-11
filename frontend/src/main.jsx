import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { AuthContextProvider } from './context/AuthContext'
import { AppointmentsContextProvider } from './context/AppointmentContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthContextProvider>
      <AppointmentsContextProvider>
        <App />
      </AppointmentsContextProvider>
    </AuthContextProvider>
  </BrowserRouter>,

)
