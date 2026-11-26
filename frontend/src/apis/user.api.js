import api from "../utils/axios";

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/api/auth/current-user");
    return response.data;
  } catch (error) {
    return null;
  }
};

export const useCoins = async (data) => {
  try {
    const response = await api.post("/api/auth/use-coins", data);
    return response.data; // we return those data from oour backend controller
  } catch (error) {
    throw error;
  }
};
