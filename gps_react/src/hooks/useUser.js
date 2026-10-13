import { useState, useCallback } from "react";
import {
  getMeApi,
  getUsersApi,
  addUserApi,
  updateUserApi,
  deleteUserApi,
} from "../api/user";
import { useAuth } from "./useAuth";
export function useUser() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(null),
    [users, setUsers] = useState([]);
  const token = auth?.token;
  const getUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await getUsersApi(token));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);
  return {
    loading,
    error,
    users,
    getMe: getMeApi,
    getUsers,
    getUserss: getUsers,
    addUser: (data) => addUserApi(data, token),
    updateUser: (id, data) => updateUserApi(id, data, token),
    deleteUser: (id) => deleteUserApi(id, token),
  };
}
