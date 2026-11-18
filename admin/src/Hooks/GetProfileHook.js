import { useEffect, useState } from "react";
import { showAxiosError } from "../config/Toast";
import { API } from "../config/urls";

export const getProfileHook = () => {
  const [data, setData] = useState();

  const getProfile = async () => {
    try {
      const resp = await API.get("/api/login/profile");
      setData(resp.data);
    } catch (error) {
      showAxiosError(error);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return {
    data,
  };
};
