import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

export default function GetStartedScreen() {
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem("hasLaunched", "true");
      router.replace("/auth/login");
    } catch (e) {
      console.error("Error setting hasLaunched", e);
      router.replace("/auth/login"); // Fallback
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Blue Section with Monuments */}
      <View style={styles.topSection}>
        <LinearGradient
          colors={["#0F4C75", "#3282B8"]}
          style={styles.gradient}
        >
          {/* Faint Architectural Backdrop */}
          <Image
            source={require("../assets/images/monuments.png")}
            style={styles.monumentsBg}
            resizeMode="cover"
          />

          <SafeAreaView style={styles.headerContent}>
            {/* Logo and Name */}
            <View style={styles.logoWrapper}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logoIcon}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Pay<Text style={{ color: '#FF7043' }}>India</Text></Text>
              <Text style={styles.tagline}>India's Smart Payment App</Text>
            </View>
          </SafeAreaView>

          {/* Wavy Separator */}
          <View style={styles.waveContainer}>
            <View style={styles.waveBowl} />
          </View>
        </LinearGradient>
      </View>

      {/* Bottom White Section */}
      <View style={styles.bottomSection}>
        <View style={styles.contentPadding}>
          <Text style={styles.mainTitle}>Manage Payments,{"\n"}Pay with Confidence</Text>

          {/* Feature Grid */}
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="flash" size={24} color="#1E88E5" />
              </View>
              <Text style={styles.featureLabel}>Instant{"\n"}Payments</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="shield-checkmark" size={24} color="#43A047" />
              </View>
              <Text style={styles.featureLabel}>Secure{"\n"}& Safe</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#F3E5F5' }]}>
                <MaterialCommunityIcons name="store" size={24} color="#8E24AA" />
              </View>
              <Text style={styles.featureLabel}>UPI, Bills,{"\n"}Recharges</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#1A73E8", "#0D47A1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>Secure • Fast • Trusted by Millions</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topSection: {
    height: height * 0.52,
    width: width,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  monumentsBg: {
    position: 'absolute',
    width: width,
    height: '100%',
    opacity: 0.15,
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginTop: 4,
  },
  waveContainer: {
    position: 'absolute',
    bottom: -height * 0.18,
    left: -width * 0.25,
    width: width * 1.5,
    height: height * 0.35,
    zIndex: 10,
  },
  waveBowl: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
    transform: [{ scaleY: 0.8 }],
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: -20, // Overlap the wave
  },
  contentPadding: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 10,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1B263B",
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 40,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 50,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: "#1A73E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
