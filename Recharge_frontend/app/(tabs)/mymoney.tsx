import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../constants/api";

const { width } = Dimensions.get("window");

// Define types for expenses and earnings
interface Expense {
  id: string;
  title: string;
  amount: number;
  icon: string;
  iconType: "ionicons" | "materialcommunity";
  backgroundColor: string;
  iconColor: string;
  progressColor: string;
  percentage: number;
}

interface Earning {
  id: string;
  label: string;
  amount: number;
  icon: string;
  backgroundColor: string;
  iconColor: string;
}

interface MonthData {
  totalIncome: number;
  totalSpent: number;
  netBalance: number;
  percentageChange: number; // positive or negative
  expenses: Expense[];
  earnings: Earning[];
  insight: string;
  highestExpense: string;
}

interface MyMoneyScreenProps {
  userData?: {
    [key: string]: MonthData; // key is month name like 'January', 'February', etc.
  };
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Default data structure
const DEFAULT_DATA: MonthData = {
  totalIncome: 0,
  totalSpent: 0,
  netBalance: 0,
  percentageChange: 0,
  expenses: [
    {
      id: "1",
      title: "Bill payments",
      amount: 0,
      icon: "receipt-outline",
      iconType: "ionicons",
      backgroundColor: "#E3F2FD",
      iconColor: "#2196F3",
      progressColor: "#2196F3",
      percentage: 0,
    },
    {
      id: "2",
      title: "OTT and subscriptions",
      amount: 0,
      icon: "tv-outline",
      iconType: "ionicons",
      backgroundColor: "#F3E5F5",
      iconColor: "#9C27B0",
      progressColor: "#9C27B0",
      percentage: 0,
    },
    {
      id: "3",
      title: "Finance",
      amount: 0,
      icon: "cash-outline",
      iconType: "ionicons",
      backgroundColor: "#E8F5E9",
      iconColor: "#4CAF50",
      progressColor: "#4CAF50",
      percentage: 0,
    },
    {
      id: "4",
      title: "Municipal taxes",
      amount: 0,
      icon: "business-outline",
      iconType: "ionicons",
      backgroundColor: "#FFF3E0",
      iconColor: "#FF9800",
      progressColor: "#FF9800",
      percentage: 0,
    },
  ],
  earnings: [
    {
      id: "e1",
      label: "Refer and Earn",
      amount: 0,
      icon: "people-outline",
      backgroundColor: "#E1F5FE",
      iconColor: "#03A9F4",
    },
    {
      id: "e2",
      label: "Rewards Earned",
      amount: 0,
      icon: "trophy-outline",
      backgroundColor: "#FFF8E1",
      iconColor: "#FFC107",
    },
  ],
  insight: "No data available for this month",
  highestExpense: "No expenses",
};

export default function MyMoneyScreen({ userData }: MyMoneyScreenProps) {
  const router = useRouter();
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYear = now.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonthIdx]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [isSalarySet, setIsSalarySet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // DB Sync State
  const [dbFinanceData, setDbFinanceData] = useState<any>(null);

  // Derived Values
  const [calculatedExpenses, setCalculatedExpenses] = useState<Expense[]>(DEFAULT_DATA.expenses);
  const [calculatedEarnings, setCalculatedEarnings] = useState<Earning[]>(DEFAULT_DATA.earnings);
  const [calculatedTotalSpent, setCalculatedTotalSpent] = useState(0);
  const [lastMonthSpent, setLastMonthSpent] = useState(0);

  // Get data for selected month or use default
  const monthData = userData?.[selectedMonth] || DEFAULT_DATA;

  // Calculate total spent based on current expenses
  const totalSpent = monthData.totalSpent || 0;
  const incomeVal = parseFloat(monthlyIncome) || 0;
  const netBalance = incomeVal - totalSpent;

  // Previous month logic for comparison
  const selectedMonthIdx = MONTHS.indexOf(selectedMonth);
  const prevMonthIdx = selectedMonthIdx === 0 ? 11 : selectedMonthIdx - 1;
  const prevMonth = MONTHS[prevMonthIdx].substring(0, 3);

  const fetchFinanceData = async (monthName: string, year: number) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/finance/${year}/${monthName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        setDbFinanceData(resData.data);
        if (resData.data.monthly_salary > 0) {
          setMonthlyIncome(resData.data.monthly_salary.toString());
          setIsSalarySet(true);
        } else {
          // Fallback to local storage if DB is 0 (first time)
          const savedSalary = await AsyncStorage.getItem("@monthly_salary");
          if (savedSalary) {
            setMonthlyIncome(savedSalary);
            setIsSalarySet(true);
          } else {
            setMonthlyIncome("");
            setIsSalarySet(false);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncFinanceData = async (payload: any) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await fetch(`${API_BASE_URL}/api/finance/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          month_name: selectedMonth,
          year: selectedYear,
        }),
      });
    } catch (error) {
      console.error("Error syncing finance data:", error);
    }
  };

  const calculateSpendingFromTransactions = async (monthName: string, year: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const transactions = await response.json();

      if (response.ok && Array.isArray(transactions)) {
        const monthIdx = MONTHS.indexOf(monthName);

        const thisMonthTransactions = transactions.filter((t: any) => {
          const tDate = new Date(t.created_at);
          return tDate.getMonth() === monthIdx && tDate.getFullYear() === year;
        });

        const prevMonthTransactions = transactions.filter((t: any) => {
          const tDate = new Date(t.created_at);
          const pMonthIdx = monthIdx === 0 ? 11 : monthIdx - 1;
          const pYear = monthIdx === 0 ? year - 1 : year;
          return tDate.getMonth() === pMonthIdx && tDate.getFullYear() === pYear;
        });

        let billSpent = 0, ottSpent = 0, financeSpent = 0, municipalSpent = 0;
        let referEarn = 0, serviceEarn = 0;
        let total = 0, prevTotal = 0;

        thisMonthTransactions.forEach((t: any) => {
          const type = (t.transaction_type || "").toUpperCase();
          const desc = (t.description || "").toLowerCase();
          const amt = parseFloat(t.amount) || 0;

          const isDebit = type.includes("DEBIT") || type.includes("RECHARGE") || type.includes("BILL");
          const isCredit = type.includes("CREDIT") || type.includes("CASHBACK") || type.includes("REWARD");

          if (isDebit) {
            total += amt;
            // Case-insensitive checks for categorization
            if (/ott|netflix|prime|subscription|disney|zee5/i.test(desc)) {
              ottSpent += amt;
            } else if (/tax|municipal|property/i.test(desc)) {
              municipalSpent += amt;
            } else if (/finance|loan|bank|insurance|emi|invest/i.test(desc)) {
              financeSpent += amt;
            } else {
              // Default to generic bill payment
              billSpent += amt;
            }
          }

          if (isCredit) {
            if (desc.includes("refer")) {
              referEarn += amt;
            } else if (desc.includes("reward") || desc.includes("cashback") || type.includes("CASHBACK")) {
              serviceEarn += amt;
            }
          }
        });

        prevMonthTransactions.forEach((t: any) => {
          const type = (t.transaction_type || "").toUpperCase();
          if (type.includes("DEBIT") || type.includes("RECHARGE") || type.includes("BILL")) {
            prevTotal += parseFloat(t.amount) || 0;
          }
        });

        setCalculatedTotalSpent(total);
        setLastMonthSpent(prevTotal);

        const updatedExpenses = DEFAULT_DATA.expenses.map(exp => {
          let val = 0;
          if (exp.id === "1") val = billSpent;
          if (exp.id === "2") val = ottSpent;
          if (exp.id === "3") val = financeSpent;
          if (exp.id === "4") val = municipalSpent;
          return {
            ...exp,
            amount: val,
            percentage: total > 0 ? (val / total) * 100 : 0
          };
        });

        const updatedEarnings = DEFAULT_DATA.earnings.map(earn => {
          let val = 0;
          if (earn.id === "e1") val = referEarn;
          if (earn.id === "e2") val = serviceEarn;
          return { ...earn, amount: val };
        });

        setCalculatedExpenses(updatedExpenses);
        setCalculatedEarnings(updatedEarnings);

        // Sync with DB
        syncFinanceData({
          monthly_salary: parseFloat(monthlyIncome) || 0,
          total_spent: total,
          last_month_spent: prevTotal,
          bill_payments_spent: billSpent,
          ott_subscriptions_spent: ottSpent,
          finance_spent: financeSpent,
          municipal_taxes_spent: municipalSpent,
          referral_earnings: referEarn,
          service_earnings: serviceEarn
        });
      }
    } catch (e) {
      console.error("Error calculating spending:", e);
    }
  };

  const handleSetSalary = async () => {
    const income = parseFloat(monthlyIncome);
    if (income >= 0) {
      try {
        setIsSalarySet(true);
        // Save locally for quick access
        await AsyncStorage.setItem("@monthly_salary", monthlyIncome);
        // Sync with DB
        await syncFinanceData({ monthly_salary: income });
        // Refresh calculations
        calculateSpendingFromTransactions(selectedMonth, selectedYear);
      } catch (e) {
        console.error("Error saving salary:", e);
      }
    }
  };

  useEffect(() => {
    fetchFinanceData(selectedMonth, selectedYear);
    calculateSpendingFromTransactions(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);


  useEffect(() => {
    const onBackPress = () => {
      router.push("/(tabs)/explore");
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, []);

  const handleBackPress = () => {
    // Navigate to home screen explicitly
    router.push("/(tabs)/explore");
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    // If user picks a month ahead of current in same year (rare, but handleable)
    // Here we just stay in current year for simplicity unless we add a year picker
    setShowMonthPicker(false);
  };

  // UI Derived state from DB or Calculations
  const displayTotalSpent = calculatedTotalSpent;
  const displayIncome = parseFloat(monthlyIncome) || 0;
  const displayNetBalance = displayIncome - displayTotalSpent;
  const displayExpenses = calculatedExpenses;
  const displayEarnings = calculatedEarnings;

  const percentageDiff = lastMonthSpent > 0
    ? ((displayTotalSpent - lastMonthSpent) / lastMonthSpent) * 100
    : 0;

  const highestExp = [...displayExpenses].sort((a, b) => b.amount - a.amount)[0];
  const insightText = displayTotalSpent > 0
    ? `Highest spent on ${highestExp.title} (₹${highestExp.amount})`
    : "Track your spending to get personalized insights";

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

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

            <Text style={styles.headerTitle}>My Money</Text>

            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* Month Selector */}
          <View style={styles.monthSelectorContainer}>
            <TouchableOpacity
              style={styles.monthSelector}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.monthSelectorText}>{selectedMonth}</Text>
              <Ionicons name="chevron-down" size={20} color="#0D47A1" />
            </TouchableOpacity>
          </View>

          {/* This Month Summary Card */}
          <View style={styles.summaryContainer}>
            <LinearGradient
              colors={["#F1F8FE", "#BBDEFB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.summaryCard}
            >
              <Text style={styles.monthTitle}>
                This Month{" "}
                <Text style={styles.monthSubtitle}>
                  ({selectedMonth.substring(0, 3)})
                </Text>
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>🏆 Total Income</Text>
                  <View style={styles.incomeInputWrapper}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={styles.incomeInput}
                      value={monthlyIncome}
                      onChangeText={setMonthlyIncome}
                      keyboardType="numeric"
                      placeholder="Enter salary"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <TouchableOpacity style={styles.setSalaryButton} onPress={handleSetSalary}>
                    <Text style={styles.setSalaryButtonText}>Set Salary</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>👍 Total Spent</Text>
                  <Text style={styles.statValue}>
                    ₹{displayTotalSpent.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>💸 Net Balance</Text>
                  <Text
                    style={[
                      styles.statValue,
                      displayNetBalance >= 0
                        ? styles.positiveBalance
                        : styles.negativeBalance,
                    ]}
                  >
                    {displayNetBalance >= 0 ? "+" : ""}₹
                    {displayNetBalance.toLocaleString()}
                  </Text>
                </View>
              </View>

              {percentageDiff !== 0 && (
                <View style={styles.insightBadge}>
                  <Text style={styles.insightIcon}>💰</Text>
                  <Text style={styles.insightText}>
                    You spent {Math.abs(Math.round(percentageDiff))}%{" "}
                    {percentageDiff < 0 ? "less" : "more"} than last
                    month
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Where Your Money Went Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Where your money went</Text>

            {displayTotalSpent > 0 || isSalarySet ? (
              <>
                <View style={styles.highlightBox}>
                  <Ionicons name="bulb" size={20} color="#2196F3" />
                  <Text style={styles.highlightText}>
                    {displayTotalSpent > 0 ? insightText : "Expenses are tracked by category"}
                  </Text>
                </View>

                <View style={styles.expensesGrid}>
                  {displayExpenses.map((expense) => (
                    <View
                      key={expense.id}
                      style={[
                        styles.expenseCard,
                        { backgroundColor: expense.backgroundColor }
                      ]}
                    >
                      <View style={[styles.expenseIconCircle, { backgroundColor: '#FFFFFF' }]}>
                        {expense.iconType === "ionicons" ? (
                          <Ionicons
                            name={expense.icon as any}
                            size={20}
                            color={expense.iconColor}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name={expense.icon as any}
                            size={20}
                            color={expense.iconColor}
                          />
                        )}
                      </View>
                      <Text style={[styles.expenseTitle, { color: expense.progressColor }]} numberOfLines={1}>
                        {expense.title}
                      </Text>
                      <Text style={[styles.expenseAmount, { color: expense.progressColor }]}>
                        ₹{expense.amount.toLocaleString()}
                      </Text>
                      <View style={[styles.progressBar, { backgroundColor: 'rgba(255, 255, 255, 0.6)' }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${expense.percentage}%`,
                              backgroundColor: expense.progressColor,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.noExpensesBox}>
                <Ionicons name="wallet-outline" size={48} color="#DDD" />
                <Text style={styles.noExpensesText}>
                  No expense tracked yet
                </Text>
                <Text style={styles.noExpensesSubtext}>
                  Set your monthly salary to start tracking expenses
                </Text>
              </View>
            )}
          </View>

          {/* Compare This Month Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compare this month</Text>

            {displayIncome > 0 ? (
              <View style={styles.compareRow}>
                <View style={styles.compareCard}>
                  <Text style={styles.compareLabel}>
                    Last Month <Text style={styles.compareMonth}>({prevMonth})</Text>
                  </Text>
                  <Text style={styles.compareAmount}>
                    ₹{lastMonthSpent.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.compareCard}>
                  <Text style={styles.compareLabel}>
                    This Month{" "}
                    <Text style={styles.compareMonth}>
                      ({selectedMonth.substring(0, 3)})
                    </Text>
                  </Text>
                  <View style={styles.compareValueRow}>
                    <Text style={styles.compareAmount}>
                      ₹{displayTotalSpent.toLocaleString()}
                    </Text>
                    {percentageDiff < 0 && (
                      <View style={styles.goodControlBadge}>
                        <Text style={styles.goodControlText}>
                          ▲ Good control!
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.noExpensesBox}>
                <Ionicons name="stats-chart-outline" size={48} color="#DDD" />
                <Text style={styles.noExpensesText}>Comparison unavailable</Text>
                <Text style={styles.noExpensesSubtext}>
                  Set your monthly salary to see comparison
                </Text>
              </View>
            )}
          </View>

          {/* Your Earnings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Earnings</Text>
              <TouchableOpacity onPress={() => router.push("/refer-earn")}>
                <Text style={styles.earnMoreLink}>Earn more →</Text>
              </TouchableOpacity>
            </View>

            {displayEarnings.some(e => e.amount > 0) ? (
              <View style={styles.earningsGrid}>
                {displayEarnings.map((earning) => (
                  <TouchableOpacity key={earning.id} style={styles.earningCard}>
                    <View
                      style={[
                        styles.earningIconCircle,
                        { backgroundColor: earning.backgroundColor },
                      ]}
                    >
                      <Ionicons
                        name={earning.icon as any}
                        size={24}
                        color={earning.iconColor}
                      />
                    </View>
                    <View style={styles.earningInfo}>
                      <Text style={styles.earningLabel}>{earning.label}</Text>
                      <Text style={styles.earningAmount}>
                        ₹{earning.amount.toLocaleString()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noExpensesBox}>
                <Ionicons name="gift-outline" size={48} color="#DDD" />
                <Text style={styles.noExpensesText}>No earnings yet</Text>
                <Text style={styles.noExpensesSubtext}>
                  Earnings will be displayed when earned
                </Text>
              </View>
            )}
          </View>

        </ScrollView>

        {/* Bottom Navigation - Matching home screen */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/(tabs)/explore")}
          >
            <Ionicons name="home" size={24} color="#999" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/mymoney")}
          >
            <Ionicons name="wallet-outline" size={24} color="#2196F3" />
            <Text style={[styles.navText, styles.navTextActive]}>My Money</Text>
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
            onPress={() => router.push("/wallet")}
          >
            <Ionicons name="card-outline" size={24} color="#999" />
            <Text style={styles.navText}>Wallet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Ionicons name="close" size={24} color="#0D47A1" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.monthList}>
              {MONTHS.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthOption,
                    selectedMonth === month && styles.monthOptionSelected,
                  ]}
                  onPress={() => handleMonthSelect(month)}
                >
                  <Text
                    style={[
                      styles.monthOptionText,
                      selectedMonth === month && styles.monthOptionTextSelected,
                    ]}
                  >
                    {month}
                  </Text>
                  {selectedMonth === month && (
                    <Ionicons name="checkmark" size={20} color="#2196F3" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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

  scrollContent: {
    paddingBottom: 20,
  },

  header: {
    paddingTop: 10,
    paddingBottom: 5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
    overflow: "hidden",
    marginBottom: 20,
    zIndex: 10,
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
    paddingTop: 45,
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

  monthSelectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F8FE",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#BBDEFB",
    gap: 8,
  },

  monthSelectorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D47A1",
  },

  summaryContainer: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },

  summaryCard: {
    borderRadius: 16,
    padding: 18,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },

  monthTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 15,
  },

