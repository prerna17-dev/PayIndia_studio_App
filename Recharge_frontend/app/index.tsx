import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncProfileCache } from '../utils/profileCompletion';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [targetRoute, setTargetRoute] = useState<any>(null);

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    try {
      // Pre-load user data into memory cache for zero-latency screen loading
      const cachedData = await AsyncStorage.getItem("userData");
      if (cachedData) syncProfileCache(JSON.parse(cachedData));

      const hasLaunched = await AsyncStorage.getItem('hasLaunched');

      if (hasLaunched === null) {
        // First time launch
        setTargetRoute("/get-started");
      } else {
        const token = await AsyncStorage.getItem('userToken');
        setTargetRoute(token ? "/(tabs)/explore" : "/auth/login");
      }
    } catch (e) {
      setTargetRoute("/auth/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !targetRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#247189" />
      </View>
    );
  }

  return <Redirect href={targetRoute} />;
}
