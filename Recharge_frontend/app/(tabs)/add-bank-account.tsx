import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  BackHandler,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddBankAccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bankName: selectedBankName, bankId: selectedBankId } = params;

  // Form States
  const [bankId, setBankId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [reEnterAccountNumber, setReEnterAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [newAccountId, setNewAccountId] = useState<number | null>(null);

  // Pre-fill bank details from params
  React.useEffect(() => {
    if (selectedBankName) {
      setBankName(selectedBankName as string);
    }
    if (selectedBankId) {
      setBankId(selectedBankId as string);
    }
  }, [selectedBankName, selectedBankId]);

  // Handle hardware back button - FIXED
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        // Go back to select-bank screen
        router.replace("/select-bank");
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }, [router]),
  );

  // Handle Account Number - Only numbers, limit 18 digits
  const handleAccountNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const limited = cleaned.substring(0, 18);
    setAccountNumber(limited);
  };

  // Handle Re-enter Account Number - Only numbers, limit 18 digits
  const handleReEnterAccountNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const limited = cleaned.substring(0, 18);
    setReEnterAccountNumber(limited);
  };

  // Handle IFSC Code - Uppercase, alphanumeric, limit 11 characters
  const handleIFSCChange = (text: string) => {
    const uppercase = text.toUpperCase();
    const limited = uppercase.substring(0, 11);
    setIfscCode(limited);
  };

  // Handle Phone Number - Only numbers, limit 10 digits
  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const limited = cleaned.substring(0, 10);
    setPhoneNumber(limited);
  };

  // Validate IFSC Code format
  const validateIFSC = (code: string) => {
    // IFSC format: 4 letters + 0 + 6 alphanumeric
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(code);
  };

  // Validate all fields
  const validateForm = () => {
    // Account Number validation
    if (!accountNumber || accountNumber.length < 9) {
      Alert.alert(
        "Validation Error",
        "Account number must be at least 9 digits",
      );
      return false;
    }

    // Re-enter Account Number validation
    if (accountNumber !== reEnterAccountNumber) {
      Alert.alert("Validation Error", "Account numbers do not match");
      return false;
    }

    // Bank Name validation
    if (!bankName.trim()) {
      Alert.alert("Validation Error", "Please enter bank name");
      return false;
    }

    // Account Holder Name validation
    if (!accountHolderName.trim()) {
      Alert.alert("Validation Error", "Please enter account holder name");
      return false;
    }

    // IFSC Code validation
    if (!ifscCode || ifscCode.length !== 11) {
      Alert.alert("Validation Error", "IFSC code must be 11 characters");
      return false;
    }

    if (!validateIFSC(ifscCode)) {
      Alert.alert("Validation Error", "Please enter a valid IFSC code");
      return false;
    }

    // Phone Number validation
    if (phoneNumber.length !== 10) {
      Alert.alert("Validation Error", "Phone number must be 10 digits");
      return false;
    }

    return true;
  };

  // Verify and Submit
  const handleVerifyAndSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsVerifying(true);
    try {
      const token = await AsyncStorage.getItem("userToken");

      // 1. Add Bank Account
      const addResponse = await fetch("http://192.168.1.26:5000/api/banking/add-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bank_id: bankId,
          account_number: accountNumber,
          account_holder_name: accountHolderName,
          ifsc_code: ifscCode,
          linked_mobile: phoneNumber,
        }),
      });

      const addData = await addResponse.json();

      if (addResponse.ok) {
        const accId = addData.account_id;
        setNewAccountId(accId);

        // 2. Trigger Verification (Send OTP)
        const verifyResponse = await fetch("http://192.168.1.26:5000/api/banking/verify-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ account_id: accId }),
        });

        if (verifyResponse.ok) {
          setShowOtpInput(true);
          Alert.alert("OTP Sent", "A verification code has been sent to your registered mobile number.");
        } else {
          const verifyData = await verifyResponse.json();
          Alert.alert("Success", `Account added, but failed to send OTP: ${verifyData.message || 'Unknown error'}`);
          router.replace("/bank-accounts");
        }
      } else {
        Alert.alert("Error", addData.message || "Failed to add bank account");
      }
    } catch (err) {
      console.error("Add/Verify bank account error:", err);
      Alert.alert("Error", "Server error. Please try again later.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Validation Error", "Please enter 6-digit OTP");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch("http://192.168.1.26:5000/api/banking/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          account_id: newAccountId,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Bank account verified and added successfully!", [
          { text: "OK", onPress: () => router.replace("/bank-accounts") }
        ]);
      } else {
        Alert.alert("Verification Failed", data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      Alert.alert("Error", "Server error during verification.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleBackPress = () => {
    // Navigate back to select-bank
    router.replace("/select-bank");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Bank Account</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Security Banner */}
          <View style={styles.bannerContainer}>
            <LinearGradient
              colors={["#E8F5E9", "#C8E6C9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.banner}
            >
              <MaterialCommunityIcons
                name="shield-lock"
                size={24}
                color="#4CAF50"
              />
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Secure & Encrypted</Text>
                <Text style={styles.bannerSubtitle}>
                  Your bank details are safe with us
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Form Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>

            {/* Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Account Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="bank" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter account number"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={18}
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  secureTextEntry
                />
              </View>
              {accountNumber.length > 0 && accountNumber.length < 9 && (
                <Text style={styles.errorText}>
                  Account number must be at least 9 digits
                </Text>
              )}
            </View>

            {/* Re-enter Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Re-enter Account Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={20}
                  color="#999"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter account number"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={18}
                  value={reEnterAccountNumber}
                  onChangeText={handleReEnterAccountNumberChange}
                />
              </View>
              {reEnterAccountNumber.length > 0 &&
                accountNumber !== reEnterAccountNumber && (
                  <Text style={styles.errorText}>
                    Account numbers do not match
                  </Text>
                )}
              {reEnterAccountNumber.length > 0 &&
                accountNumber === reEnterAccountNumber && (
                  <View style={styles.matchBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#4CAF50"
                    />
                    <Text style={styles.matchText}>Account numbers match</Text>
                  </View>
                )}
            </View>

            {/* Bank Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Bank Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="bank-outline"
                  size={20}
                  color="#999"
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., State Bank of India"
                  placeholderTextColor="#999"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>
            </View>

            {/* Account Holder Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Account Holder Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="As per bank records"
                  placeholderTextColor="#999"
                  value={accountHolderName}
                  onChangeText={setAccountHolderName}
                />
              </View>
              <Text style={styles.hintText}>
                Enter name exactly as per your bank account
              </Text>
            </View>

            {/* IFSC Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                IFSC Code <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="bank-transfer"
                  size={20}
                  color="#999"
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., SBIN0001234"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  maxLength={11}
                  value={ifscCode}
                  onChangeText={handleIFSCChange}
                />
              </View>
              <Text style={styles.hintText}>
                11-character code (e.g., SBIN0001234)
              </Text>
              {ifscCode.length === 11 && !validateIFSC(ifscCode) && (
                <Text style={styles.errorText}>Invalid IFSC code format</Text>
              )}
            </View>

            {/* Phone Number Linked to Account */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Phone Number (Linked to Account){" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#999" />
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                />
              </View>
              {phoneNumber.length > 0 && phoneNumber.length < 10 && (
                <Text style={styles.errorText}>
                  Phone number must be 10 digits
                </Text>
              )}
            </View>
          </View>

          {/* OTP Section - Show after adding account */}
          {showOtpInput && (
            <View style={[styles.section, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>Verify OTP</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Enter 6-digit OTP <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputContainer, { borderColor: '#2196F3' }]}>
                  <Ionicons name="keypad-outline" size={20} color="#2196F3" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>
                <Text style={styles.hintText}>Check your console (Dev) or SMS for OTP</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isVerifyingOtp && styles.submitButtonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isVerifyingOtp}
              >
                <Text style={styles.submitButtonText}>
                  {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Important Note */}
          <View style={styles.noteContainer}>
            <View style={styles.noteCard}>
              <Ionicons name="information-circle" size={24} color="#FF9800" />
              <View style={styles.noteTextContainer}>
                <Text style={styles.noteTitle}>Important</Text>
                <Text style={styles.noteText}>
                  • Ensure all details match your bank records{"\n"}• Phone
                  number should be registered with your bank{"\n"}• You may
                  receive an OTP for verification
                </Text>
              </View>
            </View>
          </View>

          {/* Verify and Submit Button */}
          {!showOtpInput && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isVerifying && styles.submitButtonDisabled,
                ]}
                onPress={handleVerifyAndSubmit}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.submitButtonText}>Verifying...</Text>
                  </View>
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={20}
                      color="#0D47A1"
                    />
                    <Text style={styles.submitButtonText}>Verify & Submit</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
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
    paddingTop: 50,
    paddingBottom: 20,
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

  // Banner
  bannerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 3,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#4CAF50",
  },

  // Section
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 20,
  },

  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#E53935",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  countryCode: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  phoneInput: {
    marginLeft: 5,
  },
  hintText: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  errorText: {
    fontSize: 12,
    color: "#E53935",
    marginTop: 5,
  },

  // Match Badge
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8F5E9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },

  // Note Card
  noteContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  noteCard: {
    flexDirection: "row",
    backgroundColor: "#F1F8FE",
    padding: 15,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  noteTextContainer: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 12,
    color: "#0D47A1",
    lineHeight: 18,
  },

  // Submit Button
  buttonContainer: {
    paddingHorizontal: 20,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D47A1",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
