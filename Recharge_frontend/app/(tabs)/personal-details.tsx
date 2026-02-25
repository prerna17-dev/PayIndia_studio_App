import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../../constants/api";

export default function PersonalDetailsScreen() {
  const router = useRouter();

  // Form States
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Profile completion status
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch initial profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsFetching(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Session Expired", "Please login again to continue.", [
          { text: "OK", onPress: () => router.replace("/auth/login") }
        ]);
        return;
      }

      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setFullName(data.name || "");
        setMobileNumber(data.mobile_number || "");
        setGender(data.gender || "");
        setDateOfBirth(data.date_of_birth || "");
        setProfileImage(data.profile_image || null);
      } else if (response.status === 401) {
        // Token invalid or expired
        Alert.alert("Session Expired", "Please login again to continue.", [
          { text: "OK", onPress: () => router.replace("/auth/login") }
        ]);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Handle hardware back button - FIXED
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        // Use replace to clear navigation stack and go directly to account
        router.replace("/account");
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }, [router]),
  );

  // Request camera and gallery permissions
  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const galleryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    return (
      cameraPermission.status === "granted" &&
      galleryPermission.status === "granted"
    );
  };

  // Pick image from gallery
  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert("Permission Required", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Take photo from camera
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert("Permission Required", "Please allow camera access");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Show image picker options
  const showImageOptions = () => {
    Alert.alert("Select Photo", "Choose an option", [
      {
        text: "Take Photo",
        onPress: takePhoto,
      },
      {
        text: "Choose from Gallery",
        onPress: pickImageFromGallery,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  // Format Aadhaar number with spaces (XXXX XXXX XXXX)
  const formatAadhaar = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");

    // Limit to 12 digits
    const limited = cleaned.substring(0, 12);

    // Add spaces after every 4 digits
    const formatted = limited.replace(/(\d{4})(?=\d)/g, "$1 ");

    return formatted;
  };

  const handleAadhaarChange = (text: string) => {
    const formatted = formatAadhaar(text);
    setAadhaarNumber(formatted);
  };

  // Format DOB with auto slashes (DD/MM/YYYY)
  const formatDOB = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");

    // Limit to 8 digits
    const limited = cleaned.substring(0, 8);

    // Add slashes after DD and MM
    let formatted = limited;
    if (limited.length >= 2) {
      formatted = limited.substring(0, 2) + "/" + limited.substring(2);
    }
    if (limited.length >= 4) {
      formatted =
        limited.substring(0, 2) +
        "/" +
        limited.substring(2, 4) +
        "/" +
        limited.substring(4);
    }

    return formatted;
  };

  const handleDOBChange = (text: string) => {
    const formatted = formatDOB(text);
    setDateOfBirth(formatted);
  };

  // Format mobile number
  const handleMobileChange = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);
    setMobileNumber(limited);
  };

  // Verify Aadhaar (placeholder - will connect to API later)
  const verifyAadhaar = () => {
    const cleaned = aadhaarNumber.replace(/\s/g, "");

    if (cleaned.length !== 12) {
      Alert.alert("Invalid Aadhaar", "Aadhaar number must be 12 digits");
      return;
    }

    // Placeholder verification - will be replaced with actual API call
    Alert.alert(
      "Verify Aadhaar",
      "Do you want to verify this Aadhaar number?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: () => {
            // Simulated verification - replace with actual API call
            setTimeout(() => {
              setIsAadhaarVerified(true);
              Alert.alert("Success", "Aadhaar verified successfully");
            }, 1500);
          },
        },
      ],
    );
  };

  // Validate DOB
  const validateDOB = (dob: string) => {
    if (dob.length !== 10) return false;

    const parts = dob.split("/");
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    // Check valid ranges
    if (
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12 ||
      year < 1900 ||
      year > new Date().getFullYear()
    ) {
      return false;
    }

    // Check if date is not in future
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();

    return inputDate <= today;
  };

  // Validate all fields
  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Please enter your full name");
      return false;
    }

    if (mobileNumber.length !== 10) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid 10-digit mobile number",
      );
      return false;
    }

    if (!gender) {
      Alert.alert("Validation Error", "Please select your gender");
      return false;
    }

    const cleanedAadhaar = aadhaarNumber.replace(/\s/g, "");
    if (cleanedAadhaar.length !== 12) {
      Alert.alert("Validation Error", "Aadhaar number must be 12 digits");
      return false;
    }

    if (!isAadhaarVerified) {
      Alert.alert("Verification Required", "Please verify your Aadhaar number");
      return false;
    }

    if (!validateDOB(dateOfBirth)) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid date of birth (DD/MM/YYYY)",
      );
      return false;
    }

    return true;
  };

  // Save profile
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    Alert.alert("Save Profile", "Do you want to save your profile details?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save",
        onPress: async () => {
          setIsLoading(true);
          try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
              Alert.alert("Session Expired", "Please login again to continue.", [
                { text: "OK", onPress: () => router.replace("/auth/login") }
              ]);
              return;
            }

            const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                name: fullName,
                gender: gender,
                date_of_birth: dateOfBirth,
                profile_image: profileImage,
              }),
            });

            const data = await response.json();

            if (response.ok) {
              setIsProfileComplete(true);
              Alert.alert("Success", "Profile saved successfully!", [
                {
                  text: "OK",
                  onPress: () => router.replace("/account"),
                },
              ]);
            } else if (response.status === 401) {
              Alert.alert("Session Expired", "Please login again to continue.", [
                { text: "OK", onPress: () => router.replace("/auth/login") }
              ]);
            } else {
              Alert.alert("Error", data.message || "Failed to update profile.");
            }
          } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Error", "Server error. Please check your connection.");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const handleBackPress = () => {
    // Use replace to avoid navigation loop
    router.replace("/account");
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
          <Text style={styles.headerTitle}>Personal Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Complete Profile Banner */}
          <View style={styles.bannerContainer}>
            <LinearGradient
              colors={["#F1F8FE", "#BBDEFB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.banner}
            >
              <Ionicons name="person-add" size={24} color="#0D47A1" />
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Complete Your Profile</Text>
                <Text style={styles.bannerSubtitle}>
                  Add your details to get started
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={showImageOptions}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="person" size={60} color="#999" />
                </View>
              )}
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.imageHint}>Tap to add photo</Text>
          </View>

          {/* Form Section */}
          <View style={styles.section}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Mobile Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Mobile Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#999" />
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={[styles.input, styles.mobileInput]}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobileNumber}
                  onChangeText={handleMobileChange}
                />
              </View>
              {mobileNumber.length > 0 && mobileNumber.length < 10 && (
                <Text style={styles.errorText}>
                  Mobile number must be 10 digits
                </Text>
              )}
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Gender <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "Male" && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender("Male")}
                >
                  <Ionicons
                    name="male"
                    size={20}
                    color={gender === "Male" ? "#0D47A1" : "#999"}
                  />
                  <Text
                    style={[
                      styles.genderText,
                      gender === "Male" && styles.genderTextActive,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "Female" && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender("Female")}
                >
                  <Ionicons
                    name="female"
                    size={20}
                    color={gender === "Female" ? "#0D47A1" : "#999"}
                  />
                  <Text
                    style={[
                      styles.genderText,
                      gender === "Female" && styles.genderTextActive,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "Other" && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender("Other")}
                >
                  <Ionicons
                    name="people"
                    size={20}
                    color={gender === "Other" ? "#0D47A1" : "#999"}
                  />
                  <Text
                    style={[
                      styles.genderText,
                      gender === "Other" && styles.genderTextActive,
                    ]}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Aadhaar Card */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Aadhaar Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="card-account-details"
                  size={20}
                  color="#999"
                />
                <TextInput
                  style={styles.input}
                  placeholder="XXXX XXXX XXXX"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={14} // 12 digits + 2 spaces
                  value={aadhaarNumber}
                  onChangeText={handleAadhaarChange}
                  editable={!isAadhaarVerified}
                />
                {isAadhaarVerified && (
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                )}
              </View>

              {aadhaarNumber.replace(/\s/g, "").length === 12 &&
                !isAadhaarVerified && (
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={verifyAadhaar}
                  >
                    <Text style={styles.verifyButtonText}>Verify Aadhaar</Text>
                  </TouchableOpacity>
                )}

              {isAadhaarVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Date of Birth <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={dateOfBirth}
                  onChangeText={handleDOBChange}
                />
              </View>
              <Text style={styles.hintText}>
                Enter your date of birth (e.g., 15/08/1995)
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.saveContainer}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#0D47A1" />
              ) : (
                <Text style={styles.saveButtonText}>Save Profile</Text>
              )}
            </TouchableOpacity>
          </View>

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
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 3,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#0D47A1",
  },

  // Profile Image
  imageSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFE082",
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#BBDEFB",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2196F3",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  imageHint: {
    fontSize: 13,
    color: "#666",
  },

  // Form Section
  section: {
    paddingHorizontal: 20,
  },
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
  mobileInput: {
    marginLeft: 5,
  },
  errorText: {
    fontSize: 12,
    color: "#E53935",
    marginTop: 5,
  },
  hintText: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },

  // Gender
  genderContainer: {
    flexDirection: "row",
    gap: 10,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  genderButtonActive: {
    backgroundColor: "#F1F8FE",
    borderColor: "#2196F3",
  },
  genderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  genderTextActive: {
    color: "#0D47A1",
  },

  // Verify Button
  verifyButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  verifyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8F5E9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CAF50",
  },

  // Save Button
  saveContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D47A1",
  },
});
