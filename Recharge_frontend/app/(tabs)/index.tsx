import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  // Logo pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animated dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Floating circles
  const p1Y = useRef(new Animated.Value(0)).current;
  const p2Y = useRef(new Animated.Value(0)).current;
  const p3Y = useRef(new Animated.Value(0)).current;
  const p4Y = useRef(new Animated.Value(0)).current;
  const p1Opacity = useRef(new Animated.Value(0.25)).current;
  const p2Opacity = useRef(new Animated.Value(0.18)).current;
  const p3Opacity = useRef(new Animated.Value(0.2)).current;
  const p4Opacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating particles
    const floatParticle = (
      anim: Animated.Value,
      opacityAnim: Animated.Value,
      delay: number,
      duration: number = 2800
    ) => {
      setTimeout(() => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim, {
                toValue: -28,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: 0,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(opacityAnim, {
                toValue: 0.45,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0.1,
                duration,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      }, delay);
    };
    floatParticle(p1Y, p1Opacity, 0, 3000);
    floatParticle(p2Y, p2Opacity, 600, 2400);
    floatParticle(p3Y, p3Opacity, 1200, 3600);
    floatParticle(p4Y, p4Opacity, 800, 2800);

    // Bouncing dots
    const animateDot = (dot: Animated.Value, delay: number) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -10,
              duration: 380,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 380,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };
    animateDot(dot1, 0);
    animateDot(dot2, 220);
    animateDot(dot3, 440);

    // Navigate — 3 seconds
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        setTimeout(() => {
          if (token) {
            router.replace("/(tabs)/explore");
          } else {
            router.replace("/auth/login");
          }
        }, 1500);
      } catch (error) {
        console.error("Auth check error:", error);
        router.replace("/auth/login");
      }
    };
    checkAuth();
  }, []);

  return (
    <LinearGradient
      colors={["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Top-right decorative arc (static, subtle) */}
      <View style={styles.topArc} pointerEvents="none" />
      <View style={styles.topArcInner} pointerEvents="none" />

      {/* Floating animated circles */}
      <Animated.View
        style={[
          styles.particle,
          {
            top: height * 0.08,
            left: width * 0.06,
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: "#0D47A1",
          },
          { opacity: p1Opacity, transform: [{ translateY: p1Y }] },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.particle,
          {
            top: height * 0.62,
            right: width * 0.05,
            width: 65,
            height: 65,
            borderRadius: 33,
            backgroundColor: "#1976D2",
          },
          { opacity: p2Opacity, transform: [{ translateY: p2Y }] },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.particle,
          {
            top: height * 0.28,
            right: width * 0.08,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#0D47A1",
          },
          { opacity: p3Opacity, transform: [{ translateY: p3Y }] },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.particle,
          {
            bottom: height * 0.2,
            left: width * 0.08,
            width: 55,
            height: 55,
            borderRadius: 28,
            backgroundColor: "#1565C0",
          },
          { opacity: p4Opacity, transform: [{ translateY: p4Y }] },
        ]}
        pointerEvents="none"
      />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }],
          },
        ]}
      >
        {/* Pulsing Logo Ring */}
        <Animated.View
          style={[styles.logoRing, { transform: [{ scale: pulseAnim }] }]}
        >
          <LinearGradient
            colors={["#0D47A1", "#1976D2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <Ionicons name="flash" size={40} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        {/* App Name */}
        <Text style={styles.appName}>PayIndia</Text>

        {/* Tagline */}
        <View style={styles.taglineRow}>
          <Text style={styles.taglineNormal}>Fast • Secure • </Text>
          <Text style={styles.taglineHighlight}>Instant</Text>
        </View>

        {/* Feature Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={12} color="#0D47A1" />
            <Text style={styles.badgeText}>Bank-grade Security</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="flash" size={12} color="#1976D2" />
            <Text style={styles.badgeText}>10-sec Recharge</Text>
          </View>
        </View>

        {/* Loading Dots */}
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[styles.dot, styles.dotDark, { transform: [{ translateY: dot1 }] }]}
          />
          <Animated.View
            style={[styles.dot, styles.dotMid, { transform: [{ translateY: dot2 }] }]}
          />
          <Animated.View
            style={[styles.dot, styles.dotLight, { transform: [{ translateY: dot3 }] }]}
          />
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Ionicons name="lock-closed" size={11} color="rgba(13,71,161,0.45)" />
          <Text style={styles.footerText}>
            256-bit SSL Encrypted  •  Powered by PayIndia
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // Decorative arcs (top right)
  topArc: {
    position: "absolute",
    top: -height * 0.14,
    right: -width * 0.28,
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    pointerEvents: "none",
  },
  topArcInner: {
    position: "absolute",
    top: -height * 0.08,
    right: -width * 0.15,
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.275,
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    pointerEvents: "none",
  },

  particle: {
    position: "absolute",
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },

  logoRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(13, 71, 161, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "rgba(13, 71, 161, 0.18)",
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },

  appName: {
    fontSize: 42,
    fontWeight: "800",
    color: "#0D47A1",
    letterSpacing: 2.5,
    marginBottom: 8,
    textShadowColor: "rgba(13, 71, 161, 0.15)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },

  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  taglineNormal: {
    fontSize: 14,
    color: "rgba(13, 71, 161, 0.6)",
    fontWeight: "500",
    letterSpacing: 0.4,
  },
  taglineHighlight: {
    fontSize: 14,
    color: "#0D47A1",
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  badgeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 44,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(13, 71, 161, 0.15)",
  },
  badgeText: {
    fontSize: 11,
    color: "#0D47A1",
    fontWeight: "600",
  },

  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 36,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  dotDark: { backgroundColor: "#0D47A1" },
  dotMid: { backgroundColor: "#1976D2" },
  dotLight: { backgroundColor: "#42A5F5" },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingBottom: 36,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  footerText: {
    fontSize: 10.5,
    color: "rgba(13, 71, 161, 0.45)",
    fontWeight: "400",
    letterSpacing: 0.2,
  },
});
