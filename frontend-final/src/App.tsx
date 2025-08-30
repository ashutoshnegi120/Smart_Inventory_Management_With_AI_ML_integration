// src/App.tsx
import { AuthProvider } from "./contexts/auth-context";
import AppRoutes from './AppRoutes'; // Import your routing file
import Nav from './Nav'; // Import your Nav component

function App() {
  return (
    <AuthProvider>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 min-h-screen">
        <Nav />          
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}



export default App;