  monthSubtitle: {
    fontSize: 18,
    fontWeight: "400",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  statItem: {
    flex: 1,
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(13, 71, 161, 0.2)",
    marginHorizontal: 8,
  },

  statLabel: {
    fontSize: 11,
    color: "#0D47A1",
    marginBottom: 5,
    fontWeight: "500",
  },

  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },

  incomeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
    width: '100%',
  },

  currencySymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 2,
  },

  incomeInput: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1A1A1A',
    padding: 0,
    flex: 1,
  },

  setSalaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },

  setSalaryButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  positiveBalance: {
    color: "#2E7D32",
  },

  negativeBalance: {
    color: "#C62828",
  },

  insightBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },

  insightIcon: {
    fontSize: 16,
  },

  insightText: {
    fontSize: 12,
    color: "#0D47A1",
    fontWeight: "600",
    flex: 1,
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
    letterSpacing: 0.3,
  },

  highlightBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    gap: 10,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },

  highlightText: {
    fontSize: 13,
    color: "#5D4E37",
    fontWeight: "500",
    flex: 1,
  },

  expensesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  expenseCard: {
    width: "48%",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  expenseIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  expenseTitle: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },

  expenseAmount: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },

  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  compareRow: {
    flexDirection: "row",
    gap: 12,
  },

  compareCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  compareLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },

  compareMonth: {
    fontSize: 12,
    color: "#999",
  },

  compareAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
  },

  compareValueRow: {
    gap: 5,
  },

  goodControlBadge: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 5,
  },

  goodControlText: {
    fontSize: 11,
    color: "#2E7D32",
    fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  earnMoreLink: {
    fontSize: 14,
    color: "#0277BD",
    fontWeight: "600",
  },

  earningsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  earningCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    gap: 10,
  },

  earningIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },

  earningInfo: {
    flex: 1,
  },

  earningLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
    fontWeight: "500",
  },

  earningAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },

  noExpensesBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderStyle: "dashed",
  },

  noExpensesText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
    textAlign: "center",
  },

  noExpensesSubtext: {
    fontSize: 13,
    color: "#BBB",
    marginTop: 4,
    textAlign: "center",
  },

  // Bottom Navigation - Matching home screen
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: width * 0.85,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },

  monthList: {
    maxHeight: 400,
  },

  monthOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },

  monthOptionSelected: {
    backgroundColor: "#FFF9E6",
  },

  monthOptionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },

  monthOptionTextSelected: {
    color: "#5D4E37",
    fontWeight: "600",
  },
});
