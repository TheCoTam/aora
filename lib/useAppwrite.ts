import { useEffect, useState } from "react";
import { Models } from "react-native-appwrite";
import { getAllPosts } from "./appwrite";
import { Alert } from "react-native";

const useAppwrite = (fn: () => Promise<Models.Document[]>) => {
  const [data, setData] = useState<Models.Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const res = await fn();

      setData(res);
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => fetchData();

  return { data, isLoading, refetch };
};

export default useAppwrite;
