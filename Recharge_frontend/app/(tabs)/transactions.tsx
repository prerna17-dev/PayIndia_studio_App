import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../constants/api";

const { width } = Dimensions.get("window");

interface Transaction {
  transaction_id?: number;
  id?: string;
  user_id?: number;
  transaction_type: string;
  type?: string;
  amount: number;
  description: string;
  status: "success" | "pending" | "failed";
  transaction_reference?: string;
  created_at: string;
  date: string;
  category: string;
  icon: string;
  iconType: "ionicons" | "materialcommunity";
  iconColor: string;
}

const typeToIcon = (
  type: string
): { icon: string; iconType: "ionicons" | "materialcommunity"; iconColor: string; category: string } => {
  switch (type) {
    case "Recharge":
      return { icon: "phone-portrait", iconType: "ionicons", iconColor: "#4CAF50", category: "Recharge" };
    case "Wallet_Credit":
      return { icon: "wallet", iconType: "ionicons", iconColor: "#2196F3", category: "Wallet" };
    case "Wallet_Debit":
      return { icon: "wallet-outline", iconType: "ionicons", iconColor: "#FF5722", category: "Wallet" };
    case "Loan":
      return { icon: "cash", iconType: "ionicons", iconColor: "#9C27B0", category: "Loan" };
    case "Insurance":
      return { icon: "shield-checkmark", iconType: "ionicons", iconColor: "#009688", category: "Insurance" };
    case "Bill_Payment":
      return { icon: "receipt", iconType: "ionicons", iconColor: "#FF9800", category: "Bill" };
    default:
      return { icon: "swap-horizontal", iconType: "ionicons", iconColor: "#607D8B", category: type };
  }
};

