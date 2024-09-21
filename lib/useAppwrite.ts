import { useEffect, useState } from "react";
import { Models } from "react-native-appwrite";
import { Alert } from "react-native";

const useAppwrite = (fn: any) => {
  const [data, setData] = useState<Models.Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);

    const res = await fn();

    if (!res || res.isSuccess === false) {
      Alert.alert("Error", res.message || "Internal server error!");
    } else {
      setData(res.data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => fetchData();

  return { data, isLoading, refetch };
};

export default useAppwrite;
