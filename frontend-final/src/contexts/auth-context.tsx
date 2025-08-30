"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { AdminLogin, NewAdmin, EmpLogin, addEmployeeAPI } from '../api/post/Post';


interface User {
  id: string
  name: string
  email: string
  role: "admin" | "employee"
  avatar?: string
  department?: string
  position?: string
  joinDate?: string
  leaveBalance?: number
  contactNumber?: string
  emergencyContact?: string
  address?: string
  company_name?: string
  password ?: string

}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, company_name : string, role?: "admin" | "employee") => Promise<boolean>
  signup: (name: string, email: string, password: string, company_name: string) => Promise<boolean>
  logout: () => void
  updateUserProfile: (userData: Partial<User>) => void
  addEmployee: (form: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])



  const login = async (
    email: string,
    password: string,
    company_name : string,
    role: "admin" | "employee" = "employee",
  ): Promise<boolean> => {
    try {

      const data = role === "admin" ? await AdminLogin(email, password) : await EmpLogin(email, password,company_name);
      console.log(data)
      if (data.message === "Wrong Password") {
        setIsAuthenticated(false);
        return false;
      } else {
        const userData: User = {
          id: data.id || data.employee_id,
          name: data.name || "User",
          email: data.email,
          role: data.role || role,
          company_name: data.company_name,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }

    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };


  const signup = async (
    name: string,
    email: string,
    password: string,
    company_name: string
  ): Promise<boolean> => {
    try {
      const data = await NewAdmin(name, email, password, company_name);

      const userData: User = {
        id: data.id,
        name: data.name || name,
        email: data.email,
        role: "admin",
        company_name: company_name,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error("Signup failed:", err);
      return false;
    }

  };

  const addEmployee = async (form: Partial<User>): Promise<boolean> => {
    try {
      const { name, email, password, contactNumber } = form;
  
      if (!name || !email || !password || !contactNumber) {
        console.error("Missing required fields in employee data");
        return false;
      }
  
      // Now call the API (you may rename the import to avoid conflict)
      const data = await addEmployeeAPI( email, password,name);
      console.log("Employee added:", data);
      return true;
  
    } catch (error) {
      console.error("Failed to add employee:", error);
      return false;
    }
  };
  

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
  }

  const updateUserProfile = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...userData,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };



  if (loading) {
    return <div>Loading authentication...</div>
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        logout,
        updateUserProfile,
        addEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
