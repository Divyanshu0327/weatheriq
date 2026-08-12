import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WeatherProvider } from './context/WeatherContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WeatherProvider>
          <AppRoutes />
        </WeatherProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
