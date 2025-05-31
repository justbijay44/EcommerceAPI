import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Set token in headers
export const setAuthToken = (token) =>{
  if (token){
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else{
    delete api.defaults.headers.common["Authorization"];
  }
};

// Get products
export const getProducts = async () => {
  try{
    const response = await api.get("/products/");
    return response.data;
  } catch (error) {
    console.error('Fetch products error:', error.response?.status, error.message);
    throw error;
  }
};

// Get JWT token
export const getToken = async (username, password) => {
  try{
    const response = await api.post("/token/", {
      username,
      password,
    });
    return response.data.access;
  } catch (error) {
    console.error('Fetch token error:', error.response?.status, error.message);
    throw error;
  }
};