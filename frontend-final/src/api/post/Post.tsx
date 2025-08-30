import api from '../api';

//-------------------------------------------------admin---------------------------------------------------------------------------------

export const NewAdmin = async (
    name: string,
    email: string,
    password: string,
    company_name: string
) => {
    try {
        const response = await api.post('/users', {
            name,
            email,
            role: 'admin',
            password,
            company_name,
        });

        console.log('Admin created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating admin:', error);
        throw error;
    }
};

export const AdminLogin = async (
    email: string,
    password: string
) => {
    try {
        const response = await api.post('/login', {
            email,
            password,
        }, { withCredentials: true });

        console.log('Admin logged in successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error logging in admin:', error);
        throw error;
    }

};

interface OrderData {
    supplier_name: string
    products: { [key: string]: number }
    categories : string[]
    price : number[]
    
}

export const createOrder = async (orderData: OrderData): Promise<any> => {
    try {
        const response = await api.post("/set-orders", orderData,{ withCredentials: true })
        return response.data 
    } catch (error: any) {
        console.error("Error creating order:", error)
        const message = error.response?.data?.message || "Failed to create order"
        throw new Error(message)
    }
}

export const EmpLogin = async (
    email: string,
    password: string,
    company_name :string,
) => {
    try {
        const response = await api.post('/employee_login', {
            company_name,
            email,
            password,
        }, { withCredentials: true });

        console.log('Admin logged in successfully:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error logging in admin:', error);
        throw error;
    }

};

export const addEmployeeAPI = async (email :string , password : string, name : string) =>{
    try{
        const response = await api.post('/employee-add',{
            email,password,name,permission:"sales"
        },{ withCredentials: true });
        console.log("adding the employee is success", response.data)
        return response.data;
    
    }catch (error) {
        console.error('Error logging in admin:', error);
        throw error;
    }
}

export const makeSales = async (sale_by : number , products : Record<string, number>, price : number[],categories : string[]) =>{
    console.log(JSON.stringify({ sale_by, products, price }, null, 2));
    try{
        const response = await api.post('sale_set',
            JSON.stringify({ sale_by, products, categories ,price }, null, 2)
        ,{withCredentials:true});
        console.log("respond : ",response.data)
    }catch(error:unknown){
        console.log(error)
    }
}

