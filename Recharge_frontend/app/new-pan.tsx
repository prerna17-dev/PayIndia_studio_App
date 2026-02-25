import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface UploadedDoc {
    name: string;
    size?: number;
    uri: string;
}

export default function NewPANScreen() {
    const router = useRouter();

    // Form State
    const [currentStep, setCurrentStep] = useState(1);
    const [fullName, setFullName] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [motherName, setMotherName] = useState("");
    const [dob, setDob] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");

    useEffect(() => {
        const backAction = () => {
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.replace("/pan-card-services");
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction,
        );

        return () => backHandler.remove();
    }, [currentStep]);

    // Document uploads
    const [aadhaarDoc, setAadhaarDoc] = useState<UploadedDoc | null>(null);
    const [addressProof, setAddressProof] = useState<UploadedDoc | null>(null);
    const [dobProof, setDobProof] = useState<UploadedDoc | null>(null);
    const [photo, setPhoto] = useState<UploadedDoc | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    // Document picker
    const pickDocument = async (type: "aadhaar" | "address" | "dob") => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
            });

            if (result.canceled === false && result.assets && result.assets[0]) {
                const doc = {
                    name: result.assets[0].name,
                    size: result.assets[0].size,
                    uri: result.assets[0].uri,
                };

                if (type === "aadhaar") setAadhaarDoc(doc);
                else if (type === "address") setAddressProof(doc);
                else if (type === "dob") setDobProof(doc);
            }
        } catch (err) {
            Alert.alert("Error", "Failed to pick document");
        }
    };

    // Photo picker
    const pickPhoto = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission Required", "Please allow access to photos");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
            setPhoto({
                name: "photo.jpg",
                uri: result.assets[0].uri,
            });
        }
    };

    const formatAadhaar = (text: string) => {
        const cleaned = text.replace(/\s/g, "");
        let formatted = "";
        for (let i = 0; i < cleaned.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += " ";
            formatted += cleaned[i];
        }
        setAadhaarNumber(formatted);
    };

    const formatDOB = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = "";
        if (cleaned.length <= 2) formatted = cleaned;
        else if (cleaned.length <= 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        else formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
        setDob(formatted);
    };

    const canProceedStep1 =
        fullName.trim() &&
        fatherName.trim() &&
        motherName.trim() &&
        dob.trim() &&
        mobile.length === 10 &&
        email.includes("@") &&
        aadhaarNumber.replace(/\s/g, "").length === 12 &&
        address.trim() &&
        city.trim() &&
        district.trim() &&
        state.trim() &&
        pincode.length === 6;

    const canProceedStep2 = !!(aadhaarDoc && addressProof && dobProof && photo);

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const refId = "PAN" + Math.random().toString(36).substr(2, 9).toUpperCase();
            setApplicationId(refId);
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.replace("/pan-card-services");
        }
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            if (!canProceedStep1) {
                Alert.alert("Required", "Please fill all mandatory personal and address details correctly");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!canProceedStep2) {
                Alert.alert("Required", "Please upload all mandatory documents");
                return;
            }
            setCurrentStep(3);
        } else {
            handleSubmit();
        }
    };

    if (isSubmitted) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.successContainer}>
                    <View style={styles.successIconCircle}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                    </View>
                    <Text style={styles.successTitle}>Application Submitted!</Text>
                    <Text style={styles.successSubtitle}>Your PAN card application has been received successfully.</Text>

                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <Text style={styles.idValue}>{applicationId}</Text>
                    </View>

                    <View style={styles.successActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="download-outline" size={24} color="#0D47A1" />
                            </View>
                            <Text style={styles.actionText}>Download{"\n"}Receipt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#F1F8E9' }]}>
                                <Ionicons name="time-outline" size={24} color="#2E7D32" />
                            </View>
                            <Text style={styles.actionText}>Track{"\n"}Status</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/pan-card-services")}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.btnGrad}>
                            <Text style={styles.mainBtnText}>Return to Services</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New PAN Application</Text>
                        <Text style={styles.headerSubtitle}>Apply for permanent account number</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {/* Step Indicator */}
                <View style={styles.stepIndicatorContainer}>
                    <View style={styles.progressLine}>
                        <View style={[styles.progressLineActive, { width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }]} />
                    </View>

                    <View style={styles.stepsRow}>
                        {[1, 2, 3].map((step) => (
                            <View key={step} style={styles.stepItem}>
                                <View style={[
                                    styles.stepCircle,
                                    currentStep >= step && styles.stepCircleActive,
                                    currentStep > step && styles.stepCircleCompleted
                                ]}>
                                    {currentStep > step ? (
                                        <Ionicons name="checkmark" size={16} color="#FFF" />
                                    ) : (
                                        <Text style={[styles.stepNumber, currentStep >= step && styles.stepNumberActive]}>{step}</Text>
                                    )}
                                </View>
                                <Text style={[styles.stepLabel, currentStep >= step && styles.stepLabelActive]}>
                                    {step === 1 ? "Details" : step === 2 ? "Documents" : "Review"}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* STEP 1: Details */}
                        {currentStep === 1 && (
                            <View style={styles.stepWrapper}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardHeaderIcon}>
                                        <Ionicons name="person" size={20} color="#0D47A1" />
                                    </View>
                                    <View>
                                        <Text style={styles.cardHeaderTitle}>Personal Details</Text>
                                        <Text style={styles.cardHeaderSubtitle}>Fill mandatory information</Text>
                                    </View>
                                </View>

                                <View style={styles.formCard}>
                                    <Text style={styles.inputLabel}>Full Name (as per documents) *</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={18} color="#94A3B8" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ex: John Doe"
                                            value={fullName}
                                            onChangeText={setFullName}
                                        />
                                    </View>

                                    <View style={styles.inputRow}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={styles.inputLabel}>Father's Name *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="person-outline" size={18} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Father's name"
                                                    value={fatherName}
                                                    onChangeText={setFatherName}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.inputLabel}>Mother's Name *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="person-outline" size={18} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Mother's name"
                                                    value={motherName}
                                                    onChangeText={setMotherName}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.inputRow}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={styles.inputLabel}>Date of Birth *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="DD/MM/YYYY"
                                                    value={dob}
                                                    onChangeText={formatDOB}
                                                    keyboardType="number-pad"
                                                    maxLength={10}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.inputLabel}>Mobile Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.countryCode}>+91</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="10-digit"
                                                    value={mobile}
                                                    onChangeText={setMobile}
                                                    keyboardType="phone-pad"
                                                    maxLength={10}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <Text style={styles.inputLabel}>Email Address *</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="mail-outline" size={18} color="#94A3B8" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter email address"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <View style={[styles.cardHeader, { marginTop: 24 }]}>
                                    <View style={[styles.cardHeaderIcon, { backgroundColor: '#E0F2F1' }]}>
                                        <Ionicons name="location" size={20} color="#00796B" />
                                    </View>
                                    <View>
                                        <Text style={styles.cardHeaderTitle}>Address & Aadhaar</Text>
                                        <Text style={styles.cardHeaderSubtitle}>Identity and residential proof</Text>
                                    </View>
                                </View>

                                <View style={styles.formCard}>
                                    <Text style={styles.inputLabel}>Aadhaar Number *</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="card-outline" size={18} color="#94A3B8" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="XXXX XXXX XXXX"
                                            value={aadhaarNumber}
                                            onChangeText={formatAadhaar}
                                            keyboardType="numeric"
                                            maxLength={14}
                                        />
                                    </View>

                                    <Text style={styles.inputLabel}>Full Address *</Text>
                                    <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
                                        <Ionicons name="home-outline" size={18} color="#94A3B8" style={{ marginTop: 2 }} />
                                        <TextInput
                                            style={[styles.input, { textAlignVertical: "top" }]}
                                            placeholder="Flat/House No, Building, Street"
                                            value={address}
                                            onChangeText={setAddress}
                                            multiline
                                            numberOfLines={3}
                                        />
                                    </View>

                                    <View style={styles.inputRow}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={styles.inputLabel}>City *</Text>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="City"
                                                    value={city}
                                                    onChangeText={setCity}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={styles.inputLabel}>District *</Text>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="District"
                                                    value={district}
                                                    onChangeText={setDistrict}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.inputRow}>
                                        <View style={{ flex: 1.2, marginRight: 10 }}>
                                            <Text style={styles.inputLabel}>State *</Text>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="State"
                                                    value={state}
                                                    onChangeText={setState}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.inputLabel}>Pincode *</Text>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="6-digit"
                                                    value={pincode}
                                                    onChangeText={setPincode}
                                                    keyboardType="numeric"
                                                    maxLength={6}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* STEP 2: Documents */}
                        {currentStep === 2 && (
                            <View style={styles.stepWrapper}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.cardHeaderIcon, { backgroundColor: '#E3F2FD' }]}>
                                        <Ionicons name="document-text" size={20} color="#1565C0" />
                                    </View>
                                    <View>
                                        <Text style={styles.cardHeaderTitle}>Upload Documents</Text>
                                        <Text style={styles.cardHeaderSubtitle}>Clear photos or PDF (Max 2MB)</Text>
                                    </View>
                                </View>

                                <View style={styles.docList}>
                                    {/* Aadhaar Card */}
                                    <TouchableOpacity
                                        style={[styles.docUploadCard, aadhaarDoc && styles.docUploadCardActive]}
                                        onPress={() => pickDocument("aadhaar")}
                                    >
                                        <View style={styles.docIconCircle}>
                                            <MaterialCommunityIcons name="card-account-details" size={24} color={aadhaarDoc ? "#FFF" : "#2196F3"} />
                                        </View>
                                        <View style={styles.docTextContent}>
                                            <Text style={styles.docTitle}>Aadhaar Card *</Text>
                                            <Text style={styles.docHint}>{aadhaarDoc ? aadhaarDoc.name : "Required for identity"}</Text>
                                        </View>
                                        <Ionicons
                                            name={aadhaarDoc ? "checkmark-circle" : "cloud-upload"}
                                            size={24}
                                            color={aadhaarDoc ? "#2E7D32" : "#94A3B8"}
                                        />
                                    </TouchableOpacity>

                                    {/* Address Proof */}
                                    <TouchableOpacity
                                        style={[styles.docUploadCard, addressProof && styles.docUploadCardActive]}
                                        onPress={() => pickDocument("address")}
                                    >
                                        <View style={[styles.docIconCircle, { backgroundColor: '#E8F5E9' }]}>
                                            <MaterialCommunityIcons name="home-map-marker" size={24} color={addressProof ? "#FFF" : "#43A047"} />
                                        </View>
                                        <View style={styles.docTextContent}>
                                            <Text style={styles.docTitle}>Address Proof *</Text>
                                            <Text style={styles.docHint}>{addressProof ? addressProof.name : "Utility bill or Statement"}</Text>
                                        </View>
                                        <Ionicons
                                            name={addressProof ? "checkmark-circle" : "cloud-upload"}
                                            size={24}
                                            color={addressProof ? "#2E7D32" : "#94A3B8"}
                                        />
                                    </TouchableOpacity>

                                    {/* DOB Proof */}
                                    <TouchableOpacity
                                        style={[styles.docUploadCard, dobProof && styles.docUploadCardActive]}
                                        onPress={() => pickDocument("dob")}
                                    >
                                        <View style={[styles.docIconCircle, { backgroundColor: '#FFF8E1' }]}>
                                            <MaterialCommunityIcons name="calendar-check" size={24} color={dobProof ? "#FFF" : "#FFB300"} />
                                        </View>
                                        <View style={styles.docTextContent}>
                                            <Text style={styles.docTitle}>DOB Proof *</Text>
                                            <Text style={styles.docHint}>{dobProof ? dobProof.name : "Birth Certificate or LC"}</Text>
                                        </View>
                                        <Ionicons
                                            name={dobProof ? "checkmark-circle" : "cloud-upload"}
                                            size={24}
                                            color={dobProof ? "#2E7D32" : "#94A3B8"}
                                        />
                                    </TouchableOpacity>

                                    {/* Passport Photo */}
                                    <TouchableOpacity
                                        style={[styles.docUploadCard, photo && styles.docUploadCardActive]}
                                        onPress={pickPhoto}
                                    >
                                        <View style={[styles.docIconCircle, { backgroundColor: '#FFEBEE' }]}>
                                            <MaterialCommunityIcons name="account-box" size={24} color={photo ? "#FFF" : "#E53935"} />
                                        </View>
                                        <View style={styles.docTextContent}>
                                            <Text style={styles.docTitle}>Passport Photo *</Text>
                                            <Text style={styles.docHint}>{photo ? photo.name : "Recent color photograph"}</Text>
                                        </View>
                                        <Ionicons
                                            name={photo ? "checkmark-circle" : "camera"}
                                            size={24}
                                            color={photo ? "#2E7D32" : "#94A3B8"}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* STEP 3: Review */}
                        {currentStep === 3 && (
                            <View style={styles.stepWrapper}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.cardHeaderIcon, { backgroundColor: '#F3E5F5' }]}>
                                        <Ionicons name="eye" size={20} color="#7B1FA2" />
                                    </View>
                                    <View>
                                        <Text style={styles.cardHeaderTitle}>Review Application</Text>
                                        <Text style={styles.cardHeaderSubtitle}>Verify details before submission</Text>
                                    </View>
                                </View>

                                <View style={styles.reviewCard}>
                                    <View style={styles.reviewSection}>
                                        <Text style={styles.reviewSectionTitle}>Personal Details</Text>
                                        <View style={styles.reviewItem}>
                                            <Text style={styles.reviewLabel}>Full Name</Text>
                                            <Text style={styles.reviewValue}>{fullName}</Text>
                                        </View>
                                        <View style={styles.reviewItem}>
                                            <Text style={styles.reviewLabel}>Father's Name</Text>
                                            <Text style={styles.reviewValue}>{fatherName}</Text>
                                        </View>
                                        <View style={styles.reviewItem}>
                                            <Text style={styles.reviewLabel}>DOB</Text>
                                            <Text style={styles.reviewValue}>{dob}</Text>
                                        </View>
                                        <View style={styles.reviewItem}>
                                            <Text style={styles.reviewLabel}>Mobile</Text>
                                            <Text style={styles.reviewValue}>+91 {mobile}</Text>
                                        </View>
                                        <View style={styles.reviewItem}>
                                            <Text style={styles.reviewLabel}>Email</Text>
                                            <Text style={styles.reviewValue}>{email}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.reviewSection}>
                                        <Text style={styles.reviewSectionTitle}>Address & Aadhaar</Text>
                                        <View style={styles.reviewItem}>
                                            <Text style={styles.reviewLabel}>Aadhaar</Text>
                                            <Text style={styles.reviewValue}>{aadhaarNumber}</Text>
                                        </View>
                                        <Text style={styles.reviewLabel}>Address:</Text>
                                        <Text style={styles.addressText}>
                                            {address}, {city}, {district}, {state} - {pincode}
                                        </Text>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.reviewSection}>
                                        <Text style={styles.reviewSectionTitle}>Documents Uploaded</Text>
                                        <View style={styles.reviewDocRow}>
                                            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                            <Text style={styles.reviewDocText}>Aadhaar Card Proof</Text>
                                        </View>
                                        <View style={styles.reviewDocRow}>
                                            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                            <Text style={styles.reviewDocText}>Address Proof</Text>
                                        </View>
                                        <View style={styles.reviewDocRow}>
                                            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                            <Text style={styles.reviewDocText}>DOB Proof</Text>
                                        </View>
                                        <View style={styles.reviewDocRow}>
                                            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                            <Text style={styles.reviewDocText}>Passport Size Photo</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.declarationBox}>
                                    <Ionicons name="information-circle" size={20} color="#0D47A1" />
                                    <Text style={styles.declarationText}>
                                        By submitting, you confirm that all information and documents provided are authentic and belong to the applicant.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Bottom Bar */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                        disabled={isSubmitting}
                    >
                        <LinearGradient
                            colors={['#0D47A1', '#1565C0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>
                                        {currentStep === 3 ? "Confirm & Submit" : "Continue"}
                                    </Text>
                                    <Ionicons
                                        name={currentStep === 3 ? "checkmark-done" : "arrow-forward"}
                                        size={20}
                                        color="#FFF"
                                    />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
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
    },
    backButton: {
        padding: 4,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1E293B",
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2
    },
    placeholder: {
        width: 32,
    },

    // Step Indicator
    stepIndicatorContainer: {
        backgroundColor: '#FFF',
        paddingBottom: 20,
        paddingHorizontal: 30,
        position: 'relative',
    },
    progressLine: {
        position: 'absolute',
        top: 16,
        left: 60,
        right: 60,
        height: 2,
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
    },
    progressLineActive: {
        height: '100%',
        backgroundColor: '#0D47A1',
    },
    stepsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    stepCircleActive: {
        borderColor: '#0D47A1',
        backgroundColor: '#FFF',
    },
    stepCircleCompleted: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#CBD5E1',
    },
    stepNumberActive: {
        color: '#0D47A1',
    },
    stepLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 6,
    },
    stepLabelActive: {
        color: '#0D47A1',
    },

    scrollContent: {
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    stepWrapper: {
        // animation
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardHeaderIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardHeaderTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    cardHeaderSubtitle: {
        fontSize: 12,
        color: '#64748B',
    },

    formCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
        marginTop: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
        height: 48,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
        marginLeft: 10,
    },
    inputRow: {
        flexDirection: 'row',
        marginTop: 0,
    },
    countryCode: {
        fontSize: 15,
        fontWeight: '700',
        color: '#475569',
        marginLeft: 8,
    },

    // Step 2: Documents
    docList: {
        gap: 12,
    },
    docUploadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 18,
        padding: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    docUploadCardActive: {
        borderColor: '#C8E6C9',
        backgroundColor: '#F1FBF4',
    },
    docIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    docTextContent: {
        flex: 1,
    },
    docTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    docHint: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },

    // Step 3: Review
    reviewCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    reviewSection: {
        paddingVertical: 10,
    },
    reviewSectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0D47A1',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    reviewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    reviewLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    reviewValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        textAlign: 'right',
        flex: 1,
        marginLeft: 10,
    },
    addressText: {
        fontSize: 14,
        color: '#1E293B',
        lineHeight: 20,
        fontWeight: '600',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 10,
    },
    reviewDocRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    reviewDocText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    declarationBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        borderRadius: 16,
        padding: 16,
        marginTop: 20,
        gap: 12,
    },
    declarationText: {
        flex: 1,
        fontSize: 12,
        color: '#0D47A1',
        lineHeight: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    checkBox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#0D47A1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkBoxActive: {
        backgroundColor: '#0D47A1',
    },

    // Bottom Bar
    bottomBar: {
        backgroundColor: '#FFF',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    continueButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
    },
    // Success Screen
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#FFF' },
    successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
    successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
    idCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, width: '100%', alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    idValue: { fontSize: 24, fontWeight: '800', color: '#0D47A1' },
    successActions: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    actionBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionText: { fontSize: 12, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
    mainBtn: { borderRadius: 16, overflow: 'hidden', width: '100%' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    mainBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});