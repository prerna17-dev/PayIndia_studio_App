import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS, API_BASE_URL } from "../../constants/api";
<<<<<<< HEAD
import { CircularProfileProgress } from "../../components/CircularProfileProgress";
import { calculateProfileCompletion } from "../../utils/profileCompletion";
import { Modal } from "react-native";
=======
import Svg, { Circle } from "react-native-svg";
>>>>>>> d1142ff3cf3f85edf1e6e75ca7978b53680a6c3d

const { width } = Dimensions.get("window");

// Animated Quick Action Chip
function AnimatedChip({
  icon,
  label,
  onPress,
  delay = 0,
  bgColor = "#F1F8FE",
  borderColor = "#BBDEFB",
  iconColor = "#0D47A1",
  textColor = "#0D47A1",
}: {
  icon: string;
  label: string;
  onPress: () => void;
  delay?: number;
  bgColor?: string;
  borderColor?: string;
  iconColor?: string;
  textColor?: string;
}) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance pop
    setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, delay);

    // Icon subtle bounce loop
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconBounce, {
            toValue: -4,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(iconBounce, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.delay(1800),
        ])
      ).start();
    }, delay + 400);
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.92,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[chipStyles.chip, { backgroundColor: bgColor, borderColor }]}
      >
        <Animated.View style={{ transform: [{ translateY: iconBounce }] }}>
          <Ionicons name={icon as any} size={16} color={iconColor} />
        </Animated.View>
        <Text style={[chipStyles.chipText, { color: textColor }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F8FE",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  chipText: {
    fontSize: 13,
    color: "#0D47A1",
    fontWeight: "600",
  },
});

