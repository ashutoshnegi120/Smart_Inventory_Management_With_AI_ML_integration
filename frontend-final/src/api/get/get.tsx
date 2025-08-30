import axios from "axios";
import api from "../api";

export const getInventoryOrder = async () => {
    try {
        const response = await api.get("/display-orders",{withCredentials: true});
        console.log("Inventory data:", response.data);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error("Server responded with error:", error.response.data);
            } else if (error.request) {
                console.error("Request was made but no response received:", error.request);
            } else {
                console.error("Error setting up request:", error.message);
            }
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
    
};

export const getInventoryData = async ()=>{
    try{
        const response = await api.get("/get_inventory",{withCredentials : true});
        console.log("getInventoryData :", response.data);
        return response.data;
    }catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error("Server responded with error:", error.response.data);
            } else if (error.request) {
                console.error("Request was made but no response received:", error.request);
            } else {
                console.error("Error setting up request:", error.message);
            }
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }

};


export const getEmployee = async ()=>{
    try{
        const response = await api.get("/show-all-emp",{withCredentials : true});
        console.log(response.data);
        return response.data;
    }catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error("Server responded with error:", error.response.data);
            } else if (error.request) {
                console.error("Request was made but no response received:", error.request);
            } else {
                console.error("Error setting up request:", error.message);
            }
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }

};

