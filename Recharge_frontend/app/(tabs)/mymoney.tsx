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
  TouchableOpacity,
  View,
} from "react-native";

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

// Default data structure (you can remove this once you have real user data)
const DEFAULT_DATA: MonthData = {
  totalIncome: 0,
  totalSpent: 0,
  netBalance: 0,
  percentageChange: 0,
  expenses: [],
  earnings: [],
  insight: "No data available for this month",
  highestExpense: "No expenses",
};

export default function MyMoneyScreen({ userData }: MyMoneyScreenProps) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState("February"); // Current month
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Get data for selected month or use default
  const monthData = userData?.[selectedMonth] || DEFAULT_DATA;

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
    setShowMonthPicker(false);
  };

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
                  <Text style={styles.statValue}>
                    ₹{monthData.totalIncome.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>👍 Total Spent</Text>
                  <Text style={styles.statValue}>
                    ₹{monthData.totalSpent.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>💸 Net Balance</Text>
                  <Text
                    style={[
                      styles.statValue,
                      monthData.netBalance >= 0
                        ? styles.positiveBalance
                        : styles.negativeBalance,
                    ]}
                  >
                    {monthData.netBalance >= 0 ? "+" : ""}₹
                    {monthData.netBalance.toLocaleString()}
                  </Text>
                </View>
              </View>

              {monthData.percentageChange !== 0 && (
                <View style={styles.insightBadge}>
                  <Text style={styles.insightIcon}>💰</Text>
                  <Text style={styles.insightText}>
                    You spent {Math.abs(monthData.percentageChange)}%{" "}
                    {monthData.percentageChange < 0 ? "less" : "more"} than last
                    month
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Where Your Money Went Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Where your money went</Text>

            {monthData.expenses.length > 0 ? (
              <>
                <View style={styles.highlightBox}>
                  <Ionicons name="bulb" size={20} color="#2196F3" />
                  <Text style={styles.highlightText}>
                    {monthData.highestExpense}
                  </Text>
                </View>

                <View style={styles.expensesGrid}>
                  {monthData.expenses.map((expense) => (
                    <View key={expense.id} style={styles.expenseCard}>
                      <View
                        style={[
                          styles.expenseIconCircle,
                          { backgroundColor: expense.backgroundColor },
                        ]}
                      >
                        {expense.iconType === "ionicons" ? (
                          <Ionicons
                            name={expense.icon as any}
                            size={28}
                            color={expense.iconColor}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name={expense.icon as any}
                            size={28}
                            color={expense.iconColor}
                          />
                        )}
                      </View>
                      <Text style={styles.expenseTitle}>{expense.title}</Text>
                      <Text style={styles.expenseAmount}>
                        ₹{expense.amount.toLocaleString()}
                      </Text>
                      <View
                        style={[
                          styles.progressBar,
                          { backgroundColor: expense.backgroundColor },
                        ]}
                      >
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
                  No expenses tracked yet
                </Text>
                <Text style={styles.noExpensesSubtext}>
                  Your spending will appear here
                </Text>
              </View>
            )}
          </View>

          {/* Compare This Month Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compare this month</Text>

            <View style={styles.compareRow}>
              <View style={styles.compareCard}>
                <Text style={styles.compareLabel}>
                  Last Month <Text style={styles.compareMonth}>(Jan)</Text>
                </Text>
                <Text style={styles.compareAmount}>
                  ₹
                  {monthData.percentageChange !== 0
                    ? (
                      monthData.totalSpent +
                      (monthData.totalSpent *
                        Math.abs(monthData.percentageChange)) /
                      100
                    ).toFixed(0)
                    : "0"}
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
                    ₹{monthData.totalSpent.toLocaleString()}
                  </Text>
                  {monthData.percentageChange < 0 && (
                    <View style={styles.goodControlBadge}>
                      <Text style={styles.goodControlText}>
                        ▲ Good control!
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Your Earnings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Earnings</Text>
              <TouchableOpacity>
                <Text style={styles.earnMoreLink}>Earn more →</Text>
              </TouchableOpacity>
            </View>

            {monthData.earnings.length > 0 ? (
              <View style={styles.earningsGrid}>
                {monthData.earnings.map((earning) => (
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
                  Complete offers to earn rewards
                </Text>
              </View>
            )}
          </View>

          {/* Smart Insights Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={["#F1F8FE", "#BBDEFB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.insightCard}
            >
              <View style={styles.insightHeader}>
                <View style={styles.insightTitleRow}>
                  <View style={styles.insightIconBulb}>
                    <Ionicons name="bulb" size={24} color="#2196F3" />
                  </View>
                  <Text style={styles.insightCardTitle}>Smart Insights</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#0D47A1" />
              </View>
              <Text style={styles.insightCardText}>
                {monthData.insight ||
                  "Track your spending to get personalized insights"}
              </Text>
            </LinearGradient>
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  expenseIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  expenseTitle: {
    fontSize: 13,
    color: "#1A1A1A",
    fontWeight: "600",
    marginBottom: 5,
  },

  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 10,
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

  insightCard: {
    borderRadius: 12,
    padding: 15,
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#FFE082",
  },

  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  insightTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  insightIconBulb: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  insightCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5D4E37",
  },

  insightCardText: {
    fontSize: 13,
    color: "#5D4E37",
    lineHeight: 18,
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