export default function HomeScreen({
  userName = "User",
}: {
  userName?: string;
}) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    spent: 0,
    cashback: 0,
    paidBills: 0,
    savingsPercentage: 0,
  });

  // Profile Completion States
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const fetchProfile = async () => {
    try {
      // 1. Instantly load cached profile to avoid "Welcome, User" flash
      const cachedData = await AsyncStorage.getItem("userData");
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setUserData(parsed);
        setCompletionPercentage(calculateProfileCompletion(parsed));
      }

      // 2. Fetch fresh profile data in the background
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        // Update state and cache with fresh data
        setUserData(data);
        const percentage = calculateProfileCompletion(data);
        setCompletionPercentage(percentage);
        await AsyncStorage.setItem("userData", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error fetching profile in Home:", error);
    }
  };

  const fetchReminders = async () => {
    try {
      const saved = await AsyncStorage.getItem("@my_manual_bills");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only show pending or overdue reminders
        const pendingReminders = parsed.filter((b: any) => b.status === 'pending' || b.status === 'overdue');
        setReminders(pendingReminders);
      } else {
        setReminders([]);
      }
    } catch (e) {
      console.error("Error fetching reminders:", e);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const savedSalary = await AsyncStorage.getItem("@monthly_salary");
      const salary = parseFloat(savedSalary || "0");

      let totalSpent = 0;
      let totalCashback = 0;
      let paidBillsCount = 0;

      try {
        const response = await fetch(`${API_BASE_URL}/api/wallet/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const transactions = await response.json();

        if (response.ok && Array.isArray(transactions)) {
          const now = new Date();
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

          // Filter transactions for current month
          const currentMonthTransactions = transactions.filter((t: any) => {
            const tDate = new Date(t.created_at);
            return tDate >= firstDayOfMonth;
          });

          currentMonthTransactions.forEach((t: any) => {
            const type = (t.transaction_type || "").toUpperCase().replace('_', ' ');
            const description = (t.description || "").toLowerCase();

            const isDebit = type === "WALLET DEBIT" || type === "WALLET_DEBIT" || type === "RECHARGE" || type === "BILL" || type === "BILL PAYMENT";

            // Only count as Cashback if it's explicitly a reward, not a standard top-up
            const isCashbackType = type === "CASHBACK" || type === "REWARD";
            const isCashbackDescription = description.includes("cashback") || description.includes("reward") || description.includes("refer");
            const isWalletCredit = type === "WALLET CREDIT" || type === "WALLET_CREDIT";

            if (isDebit) {
              totalSpent += parseFloat(t.amount);
              if (type.includes("BILL") || type.includes("RECHARGE")) {
                paidBillsCount++;
              }
            }

            // Exclude manual top-ups from cashback totals
            if (isCashbackType || (isWalletCredit && isCashbackDescription)) {
              totalCashback += parseFloat(t.amount);
            }
          });
        }
      } catch (apiError) {
        console.warn("Could not load transactions:", apiError);
      }

      const savings = salary > 0 ? Math.max(0, ((salary - totalSpent) / salary) * 100) : 0;

      setAnalytics({
        spent: totalSpent,
        cashback: totalCashback,
        paidBills: paidBillsCount,
        savingsPercentage: Math.round(savings),
      });

    } catch (e) {
      console.error("Error fetching analytics:", e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      fetchReminders();
      fetchAnalyticsData();
    }, [])
  );

  // Track keyboard visibility to hide bottom nav
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Show profile completion popup if incomplete
  useEffect(() => {
    const checkCompletion = async () => {
      if (userData && completionPercentage < 100) {
        const hasShown = await AsyncStorage.getItem("@profile_popup_shown");
        if (!hasShown) {
          setShowCompletionModal(true);
          await AsyncStorage.setItem("@profile_popup_shown", "true");
        }
      }
    };
    checkCompletion();
  }, [userData, completionPercentage]);

  // Handle hardware back button to exit app from Home screen
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => backHandler.remove();
    }, [])
  );

  // --- DYNAMIC SERVICE DISCOVERY ENGINE ---
  // This avoids hardcoding every single screen and automatically picks up new files
  const discoveredServices = React.useMemo(() => {
    try {
      // @ts-ignore - require.context is a Metro-specific feature for Expo
      const context = require.context("../", true, /\.tsx$/);
      const keys = context.keys();

      const SERVICE_MAP: Record<string, { icon: string; library: string; category: string; color: string; bg: string }> = {
        recharge: { icon: "phone-portrait-outline", library: "Ionicons", category: "Recharge & Bills", color: "#0D47A1", bg: "#E3F2FD" },
        bill: { icon: "receipt-outline", library: "Ionicons", category: "Recharge & Bills", color: "#F59E0B", bg: "#FFFBEB" },
        cylinder: { icon: "gas-cylinder", library: "MaterialCommunityIcons", category: "Recharge & Bills", color: "#E65100", bg: "#FFF3E0" },
        electricity: { icon: "bulb-outline", library: "Ionicons", category: "Recharge & Bills", color: "#F59E0B", bg: "#FFFBEB" },
        dth: { icon: "satellite-variant", library: "MaterialCommunityIcons", category: "Recharge & Bills", color: "#6A1B9A", bg: "#F3E5F5" },
        fastag: { icon: "highway", library: "MaterialCommunityIcons", category: "Recharge & Bills", color: "#0D47A1", bg: "#E3F2FD" },
        water: { icon: "water-outline", library: "Ionicons", category: "Recharge & Bills", color: "#0277BD", bg: "#E1F5FE" },
        gas: { icon: "pipe", library: "MaterialCommunityIcons", category: "Recharge & Bills", color: "#E65100", bg: "#FFF3E0" },
        landline: { icon: "phone-classic", library: "MaterialCommunityIcons", category: "Recharge & Bills", color: "#0D47A1", bg: "#E3F2FD" },
        cable: { icon: "television", library: "MaterialCommunityIcons", category: "Recharge & Bills", color: "#6A1B9A", bg: "#F3E5F5" },
        education: { icon: "school-outline", library: "Ionicons", category: "Recharge & Bills", color: "#0D47A1", bg: "#E3F2FD" },
        hospital: { icon: "medical-outline", library: "Ionicons", category: "Recharge & Bills", color: "#E11D48", bg: "#FFF1F2" },
        ott: { icon: "play-circle-outline", library: "Ionicons", category: "Recharge & Bills", color: "#6A1B9A", bg: "#F3E5F5" },
        municipal: { icon: "office-building", library: "MaterialCommunityIcons", category: "Recharge & Bills", color: "#0D47A1", bg: "#E3F2FD" },
        taxes: { icon: "home-city-outline", library: "MaterialCommunityIcons", category: "Recharge & Bills", color: "#0D47A1", bg: "#E3F2FD" },
        postpaid: { icon: "phone-portrait", library: "Ionicons", category: "Recharge & Bills", color: "#0D47A1", bg: "#E3F2FD" },
        broadband: { icon: "wifi-outline", library: "Ionicons", category: "Recharge & Bills", color: "#16A34A", bg: "#F0FDF4" },
        certificate: { icon: "file-certificate", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        caste: { icon: "certificate-outline", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        income: { icon: "file-certificate", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        domicile: { icon: "home-heart", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        birth: { icon: "baby-face-outline", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        death: { icon: "account-off-outline", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        marriage: { icon: "ring", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        ews: { icon: "school-outline", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        creamy: { icon: "shield-account-outline", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        seva: { icon: "card-outline", library: "Ionicons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        aadhaar: { icon: "card-account-details", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        pan: { icon: "card-text", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        voter: { icon: "card-account-mail", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        ration: { icon: "book-open-page-variant", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        satbara: { icon: "map-marker-path", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        "7/12": { icon: "map-marker-path", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        "8a": { icon: "file-document-outline", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        property: { icon: "home-city-outline", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        ferfar: { icon: "map-marker-distance", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        udyam: { icon: "factory", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        kisan: { icon: "sprout-outline", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#16A34A", bg: "#F0FDF4" },
        senior: { icon: "account-tie-outline", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        employment: { icon: "briefcase-outline", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#0D47A1", bg: "#E3F2FD" },
        ayushman: { icon: "heart-flash", library: "MaterialCommunityIcons", category: "Maha E Seva", color: "#E11D48", bg: "#FFF1F2" },
        booking: { icon: "airplane-outline", library: "Ionicons", category: "Travel", color: "#1976D2", bg: "#E3F2FD" },
        flight: { icon: "airplane-outline", library: "Ionicons", category: "Travel", color: "#1976D2", bg: "#E3F2FD" },
        train: { icon: "train-outline", library: "Ionicons", category: "Travel", color: "#C62828", bg: "#FCE4EC" },
        bus: { icon: "bus-outline", library: "Ionicons", category: "Travel", color: "#2E7D32", bg: "#E8F5E9" },
        hotel: { icon: "bed-outline", library: "Ionicons", category: "Travel", color: "#C62828", bg: "#FCE4EC" },
        wallet: { icon: "wallet-outline", library: "Ionicons", category: "Finance", color: "#4F46E5", bg: "#EDE9FE" },
        money: { icon: "analytics-outline", library: "Ionicons", category: "Finance", color: "#4F46E5", bg: "#EDE9FE" },
        bank: { icon: "office-building-outline", library: "MaterialCommunityIcons", category: "Finance", color: "#0D47A1", bg: "#E3F2FD" },
        loan: { icon: "cash-multiple", library: "MaterialCommunityIcons", category: "Finance", color: "#16A34A", bg: "#F0FDF4" },
        insurance: { icon: "shield-check-outline", library: "MaterialCommunityIcons", category: "Finance", color: "#0D47A1", bg: "#E3F2FD" },
        deposit: { icon: "calendar-clock", library: "MaterialCommunityIcons", category: "Finance", color: "#0D47A1", bg: "#E3F2FD" },
        transaction: { icon: "list-outline", library: "Ionicons", category: "Finance", color: "#4F46E5", bg: "#EDE9FE" },
        refer: { icon: "gift-outline", library: "Ionicons", category: "Offers", color: "#E65100", bg: "#FFF3E0" },
        deal: { icon: "pricetag-outline", library: "Ionicons", category: "Offers", color: "#E65100", bg: "#FFF3E0" },
        gift: { icon: "card-outline", library: "Ionicons", category: "Offers", color: "#6A1B9A", bg: "#F3E5F5" },
        autopay: { icon: "calendar-sync", library: "MaterialCommunityIcons", category: "Finance", color: "#4F46E5", bg: "#EDE9FE" },
        support: { icon: "help-circle-outline", library: "Ionicons", category: "Support", color: "#0D47A1", bg: "#E3F2FD" },
        settings: { icon: "settings-outline", library: "Ionicons", category: "Support", color: "#64748B", bg: "#F1F5F9" },
        notification: { icon: "notifications-outline", library: "Ionicons", category: "Support", color: "#1976D2", bg: "#E3F2FD" },
        account: { icon: "person-outline", library: "Ionicons", category: "Support", color: "#1976D2", bg: "#E3F2FD" },
        track: { icon: "search-outline", library: "Ionicons", category: "Support", color: "#0D47A1", bg: "#E3F2FD" },
        logout: { icon: "log-out-outline", library: "Ionicons", category: "Security", color: "#E53935", bg: "#FFEBEE" },
      };

      const services = keys
        .filter((key: string) => {
          const filename = key.split("/").pop() || "";
          return (
            !filename.startsWith("_") &&
            !filename.startsWith("+") &&
            filename !== "index.tsx" &&
            filename !== "modal.tsx"
          );
        })
        .map((key: string) => {
          let route = key.replace("./", "/").replace(".tsx", "");
          if (route.endsWith("/index")) route = route.replace("/index", "");

          const basename = key.split("/").pop()?.replace(".tsx", "") || "";
          const label = basename
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
            .replace("Aadhaar", "Aadhar")
            .replace("Udyam", "Udyam Registration")
            .replace("My Money", "My Money Analytics");

          const lowerBasename = basename.toLowerCase();
          let config = { icon: "apps-outline", library: "Ionicons", category: "Other Services", color: "#64748B", bg: "#F1F5F9" };

          for (const [keyword, value] of Object.entries(SERVICE_MAP)) {
            if (lowerBasename.includes(keyword)) {
              config = value;
              break;
            }
          }

          return { label, route, ...config };
        });

      // Add Virtual Services (Actions that are not screens)
      services.push({
        label: "Logout",
        route: "/account", // Direct to account for logout modal trigger
        icon: "log-out-outline",
        library: "Ionicons",
        category: "Security",
        color: "#E53935",
        bg: "#FFEBEE"
      });

      return services;
    } catch (e) {
      console.warn("Discovery failed", e);
      return [];
    }
  }, []);

  const SEARCHABLE_SERVICES = discoveredServices;


  // Ads data
  const ads = [
    {
      id: 1,
      title: "Mobile Recharge",
      discount: "Get 10% Cashback",
      description: "On recharges above â‚¹299",
      code: "MOBILE10",
      colors: ["#B3E5FC", "#4FC3F7"] as [string, string],
      iconName: "phone-portrait",
      iconType: "ionicon",
      iconColor: "#0277BD",
      textColor: "#01579B",
      badge: "HOT DEAL",
      badgeColor: "#0277BD",
    },
    {
      id: 2,
      title: "DTH Recharge",
      discount: "Flat 150 OFF",
      description: "On all DTH subscriptions",
      code: "DTH50",
      colors: ["#FFE0B2", "#FF9800"] as [string, string],
      iconName: "satellite-variant",
      iconType: "material",
      iconColor: "#E65100",
      textColor: "#5D4E37",
      badge: "EXCLUSIVE",
      badgeColor: "#E65100",
    },
    {
      id: 3,
      title: "Electricity Bill",
      discount: "5% Cashback",
      description: "Max cashback â‚¹100",
      code: "POWER5",
      colors: ["#C8E6C9", "#4CAF50"] as [string, string],
      iconName: "bulb",
      iconType: "ionicon",
      iconColor: "#2E7D32",
      textColor: "#1B5E20",
      badge: "SAVE MORE",
      badgeColor: "#2E7D32",
    },
    {
      id: 4,
      title: "OTT Plans",
      discount: "15% OFF",
      description: "On annual subscriptions",
      code: "OTT15",
      colors: ["#E1BEE7", "#9C27B0"] as [string, string],
      iconName: "television-play",
      iconType: "material",
      iconColor: "#6A1B9A",
      textColor: "#4A148C",
      badge: "LIMITED",
      badgeColor: "#6A1B9A",
    },
  ];

  // Auto-scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % ads.length;

        // Scroll to the next ad
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: nextIndex * (width - 40),
            animated: true,
          });
        }

        return nextIndex;
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(timer);
  }, [ads.length]);

  const onMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (width - 40));
    setCurrentAdIndex(index);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Profile Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => setShowCompletionModal(false)}
          />
          <View style={styles.completionCard}>
            <LinearGradient
              colors={["#FFFFFF", "#F1F8FE"]}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View style={styles.progressCircleContainer}>
                  <CircularProfileProgress
                    size={90}
                    strokeWidth={6}
                    percentage={completionPercentage}
                    progressColor="#0D47A1"
                  >
                    <View style={styles.percentageContainer}>
                      <Text style={styles.percentageText}>{completionPercentage}%</Text>
                    </View>
                  </CircularProfileProgress>
                </View>
              </View>

              <Text style={styles.modalTitle}>Complete Your Profile</Text>
              <Text style={styles.modalSubtitle}>
                Unlock all features and get personalized offers by completing your profile.
              </Text>

              <View style={styles.benefitsContainer}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={styles.benefitText}>Better Security</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={styles.benefitText}>Instant Support</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={styles.benefitText}>Exclusive Rewards</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => {
                  setShowCompletionModal(false);
                  router.push("/personal-details");
                }}
              >
                <LinearGradient
                  colors={["#0D47A1", "#1976D2"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.completeButtonText}>Complete Now</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.maybeLaterButton}
                onPress={() => setShowCompletionModal(false)}
              >
                <Text style={styles.maybeLaterText}>Maybe Later</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={styles.safeArea}>
        {/* Fixed Header Row - Stays at top while scrolling */}
        <LinearGradient
          colors={["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 4, y: 4 }}
          style={styles.fixedHeader}
        >
          <View style={styles.topRow}>
            {/* Left Side - Logo and App Name */}
            <View style={styles.leftSection}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Text style={styles.appNameHeader}>PayIndia</Text>
            </View>

            {/* Right Icons - Notification & Profile */}
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => router.push("/notifications")}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color="#1976D2"
                  />
                  {hasNewNotifications && (
                    <View style={styles.notificationDot} />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => router.push("/account")}
              >
                <View style={[styles.iconWrapper, styles.profileWrapper]}>
                  <CircularProfileProgress
                    size={32}
                    strokeWidth={2.5}
                    percentage={completionPercentage}
                    progressColor={completionPercentage === 100 ? "#4CAF50" : "#FF9800"}
                  >
                    {userData?.profile_image ? (
                      <Image
                        source={{
                          uri: userData.profile_image.startsWith("http")
                            ? userData.profile_image
                            : `${API_BASE_URL}${userData.profile_image}`
                        }}
                        style={styles.profileThumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="person" size={20} color="#1976D2" />
                    )}
                  </CircularProfileProgress>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Section - Blue Gradient with Mountains & Trees */}
          <LinearGradient
            colors={["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 4, y: 4 }}
            style={styles.header}
          >
            {/* Decorative Wave */}
            <View style={styles.decorativeWave} />

            {/* Centered Tagline */}
            <View style={styles.taglineSection}>
              <Text style={styles.taglineText}>Welcome, {userData?.name || "User"}</Text>
              <Text style={styles.taglineSubText}>All Digital Seva at One Place</Text>
            </View>

            {/* Mountain and Trees Background */}
            <View style={styles.landscapeContainer}>
              {/* Mountains */}
              <View style={styles.mountainBack} />
              <View style={styles.mountainFront} />

              {/* Trees */}
              <View style={styles.treeLeft}>
                <View style={styles.treeTop} />
                <View style={styles.treeTrunk} />
              </View>

              <View style={styles.treeRight}>
                <View style={styles.treeTop} />
                <View style={styles.treeTrunk} />
              </View>
            </View>
          </LinearGradient>

          {/* Functional Search Bar */}
          <View style={{ marginHorizontal: 20, marginBottom: 16, marginTop: -10, zIndex: 50 }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 4, borderRadius: 16, shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: searchQuery ? "#3B82F6" : "#F1F5F9" }}>
              <Ionicons name="search" size={20} color={searchQuery ? "#3B82F6" : "#94A3B8"} />
              <TextInput
                style={{ flex: 1, fontSize: 14, color: "#1F2937", marginLeft: 10, fontWeight: "500", paddingVertical: 9 }}
                placeholder="Search for a service or provider..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results Dropdown */}
            {searchQuery.length > 0 && (
              <View style={{ position: "absolute", top: 60, left: 0, right: 0, backgroundColor: "#FFFFFF", borderRadius: 20, shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15, maxHeight: 400, borderWidth: 1, borderColor: "#E2E8F0", overflow: "hidden" }}>
                <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#F8FAFC", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 0.5 }}>SEARCH RESULTS</Text>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                  {SEARCHABLE_SERVICES.filter(s =>
                    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.category.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 ? (
                    <View style={{ padding: 40, alignItems: "center" }}>
                      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
                        <Ionicons name="search-outline" size={32} color="#94A3B8" />
                      </View>
                      <Text style={{ fontSize: 16, color: "#475569", fontWeight: "700" }}>No services found</Text>
                      <Text style={{ fontSize: 13, color: "#94A3B8", marginTop: 4, textAlign: "center" }}>We couldn't find anything matching "{searchQuery}"</Text>
                    </View>
                  ) : (
                    SEARCHABLE_SERVICES.filter(s =>
                      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.category.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => {
                          setSearchQuery("");
                          Keyboard.dismiss();
                          if (item.route) router.push(item.route as any);
                        }}
                        style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}
                      >
                        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: item.bg, justifyContent: "center", alignItems: "center", shadowColor: item.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                          {item.library === "MaterialCommunityIcons" ? (
                            <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                          ) : (
                            <Ionicons name={item.icon as any} size={22} color={item.color} />
                          )}
                        </View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B" }}>{item.label}</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                            <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "500" }}>{item.category}</Text>
                            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#CBD5E1", marginHorizontal: 6 }} />
                            <Text style={{ fontSize: 10, color: "#94A3B8" }}>Service</Text>
                          </View>
                        </View>
                        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" }}>
                          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Quick Actions Strip */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsRow}>
              <AnimatedChip
                delay={0}
                icon="phone-portrait-outline"
                label="Recharge"
                bgColor="#E8F5E9"
                borderColor="#A5D6A7"
                iconColor="#2E7D32"
                textColor="#2E7D32"
                onPress={() => router.push("/mobile-recharge")}
              />
              <AnimatedChip
                delay={80}
                icon="bulb-outline"
                label="Electricity"
                bgColor="#FFF8E1"
                borderColor="#FFE082"
                iconColor="#F57F17"
                textColor="#F57F17"
                onPress={() => router.push("/electricity-bill")}
              />
              <AnimatedChip
                delay={160}
                icon="tv-outline"
                label="DTH"
                bgColor="#F3E5F5"
                borderColor="#CE93D8"
                iconColor="#6A1B9A"
                textColor="#6A1B9A"
                onPress={() => router.push("/dth-recharge")}
              />
              <AnimatedChip
                delay={240}
                icon="water-outline"
                label="Water Bill"
                bgColor="#E1F5FE"
                borderColor="#81D4FA"
                iconColor="#0277BD"
                textColor="#0277BD"
                onPress={() => router.push("/water-services")}
              />
              <AnimatedChip
                delay={320}
                icon="train-outline"
                label="Train"
                bgColor="#FCE4EC"
                borderColor="#F48FB1"
                iconColor="#C62828"
                textColor="#C62828"
                onPress={() => router.push("/train-booking")}
              />
              <AnimatedChip
                delay={400}
                icon="gift-outline"
                label="Refer & Earn"
                bgColor="#FFF3E0"
                borderColor="#FFCC80"
                iconColor="#E65100"
                textColor="#E65100"
                onPress={() => router.push("/refer-earn")}
              />
            </ScrollView>
          </View>

          {/* Main Content */}
          <View style={styles.content}>



            {/* Recharge & Bills Card Section */}
            <View style={styles.section}>
              <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Recharge & Bills</Text>
                  <TouchableOpacity
                    style={styles.viewMoreButton}
                    onPress={() => router.push("/more-services")}
                  >
                    <Text style={styles.viewMoreText}>View more</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.servicesRow}>
                  {/* Mobile Recharge */}
                  <TouchableOpacity
                    style={styles.serviceCardHorizontal}
                    onPress={() => router.push("/mobile-recharge")}
                  >
                    <View style={styles.iconCircle}>
                      <Ionicons
                        name="phone-portrait-outline"
                        size={24}
                        color="#0D47A1"
                      />
                    </View>
                    <Text style={styles.serviceText}>Mobile{"\n"}recharge</Text>
                  </TouchableOpacity>

                  {/* Electricity */}
                  <TouchableOpacity
                    style={styles.serviceCardHorizontal}
                    onPress={() => router.push("/electricity-bill")}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="bulb-outline" size={24} color="#0D47A1" />
                    </View>
                    <Text style={styles.serviceText}>Electricity{"\n"}bill</Text>
                  </TouchableOpacity>

                  {/* DTH Recharge */}
                  <TouchableOpacity
                    onPress={() => router.push("/dth-recharge")}
                    style={styles.serviceCardHorizontal}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name="satellite-variant"
                        size={24}
                        color="#0D47A1"
                      />
                    </View>
                    <Text style={styles.serviceText}>DTH{"\n"}recharge</Text>
                  </TouchableOpacity>

                  {/* LPG Cylinder */}
                  <TouchableOpacity
                    style={styles.serviceCardHorizontal}
                    onPress={() => router.push("/lpg-cylinder")}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name="gas-cylinder"
                        size={24}
                        color="#0D47A1"
                      />
                    </View>
                    <Text style={styles.serviceText}>LPG{"\n"}cylinder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Maha E Seva Services Card Section */}
            <View style={styles.section}>
              <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleWithBadge}>
                    <Text style={styles.cardTitle}>Maha E Seva Services</Text>
                    <View style={styles.headerNewBadge}>
                      <Text style={styles.headerNewBadgeText}>NEW</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.viewMoreButton}
                    onPress={() => router.push("/more-seva")}
                  >
                    <Text style={styles.viewMoreText}>View more</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.servicesRow}>
                  {/* Aadhar Update */}
                  <TouchableOpacity
                    style={styles.serviceCardHorizontal}
                    onPress={() => router.push("/aadhaar-services?from=explore")}
                  >
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name="card-account-details"
                        size={24}
                        color="#0D47A1"
                      />
                    </View>
                    <Text style={styles.serviceText}>Aadhar{"\n"}Update</Text>
                  </TouchableOpacity>

                  {/* Pan Card */}
                  <TouchableOpacity
                    style={styles.serviceCardHorizontal}
                    onPress={() => router.push("/pan-card-services?from=explore")}
                  >
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name="card-text"
                        size={24}
                        color="#0D47A1"
                      />
                    </View>
                    <Text style={styles.serviceText}>Pan{"\n"}Card</Text>
                  </TouchableOpacity>

                  {/* Udyam */}
                  <TouchableOpacity
                    style={styles.serviceCardHorizontal}
                    onPress={() => router.push("/udyam-services?from=explore")}
                  >
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name="factory"
                        size={24}
                        color="#0D47A1"
                      />
                    </View>
                    <Text style={styles.serviceText}>
                      Udyam{"\n"}Registration
                    </Text>
                  </TouchableOpacity>

                  {/* Income Certificate */}
                  <TouchableOpacity
                    style={styles.serviceCardHorizontal}
                    onPress={() => router.push("/income-certificate-services?from=explore")}
                  >
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name="file-certificate"
                        size={24}
                        color="#0D47A1"
                      />
                    </View>
                    <Text style={styles.serviceText}>
                      Income{"\n"}Certificate
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Travel Booking Card Section - Compact */}
            <View style={styles.section}>
              <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Travel Booking</Text>
                </View>

                <View style={styles.travelServicesRow}>
                  {/* Flight */}
                  <TouchableOpacity
                    style={styles.serviceCardHorizontal}
                    onPress={() => router.push("/flight-booking")}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name="airplane"
                        size={24}
                        color="#0D47A1"
                      />
                    </View>
                    <Text style={styles.serviceText}>Flight</Text>
                  </TouchableOpacity>

                  {/* Train */}
                  <TouchableOpacity
                    style={styles.serviceCardHorizontal}
                    onPress={() => router.push("/train-booking")}
                  >
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name="train"
                        size={24}
                        color="#0D47A1"
                      />
                    </View>
                    <Text style={styles.serviceText}>Train</Text>
                  </TouchableOpacity>

                  {/* Bus */}
                  <TouchableOpacity
                    style={styles.serviceCardHorizontal}
                    onPress={() => router.push("/bus-booking")}
                  >
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name="bus"
                        size={24}
                        color="#0D47A1"
                      />
                    </View>
                    <Text style={styles.serviceText}>Bus</Text>
                  </TouchableOpacity>

                  {/* Hotel */}
                  <TouchableOpacity
                    style={styles.serviceCardHorizontal}
                    onPress={() => Alert.alert("Redirecting", "Redirecting to our app...")}>
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name="office-building"
                        size={24}
                        color="#0D47A1"
                      />
                    </View>
                    <Text style={styles.serviceText}>Hotel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Smart Due Reminders Section */}
            <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B", letterSpacing: 0.3 }}>Due Reminders</Text>
                <TouchableOpacity
                  onPress={() => router.push("/my-bills")}
                  style={{ backgroundColor: "rgba(56, 189, 248, 0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "rgba(56, 189, 248, 0.2)" }}
                >
                  <Text style={{ fontSize: 11, color: "#0284C7", fontWeight: "600" }}>Manage →</Text>
                </TouchableOpacity>
              </View>

              {reminders.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
                  {reminders.map((item, index) => (
                    <LinearGradient
                      key={item.id || index}
                      colors={item.category.includes("Electricity") ? ["#FFF1F2", "#FFE4E6"] : ["#F0F9FF", "#E0F2FE"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ width: 180, borderRadius: 16, padding: 14, shadowColor: item.category.includes("Electricity") ? "#E11D48" : "#0284C7", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: item.category.includes("Electricity") ? "#FECDD3" : "#BAE6FD", position: "relative", overflow: "hidden" }}
                    >
                      <View style={{ position: "absolute", top: -15, right: -15, width: 60, height: 60, borderRadius: 30, backgroundColor: item.category.includes("Electricity") ? "rgba(225, 29, 72, 0.05)" : "rgba(2, 132, 199, 0.05)" }} />

                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", shadowColor: item.category.includes("Electricity") ? "#E11D48" : "#0284C7", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
                            <Ionicons name={item.icon as any || "document-text"} size={18} color={item.iconColor || (item.category.includes("Electricity") ? "#E11D48" : "#0284C7")} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E293B" }} numberOfLines={1}>{item.provider}</Text>
                            <Text style={{ fontSize: 10, color: item.status === "overdue" ? "#E11D48" : "#64748B", fontWeight: "600", marginTop: 2 }}>
                              {item.status === "overdue" ? "Overdue" : `Due: ${item.dueDate}`}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <View>
                          <Text style={{ fontSize: 9, color: "#94A3B8", fontWeight: "500", marginBottom: 2 }}>AMOUNT</Text>
                          <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A", letterSpacing: 0.5 }}>{item.amount}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => router.push("/my-bills")}
                          style={{ backgroundColor: item.category.includes("Electricity") ? "#E11D48" : "#0284C7", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, shadowColor: item.category.includes("Electricity") ? "#E11D48" : "#0284C7", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 }}
                        >
                          <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700", letterSpacing: 0.3 }}>Pay Now</Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  ))}
                </ScrollView>
              ) : (
                <LinearGradient
                  colors={["#F8FAFC", "#F1F5F9"]}
                  style={{ borderRadius: 16, padding: 20, alignItems: "center", justifyContent: "center", borderStyle: "dashed", borderWidth: 1, borderColor: "#CBD5E1" }}
                >
                  <Ionicons name="shield-checkmark-outline" size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#475569" }}>All caught up!</Text>
                  <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>No pending bills for now.</Text>
                </LinearGradient>
              )}
            </View>

            {/* Smart Analytics Mini-Summary */}
            <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
              <LinearGradient
                colors={["#4C1D95", "#d78bdbff", "#e474a1ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 24,
                  padding: 20,
                  shadowColor: "#701A75",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.35,
                  shadowRadius: 15,
                  elevation: 10,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Decorative glowing orbs */}
                <View style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(236, 72, 153, 0.2)" }} />
                <View style={{ position: "absolute", bottom: -30, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(167, 139, 250, 0.2)" }} />

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
                        <Ionicons name="pie-chart" size={16} color="#FBCFE8" />
                      </View>
                      <Text style={{ fontSize: 15, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.3 }}>Smart Analytics</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: "#FBCFE8", fontWeight: "600", marginBottom: 4 }}>This Month's Overview</Text>
                    <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 14 }}>Track your expenses and optimize your savings effectively.</Text>
                  </View>

                  <View style={{ alignItems: "flex-end", justifyContent: "space-between", paddingLeft: 10 }}>
                    <TouchableOpacity
                      onPress={() => router.push("/mymoney")}
                      style={{ backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                    >
                      <Text style={{ fontSize: 11, color: "#FFFFFF", fontWeight: "800", letterSpacing: 0.5 }}>Insights  →</Text>
                    </TouchableOpacity>

                    {/* SVG-based Circular Progress */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 }}>
                      <View>
                        <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: "600", textAlign: "right", letterSpacing: 0.5 }}>SAVINGS</Text>
                        <Text style={{ fontSize: 12, color: "#FBCFE8", fontWeight: "bold", textAlign: "right" }}>Goal</Text>
                      </View>
                      <View style={{ width: 44, height: 44, justifyContent: "center", alignItems: "center", shadowColor: "#34D399", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8 }}>
                        <Svg width={44} height={44} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
                          <Circle
                            cx={22}
                            cy={22}
                            r={18}
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth={4}
                            fill="rgba(255,255,255,0.05)"
                          />
                          <Circle
                            cx={22}
                            cy={22}
                            r={18}
                            stroke="#34D399"
                            strokeWidth={4}
                            strokeDasharray={113.1}
                            strokeDashoffset={113.1 - ((isNaN(analytics.savingsPercentage) ? 0 : Math.min(Math.max(analytics.savingsPercentage, 0), 100)) / 100) * 113.1}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </Svg>
                        <Text style={{ fontSize: 11, fontWeight: "900", color: "#ffffffff" }}>{analytics.savingsPercentage}%</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Data Row */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 }}>
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "600", marginBottom: 6, letterSpacing: 0.5 }}>SPENT</Text>
                    <Text style={{ fontSize: 18, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 }}>₹{analytics.spent.toLocaleString()}</Text>
                  </View>

                  <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 4 }} />

                  <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "600", marginBottom: 6, letterSpacing: 0.5 }}>CASHBACK</Text>
                    <Text style={{ fontSize: 18, fontWeight: "900", color: "#4ffcbcff", letterSpacing: 0.5 }}>+₹{analytics.cashback.toLocaleString()}</Text>
                  </View>

                  <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 4 }} />

                  <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "600", marginBottom: 6, letterSpacing: 0.5 }}>PAID BILLS</Text>
                    <Text style={{ fontSize: 18, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 }}>{analytics.paidBills.toString().padStart(2, '0')}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Refer & Earn Mega Banner */}
            <View style={[styles.referSection, { shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10 }]}>
              <LinearGradient colors={["#F3E8FF", "#EBEBFF", "#DBEAFE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.referGradient}>
                <View style={[styles.referCircle1, { backgroundColor: "rgba(59, 130, 246, 0.05)" }]} />
                <View style={[styles.referCircle2, { backgroundColor: "rgba(147, 51, 234, 0.05)" }]} />
                <View style={styles.referLeft}>
                  <View style={[styles.referBadge, { backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }]}>
                    <Text style={[styles.referBadgeText, { color: "#3B82F6" }]}>MEGA REWARD</Text>
                  </View>
                  <Text style={[styles.referHeadline, { color: "#1A1A1A" }]}>Refer & Earn</Text>
                  <Text style={[styles.referSub, { color: "#4B5563" }]}>Invite friends and earn up to ₹500 on their first payment!</Text>
                  <TouchableOpacity style={[styles.referBtn, { backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 }]} onPress={() => router.push("/refer-earn")}>
                    <Text style={[styles.referBtnText, { color: "#3B82F6" }]}>Invite Now</Text>
                    <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
                <View style={styles.referRight}>
                  <View style={[styles.referIconWrap, { backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }]}>
                    <Ionicons name="gift" size={36} color="#3B82F6" />
                  </View>
                  <Text style={[styles.referCode, { color: "#4B5563" }]}>Your Code</Text>
                  <View style={[styles.referCodeBox, { backgroundColor: "rgba(255, 255, 255, 0.6)", borderColor: "#DBEAFE", borderWidth: 1 }]}>
                    <Text style={[styles.referCodeText, { color: "#3B82F6" }]}>PayIndia</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Deals & Offers Section */}
            <View style={styles.dealsSection}>
              <View style={styles.dealsSectionHeader}>
                <View style={styles.dealsTitleRow}>

                  <Text style={styles.dealsTitle}>Deals & Offers</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/deals-offers")}>
                  <Text style={styles.dealsSeeAll}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.adsContainer}>
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={true}
                  onMomentumScrollEnd={onMomentumScrollEnd}
                  style={styles.adsScrollView}
                >
                  {ads.map((ad) => (
                    <TouchableOpacity
                      key={ad.id}
                      style={styles.adCard}
                      activeOpacity={0.92}
                    >
                      <LinearGradient
                        colors={ad.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.adGradient}
                      >
                        {/* Decorative circles */}
                        <View style={[styles.adCircle, styles.adCircleLg]} />
                        <View style={[styles.adCircle, styles.adCircleSm]} />

                        {/* Left: info */}
                        <View style={styles.adLeft}>
                          <View style={[styles.adBadge, { backgroundColor: ad.badgeColor }]}>
                            <Text style={styles.adBadgeText}>{ad.badge}</Text>
                          </View>
                          <Text style={[styles.adTitle, { color: ad.textColor }]}>{ad.title}</Text>
                          <Text style={[styles.adDescription, { color: ad.textColor }]}>{ad.description}</Text>
                          <View style={styles.adCodeChip}>
                            <Text style={[styles.adCodeLabel, { color: ad.textColor }]}>USE </Text>
                            <Text style={[styles.adCodeValue, { color: ad.badgeColor }]}>{ad.code}</Text>
                          </View>
                        </View>

                        {/* Right: big discount */}
                        <View style={styles.adRight}>
                          <View style={[styles.adIconBubble, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                            {ad.iconType === "ionicon" ? (
                              <Ionicons name={ad.iconName as any} size={26} color={ad.iconColor} />
                            ) : (
                              <MaterialCommunityIcons name={ad.iconName as any} size={26} color={ad.iconColor} />
                            )}
                          </View>
                          <Text style={[styles.adDiscountBig, { color: ad.textColor }]}>{ad.discount}</Text>
                          <View style={[styles.adClaimBtn, { borderColor: ad.textColor }]}>
                            <Text style={[styles.adClaimText, { color: ad.textColor }]}>Claim  →</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Pagination Dots */}
                <View style={styles.paginationContainer}>
                  {ads.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        currentAdIndex === index && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Gift Cards & Vouchers Section */}
            <View style={styles.section}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, marginHorizontal: 20 }}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 0, marginBottom: 0 }]}>Gift Cards & Vouchers</Text>
                <TouchableOpacity onPress={() => router.push("/gift-cards-vouchers")}>
                  <Text style={styles.dealsSeeAll}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.cardContainer, { paddingHorizontal: 0, paddingVertical: 10 }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.vouchersScroll, { paddingHorizontal: 15 }]}>
                  {[
                    { name: "Amazon", icon: "cart", lib: "Ionicons", color: "#FF9900", bg: "#FFF7ED" },
                    { name: "Flipkart", icon: "cart", lib: "Ionicons", color: "#2874F0", bg: "#F0F9FF" },
                    { name: "Swiggy", icon: "hamburger", lib: "MaterialCommunityIcons", color: "#F97316", bg: "#FFF7ED" },
                    { name: "Zomato", icon: "alpha-z", lib: "MaterialCommunityIcons", color: "#E23744", bg: "#FFF1F2" },
                    { name: "MMT", icon: "airplane", lib: "Ionicons", color: "#1976D2", bg: "#F0F9FF" },
                    { name: "Netflix", icon: "netflix", lib: "MaterialCommunityIcons", color: "#E50914", bg: "#FEE2E2" },
                  ].map((v, i) => (
                    <TouchableOpacity key={i} style={styles.voucherCard} onPress={() => router.push("/gift-cards-vouchers")}>
                      <View style={[styles.voucherIconCircle, { backgroundColor: v.bg, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" }]}>
                        {v.lib === "Ionicons" ? (
                          <Ionicons name={v.icon as any} size={28} color={v.color} />
                        ) : (
                          <MaterialCommunityIcons name={v.icon as any} size={v.name === "Zomato" ? 48 : v.name === "Netflix" ? 38 : 28} color={v.color} />
                        )}
                      </View>
                      <Text style={styles.voucherName} numberOfLines={1}>{v.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Rate Us & Feedback Card */}
            <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
              <LinearGradient colors={["#E0F2FE", "#F0F9FF"]} style={{ flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 20, justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "900", color: "#1E3A8A" }}>Enjoying PayIndia?</Text>
                  <Text style={{ fontSize: 12, color: "#3B82F6", marginTop: 2, marginBottom: 8 }}>Help us grow by rating us!</Text>
                  <View style={{ flexDirection: "row" }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name="star" size={20} color="#F59E0B" style={{ marginRight: 4 }} />
                    ))}
                  </View>
                </View>
                <TouchableOpacity style={{ backgroundColor: "#1E3A8A", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: "#FFFFFF" }}>Rate App</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>


            {/* 24/7 Support & Security "Trust Strip" */}
            <View style={{ marginHorizontal: 20, marginBottom: 24, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>100% Secure</Text>
              </View>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1" }} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="headset" size={16} color="#3B82F6" />
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>24/7 Support</Text>
              </View>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1" }} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="card" size={16} color="#F59E0B" />
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>Trust & Safe</Text>
              </View>
            </View>

            {/* "Made in India" Footer */}
            <View style={{ alignItems: "center", marginTop: 40, marginBottom: 30 }}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#64748B" }}>
                Made with <Ionicons name="heart" size={14} color="#EF4444" /> in India
              </Text>
              <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 4, fontWeight: "600" }}>PayIndia • version 1.0.0</Text>
            </View>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>

        {/* Bottom Navigation - Hidden when keyboard is open */}
        {!isKeyboardVisible && (
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="home" size={24} color="#2196F3" />
              <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push("/mymoney")}
            >
              <Ionicons name="wallet-outline" size={24} color="#999" />
              <Text style={styles.navText}>My Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push("/transactions")}
            >
              <Ionicons name="time-outline" size={24} color="#999" />
              <Text style={styles.navText}>Transactions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.replace("/wallet")}
            >
              <Ionicons name="card-outline" size={24} color="#999" />
              <Text style={styles.navText}>Wallet</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  safeArea: {
    flex: 1,
  },

  header: {
    paddingTop: 10,
    paddingBottom: 25,
    position: "relative",
    overflow: "hidden",
    marginBottom: 20,
  },

  fixedHeader: {
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  decorativeWave: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    top: -80,
    right: -80,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40, // Increased padding for better spacing
    paddingBottom: 8,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileButton: {
    padding: 0,
  },

  appNameHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D47A1",
    letterSpacing: 0.5,
  },

  headerLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    marginRight: 10,
  },

  headerIcons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  headerIconButton: {
    padding: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  profileWrapper: {
    backgroundColor: "#E3F2FD",
    borderColor: "#BBDEFB",
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#FF5252",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  // Centered Tagline Section
  taglineSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
    zIndex: 1,
  },
  taglineText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000000",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  taglineSubText: {
    fontSize: 14,
    color: "#000000",
    opacity: 0.7,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },

  // Landscape Background - Mountains & Trees
  landscapeContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 0,
  },

  // Mountains
  mountainBack: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderBottomWidth: 70,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#81D4FA",
    opacity: 0.6,
  },

  mountainFront: {
    position: "absolute",
    bottom: 0,
    right: "15%",
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderBottomWidth: 85,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#4FC3F7",
    opacity: 0.5,
  },

  // Trees
  treeLeft: {
    position: "absolute",
    bottom: 3,
    left: "10%",
    alignItems: "center",
  },

  treeRight: {
    position: "absolute",
    bottom: 3,
    right: "8%",
    alignItems: "center",
  },

  treeTop: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 35,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#4CAF50",
  },

  treeTrunk: {
    width: 8,
    height: 15,
    backgroundColor: "#5D4E37",
    marginTop: -5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
    letterSpacing: 0.3,
    paddingHorizontal: 20,
  },

  content: {
    backgroundColor: "#FFFFFF",
  },

  section: {
    marginBottom: 16,
  },

  // Card Container Styles - REDUCED PADDING
  cardContainer: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 4,
    elevation: 0,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },

  viewMoreButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },

  viewMoreText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },

  // Services Row - NO SCROLLING
  servicesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },

  serviceCardHorizontal: {
    alignItems: "center",
    width: 70,
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 26,
    backgroundColor: "#F1F8FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },

  serviceText: {
    fontSize: 11,
    color: "#1A1A1A",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 12,
  },

  // Travel Services Row - COMPACT
  travelServicesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },

  // Auto-scrollable Ads Container
  adsContainer: {
    paddingHorizontal: 20,
  },

  adsScrollView: {
    width: width - 40,
  },


  // Pagination Dots
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },

  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },

  paginationDotActive: {
    backgroundColor: "#2196F3",
    width: 24,
  },

  viewAllArrow: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 10,
  },

  vouchersScroll: {
    paddingHorizontal: 20,
    gap: 15,
  },
  voucherCard: {
    alignItems: "center",
    width: 70,
  },
  voucherIconCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  voucherName: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    fontWeight: "600",
  },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  navText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  navTextActive: {
    color: "#2196F3",
    fontWeight: "600",
  },

  // Wallet Balance Card
  walletCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  walletGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  walletLeft: {
    flex: 1,
  },
  walletIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  walletLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  walletSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "400",
  },
  walletRight: {
    alignItems: "flex-end",
    gap: 10,
  },
  addMoneyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  addMoneyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0D47A1",
  },
  walletHistoryBtn: {
    paddingVertical: 2,
  },
  walletHistoryText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },

  // Quick Actions
  quickActionsSection: {
    marginBottom: 16,
    paddingTop: 4,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 10,
    paddingHorizontal: 20,
    letterSpacing: 0.3,
  },
  quickActionsRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F8FE",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  quickChipText: {
    fontSize: 13,
    color: "#0D47A1",
    fontWeight: "600",
  },

  // Deals & Offers section header
  dealsSection: { marginBottom: 16 },
  dealsSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 12 },
  dealsTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dealsFire: { fontSize: 20 },
  dealsTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A", letterSpacing: 0.3 },
  dealsSeeAll: { fontSize: 13, color: "#2196F3", fontWeight: "600" },

  // Ad card redesign
  adCard: { width: width - 40, height: 140, borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 8 },
  adGradient: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, overflow: "hidden" },
  adCircle: { position: "absolute", borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.12)" },
  adCircleLg: { width: 130, height: 130, bottom: -40, right: -20 },
  adCircleSm: { width: 70, height: 70, top: -25, right: 80 },
  adLeft: { flex: 1, justifyContent: "center", paddingRight: 10 },
  adRight: { alignItems: "center", justifyContent: "center", gap: 8 },
  adBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 8 },
  adBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold", letterSpacing: 0.5 },
  adIconBubble: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  adTitle: { fontSize: 13, fontWeight: "800", letterSpacing: 0.2, marginBottom: 2 },
  adDiscountBig: { fontSize: 18, fontWeight: "900", textAlign: "center", letterSpacing: 0.5 },
  adDescription: { fontSize: 10, opacity: 0.85, marginBottom: 8 },
  adCodeChip: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.35)", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, alignSelf: "flex-start" },
  adCodeLabel: { fontSize: 10, fontWeight: "600" },
  adCodeValue: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  adClaimBtn: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12 },
  adClaimText: { fontSize: 11, fontWeight: "700" },


  // Trust Stats Strip
  statsStrip: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", marginHorizontal: 20, marginBottom: 20, backgroundColor: "#FFFFFF", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, borderWidth: 1, borderColor: "#E3F2FD" },
  statItem: { alignItems: "center", flex: 1 },
  statNumber: { fontSize: 18, fontWeight: "900", color: "#0D47A1", letterSpacing: 0.3 },
  statLabel: { fontSize: 10, color: "#757575", fontWeight: "500", marginTop: 2, textAlign: "center" },
  statDivider: { width: 1, height: 32, backgroundColor: "#BBDEFB" },

  // Refer & Earn Banner
  referSection: { marginHorizontal: 20, marginBottom: 24, borderRadius: 20, overflow: "hidden", shadowColor: "#6A1B9A", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10 },
  referGradient: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 20, overflow: "hidden" },
  referCircle1: { position: "absolute", width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.1)", top: -50, right: -30 },
  referCircle2: { position: "absolute", width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.08)", bottom: -30, right: 60 },
  referLeft: { flex: 1, paddingRight: 12 },
  referBadge: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.25)", paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12, marginBottom: 8 },
  referBadgeText: { fontSize: 10, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },
  referHeadline: { fontSize: 26, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5, marginBottom: 2 },
  referSub: { fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: "400", marginBottom: 12, lineHeight: 15 },
  referBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: "flex-start" },
  referBtnText: { fontSize: 13, fontWeight: "700", color: "#6A1B9A" },
  referRight: { alignItems: "center", gap: 8 },
  referIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  referCode: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  referCodeBox: { backgroundColor: "rgba(255,255,255,0.25)", paddingVertical: 4, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
  referCodeText: { fontSize: 13, fontWeight: "900", color: "#FFFFFF", letterSpacing: 1.5 },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerNewBadge: {
    backgroundColor: "#178302ff",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
    marginLeft: 4,
  },
  headerNewBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  completionCard: {
    width: width * 0.85,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalGradient: {
    padding: 24,
    alignItems: "center",
  },
  modalHeader: {
    marginBottom: 20,
  },
  progressCircleContainer: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 60,
    elevation: 4,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  percentageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0D47A1",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  benefitsContainer: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  completeButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 12,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  maybeLaterButton: {
    paddingVertical: 8,
  },
  maybeLaterText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },
  completionBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completionBadgeText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "700",
  },
});