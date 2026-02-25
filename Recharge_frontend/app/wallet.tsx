import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function WalletScreen() {
  const router = useRouter();

  // State for auto-use toggle
  const [isAutoUseEnabled, setIsAutoUseEnabled] = React.useState(false);

  const handleToggle = () => {
    setIsAutoUseEnabled(!isAutoUseEnabled);
  };

  const handleBackPress = () => {
    router.push({
      pathname: "/(tabs)/explore",
      params: {},
    });
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
                  <Text style={styles.balanceAmount}>₹0.00</Text>
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
                <TouchableOpacity style={styles.addMoneyButton}>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.addMoneyText}>Add Money</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.withdrawButton}>
                  <Text style={styles.withdrawText}>Withdraw</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

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

          {/* Empty State - No Activity */}
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <MaterialCommunityIcons
                name="wallet-outline"
                size={80}
                color="#E0E0E0"
              />
            </View>
            <Text style={styles.emptyStateTitle}>No Activity Yet</Text>
            <Text style={styles.emptyStateText}>
              Your wallet transactions will appear here
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Add money to get started with your wallet
            </Text>
          </View>

          <TouchableOpacity style={styles.walletInfo}>
            <Ionicons name="information-circle" size={20} color="#999" />
            <Text style={styles.walletInfoText}>Wallet Info</Text>
          </TouchableOpacity>
        </ScrollView>

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
});
