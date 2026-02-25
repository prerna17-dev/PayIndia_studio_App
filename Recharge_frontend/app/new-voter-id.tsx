import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
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

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
    [key: string]: any;
}

interface FormDataType {
    fullName: string;
    dob: string;
    gender: string;
    mobile: string;
    email: string;
    aadhaarNo: string;
    houseNo: string;
    area: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    assembly: string;
}

interface DocumentsState {
    aadhaarCard: DocumentType | null;
    addressProof: DocumentType | null;
    photo: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewVoterIDScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    const [documents, setDocuments] = useState<DocumentsState>({
        aadhaarCard: null,
        addressProof: null,
        photo: null,
    });
    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        dob: "",
        gender: "",
        mobile: "",
        email: "",
        aadhaarNo: "",
        houseNo: "",
        area: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        assembly: "",
    });

    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);

    // Handle hardware back button
    useEffect(() => {
        const backAction = () => {
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.replace("/voter-id-services");
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction,
        );

        return () => backHandler.remove();
    }, [currentStep]);

    // Handle document upload
    const handleDocumentUpload = async (docType: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets[0]) {
                const file = result.assets[0];

                if (file.size && file.size > 5 * 1024 * 1024) {
                    Alert.alert(
                        "File Too Large",
                        "Please upload a file smaller than 5MB",
                    );
                    return;
                }

                setDocuments((prev) => ({
                    ...prev,
                    [docType]: file,
                }));

                Alert.alert("Success", "Document uploaded successfully");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const formatDOB = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        }
        if (cleaned.length > 4) {
            formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        }
        return formatted;
    };

    const handleSendOtp = () => {
        if (formData.aadhaarNo.length !== 12) {
            Alert.alert("Error", "Please enter valid 12-digit Aadhaar number");
            return;
        }
        setIsOtpSent(true);
        Alert.alert("Success", "OTP sent to registered mobile number");
    };

    const handleVerifyOtp = () => {
        if (otp.length === 6) {
            setIsOtpVerified(true);
            Alert.alert("Verified", "Aadhaar OTP verified successfully");
        } else {
            Alert.alert("Error", "Please enter valid 6-digit OTP");
        }
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            if (
                !formData.fullName ||
                !formData.dob ||
                !formData.gender ||
                !formData.mobile ||
                !formData.aadhaarNo ||
                !isOtpVerified
            ) {
                Alert.alert("Required", "Please fill all personal details and verify Aadhaar OTP");
                return;
            }
            if (!formData.houseNo || !formData.city || !formData.district || !formData.pincode || !formData.assembly) {
                Alert.alert("Required", "Please fill complete address and assembly details");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!documents.photo) {
                Alert.alert("Required", "Recent photograph is mandatory");
                return;
            }
            if (!documents.aadhaarCard) {
                Alert.alert("Required", "Aadhaar Card copy is mandatory");
                return;
            }
            if (!documents.addressProof) {
                Alert.alert("Required", "Address Proof is mandatory");
                return;
            }
            setCurrentStep(3);
        } else {
            setIsSubmitting(true);
            // Simulate API call
            setTimeout(() => {
                const refId = "VOT" + Math.random().toString(36).substr(2, 9).toUpperCase();
                setApplicationId(refId);
                setIsSubmitting(false);
                setIsSubmitted(true);
            }, 2000);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.replace("/voter-id-services");
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
                    <Text style={styles.successSubtitle}>Your new Voter ID registration has been received successfully.</Text>

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

                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/voter-id-services")}>
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
                        <Text style={styles.headerTitle}>New Voter Registration</Text>
                        <Text style={styles.headerSubtitle}>Apply for fresh Voter ID Card</Text>
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

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* STEP 1: Personal Details */}
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderIcon}>
                                    <Ionicons name="person" size={20} color="#0D47A1" />
                                </View>
                                <View>
                                    <Text style={styles.cardHeaderTitle}>Personal Details</Text>
                                    <Text style={styles.cardHeaderSubtitle}>Identity and verification</Text>
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.inputLabel}>Full Name (As per Aadhaar) *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your full name"
                                        value={formData.fullName}
                                        onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                    />
                                </View>

                                <Text style={styles.inputLabel}>Date of Birth *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="DD/MM/YYYY"
                                        keyboardType="number-pad"
                                        maxLength={10}
                                        value={formData.dob}
                                        onChangeText={(text) => setFormData({ ...formData, dob: formatDOB(text) })}
                                    />
                                </View>

                                <Text style={styles.inputLabel}>Gender *</Text>
                                <View style={styles.genderContainer}>
                                    {["Male", "Female", "Other"].map((g) => (
                                        <TouchableOpacity
                                            key={g}
                                            style={[styles.genderBox, formData.gender === g && styles.genderBoxActive]}
                                            onPress={() => setFormData({ ...formData, gender: g })}
                                        >
                                            <MaterialCommunityIcons
                                                name={g === 'Male' ? 'gender-male' : g === 'Female' ? 'gender-female' : 'gender-transgender'}
                                                size={20}
                                                color={formData.gender === g ? '#0D47A1' : '#64748B'}
                                            />
                                            <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.inputLabel}>Aadhaar Number *</Text>
                                <View style={styles.otpSection}>
                                    <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }]}>
                                        <MaterialCommunityIcons name="card-account-details-outline" size={18} color="#94A3B8" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="XXXX XXXX XXXX"
                                            keyboardType="number-pad"
                                            maxLength={12}
                                            value={formData.aadhaarNo}
                                            onChangeText={(text) => setFormData({ ...formData, aadhaarNo: text })}
                                            editable={!isOtpVerified}
                                        />
                                    </View>
                                    {!isOtpVerified && (
                                        <TouchableOpacity
                                            style={[styles.otpButton, formData.aadhaarNo.length !== 12 && styles.otpButtonDisabled]}
                                            onPress={handleSendOtp}
                                            disabled={formData.aadhaarNo.length !== 12}
                                        >
                                            <Text style={styles.otpButtonText}>{isOtpSent ? "Resend" : "Send OTP"}</Text>
                                        </TouchableOpacity>
                                    )}
                                    {isOtpVerified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                                            <Text style={styles.verifiedText}>Verified</Text>
                                        </View>
                                    )}
                                </View>

                                {isOtpSent && !isOtpVerified && (
                                    <View style={styles.otpVerifyContainer}>
                                        <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }]}>
                                            <Ionicons name="key-outline" size={18} color="#94A3B8" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter 6-digit OTP"
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                value={otp}
                                                onChangeText={setOtp}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.verifyButton, otp.length !== 6 && styles.otpButtonDisabled]}
                                            onPress={handleVerifyOtp}
                                            disabled={otp.length !== 6}
                                        >
                                            <Text style={styles.verifyButtonText}>Verify</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            <View style={[styles.cardHeader, { marginTop: 20 }]}>
                                <View style={[styles.cardHeaderIcon, { backgroundColor: '#E0F2F1' }]}>
                                    <Ionicons name="location" size={20} color="#00796B" />
                                </View>
                                <View>
                                    <Text style={styles.cardHeaderTitle}>Address & Assembly</Text>
                                    <Text style={styles.cardHeaderSubtitle}>Voter locality details</Text>
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.inputLabel}>House No / Building *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="home-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Flat/House No."
                                        value={formData.houseNo}
                                        onChangeText={(text) => setFormData({ ...formData, houseNo: text })}
                                    />
                                </View>

                                <Text style={styles.inputLabel}>Assembly Constituency *</Text>
                                <View style={styles.inputContainer}>
                                    <MaterialCommunityIcons name="office-building-marker-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ex: Mumbai South"
                                        value={formData.assembly}
                                        onChangeText={(text) => setFormData({ ...formData, assembly: text })}
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Text style={styles.inputLabel}>City *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="City"
                                                value={formData.city}
                                                onChangeText={(text) => setFormData({ ...formData, city: text })}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>District *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="District"
                                                value={formData.district}
                                                onChangeText={(text) => setFormData({ ...formData, district: text })}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1.5, marginRight: 10 }}>
                                        <Text style={styles.inputLabel}>State *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="State"
                                                value={formData.state}
                                                onChangeText={(text) => setFormData({ ...formData, state: text })}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Pincode *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="6-digit"
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                value={formData.pincode}
                                                onChangeText={(text) => setFormData({ ...formData, pincode: text })}
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
                                    <Text style={styles.cardHeaderSubtitle}>Clear photos or PDF (Max 5MB)</Text>
                                </View>
                            </View>

                            <View style={styles.docList}>
                                {/* Recent Photo */}
                                <TouchableOpacity
                                    style={[styles.docUploadCard, documents.photo && styles.docUploadCardActive]}
                                    onPress={() => handleDocumentUpload("photo")}
                                >
                                    <View style={[styles.docIconCircle, { backgroundColor: '#F3E5F5' }]}>
                                        <Ionicons name="person" size={24} color={documents.photo ? "#FFF" : "#7B1FA2"} />
                                    </View>
                                    <View style={styles.docTextContent}>
                                        <Text style={styles.docTitle}>Recent Photograph *</Text>
                                        <Text style={styles.docHint}>{documents.photo ? documents.photo.name : "White background preferred"}</Text>
                                    </View>
                                    <Ionicons
                                        name={documents.photo ? "checkmark-circle" : "camera"}
                                        size={24}
                                        color={documents.photo ? "#2E7D32" : "#94A3B8"}
                                    />
                                </TouchableOpacity>

                                {/* Aadhaar Card */}
                                <TouchableOpacity
                                    style={[styles.docUploadCard, documents.aadhaarCard && styles.docUploadCardActive]}
                                    onPress={() => handleDocumentUpload("aadhaarCard")}
                                >
                                    <View style={styles.docIconCircle}>
                                        <MaterialCommunityIcons name="card-account-details" size={24} color={documents.aadhaarCard ? "#FFF" : "#2196F3"} />
                                    </View>
                                    <View style={styles.docTextContent}>
                                        <Text style={styles.docTitle}>Aadhaar Card *</Text>
                                        <Text style={styles.docHint}>{documents.aadhaarCard ? documents.aadhaarCard.name : "Front & Back combined"}</Text>
                                    </View>
                                    <Ionicons
                                        name={documents.aadhaarCard ? "checkmark-circle" : "cloud-upload"}
                                        size={24}
                                        color={documents.aadhaarCard ? "#2E7D32" : "#94A3B8"}
                                    />
                                </TouchableOpacity>

                                {/* Address Proof */}
                                <TouchableOpacity
                                    style={[styles.docUploadCard, documents.addressProof && styles.docUploadCardActive]}
                                    onPress={() => handleDocumentUpload("addressProof")}
                                >
                                    <View style={[styles.docIconCircle, { backgroundColor: '#E8F5E9' }]}>
                                        <MaterialCommunityIcons name="home-map-marker" size={24} color={documents.addressProof ? "#FFF" : "#43A047"} />
                                    </View>
                                    <View style={styles.docTextContent}>
                                        <Text style={styles.docTitle}>Address Proof *</Text>
                                        <Text style={styles.docHint}>{documents.addressProof ? documents.addressProof.name : "Light/Gas Bill or Bank Passbook"}</Text>
                                    </View>
                                    <Ionicons
                                        name={documents.addressProof ? "checkmark-circle" : "cloud-upload"}
                                        size={24}
                                        color={documents.addressProof ? "#2E7D32" : "#94A3B8"}
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
                                    <Text style={styles.cardHeaderTitle}>Final Review</Text>
                                    <Text style={styles.cardHeaderSubtitle}>Confirm registration details</Text>
                                </View>
                            </View>

                            <View style={styles.reviewCard}>
                                <View style={styles.reviewSection}>
                                    <Text style={styles.reviewSectionTitle}>Applicant Info</Text>
                                    <View style={styles.reviewItem}>
                                        <Text style={styles.reviewLabel}>Name</Text>
                                        <Text style={styles.reviewValue}>{formData.fullName}</Text>
                                    </View>
                                    <View style={styles.reviewItem}>
                                        <Text style={styles.reviewLabel}>DOB</Text>
                                        <Text style={styles.reviewValue}>{formData.dob}</Text>
                                    </View>
                                    <View style={styles.reviewItem}>
                                        <Text style={styles.reviewLabel}>Mobile</Text>
                                        <Text style={styles.reviewValue}>+91 {formData.mobile}</Text>
                                    </View>
                                    <View style={styles.reviewItem}>
                                        <Text style={styles.reviewLabel}>Aadhaar</Text>
                                        <Text style={styles.reviewValue}>XXXX XXXX {formData.aadhaarNo.slice(-4)}</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.reviewSection}>
                                    <Text style={styles.reviewSectionTitle}>Location Info</Text>
                                    <View style={styles.reviewItem}>
                                        <Text style={styles.reviewLabel}>Assembly</Text>
                                        <Text style={styles.reviewValue}>{formData.assembly}</Text>
                                    </View>
                                    <Text style={styles.addressText}>
                                        {formData.houseNo}, {formData.area}, {formData.city}, {formData.district}, {formData.state} - {formData.pincode}
                                    </Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.reviewSection}>
                                    <Text style={styles.reviewSectionTitle}>Documents Uploaded</Text>
                                    <View style={styles.docStatusRow}>
                                        <View style={styles.docBadge}>
                                            <Ionicons name="image" size={14} color="#2196F3" />
                                            <Text style={styles.docBadgeText}>Photo</Text>
                                        </View>
                                        <View style={styles.docBadge}>
                                            <Ionicons name="card" size={14} color="#2196F3" />
                                            <Text style={styles.docBadgeText}>Aadhaar</Text>
                                        </View>
                                        <View style={styles.docBadge}>
                                            <Ionicons name="home" size={14} color="#2196F3" />
                                            <Text style={styles.docBadgeText}>Address</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.declarationBox}>
                                <Ionicons name="information-circle" size={20} color="#0D47A1" />
                                <Text style={styles.declarationText}>
                                    I hereby declare that I am an Indian citizen and have not applied for Voter ID anywhere else. All information provided is true to the best of my knowledge.
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={{ height: 20 }} />
                </ScrollView>

                {/* Bottom Bar */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#0D47A1', '#1565C0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>
                                {currentStep === 3 ? "Submit Registration" : "Continue"}
                            </Text>
                            <Ionicons
                                name={currentStep === 3 ? "checkmark-done" : "arrow-forward"}
                                size={20}
                                color="#FFF"
                            />
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
        color: '#CBD5E1',
        marginTop: 8,
    },
    stepLabelActive: {
        color: '#0D47A1',
    },

    scrollContent: {
        padding: 20,
    },
    stepWrapper: {
        gap: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    cardHeaderIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
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
        height: 50,
        marginBottom: 4,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1E293B',
    },
    inputRow: {
        flexDirection: 'row',
        marginTop: 4,
    },

    genderContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    genderBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 46,
    },
    genderBoxActive: {
        borderColor: '#0D47A1',
        backgroundColor: '#E3F2FD',
    },
    genderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    genderTextActive: {
        color: '#0D47A1',
    },

    // OTP Section
    otpSection: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    otpButton: {
        backgroundColor: '#0D47A1',
        paddingHorizontal: 12,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
    },
    otpButtonDisabled: {
        opacity: 0.5,
    },
    otpButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    otpVerifyContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    verifyButton: {
        backgroundColor: '#2E7D32',
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
    },
    verifyButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        height: 50,
        borderRadius: 12,
    },
    verifiedText: {
        color: '#2E7D32',
        fontSize: 13,
        fontWeight: '700',
    },

    // Documents
    docList: {
        gap: 12,
    },
    docUploadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 16,
    },
    docUploadCardActive: {
        borderColor: '#2E7D32',
        backgroundColor: '#F0F9FF',
    },
    docIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E1F5FE',
        alignItems: 'center',
        justifyContent: 'center',
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
        color: '#64748B',
        marginTop: 2,
    },

    // Review
    reviewCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    reviewSection: {
        marginBottom: 16,
    },
    reviewSectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0D47A1',
        marginBottom: 10,
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
    },
    addressText: {
        fontSize: 14,
        color: '#1E293B',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
    },
    docStatusRow: {
        flexDirection: 'row',
        gap: 8,
    },
    docBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    docBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#0D47A1',
    },

    declarationBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    declarationText: {
        flex: 1,
        fontSize: 12,
        color: '#0D47A1',
        lineHeight: 18,
    },

    // Bottom Bar
    bottomBar: {
        padding: 20,
        backgroundColor: '#FFF',
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
        paddingVertical: 16,
        gap: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },

    // Success Screen
    successContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
        backgroundColor: "#FFF",
    },
    successIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#F0FDF4",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1E293B",
    },
    successSubtitle: {
        color: "#64748B",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 20,
    },
    idCard: {
        backgroundColor: "#F8FAFC",
        padding: 24,
        borderRadius: 20,
        width: "100%",
        alignItems: "center",
        marginVertical: 32,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    idLabel: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: '700',
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    idValue: {
        fontSize: 28,
        fontWeight: "800",
        color: "#0D47A1",
        marginTop: 4,
    },
    successActions: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 40,
    },
    actionBtn: {
        alignItems: 'center',
        gap: 8,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
        textAlign: 'center',
    },
    mainBtn: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    btnGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    mainBtnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "800",
    },
});
