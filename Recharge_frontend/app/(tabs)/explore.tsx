import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen({
  userName = "User",
}: {
  userName?: string;
}) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(true); // Default to true for demo

  // Ads data
  const ads = [
    {
      id: 1,
      title: "Mobile Recharge",
      discount: "Get 10% Cashback",
      description: "On recharges above ₹299",
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
      discount: "Flat ₹50 OFF",
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
      description: "Max cashback ₹100",
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
                  <Ionicons name="person" size={22} color="#1976D2" />
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
              <Text style={styles.taglineText}>All Digital Seva</Text>
              <Text style={styles.taglineText}>at One Place</Text>
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
                  <Text style={styles.cardTitle}>Maha E Seva Services</Text>
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
                </View>
              </View>
            </View>

            {/* Deals & Offers Section - Auto-scrollable Ads Box */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deals & Offers</Text>

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
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={ad.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.adGradient}
                      >
                        <View
                          style={[
                            styles.adBadge,
                            { backgroundColor: ad.badgeColor },
                          ]}
                        >
                          <Text style={styles.adBadgeText}>{ad.badge}</Text>
                        </View>

                        <View style={styles.adIconContainer}>
                          <View
                            style={[
                              styles.adIconCircle,
                              { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                            ]}
                          >
                            {ad.iconType === "ionicon" ? (
                              <Ionicons
                                name={ad.iconName as any}
                                size={18}
                                color={ad.iconColor}
                              />
                            ) : (
                              <MaterialCommunityIcons
                                name={ad.iconName as any}
                                size={18}
                                color={ad.iconColor}
                              />
                            )}
                          </View>
                        </View>

                        <Text style={[styles.adTitle, { color: ad.textColor }]}>
                          {ad.title}
                        </Text>
                        <Text
                          style={[styles.adDiscount, { color: ad.textColor }]}
                        >
                          {ad.discount}
                        </Text>
                        <Text
                          style={[
                            styles.adDescription,
                            { color: ad.textColor },
                          ]}
                        >
                          {ad.description}
                        </Text>

                        <View style={styles.adFooter}>
                          <Text
                            style={[styles.adCode, { color: ad.textColor }]}
                          >
                            Use: {ad.code}
                          </Text>
                          <Ionicons
                            name="arrow-forward-circle"
                            size={18}
                            color={ad.textColor}
                          />
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
              <Text style={styles.sectionTitle}>Gift Cards & Vouchers</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.vouchersScroll}
              >
                {/* MakeMyTrip */}
                <TouchableOpacity style={styles.voucherCard}>
                  <View style={styles.voucherIconCircle}>
                    <MaterialCommunityIcons
                      name="airplane"
                      size={28}
                      color="#1976D2"
                    />
                  </View>
                  <Text style={styles.voucherName}>MakeMyTrip</Text>
                </TouchableOpacity>

                {/* BookMyShow */}
                <TouchableOpacity style={styles.voucherCard}>
                  <View style={styles.voucherIconCircle}>
                    <MaterialCommunityIcons
                      name="movie-open"
                      size={28}
                      color="#C2185B"
                    />
                  </View>
                  <Text style={styles.voucherName}>BookMyShow</Text>
                </TouchableOpacity>

                {/* Zomato */}
                <TouchableOpacity style={styles.voucherCard}>
                  <View style={styles.voucherIconCircle}>
                    <Ionicons name="fast-food" size={28} color="#E23744" />
                  </View>
                  <Text style={styles.voucherName}>Zomato</Text>
                </TouchableOpacity>

                {/* Amazon */}
                <TouchableOpacity style={styles.voucherCard}>
                  <View style={styles.voucherIconCircle}>
                    <Ionicons name="cart" size={28} color="#FF9900" />
                  </View>
                  <Text style={styles.voucherName}>Amazon</Text>
                </TouchableOpacity>

                {/* Giva */}
                <TouchableOpacity style={styles.voucherCard}>
                  <View style={styles.voucherIconCircle}>
                    <MaterialCommunityIcons
                      name="diamond-stone"
                      size={28}
                      color="#8E24AA"
                    />
                  </View>
                  <Text style={styles.voucherName}>Giva</Text>
                </TouchableOpacity>

                {/* View All Arrow */}
                <TouchableOpacity style={styles.viewAllArrow}>
                  <Ionicons name="chevron-forward" size={28} color="#1A1A1A" />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation - Now with 4 icons */}
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

  adCard: {
    width: width - 40,
    height: 95,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  adGradient: {
    flex: 1,
    padding: 8,
    justifyContent: "space-between",
  },

  adBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 8,
  },

  adBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  adIconContainer: {
    marginTop: 4,
  },

  adIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  adTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
    letterSpacing: 0.3,
  },

  adDiscount: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 1,
  },

  adDescription: {
    fontSize: 9,
    opacity: 0.9,
    marginTop: 0,
  },

  adFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 3,
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },

  adCode: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
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
});