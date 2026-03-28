import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Clipboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ENDPOINTS } from "../constants/api";

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
}

interface FormDataType {
    // Farmer Details
    farmerName: string;
    aadhaarNumber: string;
    mobileNumber: string;
    gender: string;
    category: string;
    state: string;
    district: string;
    taluka: string;
    village: string;
    // Land Details
    surveyNumber: string;
    landArea: string;
    ownershipType: string;
    // Bank Details
    bankName: string;
    accountNumber: string;
    ifscCode: string;
}

interface DocumentsState {
    land712: DocumentType | null;
    bankPassbook: DocumentType | null;
}

export default function NewPMKisanRegistrationScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [declarationChecked, setDeclarationChecked] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const categories = ["General", "OBC", "SC", "ST", "VJNT"];

    const [formData, setFormData] = useState<FormDataType>({
        farmerName: "",
        aadhaarNumber: "",
        mobileNumber: "",
        gender: "",
        category: "",
        state: "",
        district: "",
        taluka: "",
        village: "",
        surveyNumber: "",
        landArea: "",
        ownershipType: "Single",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
    });

    const [documents, setDocuments] = useState<DocumentsState>({
        land712: null,
        bankPassbook: null,
    });

    // OTP State
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    // Handle Hardware Back Button
    useEffect(() => {
        const backAction = () => {
            if (isSubmitted) {
                router.back();
                return true;
            }
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.back();
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [currentStep, isSubmitted]);

    const handleSendOtp = async () => {
        if (formData.aadhaarNumber.length !== 12) {
            Alert.alert("Invalid Aadhaar", "Please enter a valid 12-digit Aadhaar number");
            return;
        }
        if (formData.mobileNumber.length !== 10) {
            Alert.alert("Invalid Mobile", "Please enter a valid 10-digit mobile number");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                API_ENDPOINTS.PM_KISAN_OTP_SEND,
                { mobileNumber: formData.mobileNumber, aadhaarNumber: formData.aadhaarNumber, type: 'apply' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setIsOtpSent(true);
                Alert.alert("Success", "OTP sent to your mobile number");
            } else {
                Alert.alert("Error", response.data.message || "Failed to send OTP");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to send OTP");
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter the 6-digit verification code");
            return;
        }

        setIsVerifying(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                API_ENDPOINTS.PM_KISAN_OTP_VERIFY,
                { mobileNumber: formData.mobileNumber, otp },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setIsVerifying(false);
                setIsOtpVerified(true);
                Alert.alert("Success", "Aadhaar verified successfully");
            } else {
                setIsVerifying(false);
                Alert.alert("Error", response.data.message || "Invalid OTP");
            }
        } catch (error: any) {
            setIsVerifying(false);
            Alert.alert("Error", error.response?.data?.message || "OTP verification failed");
        }
    };

    const pickDocument = async (docType: keyof DocumentsState) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets) {
                const asset = result.assets[0];
                if (asset.size && asset.size > 5 * 1024 * 1024) {
                    Alert.alert("File Too Large", "Please upload a document smaller than 5MB");
                    return;
                }
                setDocuments(prev => ({
                    ...prev,
                    [docType]: {
                        name: asset.name,
                        size: asset.size,
                        uri: asset.uri
                    }
                }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            if (!formData.farmerName || formData.aadhaarNumber.length !== 12 || formData.mobileNumber.length !== 10 || !formData.gender || !formData.category || !formData.state || !formData.district || !formData.taluka || !formData.village) {
                Alert.alert("Required", "Please fill all required farmer details accurately");
                return;
            }
            if (!isOtpVerified) {
                Alert.alert("Verification Required", "Please verify your Aadhaar number via OTP before proceeding");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!formData.surveyNumber || !formData.landArea || !formData.bankName || !formData.accountNumber || !formData.ifscCode) {
                Alert.alert("Required", "Please fill all land and bank details");
                return;
            }
            if (!documents.land712 || !documents.bankPassbook) {
                Alert.alert("Required", "Please upload 7/12 Extract and Bank Passbook");
                return;
            }
            setCurrentStep(3);
        } else {
            if (!declarationChecked) {
                Alert.alert("Declaration", "Please confirm that the details provided are correct");
                return;
            }
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = new FormData();

            // Map frontend fields to backend fields
            const submissionData = {
                farmer_name: formData.farmerName,
                aadhaar_number: formData.aadhaarNumber,
                mobile_number: formData.mobileNumber,
                gender: formData.gender,
                category: formData.category,
                state: formData.state,
                district: formData.district,
                taluka: formData.taluka,
                village: formData.village,
                survey_number: formData.surveyNumber,
                land_area: formData.landArea,
                ownership_type: formData.ownershipType,
                bank_name: formData.bankName,
                account_number: formData.accountNumber,
                ifsc_code: formData.ifscCode,
            };

            // Append form fields
            Object.keys(submissionData).forEach(key => {
                data.append(key, (submissionData as any)[key]);
            });

            // Append documents
            if (documents.land712) {
                data.append("land_712", {
                    uri: documents.land712.uri,
                    name: documents.land712.name,
                    type: documents.land712.uri.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
                } as any);
            }
            if (documents.bankPassbook) {
                data.append("bank_passbook", {
                    uri: documents.bankPassbook.uri,
                    name: documents.bankPassbook.name,
                    type: documents.bankPassbook.uri.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
                } as any);
            }

            const response = await axios.post(
                API_ENDPOINTS.PM_KISAN_APPLY,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                const refId = response.data.data.reference_id || "PMK-PENDING";
                setApplicationId(refId);
                setIsSubmitting(false);
                setIsSubmitted(true);
            } else {
                setIsSubmitting(false);
                Alert.alert("Error", response.data.message || "Submission failed");
            }
        } catch (error: any) {
            setIsSubmitting(false);
            Alert.alert("Error", error.response?.data?.message || "Failed to submit application");
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicatorContainer}>
            <View style={styles.progressLine}>
                <View style={[styles.progressLineActive, { width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }]} />
            </View>
            <View style={styles.stepsRow}>
                {[1, 2, 3].map((s) => (
                    <View key={s} style={styles.stepItem}>
                        <View style={[styles.stepCircle, currentStep >= s && styles.stepCircleActive, currentStep > s && styles.stepCircleCompleted]}>
                            {currentStep > s ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Text style={[styles.stepNumber, currentStep >= s && styles.stepNumberActive]}>{s}</Text>}
                        </View>
                        <Text style={[styles.stepLabel, currentStep >= s && styles.stepLabelActive]}>
                            {s === 1 ? "Details" : s === 2 ? "Land & Bank" : "Review"}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    if (isSubmitted) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.successContainer}>
                    <View style={styles.successIconCircle}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                    </View>
                    <Text style={styles.successTitle}>Application Submitted!</Text>
                    <Text style={styles.successSubtitle}>Your registration for PM-KISAN Samman Nidhi has been received.</Text>

                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <Text style={styles.idValue}>{applicationId}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    Clipboard.setString(applicationId);
                                    setShowToast(true);
                                    setTimeout(() => setShowToast(false), 2000);
                                }}
                                style={{ padding: 4 }}
                            >
                                <Ionicons name="copy-outline" size={24} color="#1565C0" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showToast && (
                        <View style={styles.toast}>
                            <Text style={styles.toastText}>Reference ID Copied!</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.back()}>
                        <LinearGradient colors={['#1565C0', '#0D47A1']} style={styles.btnGrad}>
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
                    <TouchableOpacity style={styles.backButton} onPress={() => {
                        if (currentStep > 1) setCurrentStep(currentStep - 1);
                        else router.back();
                    }}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Registration</Text>
                        <Text style={styles.headerSubtitle}>PM-KISAN Samman Nidhi</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Farmer Information" icon="person" />
                            <View style={styles.formCard}>
                                <Label text="Farmer Full Name (as per Aadhaar) *" />
                                <Input value={formData.farmerName} onChangeText={(t: string) => setFormData({ ...formData, farmerName: t })} placeholder="Enter full name" />

                                <Label text="Mobile Number *" />
                                <Input value={formData.mobileNumber} onChangeText={(t: string) => setFormData({ ...formData, mobileNumber: t.replace(/\D/g, '').substring(0, 10) })} placeholder="10 digit mobile number" keyboardType="number-pad" maxLength={10} />

                                <Label text="Aadhaar Number *" />
                                <View style={styles.otpInputRow}>
                                    <View style={{ flex: 1 }}>
                                        <Input
                                            value={formData.aadhaarNumber}
                                            onChangeText={(t: string) => setFormData({ ...formData, aadhaarNumber: t.replace(/\D/g, '').substring(0, 12) })}
                                            placeholder="12 digit Aadhaar number"
                                            keyboardType="number-pad"
                                            maxLength={12}
                                            editable={!isOtpVerified}
                                        />
                                    </View>
                                    <TouchableOpacity style={[styles.inlineOtpBtn, (isOtpSent || isOtpVerified) && styles.inlineOtpBtnDisabled]} onPress={handleSendOtp} disabled={isOtpVerified}>
                                        <Text style={styles.inlineOtpBtnText}>{isOtpVerified ? "Verified" : isOtpSent ? "Resend" : "Send OTP"}</Text>
                                    </TouchableOpacity>
                                </View>

                                {isOtpSent && !isOtpVerified && (
                                    <View style={{ marginTop: 10 }}>
                                        <Label text="Enter 6-digit OTP *" />
                                        <View style={styles.otpInputRow}>
                                            <View style={{ flex: 1 }}>
                                                <Input
                                                    value={otp}
                                                    onChangeText={setOtp}
                                                    placeholder="X X X X X X"
                                                    keyboardType="number-pad"
                                                    maxLength={6}
                                                />
                                            </View>
                                            <TouchableOpacity style={styles.verifyBtnInline} onPress={handleVerifyOtp} disabled={isVerifying}>
                                                {isVerifying ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.verifyBtnTextInline}>Verify</Text>}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}

                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Gender *" />
                                        <View style={styles.genderContainer}>
                                            {["Male", "Female"].map((g) => (
                                                <TouchableOpacity key={g} style={[styles.genderBtn, formData.gender === g && styles.genderBtnActive]} onPress={() => setFormData({ ...formData, gender: g })}>
                                                    <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>{g}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Category *" />
                                        <TouchableOpacity style={styles.selectBtn} onPress={() => setShowCategoryPicker(true)}>
                                            <Text style={[styles.selectText, !formData.category && { color: "#94A3B8" }]}>{formData.category || "Select Category"}</Text>
                                            <Ionicons name="chevron-down" size={16} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <SectionTitle title="Location Details" icon="location" />
                            <View style={styles.formCard}>
                                <Label text="State *" />
                                <Input value={formData.state} onChangeText={(t: string) => setFormData({ ...formData, state: t })} placeholder="Enter State" />

                                <Label text="District *" />
                                <Input value={formData.district} onChangeText={(t: string) => setFormData({ ...formData, district: t })} placeholder="Enter District" />

                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Taluka *" />
                                        <Input value={formData.taluka} onChangeText={(t: string) => setFormData({ ...formData, taluka: t })} placeholder="Taluka" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Village *" />
                                        <Input value={formData.village} onChangeText={(t: string) => setFormData({ ...formData, village: t })} placeholder="Village" />
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Land Ownership Details" icon="map" />
                            <View style={styles.formCard}>
                                <Label text="Survey / Gat Number *" />
                                <Input value={formData.surveyNumber} onChangeText={(t: string) => setFormData({ ...formData, surveyNumber: t })} placeholder="Enter survey number" />

                                <Label text="Land Area (in Hectares) *" />
                                <Input value={formData.landArea} onChangeText={(t: string) => setFormData({ ...formData, landArea: t })} placeholder="e.g. 1.5" keyboardType="numeric" />

                                <Label text="Ownership Type *" />
                                <View style={styles.genderContainer}>
                                    {["Single", "Joint"].map((o) => (
                                        <TouchableOpacity key={o} style={[styles.genderBtn, formData.ownershipType === o && styles.genderBtnActive]} onPress={() => setFormData({ ...formData, ownershipType: o })}>
                                            <Text style={[styles.genderText, formData.ownershipType === o && styles.genderTextActive]}>{o}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity style={[styles.uploadBox, documents.land712 && styles.uploadBoxActive]} onPress={() => pickDocument('land712')}>
                                    <Ionicons name={documents.land712 ? "checkmark-circle" : "cloud-upload"} size={28} color={documents.land712 ? "#2E7D32" : "#1565C0"} />
                                    <Text style={[styles.uploadText, documents.land712 && styles.uploadTextActive]}>
                                        {documents.land712 ? documents.land712.name : "Upload 7/12 Extract *"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <SectionTitle title="Bank Account Details" icon="wallet" />
                            <View style={styles.formCard}>
                                <Label text="Bank Name *" />
                                <Input value={formData.bankName} onChangeText={(t: string) => setFormData({ ...formData, bankName: t })} placeholder="Enter Bank Name" />

                                <Label text="Account Number *" />
                                <Input value={formData.accountNumber} onChangeText={(t: string) => setFormData({ ...formData, accountNumber: t.replace(/\D/g, '') })} placeholder="Bank Account Number" keyboardType="number-pad" />

                                <Label text="IFSC Code *" />
                                <Input value={formData.ifscCode} onChangeText={(t: string) => setFormData({ ...formData, ifscCode: t.toUpperCase() })} placeholder="IFSC Code" autoCapitalize="characters" />

                                <TouchableOpacity style={[styles.uploadBox, documents.bankPassbook && styles.uploadBoxActive]} onPress={() => pickDocument('bankPassbook')}>
                                    <Ionicons name={documents.bankPassbook ? "checkmark-circle" : "cloud-upload"} size={28} color={documents.bankPassbook ? "#2E7D32" : "#1565C0"} />
                                    <Text style={[styles.uploadText, documents.bankPassbook && styles.uploadTextActive]}>
                                        {documents.bankPassbook ? documents.bankPassbook.name : "Upload Bank Passbook *"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <View style={styles.reviewCard}>
                                <View style={styles.reviewSectionHeader}>
                                    <Text style={styles.reviewSectionTitle}>Farmer Details</Text>
                                    <TouchableOpacity onPress={() => setCurrentStep(1)}>
                                        <Text style={styles.editLink}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                                <ReviewRow label="Farmer Name" value={formData.farmerName} />
                                <ReviewRow label="Aadhaar" value={formData.aadhaarNumber} />
                                <ReviewRow label="Gender/Cat" value={`${formData.gender} / ${formData.category}`} />
                                <ReviewRow label="Location" value={`${formData.village}, ${formData.state}`} />

                                <View style={styles.reviewSectionHeader}>
                                    <Text style={styles.reviewSectionTitle}>Land & Bank</Text>
                                    <TouchableOpacity onPress={() => setCurrentStep(2)}>
                                        <Text style={styles.editLink}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                                <ReviewRow label="Survey No" value={formData.surveyNumber} />
                                <ReviewRow label="Land Area" value={formData.landArea + " Ha"} />
                                <ReviewRow label="Bank" value={formData.bankName} />
                                <ReviewRow label="Account" value={formData.accountNumber} />

                                <View style={styles.revDivider} />
                                <ReviewRow label="7/12 Uploaded" value={documents.land712 ? "Yes" : "No"} />
                                <ReviewRow label="Passbook Uploaded" value={documents.bankPassbook ? "Yes" : "No"} />
                            </View>

                            <TouchableOpacity style={styles.declarationRow} onPress={() => setDeclarationChecked(!declarationChecked)}>
                                <Ionicons name={declarationChecked ? "checkbox" : "square-outline"} size={24} color={declarationChecked ? "#2E7D32" : "#64748B"} />
                                <Text style={styles.declarationText}>I confirm that all details provided are correct and I am eligible for PM-KISAN scheme.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
                        <LinearGradient colors={["#1565C0", "#0D47A1"]} style={styles.btnContent}>
                            {isSubmitting ? <ActivityIndicator color="#FFF" /> : (
                                <>
                                    <Text style={styles.btnLabel}>{currentStep === 3 ? "Submit Application" : "Continue"}</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Category Picker Modal */}
                <Modal visible={showCategoryPicker} transparent animationType="fade">
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCategoryPicker(false)}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Category</Text>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setFormData({ ...formData, category: cat });
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    <Text style={[styles.modalItemText, formData.category === cat && styles.modalItemTextActive]}>{cat}</Text>
                                    {formData.category === cat && <Ionicons name="checkmark-circle" size={20} color="#1565C0" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

// Reusable Components
const SectionTitle = ({ title, icon }: { title: string, icon: any }) => (
    <View style={styles.secHeader}>
        <View style={styles.secIcon}><Ionicons name={icon as any} size={20} color="#2196F3" /></View>
        <Text style={styles.secTitle}>{title}</Text>
    </View>
);
const Label = ({ text }: { text: string }) => <Text style={styles.label}>{text}</Text>;
const Input = (props: any) => <TextInput style={[styles.input, props.editable === false && styles.inputDisabled]} placeholderTextColor="#94A3B8" {...props} />;
const ReviewRow = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.revRow}>
        <Text style={styles.revLabel}>{label}</Text>
        <Text style={styles.revValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#FFF" },
    backButton: { padding: 4 },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 11, color: "#64748B", marginTop: 2 },

    stepIndicatorContainer: { backgroundColor: '#FFF', paddingBottom: 20, paddingHorizontal: 30 },
    progressLine: { position: 'absolute', top: 17, left: 60, right: 60, height: 2, backgroundColor: '#F1F5F9' },
    progressLineActive: { height: '100%', backgroundColor: '#2E7D32' },
    stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    stepItem: { alignItems: 'center' },
    stepCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    stepCircleActive: { borderColor: '#1565C0' },
    stepCircleCompleted: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    stepNumber: { fontSize: 14, fontWeight: '700', color: '#CBD5E1' },
    stepNumberActive: { color: '#1565C0' },
    stepLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 6 },
    stepLabelActive: { color: '#1565C0' },

    scrollContent: { padding: 20 },
    stepWrapper: { gap: 15 },

    secHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
    secIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E3F2FD", alignItems: "center", justifyContent: "center" },
    secTitle: { fontSize: 15, fontWeight: "800", color: "#1E293B" },

    formCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#F1F5F9" },
    label: { fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 14, fontSize: 14, color: "#1E293B", borderWidth: 1, borderColor: "#E2E8F0" },
    inputDisabled: { backgroundColor: "#F1F5F9", color: "#94A3B8" },
    row: { flexDirection: "row", gap: 12 },

    genderContainer: { flexDirection: "row", gap: 8 },
    genderBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0" },
    genderBtnActive: { backgroundColor: "#E3F2FD", borderColor: "#1565C0" },
    genderText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
    genderTextActive: { color: "#1565C0", fontWeight: "700" },

    selectBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E2E8F0" },
    selectText: { fontSize: 14, color: "#1E293B", fontWeight: "500" },

    uploadBox: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F1F8FE", borderRadius: 12, padding: 16, borderStyle: "dashed", borderWidth: 1.5, borderColor: "#1565C0", marginTop: 20 },
    uploadBoxActive: { backgroundColor: "#F1F8E9", borderColor: "#2E7D32", borderStyle: "solid" },
    uploadText: { fontSize: 14, fontWeight: "700", color: "#1565C0" },
    uploadTextActive: { color: "#2E7D32" },

    reviewCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, gap: 10 },
    revRow: { flexDirection: "row", justifyContent: "space-between" },
    revLabel: { fontSize: 13, color: "#64748B" },
    revValue: { fontSize: 13, fontWeight: "800", color: "#1E293B" },
    revDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 4 },

    declarationRow: { flexDirection: "row", gap: 12, paddingHorizontal: 4 },
    declarationText: { flex: 1, fontSize: 12, color: "#64748B", fontWeight: "600", lineHeight: 18 },

    footer: { padding: 20, backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#F1F5F9" },
    continueBtn: { borderRadius: 16, overflow: "hidden" },
    btnContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 8 },
    btnLabel: { fontSize: 16, fontWeight: "800", color: "#FFF" },

    otpInputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
    inlineOtpBtn: { backgroundColor: "#1565C0", paddingHorizontal: 15, height: 48, borderRadius: 12, justifyContent: "center", borderWidth: 1, borderColor: "#0D47A1" },
    inlineOtpBtnDisabled: { opacity: 0.6, borderColor: "#E2E8F0" },
    inlineOtpBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
    verifyBtnInline: { backgroundColor: "#2E7D32", paddingHorizontal: 20, height: 48, borderRadius: 12, justifyContent: "center" },
    verifyBtnTextInline: { color: "#FFF", fontWeight: "700", fontSize: 14 },

    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#FFF' },
    successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
    successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 35, lineHeight: 22 },
    idCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 25, width: '100%', alignItems: 'center', marginBottom: 35, borderWidth: 1, borderColor: "#E2E8F0" },
    idLabel: { fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontWeight: "700" },
    idValue: { fontSize: 28, fontWeight: '900', color: '#1565C0' },
    successActions: { flexDirection: 'row', gap: 15, marginBottom: 35 },
    actionBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    actionIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    actionText: { fontSize: 12, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    mainBtnText: { fontSize: 16, fontWeight: "800", color: "#FFF" },
    toast: { position: 'absolute', bottom: 120, backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, zIndex: 100 },
    toastText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },

    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalContent: { width: "100%", backgroundColor: "#FFF", borderRadius: 24, padding: 24, gap: 10 },
    modalTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 10 },
    modalItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    modalItemText: { fontSize: 15, color: "#475569", fontWeight: "600" },
    modalItemTextActive: { color: "#1565C0", fontWeight: "700" },

    reviewSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15, marginBottom: 8 },
    reviewSectionTitle: { fontSize: 14, fontWeight: "800", color: "#1E293B" },
    editLink: { fontSize: 13, color: "#1565C0", fontWeight: "700" },
});
