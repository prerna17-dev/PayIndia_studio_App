import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RazorpayCheckout from "react-native-razorpay";
import { API_ENDPOINTS } from "../../constants/api";

export default function WalletScreen() {
  const router = useRouter();
  const [balance, setBalance] = useState("0.00");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchWalletBalance();
    }, [])
  );

  const fetchWalletBalance = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.wallet_balance ? parseFloat(data.wallet_balance).toFixed(2) : "0.00");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const showMsg = (title: string, msg: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  const handleAddMoney = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showMsg("Invalid Amount", "Please enter a valid amount to add.");
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Please log in first");

      const orderResponse = await fetch(API_ENDPOINTS.CREATE_PAYMENT_ORDER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: numAmount }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // ── WEB: Use Razorpay browser checkout script ──
      if (Platform.OS === "web") {
        const verifyAndCredit = async (data: any) => {
          const verifyResponse = await fetch(API_ENDPOINTS.VERIFY_PAYMENT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: data.razorpay_order_id,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
              amount: numAmount,
            }),
          });
          const verifyData = await verifyResponse.json();
          if (verifyResponse.ok && verifyData.success) {
            showMsg("Success ✅", "Money added to your wallet!");
            setAmount("");
            fetchWalletBalance();
          } else {
            showMsg("Error", verifyData.message || "Payment verification failed.");
          }
        };

        // Load Razorpay checkout.js if not already loaded
        const loadRazorpayScript = () =>
          new Promise<void>((resolve) => {
            if ((window as any).Razorpay) return resolve();
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve();
            document.body.appendChild(script);
          });

        await loadRazorpayScript();

        const rzpOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "PayIndia Studio",
          description: "Add Money to Wallet",
          order_id: orderData.orderId,
          handler: verifyAndCredit,
          theme: { color: "#2196F3" },
        };

        const rzp = new (window as any).Razorpay(rzpOptions);
        rzp.open();
        setIsLoading(false);
        return;
      }

      // ── NATIVE (Expo Go / APK): Use react-native-razorpay ──
      const options = {
        description: "Add Money to PayIndia Wallet",
        currency: orderData.currency,
        key: orderData.keyId,
        amount: orderData.amount.toString(),
        name: "PayIndia Studio",
        order_id: orderData.orderId,
        theme: { color: "#2196F3" },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          const verifyResponse = await fetch(API_ENDPOINTS.VERIFY_PAYMENT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: data.razorpay_order_id,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
              amount: numAmount,
            }),
          });

          const verifyData = await verifyResponse.json();
          if (verifyResponse.ok && verifyData.success) {
            showMsg("Success", "Money added to your wallet successfully!");
            setAmount("");
            fetchWalletBalance();
          } else {
            showMsg("Error", verifyData.message || "Payment verification failed.");
          }
        })
        .catch((error: any) => {
          showMsg("Payment Cancelled", "Payment failed or was cancelled.");
          console.error("Razorpay Error:", error);
        });
    } catch (error: any) {
      console.error(error);
      showMsg("Error", error.message || "Failed to initiate payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <LinearGradient
          colors={["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
              <Ionicons name="arrow-back" size={24} color="#0D47A1" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>PayIndia Wallet</Text>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Balance Card */}
          <LinearGradient
            colors={["#0D47A1", "#1976D2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Current Wallet Balance</Text>
            <Text style={styles.balanceAmount}>₹{balance}</Text>
          </LinearGradient>

          {/* Add Money Input */}
          <View style={styles.addMoneySection}>
            <Text style={styles.sectionTitle}>Add Money to Wallet</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.quickAmountRow}>
              {[100, 500, 1000, 2000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.quickAmountBtn}
                  onPress={() => setAmount(amt.toString())}
                >
                  <Text style={styles.quickAmountText}>+₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.actionButton,
                isLoading || !amount ? styles.actionButtonInactive : styles.actionButtonActive,
              ]}
              onPress={handleAddMoney}
              disabled={isLoading || !amount}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.actionButtonText}>Proceed to Add ₹{amount || "0"}</Text>
              )}
            </TouchableOpacity>
            {Platform.OS === 'web' && (
              <Text style={styles.webNotice}>
                Note: Payment Gateway requires the Mobile App (Expo Go)
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  safeArea: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#0D47A1" },
  content: { padding: 20 },
  balanceCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  balanceLabel: { color: "#BBDEFB", fontSize: 16, marginBottom: 8 },
  balanceAmount: { color: "#FFFFFF", fontSize: 40, fontWeight: "bold" },
  addMoneySection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A", marginBottom: 15 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    backgroundColor: "#F9F9F9",
  },
  currencySymbol: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A", marginRight: 10 },
  input: { flex: 1, fontSize: 32, fontWeight: "bold", color: "#1A1A1A" },
  quickAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  quickAmountBtn: {
    backgroundColor: "#F1F8FE",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  quickAmountText: { color: "#0D47A1", fontWeight: "bold", fontSize: 14 },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
  },
  actionButtonActive: { backgroundColor: "#2196F3" },
  actionButtonInactive: { backgroundColor: "#B0BEC5" },
  actionButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  webNotice: {
    textAlign: "center",
    color: "#e53935",
    marginTop: 15,
    fontSize: 12,
  }
});
