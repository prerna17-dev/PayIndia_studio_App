import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../../constants/api";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(false);

  // Timer countdown for OTP
  useEffect(() => {
    if (step === "otp") {
      const interval = setInterval(() => {
        setTimer((prev: number) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleSendOTP = async () => {
    if (phoneNumber.length === 10) {
      setIsLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.SEND_OTP, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: phoneNumber }),
        });

        const data = await response.json();

        if (response.ok) {
          Animated.timing(slideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          setStep("otp");
          setTimer(30);
          console.log("OTP sent successfully to:", phoneNumber);
        } else {
          alert(data.message || "Failed to send OTP. Please try again.");
        }
      } catch (error) {
        console.error("error sending otp", error);
        alert("Server error. Please check if backend is running.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please enter a valid 10-digit mobile number");
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length === 6) {
      setIsLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: phoneNumber, otp: otpCode }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Login successful. Token:", data.token);
          console.log("User data:", data.user);
          // TODO: Store token securely
          router.replace("/(tabs)/explore");
        } else {
          alert(data.message || "Invalid OTP. Please try again.");
        }
      } catch (error) {
        console.error("error verifying otp", error);
        alert("Server error. Please check if backend is running.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please enter complete OTP");
    }
  };

  const handleResend = () => {
    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    handleSendOTP();
  };

  const handleChangeNumber = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setStep("phone");
    setOtp(["", "", "", "", "", ""]);
    setPhoneNumber("");
  };

  return (
    <View style={styles.container}>
      {/* ✅ FIX 1: Hides the "auth/login" header bar */}
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar style="dark" />

      {/* Top Yellow Section */}
      <LinearGradient
        colors={["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topSection}
      >
        {/* Decorative Wave */}
        <View style={styles.decorativeWave} />

        {/* Header Content */}
        <View style={styles.headerContent}>
          {step === "otp" && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleChangeNumber}
            >
              <Ionicons name="arrow-back" size={24} color="#0D47A1" />
            </TouchableOpacity>
          )}

          <View style={styles.logoContainer}>
            {step === "phone" ? (
              <>
                <Text style={styles.appName}>PayIndia</Text>
                <Text style={styles.loginText}>Login to your account</Text>
              </>
            ) : (
              <Ionicons name="lock-closed" size={60} color="#0D47A1" />
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Bottom White Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.bottomSection}
      >
        {/* ✅ FIX 2: Changed justifyContent to 'flex-start' + small paddingTop for the gap */}
        <View style={styles.formContainer}>
          {/* Phone Number Input */}
          {step === "phone" && (
            <Animated.View style={styles.phoneSection}>
              {/* Welcome Text */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Welcome!</Text>
                <Text style={styles.welcomeSubtitle}>
                  Enter your mobile number to continue
                </Text>
              </View>

              {/* Phone Input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    autoFocus
                  />
                </View>
              </View>

              {/* Send OTP Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  phoneNumber.length === 10 && !isLoading
                    ? styles.actionButtonActive
                    : styles.actionButtonInactive,
                ]}
                onPress={handleSendOTP}
                disabled={phoneNumber.length !== 10 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.actionButtonText}>Send OTP</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                  </>
                )}
              </TouchableOpacity>

              {/* Terms & Conditions */}
              <Text style={styles.termsText}>
                By continuing, you agree to our{" "}
                <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </Animated.View>
          )}

          {/* OTP Input */}
          {step === "otp" && (
            <Animated.View style={styles.otpSection}>
              {/* Title */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Verification Code</Text>
                <Text style={styles.subtitle}>
                  We have sent a 6-digit code to{"\n"}
                  <Text style={styles.phoneText}>+91 {phoneNumber}</Text>
                </Text>
                <TouchableOpacity onPress={handleChangeNumber}>
                  <Text style={styles.changeNumber}>Change Number</Text>
                </TouchableOpacity>
              </View>

              {/* OTP Input Boxes */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    autoFocus={index === 0}
                  />
                ))}
              </View>

              {/* Timer & Resend */}
              <View style={styles.resendSection}>
                {timer > 0 ? (
                  <Text style={styles.timerText}>
                    Resend OTP in{" "}
                    <Text style={styles.timerCount}>{timer}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendButton}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  otp.join("").length === 6 && !isLoading
                    ? styles.actionButtonActive
                    : styles.actionButtonInactive,
                ]}
                onPress={handleVerify}
                disabled={otp.join("").length !== 6 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.actionButtonText}>Verify & Continue</Text>
                    <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Top Yellow Section
  topSection: {
    height: "15%",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: "relative",
    overflow: "hidden",
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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  appName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0D47A1",
    letterSpacing: 1,
    marginBottom: 8,
  },

  loginText: {
    fontSize: 16,
    color: "#0D47A1",
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // Bottom White Section
  bottomSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // ✅ FIX 2: flex-start + paddingTop: 24 for a small gap below the yellow section
  formContainer: {
    flex: 1,
    padding: 30,
    paddingTop: 24,
    justifyContent: "flex-start",
  },

  // Phone Section
  phoneSection: {
    width: "100%",
  },

  welcomeSection: {
    marginBottom: 30,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 10,
  },

  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 20,
  },

  inputSection: {
    marginBottom: 25,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },

  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#90CAF9",
    borderRadius: 12,
    backgroundColor: "#F1F8FE",
    overflow: "hidden",
  },

  countryCode: {
    paddingHorizontal: 15,
    paddingVertical: 18,
    backgroundColor: "#BBDEFB",
    borderRightWidth: 2,
    borderRightColor: "#90CAF9",
  },

  countryCodeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
  },

  phoneInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 18,
    fontSize: 18,
    color: "#1A1A1A",
    fontWeight: "600",
  },

  // OTP Section
  otpSection: {
    width: "100%",
  },

  titleSection: {
    alignItems: "center",
    marginBottom: 35,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },

  phoneText: {
    fontWeight: "bold",
    color: "#2196F3",
    fontSize: 16,
  },

  changeNumber: {
    marginTop: 12,
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    paddingHorizontal: 5,
  },

  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
    backgroundColor: "#F9F9F9",
  },

  otpBoxFilled: {
    borderColor: "#2196F3",
    backgroundColor: "#F1F8FE",
  },

  resendSection: {
    alignItems: "center",
    marginBottom: 30,
  },

  timerText: {
    fontSize: 14,
    color: "#666",
  },

  timerCount: {
    fontWeight: "bold",
    color: "#2196F3",
  },

  resendButton: {
    fontSize: 15,
    color: "#2196F3",
    fontWeight: "bold",
  },

  // Action Button
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  actionButtonActive: {
    backgroundColor: "#2196F3",
  },

  actionButtonInactive: {
    backgroundColor: "#E0E0E0",
  },

  actionButtonText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFF",
    letterSpacing: 0.5,
  },

  // Terms
  termsText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 25,
    lineHeight: 18,
  },

  termsLink: {
    color: "#2196F3",
    fontWeight: "600",
  },
});
