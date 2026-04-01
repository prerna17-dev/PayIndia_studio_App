import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
// @ts-ignore
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../../constants/api";
import { calculateProfileCompletion } from "../../utils/profileCompletion";

export default function PersonalDetailsScreen() {
  const router = useRouter();

  // Form States
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Profile completion status
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Date Picker States
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [viewDate, setViewDate] = useState(new Date()); // Date currently being viewed in calendar
  const [selectedDate, setSelectedDate] = useState(new Date()); // Date actually selected
  const [pickerView, setPickerView] = useState<"calendar" | "year">("calendar");

  // Fetch initial profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsFetching(true);
    try {
      // 1. Instantly load cached profile to avoid layout shift
      const cachedData = await AsyncStorage.getItem("userData");
      if (cachedData) {
        const data = JSON.parse(cachedData);
        setFullName(data.name || "");
        setMobileNumber(data.mobile_number || "");
        setEmail(data.user_email || "");
        setGender(data.gender || "");
        const rawDOB = data.date_of_birth || "";
        setDateOfBirth(rawDOB.length > 10 ? rawDOB.substring(0, 10) : rawDOB);
        setProfileImage(data.profile_image || null);
      }

      // 2. Fetch fresh profile data
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setFullName(data.name || "");
        setMobileNumber(data.mobile_number || "");
        setEmail(data.user_email || "");
        setGender(data.gender || "");
        // Truncate DOB to 10 characters (YYYY-MM-DD) to pass validation
        const rawDOB = data.date_of_birth || "";
        setDateOfBirth(rawDOB.length > 10 ? rawDOB.substring(0, 10) : rawDOB);
        setProfileImage(data.profile_image || null);
        
        await AsyncStorage.setItem("userData", JSON.stringify(data));
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
        // Go explicitly back to account screen as requested
        router.navigate("/account");
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

  // Email change handler
  const handleEmailChange = (text: string) => {
    setEmail(text.trim());
  };

  // Format DOB with auto slashes (DD/MM/YYYY)
  const formatDOB = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");

    // Limit to 8 digits
    const limited = cleaned.substring(0, 8);

    // Add hyphens after YYYY and MM
    let formatted = limited;
    if (limited.length >= 4) {
      formatted = limited.substring(0, 4) + "-" + limited.substring(4);
    }
    if (limited.length >= 6) {
      formatted =
        limited.substring(0, 4) +
        "-" +
        limited.substring(4, 6) +
        "-" +
        limited.substring(6);
    }

    return formatted;
  };

  const handleDOBChange = (text: string) => {
    const formatted = formatDOB(text);
    setDateOfBirth(formatted);
  };

  // Date Picker Logic
  const openDatePicker = () => {
    let initialDate = new Date();
    if (dateOfBirth && dateOfBirth.length === 10) {
      const parts = dateOfBirth.split("-");
      initialDate = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
      );
    }
    setSelectedDate(initialDate);
    setViewDate(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    setPickerView("calendar");
    setIsDatePickerVisible(true);
  };

  const confirmDate = () => {
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = selectedDate.getDate().toString().padStart(2, "0");
    setDateOfBirth(`${year}-${month}-${day}`);
    setIsDatePickerVisible(false);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const years = Array.from(
    { length: new Date().getFullYear() - 1950 + 1 },
    (_, i) => 1950 + i
  ).reverse();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust firstDay to start from Monday (0: Mon, 6: Sun)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    // Padding for start of month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // Format mobile number
  const handleMobileChange = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);
    setMobileNumber(limited);
  };

  // Email validation helper
  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Validate DOB
  const validateDOB = (dob: string) => {
    if (dob.length !== 10) return false;

    const parts = dob.split("-");
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);

    // Check valid ranges
    if (
      year < 1900 ||
      year > new Date().getFullYear() ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
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

    if (!email.trim() || !validateEmail(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }

    if (!validateDOB(dateOfBirth)) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid date of birth (YYYY-MM-DD)",
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
            const formData = new FormData();
            formData.append("name", fullName);
            formData.append("user_email", email);
            formData.append("gender", gender);
            formData.append("date_of_birth", dateOfBirth);

            if (profileImage && !profileImage.startsWith("http") && !profileImage.startsWith("/uploads/")) {
              const filename = profileImage.split("/").pop();
              const match = /\.(\w+)$/.exec(filename || "");
              const type = match ? `image/${match[1]}` : `image`;
              // @ts-ignore
              formData.append("profile_image", {
                uri: profileImage,
                name: filename,
                type,
              });
            } else if (profileImage) {
              formData.append("profile_image", profileImage);
            }

            const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            });

            const data = await response.json();

            if (response.ok) {
              // Update local cache immediately so that returning to previous screens shows fresh data instantly
              try {
                const getResponse = await fetch(API_ENDPOINTS.USER_PROFILE, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (getResponse.ok) {
                  const freshData = await getResponse.json();
                  await AsyncStorage.setItem("userData", JSON.stringify(freshData));
                }
              } catch (e) {
                console.error("Cache update failed:", e);
              }

              setIsProfileComplete(true);
              Alert.alert("Success", "Profile saved successfully!", [
                {
                  text: "OK",
                  onPress: () => router.navigate("/account"),
                },
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

  // Update completion percentage whenever form data changes
  useEffect(() => {
    const data = {
      name: fullName,
      mobile_number: mobileNumber,
      user_email: email,
      gender: gender,
      date_of_birth: dateOfBirth,
      profile_image: profileImage,
    };
    setCompletionPercentage(calculateProfileCompletion(data));
  }, [fullName, mobileNumber, email, gender, dateOfBirth, profileImage]);

  const handleBackPress = () => {
    router.navigate("/account");
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

        <ScrollView 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
                <Text style={styles.bannerTitle}>
                  {completionPercentage === 100 ? "Profile Complete!" : "Complete Your Profile"}
                </Text>
                <Text style={styles.bannerSubtitle}>
                  {completionPercentage === 100 
                    ? "Your details are up to date" 
                    : `${completionPercentage}% completed. Add your details to reach 100%`}
                </Text>
              </View>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageBadgeText}>{completionPercentage}%</Text>
              </View>
            </LinearGradient>
            {completionPercentage < 100 && (
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${completionPercentage}%` }]} />
              </View>
            )}
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

            {/* Email Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={handleEmailChange}
                />
              </View>
              <Text style={styles.hintText}>
                Used for sending important notifications
              </Text>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Date of Birth <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity onPress={openDatePicker}>
                  <Ionicons name="calendar-outline" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={dateOfBirth}
                  onChangeText={handleDOBChange}
                />
              </View>
              <Text style={styles.hintText}>
                Enter your date of birth (e.g., 1995-08-15)
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

        {/* Date Picker Modal */}
        <Modal
          visible={isDatePickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDatePickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalDismiss}
              activeOpacity={1}
              onPress={() => setIsDatePickerVisible(false)}
            />
            <View style={styles.pickerCard}>
              {/* Material Header */}
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setPickerView("year")}>
                  <Text style={styles.pickerYearText}>{selectedDate.getFullYear()}</Text>
                </TouchableOpacity>
                <Text style={styles.pickerFullDateText}>
                  {dayNames[selectedDate.getDay()]}, {selectedDate.getDate()} {shortMonths[selectedDate.getMonth()]}
                </Text>
              </View>

              {pickerView === "calendar" ? (
                <>
                  {/* Month Navigation */}
                  <View style={styles.monthNav}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navArrow}>
                      <Ionicons name="chevron-back" size={20} color="#555" />
                    </TouchableOpacity>
                    <Text style={styles.monthYearDisplay}>
                      {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navArrow}>
                      <Ionicons name="chevron-forward" size={20} color="#555" />
                    </TouchableOpacity>
                  </View>

                  {/* Calendar Grid */}
                  <View style={styles.calendarContainer}>
                    <View style={styles.weekHeaders}>
                      {daysOfWeek.map((day, i) => (
                        <Text key={i} style={styles.weekHeaderText}>{day}</Text>
                      ))}
                    </View>
                    <View style={styles.daysGrid}>
                      {getCalendarDays().map((day, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dayCell,
                            day === selectedDate.getDate() &&
                            viewDate.getMonth() === selectedDate.getMonth() &&
                            viewDate.getFullYear() === selectedDate.getFullYear() &&
                            styles.selectedDayCell
                          ]}
                          disabled={day === null}
                          onPress={() => {
                            if (day) {
                              setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
                            }
                          }}
                        >
                          <Text style={[
                            styles.dayText,
                            day === selectedDate.getDate() &&
                            viewDate.getMonth() === selectedDate.getMonth() &&
                            viewDate.getFullYear() === selectedDate.getFullYear() &&
                            styles.selectedDayText
                          ]}>
                            {day || ""}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              ) : (
                /* Year List View */
                <View style={[styles.pickerContent, { height: 320 }]}>
                  <FlatList
                    data={years}
                    keyExtractor={(item: number) => item.toString()}
                    renderItem={({ item }: { item: number }) => (
                      <TouchableOpacity
                        style={[
                          styles.yearListItem,
                          selectedDate.getFullYear() === item && styles.yearListItemActive,
                        ]}
                        onPress={() => {
                          const newSelected = new Date(selectedDate);
                          newSelected.setFullYear(item);
                          setSelectedDate(newSelected);
                          setViewDate(new Date(item, newSelected.getMonth(), 1));
                          setPickerView("calendar");
                        }}
                      >
                        <Text
                          style={[
                            styles.yearListText,
                            selectedDate.getFullYear() === item && styles.yearListTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              )}

              <View style={styles.pickerFooter}>
                <TouchableOpacity
                  style={styles.footerBtn}
                  onPress={() => {
                    setDateOfBirth("");
                    setIsDatePickerVisible(false);
                  }}
                >
                  <Text style={styles.footerBtnText}>CLEAR</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  style={styles.footerBtn}
                  onPress={() => setIsDatePickerVisible(false)}
                >
                  <Text style={styles.footerBtnText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerBtn}
                  onPress={confirmDate}
                >
                  <Text style={styles.footerBtnText}>SET</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    color: "#FFFFFF",
  },

  // Date Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalDismiss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pickerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    maxHeight: "80%",
  },
  pickerHeader: {
    backgroundColor: "#1976D2",
    padding: 20,
    paddingTop: 25,
  },
  pickerYearText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "600",
  },
  pickerFullDateText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 5,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  navArrow: {
    padding: 10,
  },
  monthYearDisplay: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  calendarContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    height: 300,
  },
  weekHeaders: {
    flexDirection: "row",
    marginBottom: 10,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    fontWeight: "bold",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  selectedDayCell: {
    backgroundColor: "#1976D2",
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  yearListItem: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    margin: 5,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  yearListItemActive: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#1976D2",
  },
  yearListText: {
    fontSize: 16,
    color: "#666",
  },
  yearListTextActive: {
    color: "#1976D2",
    fontWeight: "bold",
  },
  pickerContent: {
    padding: 15,
  },
  pickerFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
    paddingBottom: 15,
    paddingRight: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  footerBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  footerBtnText: {
    color: "#1976D2",
    fontWeight: "bold",
    fontSize: 14,
  },
  percentageBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  percentageBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0D47A1",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(13, 71, 161, 0.1)",
    borderRadius: 3,
    marginTop: 15,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#0D47A1",
    borderRadius: 3,
  },
});
