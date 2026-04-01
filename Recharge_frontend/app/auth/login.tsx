import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../../constants/api";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (step === "otp") {
      const interval = setInterval(() => {
        setTimer((prev: number) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (step === "otp") {
          setStep("phone");
          return true;
        } else {
          BackHandler.exitApp();
          return true;
        }
      };
      const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => backHandler.remove();
    }, [step])
  );

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
          setStep("otp");
          setTimer(30);
        } else {
          alert(data.message || "Failed to send OTP.");
        }
      } catch (error) {
        alert("Server error. Please check if backend is running.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please enter a valid 10-digit mobile number");
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const pasteString = value.slice(0, 4);
      const newOtp = [...otp];
      for (let i = 0; i < pasteString.length; i++) {
        newOtp[i] = pasteString[i];
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(pasteString.length - 1, 3)]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length === 4) {
      setIsLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: phoneNumber, otp: otpCode, name: name }),
        });
        const data = await response.json();
        if (response.ok) {
          await AsyncStorage.setItem("userToken", data.token);
          if (data.user) await AsyncStorage.setItem("userData", JSON.stringify(data.user));

          // Clear popup flag to ensure new login shows the completion nudge in Explore
          await AsyncStorage.removeItem("@profile_popup_shown");

          router.replace("/(tabs)/explore");
        } else {
          alert(data.message || "Invalid OTP.");
        }
      } catch (error) {
        alert("Server error.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please enter complete OTP");
    }
  };

  const renderPhoneStep = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerSpacer} />
      <Text style={styles.title}>Login to your account!</Text>
      <Text style={styles.subtitle}>Hello, welcome ! 👋</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <View style={styles.inputWrapper}>
          <View style={styles.flagContainer}>
            <Image source={{ uri: "https://flagcdn.com/w40/in.png" }} style={styles.flag} />
            <Text style={styles.phonePrefix}>+91</Text>
            <View style={styles.divider} />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Enter mobile number"
            placeholderTextColor="#CBD5E1"
            keyboardType="phone-pad"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          {phoneNumber.length === 10 && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, phoneNumber.length !== 10 && styles.buttonDisabled]}
        onPress={handleSendOTP}
        disabled={phoneNumber.length !== 10 || isLoading}
      >
        {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Request OTP</Text>}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderOtpStep = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity style={styles.backFab} onPress={() => setStep("phone")}>
        <Ionicons name="chevron-back" size={24} color="#1E293B" />
      </TouchableOpacity>

      <Image
        source={require("../../assets/images/otp_illustration.png")}
        style={styles.illustration}
        resizeMode="contain"
      />

      <Text style={styles.titleCenter}>Verification code</Text>
      <Text style={styles.subtitleCenter}>Please enter the verification code sent to your mobile number.</Text>

      <View style={styles.phoneDisplayRow}>
        <Text style={styles.phoneDisplayText}>+91 {phoneNumber}</Text>
        <TouchableOpacity onPress={() => setStep("phone")}>
          <Ionicons name="pencil" size={16} color="#247189" />
        </TouchableOpacity>
      </View>

      <View style={styles.otpBoxesRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[styles.otpInput, digit ? styles.otpInputActive : null]}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(v) => handleOtpChange(v, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            autoFocus={index === 0}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.resendLink} onPress={() => timer === 0 && handleSendOTP()}>
        <Text style={[styles.resendText, timer > 0 && { color: "#CBD5E1" }]}>{timer > 0 ? `Resend in ${timer}s` : "Resend"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryButton, otp.join("").length !== 4 && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={otp.join("").length !== 4 || isLoading}
      >
        {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Submit</Text>}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {step === "phone" ? renderPhoneStep() : renderOtpStep()}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 30, paddingBottom: 40 },
  headerSpacer: { height: height * 0.1 },
  title: { fontSize: 24, fontWeight: "800", color: "#1E293B", marginBottom: 4 },
  titleCenter: { fontSize: 24, fontWeight: "800", color: "#1E293B", textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#64748B", fontWeight: "500", marginBottom: 40 },
  subtitleCenter: { fontSize: 14, color: "#64748B", textAlign: 'center', lineHeight: 20, paddingHorizontal: 20, marginBottom: 10 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, color: "#94A3B8", fontWeight: "600", marginBottom: 8 },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 15, height: 56, backgroundColor: "#F8FAFC" },
  textInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: "600", color: "#1E293B" },
  flagContainer: { flexDirection: "row", alignItems: "center" },
  flag: { width: 24, height: 16, borderRadius: 2 },
  phonePrefix: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginLeft: 8 },
  divider: { width: 1.5, height: 20, backgroundColor: "#E2E8F0", marginHorizontal: 10 },
  primaryButton: { height: 56, backgroundColor: "#247189", borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 10, shadowColor: "#247189", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  buttonDisabled: { backgroundColor: "#94A3B8" },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 30 },
  hairline: { flex: 1, height: 1.5, backgroundColor: "#F1F5F9" },
  dividerText: { marginHorizontal: 15, color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  socialButton: { height: 56, borderWidth: 1.5, borderColor: "#F1F5F9", borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  socialText: { fontSize: 15, fontWeight: "700", color: "#1E293B", marginLeft: 12 },
  socialIcon: { width: 20, height: 20 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#64748B", fontSize: 14, fontWeight: "600" },
  footerLink: { color: "#247189", fontSize: 14, fontWeight: "800" },
  backFab: { marginTop: 50, marginBottom: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" },
  illustration: { width: width * 0.7, height: height * 0.25, alignSelf: 'center', marginBottom: 20 },
  phoneDisplayRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 30 },
  phoneDisplayText: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  otpBoxesRow: { flexDirection: "row", justifyContent: "center", gap: 15, marginBottom: 25 },
  otpInput: { width: 58, height: 64, borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 12, backgroundColor: "#F8FAFC", textAlign: "center", fontSize: 24, fontWeight: "900", color: "#1E293B" },
  otpInputActive: { borderColor: "#247189", backgroundColor: "#FFFFFF" },
  resendLink: { alignItems: "center", marginBottom: 30 },
  resendText: { fontSize: 14, fontWeight: "700", color: "#247189" },
});
