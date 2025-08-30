import api from "../api"

export const  statusChange = async (id :number,status:string)=>{
    try {
        const response = await api.patch('/status-change', {
            id,
            status,
        }, { withCredentials: true });
        console.log('status change successful:', response.data);
    } catch (error) {
        console.error('Error logging in admin:', error);
        throw error;
    }
}

export const  passwordChange = async (id :number,password:string,re_password:string)=>{
    try {
        const response = await api.patch('/password_change', {
            id,
            password,
            re_password
        }, { withCredentials: true });
        console.log(response.data);
    } catch (error) {
        console.error('Error logging in admin:', error);
        throw error;
    }
}