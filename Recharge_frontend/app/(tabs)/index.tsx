import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animated dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animated dots - bouncing up and down
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, {
            toValue: -15,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot1, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot2, {
              toValue: -15,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }, 200);

      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot3, {
              toValue: -15,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }, 400);
    };

    animateDots();

    // Navigate after check
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        // Allow splash to show for at least 1.5s
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
      {/* Wavy Line - Top Right */}
      <Svg height="200" width={width} style={styles.waveTopRight}>
        <Path
          d={`M ${width} 0 Q ${width - 50} 50, ${width} 100 L ${width} 0 Z`}
          fill="#BBDEFB"
          opacity="0.3"
        />
        <Path
          d={`M ${width} 20 Q ${width - 80} 80, ${width} 140 L ${width} 20 Z`}
          fill="#90CAF9"
          opacity="0.25"
        />
      </Svg>

      {/* Wavy Line - Bottom Left */}
      <Svg height="200" width={width} style={styles.waveBottomLeft}>
        <Path
          d="M 0 200 Q 50 150, 0 100 L 0 200 Z"
          fill="#BBDEFB"
          opacity="0.3"
        />
        <Path
          d="M 0 180 Q 80 120, 0 60 L 0 180 Z"
          fill="#90CAF9"
          opacity="0.25"
        />
      </Svg>

      {/* Main Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* App Name - Yellow */}
        <Text style={styles.appName}>PayIndia</Text>

        {/* Tagline - Black */}
        <Text style={styles.tagline}>Fast & Secure Payments</Text>

        {/* Animated Loading Dots - Black */}
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot1 }] }]}
          />
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot2 }] }]}
          />
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot3 }] }]}
          />
        </View>
      </Animated.View>

      {/* Footer */}
      <Text style={styles.footer}>Powered by PayIndia</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Wavy Lines Position
  waveTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  waveBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },

  // Main Content
  content: {
    alignItems: "center",
    justifyContent: "center",
  },

  // App Name - Yellow
  appName: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 15,
    letterSpacing: 2,
    textShadowColor: "rgba(13, 71, 161, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },

  // Tagline - Black
  tagline: {
    fontSize: 18,
    color: "#0D47A1",
    marginBottom: 60,
    fontWeight: "500",
    letterSpacing: 1,
  },

  // Animated Dots Container
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    height: 40,
  },

  // Individual Dot - Black
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0D47A1",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 50,
    fontSize: 14,
    color: "#0D47A1",
    opacity: 0.7,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});
