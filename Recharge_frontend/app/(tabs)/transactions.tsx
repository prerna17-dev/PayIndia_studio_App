import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import {
  BackHandler,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Mock transaction data - you can replace this with actual data from your backend
interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: "success" | "pending" | "failed";
  category: string;
  icon: string;
  iconColor: string;
}

export default function HistoryScreen() {
  const router = useRouter();

  // Set this to true when user has transactions, false for empty state
  const [hasTransactions, setHasTransactions] = React.useState(false);

  // Sample transactions data
  const transactions: Transaction[] = [
    {
      id: "1",
      type: "Mobile Recharge",
      amount: 299,
      date: "Feb 09, 2026 • 11:30 AM",
      status: "success",
      category: "Recharge",
      icon: "phone-portrait",
      iconColor: "#4CAF50",
    },
    {
      id: "2",
      type: "Electricity Bill",
      amount: 1850,
      date: "Feb 08, 2026 • 03:45 PM",
      status: "success",
      category: "Bill Payment",
      icon: "bulb",
      iconColor: "#2196F3",
    },
    {
      id: "3",
      type: "DTH Recharge",
      amount: 450,
      date: "Feb 07, 2026 • 09:20 AM",
      status: "pending",
      category: "Recharge",
      icon: "satellite-variant",
      iconColor: "#FF9800",
    },
    {
      id: "4",
      type: "Water Bill",
      amount: 680,
      date: "Feb 05, 2026 • 02:15 PM",
      status: "success",
      category: "Bill Payment",
      icon: "water",
      iconColor: "#2196F3",
    },
    {
      id: "5",
      type: "Mobile Recharge",
      amount: 599,
      date: "Feb 03, 2026 • 06:30 PM",
      status: "failed",
      category: "Recharge",
      icon: "phone-portrait",
      iconColor: "#F44336",
    },
  ];

  React.useEffect(() => {
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
    router.push("/(tabs)/explore");
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationCircle}>
          {/* Clipboard */}
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

          {/* Coins Stack - Left */}
          <View style={styles.coinsStackLeft}>
            <View style={[styles.coin, { bottom: 0, left: 0 }]} />
            <View style={[styles.coin, { bottom: 8, left: 2 }]} />
            <View style={[styles.coin, { bottom: 16, left: 4 }]} />
          </View>

          {/* Coins Stack - Right Bottom */}
          <View style={styles.coinsStackRight}>
            <View style={[styles.coin, { bottom: 0, right: 0 }]} />
            <View style={[styles.coin, { bottom: 6, right: 3 }]} />
          </View>

          {/* Magnifying Glass */}
          <View style={styles.magnifyingGlass}>
            <View style={styles.magnifyingLens} />
            <View style={styles.magnifyingHandle} />
          </View>

          {/* Hourglass */}
          <View style={styles.hourglass}>
            <View style={styles.hourglassTop} />
            <View style={styles.hourglassMiddle} />
            <View style={styles.hourglassBottom} />
          </View>

          {/* Sparkles */}
          <View style={[styles.sparkle, { top: 20, left: 30 }]}>
            <Ionicons name="sparkles" size={20} color="#FFD700" />
          </View>
          <View style={[styles.sparkle, { top: 40, right: 40 }]}>
            <Ionicons name="sparkles" size={16} color="#FFD700" />
          </View>
          <View style={[styles.sparkle, { bottom: 60, left: 50 }]}>
            <Ionicons name="sparkles" size={14} color="#FFD700" />
          </View>
          <View style={[styles.sparkle, { bottom: 40, right: 30 }]}>
            <Ionicons name="sparkles" size={18} color="#FFD700" />
          </View>
        </View>
      </View>

      {/* Text Content */}
      <View style={styles.emptyTextContainer}>
        <Text style={styles.emptyTitle}>No Transactions Yet</Text>
        <Text style={styles.emptyDescription}>
          You haven't made any transactions yet. Your history will appear here
          once you start recharging & paying bills.
        </Text>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push("/(tabs)/explore")}
      >
        <Text style={styles.ctaButtonText}>Start Recharging</Text>
      </TouchableOpacity>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "failed":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Success";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const renderTransactionItem = (transaction: Transaction) => (
    <TouchableOpacity key={transaction.id} style={styles.transactionCard}>
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: `${transaction.iconColor}15` },
          ]}
        >
          {transaction.icon === "satellite-variant" ? (
            <MaterialCommunityIcons
              name={transaction.icon as any}
              size={24}
              color={transaction.iconColor}
            />
          ) : (
            <Ionicons
              name={transaction.icon as any}
              size={24}
              color={transaction.iconColor}
            />
          )}
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionType}>{transaction.type}</Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
      </View>

      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>₹{transaction.amount}</Text>
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
            {getStatusText(transaction.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTransactionsList = () => (
    <View style={styles.transactionsContainer}>
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity style={[styles.filterTab, styles.filterTabActive]}>
          <Text style={styles.filterTabTextActive}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Success</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Failed</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Transactions List */}
      <View style={styles.transactionsList}>
        <Text style={styles.transactionsSectionTitle}>Recent Transactions</Text>
        {transactions.map((transaction) => renderTransactionItem(transaction))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <LinearGradient
          colors={["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 4, y: 4 }}
          style={styles.header}
        >
          {/* Decorative Wave */}
          <View style={styles.decorativeWave} />

          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color="#0D47A1" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction History</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="filter-outline" size={24} color="#0D47A1" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {hasTransactions ? renderTransactionsList() : renderEmptyState()}
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
            <Ionicons name="wallet-outline" size={24} color="#999" />
            <Text style={styles.navText}>My Money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/transactions")}
          >
            <Ionicons name="time-outline" size={24} color="#2196F3" />
            <Text style={[styles.navText, styles.navTextActive]}>
              Transactions
            </Text>
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
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  safeArea: {
    flex: 1,
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

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60, // Increased padding
    paddingBottom: 15,
    zIndex: 1,
  },

  backButton: {
    padding: 5,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
    letterSpacing: 0.3,
  },

  filterButton: {
    padding: 5,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  illustrationContainer: {
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },

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
    left: "50%",
    marginLeft: -20,
    width: 40,
    height: 16,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#90CAF9",
  },

  clipboardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 15,
  },

  rupeeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#BBDEFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  rupeeSymbol: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D47A1",
  },

  clipboardLines: {
    gap: 8,
  },

  clipboardLine: {
    width: 60,
    height: 4,
    backgroundColor: "#BBDEFB",
    borderRadius: 2,
  },

  coinsStackLeft: {
    position: "absolute",
    bottom: 30,
    left: 20,
  },

  coinsStackRight: {
    position: "absolute",
    bottom: 30,
    right: 30,
  },

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

  magnifyingGlass: {
    position: "absolute",
    right: 15,
    top: 60,
  },

  magnifyingLens: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#2196F3",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },

  magnifyingHandle: {
    position: "absolute",
    bottom: -15,
    right: -5,
    width: 4,
    height: 20,
    backgroundColor: "#2196F3",
    transform: [{ rotate: "45deg" }],
    borderRadius: 2,
  },

  hourglass: {
    position: "absolute",
    right: 25,
    bottom: 50,
    alignItems: "center",
  },

  hourglassTop: {
    width: 20,
    height: 15,
    backgroundColor: "#BBDEFB",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: 2,
    borderColor: "#2196F3",
  },

  hourglassMiddle: {
    width: 8,
    height: 6,
    backgroundColor: "#2196F3",
    marginVertical: -2,
  },

  hourglassBottom: {
    width: 20,
    height: 15,
    backgroundColor: "#BBDEFB",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderWidth: 2,
    borderColor: "#2196F3",
  },

  sparkle: {
    position: "absolute",
  },

  emptyTextContainer: {
    alignItems: "center",
    marginBottom: 30,
  },

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

  // Transactions List Styles
  transactionsContainer: {
    flex: 1,
    paddingTop: 10,
  },

  filterContainer: {
    maxHeight: 50,
    marginBottom: 15,
  },

  filterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },

  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  filterTabActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },

  filterTabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  filterTabTextActive: {
    fontSize: 14,
    color: "#0D47A1",
    fontWeight: "bold",
  },

  transactionsList: {
    paddingHorizontal: 20,
  },

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

  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  transactionDetails: {
    flex: 1,
  },

  transactionType: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },

  transactionDate: {
    fontSize: 12,
    color: "#999",
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

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
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
});
