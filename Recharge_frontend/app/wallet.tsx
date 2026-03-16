import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS, API_BASE_URL } from "../constants/api";

const { width } = Dimensions.get("window");

export default function WalletScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Payment related params
  const { amount, billType, consumerNumber, lenderName, policyNumber, borrowerName, loanAccountNumber } = params;
  const isPaymentFlow = !!amount;

  // State
  const [isAutoUseEnabled, setIsAutoUseEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Wallet Logic States
  const [balance, setBalance] = useState("0.00");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

  // Modal States
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchBalance = async () => {
    setIsFetchingBalance(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_ENDPOINTS.USER_PROFILE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.wallet_balance || "0.00");
        fetchTransactions(); // Fetch transactions whenever balance is updated
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setIsFetchingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleToggle = () => {
    setIsAutoUseEnabled(!isAutoUseEnabled);
  };

  const handleBackPress = useCallback(() => {
    router.replace("/(tabs)/explore");
    return true;
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [handleBackPress])
  );

  const handleConfirmPayment = () => {
    setIsLoading(true);
    // Simulate payment process
    setTimeout(() => {
      setIsLoading(false);
      setShowPaymentSuccess(true);
      fetchBalance(); // Refresh balance after payment
    }, 2000);
  };

  const handleAddMoney = async () => {
    const numAmount = parseFloat(amountInput);
    if (!numAmount || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to add.");
      return;
    }

    setIsProcessing(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/wallet/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: numAmount }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowAddMoneyModal(false);
        setAmountInput("");
        fetchBalance();
        Alert.alert("Success", "Money added to your wallet successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to add money");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amountInput);
    if (!numAmount || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to withdraw.");
      return;
    }

    if (numAmount > parseFloat(balance)) {
      Alert.alert("Insufficient Balance", "You don't have enough balance to withdraw this amount.");
      return;
    }

    setIsProcessing(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/wallet/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: numAmount }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowWithdrawModal(false);
        setAmountInput("");
        fetchBalance();
        Alert.alert("Success", "Withdrawal initiated successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to withdraw money");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          animation: "none",
          presentation: "card",
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header Section - Yellow Gradient */}
        <LinearGradient
          colors={["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 4, y: 4 }}
          style={styles.header}
        >
          {/* Decorative Wave */}
          <View style={styles.decorativeWave} />

          {/* Top Row - Back Button & Title */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color="#0D47A1" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Wallet</Text>

            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Balance Card - No Animation */}
          <View style={styles.balanceCardContainer}>
            <LinearGradient
              colors={["#F1F8FE", "#BBDEFB", "#90CAF9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}
            >
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />

              {/* Top row with balance */}
              <View style={styles.topSection}>
                <View style={styles.balanceSection}>
                  <Text style={styles.balanceLabel}>Total Balance</Text>
                  <View style={styles.amountContainer}>
                    <Text style={styles.balanceAmount}>₹{balance}</Text>
                    {isFetchingBalance && <ActivityIndicator size="small" color="#0D47A1" style={{ marginLeft: 10 }} />}
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.statIconCircle,
                        { backgroundColor: "#C8E6C9" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="cash-multiple"
                        size={16}
                        color="#2E7D32"
                      />
                    </View>
                    <Text style={styles.statLabel}>Cashback</Text>
                    <Text style={styles.statValue}>₹0</Text>
                  </View>

                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.statIconCircle,
                        { backgroundColor: "#E1BEE7" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="sync"
                        size={16}
                        color="#6A1B9A"
                      />
                    </View>
                    <Text style={styles.statLabel}>Refunds</Text>
                    <Text style={styles.statValue}>₹0</Text>
                  </View>

                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.statIconCircle,
                        { backgroundColor: "#B3E5FC" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="wallet-plus"
                        size={16}
                        color="#0277BD"
                      />
                    </View>
                    <Text style={styles.statLabel}>Added Money</Text>
                    <Text style={styles.statValue}>₹0</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.addMoneyButton}
                  onPress={() => {
                    setAmountInput("");
                    setShowAddMoneyModal(true);
                  }}
                >
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.addMoneyText}>Add Money</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.withdrawButton}
                  onPress={() => {
                    setAmountInput("");
                    setShowWithdrawModal(true);
                  }}
                >
                  <Text style={styles.withdrawText}>Withdraw</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {isPaymentFlow && (
            <View style={styles.paymentConfirmSection}>
              <View style={styles.confirmCard}>
                <View style={styles.confirmHeader}>
                  <MaterialCommunityIcons name="credit-card-check" size={24} color="#0D47A1" />
                  <Text style={styles.confirmTitle}>Confirm Payment</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Bill Type</Text>
                  <Text style={styles.confirmValue}>{String(billType).toUpperCase()}</Text>
                </View>
                {lenderName && (
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Lender/Bank</Text>
                    <Text style={styles.confirmValue}>{lenderName}</Text>
                  </View>
                )}
                {consumerNumber && (
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Consumer No.</Text>
                    <Text style={styles.confirmValue}>{consumerNumber}</Text>
                  </View>
                )}
                {policyNumber && (
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Policy No.</Text>
                    <Text style={styles.confirmValue}>{policyNumber}</Text>
                  </View>
                )}
                {loanAccountNumber && (
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Loan Acc No.</Text>
                    <Text style={styles.confirmValue}>{loanAccountNumber}</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Amount to Pay</Text>
                  <Text style={styles.totalValue}>₹{amount}</Text>
                </View>

                <TouchableOpacity
                  onPress={handleConfirmPayment}
                  disabled={isLoading}
                  style={{ marginTop: 20 }}
                >
                  <LinearGradient
                    colors={["#0D47A1", "#1565C0"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Confirm and Pay</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Auto-use Toggle */}
          <View style={styles.autoUseSection}>
            <View style={styles.autoUseContent}>
              <View style={styles.autoUseLeft}>
                <View style={styles.bulbIcon}>
                  <Ionicons name="bulb" size={24} color="#2196F3" />
                </View>
                <View style={styles.autoUseText}>
                  <Text style={styles.autoUseTitle}>
                    Auto-use wallet balance
                  </Text>
                  <Text style={styles.autoUseSubtitle}>
                    Automatically use wallet balance for payments
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.toggleSwitch}
                onPress={handleToggle}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.toggleTrack,
                    {
                      backgroundColor: isAutoUseEnabled ? "#2196F3" : "#E0E0E0",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        alignSelf: isAutoUseEnabled ? "flex-end" : "flex-start",
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.toggleLabel,
                    { color: isAutoUseEnabled ? "#2196F3" : "#999" },
                  ]}
                >
                  {isAutoUseEnabled ? "ON" : "OFF"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Activity Section */}
          {!isPaymentFlow && (
            <View style={styles.transactionsList}>
              <View style={styles.sectionHeader}>
                <Text style={styles.transactionsSectionTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => router.push("/transactions")}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {isFetchingBalance ? (
                <ActivityIndicator color="#0D47A1" style={{ marginTop: 20 }} />
              ) : transactions.filter(t => !["WALLET_CREDIT", "WALLET_DEBIT", "WALLET CREDIT", "WALLET DEBIT"].includes(t.transaction_type.toUpperCase().replace('_', ' '))).length > 0 ? (
                transactions
                  .filter(t => !["WALLET_CREDIT", "WALLET_DEBIT", "WALLET CREDIT", "WALLET DEBIT"].includes(t.transaction_type.toUpperCase().replace('_', ' ')))
                  .slice(0, 5)
                  .map((transaction, index) => {
                    const type = transaction.transaction_type.toUpperCase();
                    const isRecharge = type === "RECHARGE" || type === "MOBILE RECHARGE";
                    const isBill = type === "BILL" || type === "BILL PAYMENT";

                    let label = isRecharge ? "Mobile Recharge" : isBill ? "Bill Payment" : transaction.transaction_type;
                    let icon = isRecharge ? "phone-portrait" : isBill ? "receipt" : "card-outline";
                    let iconColor = isRecharge ? "#2196F3" : isBill ? "#FF9800" : "#9C27B0";

                    return (
                      <View
                        key={transaction.transaction_id || `act-${index}`}
                        style={styles.transactionCardCompact}
                      >
                        <View style={styles.transactionLeftCompact}>
                          <View style={[styles.iconCircleCompact, { backgroundColor: `${iconColor}15` }]}>
                            {isRecharge || icon === 'card-outline' ? (
                              <Ionicons name={icon as any} size={18} color={iconColor} />
                            ) : (
                              <MaterialCommunityIcons
                                name={icon as any}
                                size={18}
                                color={iconColor}
                              />
                            )}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.transTypeCompact} numberOfLines={1}>{label}</Text>
                            <Text style={styles.transDescriptionCompact} numberOfLines={1}>
                              {transaction.description || "Wallet Usage"}
                            </Text>
                            <Text style={styles.transDateCompact}>{new Date(transaction.created_at).toLocaleDateString()}</Text>
                          </View>
                        </View>
                        <Text style={[styles.transAmountCompact, { color: "#1A1A1A" }]}>
                          -₹{transaction.amount}
                        </Text>
                      </View>
                    );
                  })
              ) : (
                <View style={styles.emptyActivity}>
                  <Text style={styles.emptyActivityText}>No recent wallet usage activity</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.walletInfo}>
            <Ionicons name="information-circle" size={20} color="#999" />
            <Text style={styles.walletInfoText}>Wallet Info</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Success Modal */}
        <Modal
          visible={showPaymentSuccess}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPaymentSuccess(false)}
        >
          <View style={styles.successOverlay}>
            <View style={styles.successCard}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={50} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Payment Successful</Text>
              <View style={styles.receipt}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Transaction ID</Text>
                  <Text style={styles.receiptValue}>W-TXN-{Math.floor(Math.random() * 900000) + 100000}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Amount Paid</Text>
                  <Text style={styles.receiptValue}>₹{amount}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Mode</Text>
                  <Text style={styles.receiptValue}>Wallet balance</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Date</Text>
                  <Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.backHomeButtonSuccess}
                onPress={() => {
                  setShowPaymentSuccess(false);
                  router.replace("/(tabs)/explore");
                }}
              >
                <Text style={styles.backHomeTextSuccess}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Money Modal */}
        <Modal
          visible={showAddMoneyModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddMoneyModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowAddMoneyModal(false)}
            />
            <LinearGradient
              colors={["#FFFFFF", "#F8FAFC"]}
              style={styles.modalContent}
            >
              <View style={styles.modalPullBar} />

              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Add Money</Text>
                  <Text style={styles.modalSubtitle}>Top up your wallet balance</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtnCircle}
                  onPress={() => setShowAddMoneyModal(false)}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <LinearGradient
                colors={["#F1F8FE", "#FFFFFF"]}
                style={styles.premiumInputCard}
              >
                <Text style={styles.inputLabel}>Enter Amount</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="number-pad"
                    value={amountInput}
                    onChangeText={setAmountInput}
                    autoFocus
                  />
                </View>
              </LinearGradient>

              <View style={styles.presetsWrapper}>
                <Text style={styles.sectionLabel}>Quick Select</Text>
                <View style={styles.presetsGrid}>
                  {[100, 500, 1000, 2000].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={styles.presetChip}
                      onPress={() => setAmountInput(amt.toString())}
                    >
                      <MaterialCommunityIcons name="plus" size={12} color="#0D47A1" />
                      <Text style={styles.presetChipText}>₹{amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.mainActionBtn}
                onPress={handleAddMoney}
                disabled={isProcessing}
              >
                <LinearGradient
                  colors={["#1976D2", "#0D47A1"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btnGrad}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.mainActionText}>Add to Wallet</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </KeyboardAvoidingView>
        </Modal>

        {/* Withdraw Modal */}
        <Modal
          visible={showWithdrawModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowWithdrawModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowWithdrawModal(false)}
            />
            <LinearGradient
              colors={["#FFFFFF", "#FDFEFF"]}
              style={styles.modalContent}
            >
              <View style={styles.modalPullBar} />

              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Withdraw Money</Text>
                  <Text style={styles.modalSubtitle}>Transfer to bank account</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtnCircle}
                  onPress={() => setShowWithdrawModal(false)}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.balanceHighlightCard}>
                <LinearGradient
                  colors={["#E3F2FD", "#F1F8FE"]}
                  style={styles.balanceHighlightContent}
                >
                  <View style={styles.balanceInfoLeft}>
                    <Text style={styles.balanceInfoLabel}>Available to Withdraw</Text>
                    <Text style={styles.balanceInfoAmount}>₹{balance}</Text>
                  </View>
                  <MaterialCommunityIcons name="bank-transfer" size={28} color="#0D47A1" />
                </LinearGradient>
              </View>

              <LinearGradient
                colors={["#F8FAFC", "#FFFFFF"]}
                style={styles.premiumInputCard}
              >
                <Text style={styles.inputLabel}>Withdrawal Amount</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="number-pad"
                    value={amountInput}
                    onChangeText={setAmountInput}
                    autoFocus
                  />
                </View>
              </LinearGradient>

              <TouchableOpacity
                style={[styles.mainActionBtn, { marginTop: 24 }]}
                onPress={handleWithdraw}
                disabled={isProcessing}
              >
                <LinearGradient
                  colors={["#1E293B", "#0F172A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btnGrad}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.mainActionText}>Confirm Withdrawal</Text>
                      <MaterialCommunityIcons name="check-decagram" size={18} color="#FFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.securityNote}>
                <Ionicons name="shield-checkmark" size={14} color="#94A3B8" />
                <Text style={styles.securityNoteText}>Secure end-to-end encrypted transfer</Text>
              </View>
            </LinearGradient>
          </KeyboardAvoidingView>
        </Modal>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/(tabs)/explore")}
          >
            <Ionicons name="home" size={24} color="#999" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/mymoney")}
          >
            <Ionicons name="wallet-outline" size={24} color="#999" />
            <Text style={styles.navText}>My Money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/transactions")}
          >
            <Ionicons name="time-outline" size={24} color="#999" />
            <Text style={styles.navText}>Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/wallet")}
          >
            <Ionicons name="card-outline" size={24} color="#2196F3" />
            <Text style={[styles.navText, styles.navTextActive]}>Wallet</Text>
          </TouchableOpacity>
        </View>
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

  // Header - Yellow Gradient
  header: {
    paddingTop: 10,
    paddingBottom: 5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
    overflow: "hidden",
    marginBottom: 20,
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
    paddingTop: 60, // Increased padding
    paddingBottom: 15,
    zIndex: 1,
  },

  backButton: {
    padding: 5,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0D47A1",
    letterSpacing: 0.5,
  },

  placeholder: {
    width: 34,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  // Balance Card - No Animation
  balanceCardContainer: {
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 20,
  },

  balanceCard: {
    borderRadius: 16,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  decorCircle1: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    top: -30,
    right: -25,
  },

  decorCircle2: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    bottom: -20,
    left: -15,
  },

  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    zIndex: 1,
  },

  balanceSection: {
    flex: 1,
  },

  balanceLabel: {
    fontSize: 15,
    color: "#0D47A1",
    fontWeight: "500",
    marginBottom: 4,
  },

  balanceAmount: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0D47A1",
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },

  statItem: {
    alignItems: "center",
  },

  statIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },

  statLabel: {
    fontSize: 10,
    color: "#0D47A1",
    marginBottom: 1,
  },

  statValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0D47A1",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 13,
    zIndex: 1,
  },

  addMoneyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0277BD",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },

  addMoneyText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  withdrawButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },

  withdrawText: {
    color: "#0D47A1",
    fontSize: 14,
    fontWeight: "bold",
  },

  autoUseSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },

  autoUseContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  autoUseLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 5,
  },

  bulbIcon: {
    width: 35,
    height: 35,
    borderRadius: 22,
    backgroundColor: "#F1F8FE",
    alignItems: "center",
    justifyContent: "center",
  },

  autoUseText: {
    flex: 1,
  },

  autoUseTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },

  autoUseSubtitle: {
    fontSize: 12,
    color: "#666",
  },

  toggleSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  toggleTrack: {
    width: 38,
    height: 26,
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },

  toggleLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },

  // Empty State
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyStateIcon: {
    marginBottom: 20,
  },

  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },

  emptyStateText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 6,
  },

  emptyStateSubtext: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },

  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 6,
  },

  walletInfoText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },

  // Bottom Navigation
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

  // Payment Confirmation Styles
  paymentConfirmSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  confirmCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E3F2FD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  confirmHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 16,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  confirmLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0D47A1",
  },
  confirmButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Success Modal Styles
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 24,
  },
  receipt: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  backHomeButtonSuccess: {
    backgroundColor: "#0D47A1",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  backHomeTextSuccess: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Modal Styles - Premium Redesign
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.6)", // Darker, more premium overlay
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalPullBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20, // Reduced from 28
  },
  modalTitle: {
    fontSize: 20, // Reduced from 24
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    fontSize: 13, // Reduced from 14
    color: "#64748B",
    marginTop: 2,
  },
  closeBtnCircle: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumInputCard: {
    padding: 16, // Reduced from 24
    borderRadius: 20, // Reduced from 24
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 11, // Reduced from 12
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 32, // Reduced from 40
    fontWeight: "800",
    color: "#0F172A",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32, // Reduced from 40
    fontWeight: "800",
    color: "#0F172A",
    padding: 0,
  },
  presetsWrapper: {
    marginTop: 20, // Reduced from 28
    marginBottom: 24, // Reduced from 32
  },
  sectionLabel: {
    fontSize: 13, // Reduced from 14
    fontWeight: "700",
    color: "#475569",
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12, // Reduced from 16
    paddingVertical: 10, // Reduced from 12
    borderRadius: 14, // Reduced from 16
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  presetChipText: {
    fontSize: 14, // Reduced from 15
    fontWeight: "700",
    color: "#0D47A1",
    marginLeft: 3,
  },
  mainActionBtn: {
    borderRadius: 16, // Reduced from 20
    overflow: "hidden",
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  btnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15, // Reduced from 18
    gap: 8,
  },
  mainActionText: {
    fontSize: 16, // Reduced from 17
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  balanceHighlightCard: {
    borderRadius: 20, // Reduced from 24
    overflow: "hidden",
    marginBottom: 20,
  },
  balanceHighlightContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16, // Reduced from 20
  },
  balanceInfoLeft: {
    flex: 1,
  },
  balanceInfoLabel: {
    fontSize: 12, // Reduced from 13
    fontWeight: "600",
    color: "#0D47A1",
    opacity: 0.8,
  },
  balanceInfoAmount: {
    fontSize: 24, // Reduced from 28
    fontWeight: "800",
    color: "#0D47A1",
    marginTop: 2,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20, // Reduced from 24
    gap: 6,
  },
  securityNoteText: {
    fontSize: 11, // Reduced from 12
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 0.1,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionsList: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  transactionsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },
  transactionCardCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  transactionLeftCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircleCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  transTypeCompact: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  transDateCompact: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 1,
  },
  transDescriptionCompact: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  transAmountCompact: {
    fontSize: 15,
    fontWeight: "700",
  },
  emptyActivity: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyActivityText: {
    color: "#94A3B8",
    fontSize: 14,
  },
});
