import { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";

export default function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get("/auth/profile");
        setUser(res.data.user);
      } catch (err) {
        console.log("User fetch error:", err);
      }
    };

    fetchUser();
  }, []);

  return user;
}