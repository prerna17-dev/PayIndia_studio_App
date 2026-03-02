import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  BackHandler,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AccountScreen() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    setShowLogoutSuccess(true);

    // Redirect after a short delay
    setTimeout(() => {
      setShowLogoutSuccess(false);
      router.replace("/auth/login");
    }, 1500);
  };

  // Handle hardware back button - go to home screen
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        // Go to home/explore screen
        router.replace("/(tabs)/explore");
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }, [router]),
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)/explore")}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Account</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Section - Reduced Width */}
          <View style={styles.profileSection}>
            <TouchableOpacity
              style={styles.profileIconContainer}
              onPress={() => router.push("/personal-details")}
            >
              <Ionicons name="person-circle" size={80} color="#2196F3" />
              <View style={styles.editPencilContainer}>
                <Ionicons name="pencil" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.profileName}>User</Text>
            <Text style={styles.profilePhone}>+91 XXXXXXXXXX</Text>
          </View>

          {/* Refer & Earn Banner */}
          <TouchableOpacity
            style={styles.referBannerContainer}
            onPress={() => router.push("/refer-earn")}
          >
            <LinearGradient
              colors={["#F1F8FE", "#BBDEFB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.referBanner}
            >
              <View style={styles.referContent}>
                <Text style={styles.referEmoji}>🎉</Text>
                <View style={styles.referTextContainer}>
                  <Text style={styles.referTitle}>Refer & Earn ₹5 - 100</Text>
                  <Text style={styles.referSubtitle}>
                    Invite friends & earn cashback
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#0D47A1" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Add Bank Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>

            <TouchableOpacity
              style={styles.addBankCard}
              onPress={() => router.push("/select-bank")}
            >
              <LinearGradient
                colors={["#F1F8FE", "#BBDEFB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addBankGradient}
              >
                {/* Bank Icon */}
                <TouchableOpacity
                  style={styles.bankIconContainer}
                  onPress={() => router.push("/select-bank")}
                >
                  <View style={styles.bankIconCircle}>
                    <MaterialCommunityIcons
                      name="bank"
                      size={50}
                      color="#0D47A1"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.plusCircle}
                    onPress={() => router.push("/select-bank")}
                  >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* Text */}
                <Text style={styles.addBankTitle}>Add Bank Account</Text>
                <Text style={styles.addBankSubtitle}>
                  Link your bank account for faster payments
                </Text>

                {/* Button */}
                <TouchableOpacity
                  style={styles.addBankButton}
                  onPress={() => router.push("/select-bank")}
                >
                  <Text style={styles.addBankButtonText}>Add Account</Text>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Menu Items Section */}
          <View style={styles.section}>
            {/* Personal Details */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/personal-details")}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#E3F2FD" }]}>
                  <Ionicons name="person-outline" size={22} color="#1976D2" />
                </View>
                <Text style={styles.menuItemText}>Personal Details</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            {/* Bank Account */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/bank-accounts")}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#F1F8FE" }]}>
                  <MaterialCommunityIcons
                    name="bank-outline"
                    size={22}
                    color="#2196F3"
                  />
                </View>
                <Text style={styles.menuItemText}>Bank Account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            {/* Security */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/security")}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#FCE4EC" }]}>
                  <MaterialCommunityIcons
                    name="shield-lock-outline"
                    size={22}
                    color="#C2185B"
                  />
                </View>
                <Text style={styles.menuItemText}>Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            {/* Autopay */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/autopay")}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#E8F5E9" }]}>
                  <MaterialCommunityIcons
                    name="calendar-sync"
                    size={22}
                    color="#4CAF50"
                  />
                </View>
                <Text style={styles.menuItemText}>Autopay</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/help-support")}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#F3E5F5" }]}>
                  <Ionicons
                    name="help-circle-outline"
                    size={22}
                    color="#9C27B0"
                  />
                </View>
                <Text style={styles.menuItemText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            {/* Settings */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/settings")}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#FFF3E0" }]}>
                  <Ionicons name="settings-outline" size={22} color="#FF9800" />
                </View>
                <Text style={styles.menuItemText}>Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Small Logout Button exactly below Settings section */}
          <TouchableOpacity
            style={styles.smallLogoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <Ionicons name="log-out-outline" size={18} color="#E53935" />
            <Text style={styles.smallLogoutText}>Logout</Text>
          </TouchableOpacity>

          {/* App Version at the very last */}
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>



        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalDismiss}
              activeOpacity={1}
              onPress={() => setShowLogoutModal(false)}
            />
            <View style={styles.bottomSheet}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="warning-outline" size={32} color="#E53935" />
              </View>
              <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleLogout}
                >
                  <Text style={styles.confirmButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Logout Success Overlay */}
        <Modal
          visible={showLogoutSuccess}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.successOverlay}>
            <View style={styles.successCard}>
              <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
              <Text style={styles.successText}>Logout Successful !</Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  placeholder: {
    width: 34,
  },

  // Profile Section - Reduced Width
  profileSection: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 5,
    marginBottom: 0,
  },
  profileIconContainer: {
    marginBottom: 6,
    position: "relative",
  },
  editPencilContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#4CAF50",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 3,
  },
  profilePhone: {
    fontSize: 14,
    color: "#666",
  },

  // Refer & Earn Banner
  referBannerContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 15,
  },
  referBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  referContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  referEmoji: {
    fontSize: 24,
  },
  referTextContainer: {
    gap: 2,
  },
  referTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0D47A1",
    letterSpacing: 0.2,
  },
  referSubtitle: {
    fontSize: 11,
    color: "#0D47A1",
    opacity: 0.8,
  },

  // Add Bank Account Card
  section: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
  },
  addBankCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  addBankGradient: {
    padding: 12,
    alignItems: "center",
  },
  bankIconContainer: {
    position: "relative",
    marginBottom: 15,
  },
  bankIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#90CAF9",
  },
  plusCircle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 18,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  addBankTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 8,
  },
  addBankSubtitle: {
    fontSize: 13,
    color: "#0D47A1",
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.8,
  },
  addBankButton: {
    backgroundColor: "#0D47A1",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 15,
  },
  addBankButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Menu Items
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E53935",
  },

  // Version
  versionSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: "#999",
  },
  smallLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FFEBEE',
    alignSelf: 'flex-start',
    marginLeft: 15,
  },
  smallLogoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E53935",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  warningIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#E53935',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 15,
  },
});