export default function HistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState("All");

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/user/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.data)) {
        const mapped: Transaction[] = data.data.map((t: any) => {
          const meta = typeToIcon(t.transaction_type || "");
          let displayDate = "N/A";
          try {
             if (t.created_at) {
               displayDate = new Date(t.created_at).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
             }
          } catch (dateErr) {
            console.warn("Date parsing error:", dateErr);
          }

          return {
            transaction_id: t.transaction_id,
            id: String(t.transaction_id || Math.random()),
            type: t.description || t.transaction_type || "Transaction",
            transaction_type: t.transaction_type || "Unknown",
            description: t.description || "",
            amount: parseFloat(t.amount) || 0,
            created_at: t.created_at || "",
            date: displayDate,
            status: (t.status?.toLowerCase() || "pending") as Transaction["status"],
            category: meta.category,
            icon: meta.icon,
            iconType: meta.iconType,
            iconColor: meta.iconColor,
          };
        });
        setTransactions(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch transactions", e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchTransactions();

    const onBackPress = () => {
      router.push("/(tabs)/explore");
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const hasTransactions = transactions.length > 0;
  const filteredTransactions =
    activeFilter === "All"
      ? transactions
      : transactions.filter((t) => t.status === activeFilter.toLowerCase());

  const handleBackPress = () => {
    router.push("/(tabs)/explore");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success": return "#4CAF50";
      case "pending": return "#FF9800";
      case "failed": return "#F44336";
      default: return "#999";
    }
  };

  const getTransactionUI = (type: string) => {
    switch (type) {
      case "Wallet_Credit":
        return { icon: "wallet", color: "#4CAF50", label: "Money Added", isCredit: true };
      case "Wallet_Debit":
        return { icon: "bank-transfer-out", color: "#F44336", label: "Money Withdrawn", isCredit: false };
      case "Recharge":
        return { icon: "phone-portrait", color: "#2196F3", label: "Mobile Recharge", isCredit: false };
      default:
        return { icon: "receipt", color: "#9C27B0", label: type, isCredit: false };
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationCircle}>
          <View style={styles.clipboard}>
            <View style={styles.clipboardClip} />
            <View style={styles.clipboardContent}>
              <View style={styles.rupeeCircle}>
                <Text style={styles.rupeeSymbol}>₹</Text>
              </View>
              <View style={styles.clipboardLines}>
                <View style={styles.clipboardLine} />
                <View style={styles.clipboardLine} />
                <View style={styles.clipboardLine} />
              </View>
            </View>
          </View>
          <View style={styles.coinsStackLeft}>
            <View style={[styles.coin, { bottom: 0, left: 0 }]} />
            <View style={[styles.coin, { bottom: 8, left: 2 }]} />
            <View style={[styles.coin, { bottom: 16, left: 4 }]} />
          </View>
          <View style={styles.coinsStackRight}>
            <View style={[styles.coin, { bottom: 0, right: 0 }]} />
            <View style={[styles.coin, { bottom: 6, right: 3 }]} />
          </View>
          <View style={[styles.sparkle, { top: 20, left: 30 }]}>
            <Ionicons name="sparkles" size={20} color="#FFD700" />
          </View>
          <View style={[styles.sparkle, { top: 40, right: 40 }]}>
            <Ionicons name="sparkles" size={16} color="#FFD700" />
          </View>
        </View>
      </View>
      <View style={styles.emptyTextContainer}>
        <Text style={styles.emptyTitle}>No Transactions Yet</Text>
        <Text style={styles.emptyDescription}>
          You haven't made any transactions yet. Your history will appear here
          once you start recharging & paying bills.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push("/(tabs)/explore")}
      >
        <Text style={styles.ctaButtonText}>Start Recharging</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTransactionItem = (transaction: Transaction) => {
    const ui = getTransactionUI(transaction.transaction_type);
    return (
      <TouchableOpacity key={transaction.id} style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.transactionIcon,
              { backgroundColor: `${ui.color}15` },
            ]}
          >
            {ui.icon.includes("bank") ? (
              <MaterialCommunityIcons
                name={ui.icon as any}
                size={24}
                color={ui.color}
              />
            ) : (
              <Ionicons
                name={ui.icon as any}
                size={22}
                color={ui.color}
              />
            )}
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionType}>{ui.label}</Text>
            <Text style={styles.transactionDate}>{transaction.date}</Text>
            <Text style={styles.transactionDesc} numberOfLines={1}>{transaction.description}</Text>
          </View>
        </View>

        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: ui.isCredit ? "#4CAF50" : "#1A1A1A" }
          ]}>
            {ui.isCredit ? "+" : "-"}₹{transaction.amount}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(transaction.status)}15` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(transaction.status) },
              ]}
            >
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTransactionsList = () => (
    <View style={styles.transactionsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {["All", "Success", "Pending", "Failed"].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={activeFilter === filter ? styles.filterTabTextActive : styles.filterTabText}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.transactionsList}>
        <Text style={styles.transactionsSectionTitle}>Recent Transactions</Text>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => renderTransactionItem(transaction))
        ) : (
          <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
            No transactions found for "{activeFilter}" filter.
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 4, y: 4 }}
          style={styles.header}
        >
          <View style={styles.decorativeWave} />
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#0D47A1" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction History</Text>
            <TouchableOpacity style={styles.filterButton} onPress={fetchTransactions}>
              <Ionicons name="refresh-outline" size={24} color="#0D47A1" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={{ color: "#999", marginTop: 12 }}>Loading transactions...</Text>
            </View>
          ) : hasTransactions ? (
            renderTransactionsList()
          ) : (
            renderEmptyState()
          )}
        </ScrollView>

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
            onPress={() => router.push("/(tabs)/mymoney")}
          >
            <Ionicons name="wallet-outline" size={24} color="#999" />
            <Text style={styles.navText}>My Money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/(tabs)/transactions")}
          >
            <Ionicons name="time-outline" size={24} color="#2196F3" />
            <Text style={[styles.navText, styles.navTextActive]}>Transactions</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  safeArea: { flex: 1 },
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    zIndex: 1,
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
    letterSpacing: 0.3,
  },
  filterButton: { padding: 5 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  illustrationContainer: { marginBottom: 30, alignItems: "center", justifyContent: "center" },
  illustrationCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#F1F8FE",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  clipboard: {
    width: 120,
    height: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#90CAF9",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  clipboardClip: {
    position: "absolute",
    top: -8,
    left: "50%" as any,
    marginLeft: -20,
    width: 40,
    height: 16,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#90CAF9",
  },
  clipboardContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 15 },
  rupeeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#BBDEFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  rupeeSymbol: { fontSize: 24, fontWeight: "bold", color: "#0D47A1" },
  clipboardLines: { gap: 8 },
  clipboardLine: { width: 60, height: 4, backgroundColor: "#BBDEFB", borderRadius: 2 },
  coinsStackLeft: { position: "absolute", bottom: 30, left: 20 },
  coinsStackRight: { position: "absolute", bottom: 30, right: 30 },
  coin: {
    position: "absolute",
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#2196F3",
    borderWidth: 3,
    borderColor: "#90CAF9",
    alignItems: "center",
    justifyContent: "center",
  },
  sparkle: { position: "absolute" },
  emptyTextContainer: { alignItems: "center", marginBottom: 30 },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  ctaButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D47A1",
    letterSpacing: 0.5,
  },

  // Transactions List
  transactionsContainer: { flex: 1, paddingTop: 10 },
  filterContainer: { maxHeight: 50, marginBottom: 15 },
  filterContent: { paddingHorizontal: 20, gap: 10 },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterTabActive: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  filterTabText: { fontSize: 14, color: "#666", fontWeight: "500" },
  filterTabTextActive: { fontSize: 14, color: "#FFFFFF", fontWeight: "bold" },
  transactionsList: { paddingHorizontal: 20 },
  transactionsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
    letterSpacing: 0.3,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionDetails: { flex: 1 },
  transactionType: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 2,
  },
  transactionDesc: {
    fontSize: 12,
    color: "#94A3B8",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "600" },

  // Bottom Nav
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
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  navText: { fontSize: 12, color: "#999", fontWeight: "500" },
  navTextActive: { color: "#2196F3", fontWeight: "bold" },
});
