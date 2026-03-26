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
    ActivityIndicator,
    Clipboard
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../constants/api";

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
}

interface FormDataType {
    // Deceased Details
    deceasedName: string;
    deceasedAadhaar: string;
    gender: string;
    dob: string;
    dateOfDeath: string;
    timeOfDeath: string;
    placeOfDeath: "Hospital" | "Home" | "Other" | "";
    hospitalName: string;
    causeOfDeath: string;

    // Applicant Details
    applicantName: string;
    applicantAadhaar: string;
    relationship: string;
    mobileNumber: string;
    email: string;

    // Address of Deceased
    houseNo: string;
    street: string;
    village: string;
    taluka: string;
    district: string;
    state: string;
    pincode: string;

    // Registration Type
    registrationType: "Normal" | "Late" | "";
    delayReason: string;

    declaration: boolean;
    finalDeclaration: boolean;
}

interface DocumentsState {
    deathReport: DocumentType | null;
    deceasedAadhaarDoc: DocumentType | null;
    applicantAadhaarDoc: DocumentType | null;
    addressProof: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewDeathCertificateScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [showCopied, setShowCopied] = useState(false);

    // OTP States
    const [isApplicantVerified, setIsApplicantVerified] = useState(false);
    const [applicantOtpCode, setApplicantOtpCode] = useState("");
    const [isVerifyingApplicant, setIsVerifyingApplicant] = useState(false);
    const [isSendingApplicantOtp, setIsSendingApplicantOtp] = useState(false);
    const [isApplicantOtpSent, setIsApplicantOtpSent] = useState(false);

    const [documents, setDocuments] = useState<DocumentsState>({
        deathReport: null,
        deceasedAadhaarDoc: null,
        applicantAadhaarDoc: null,
        addressProof: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        deceasedName: "",
        deceasedAadhaar: "",
        gender: "",
        dob: "",
        dateOfDeath: "",
        timeOfDeath: "",
        placeOfDeath: "",
        hospitalName: "",
        causeOfDeath: "",
        applicantName: "",
        applicantAadhaar: "",
        relationship: "",
        mobileNumber: "",
        email: "",
        houseNo: "",
        street: "",
        village: "",
        taluka: "",
        district: "",
        state: "",
        pincode: "",
        registrationType: "Normal",
        delayReason: "",
        declaration: false,
        finalDeclaration: false,
    });

    // Handle back navigation
    useEffect(() => {
        const backAction = () => {
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.back();
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [currentStep]);

    const REQUIRED_DOCS = [
        { id: 'deathReport', name: 'Death Report / Doctor Certificate *', icon: 'file-document-outline', color: '#EF4444', hint: 'Hospital / Doctor issued' },
        { id: 'deceasedAadhaarDoc', name: 'Aadhaar Card (Deceased) *', icon: 'card-account-details-outline', color: '#0D47A1', hint: 'Front & Back side' },
        { id: 'applicantAadhaarDoc', name: 'Aadhaar Card (Applicant) *', icon: 'account-child-outline', color: '#1565C0', hint: 'Front & Back side' },
        { id: 'addressProof', name: 'Address Proof *', icon: 'home-outline', color: '#2E7D32', hint: 'Ration Card / Light Bill' },
    ];

    const pickDocument = async (docType: keyof DocumentsState) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets[0]) {
                const file = result.assets[0];

                if (file.size && file.size > 2 * 1024 * 1024) {
                    Alert.alert("File Too Large", "Please upload a file smaller than 2MB");
                    return;
                }

                setDocuments((prev) => ({
                    ...prev,
                    [docType]: {
                        name: file.name,
                        size: file.size,
                        uri: file.uri,
                    },
                }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const removeDocument = (docType: keyof DocumentsState) => {
        setDocuments((prev) => ({
            ...prev,
            [docType]: null,
        }));
    };

    const handleSendOTP = async () => {
        if (formData.mobileNumber.length !== 10 || formData.applicantAadhaar.length !== 12) {
            Alert.alert("Error", "Please enter valid 10-digit mobile and 12-digit Aadhaar");
            return;
        }

        setIsSendingApplicantOtp(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(API_ENDPOINTS.DEATH_OTP_SEND, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mobile_number: formData.mobileNumber,
                    aadhar_number: formData.applicantAadhaar,
                    purpose: "DEATH_APPLY"
                })
            });
            const result = await response.json();
            if (result.success) {
                setIsApplicantOtpSent(true);
                Alert.alert("Success", "OTP sent to your mobile number");
            } else {
                Alert.alert("Error", result.message || "Failed to send OTP");
            }
        } catch (error) {
            Alert.alert("Error", "Connectivity issue while sending OTP");
        } finally {
            setIsSendingApplicantOtp(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (applicantOtpCode.length !== 6) {
            Alert.alert("Error", "Enter 6-digit OTP");
            return;
        }

        setIsVerifyingApplicant(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(API_ENDPOINTS.DEATH_OTP_VERIFY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mobile_number: formData.mobileNumber,
                    otp_code: applicantOtpCode,
                    purpose: "DEATH_APPLY"
                })
            });
            const result = await response.json();
            if (result.success) {
                setIsApplicantVerified(true);
                Alert.alert("Success", "Aadhaar verified successfully");
            } else {
                Alert.alert("Error", result.message || "Invalid OTP");
            }
        } catch (error) {
            Alert.alert("Error", "Connectivity issue while verifying OTP");
        } finally {
            setIsVerifyingApplicant(false);
        }
    };

    const formatDate = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        return formatted;
    };

    const formatTime = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + ":" + cleaned.slice(2, 4);
        return formatted;
    };

    const handleContinue = async () => {
        if (currentStep === 1) {
            const { deceasedName, deceasedAadhaar, gender, dateOfDeath, applicantName, relationship, mobileNumber, houseNo, village, district, pincode, registrationType, declaration, state } = formData;

            if (!deceasedName || deceasedAadhaar.length !== 12 || !gender || !dateOfDeath) {
                Alert.alert("Required", "Deceased details are incomplete");
                return;
            }
            if (!applicantName || !relationship || mobileNumber.length !== 10) {
                Alert.alert("Required", "Applicant details are incomplete");
                return;
            }
            if (!isApplicantVerified) {
                Alert.alert("Verification Required", "Please verify Applicant Aadhaar via OTP");
                return;
            }
            if (!houseNo || !village || !district || !state || pincode.length !== 6) {
                Alert.alert("Required", "Address details are incomplete");
                return;
            }
            if (!declaration) {
                Alert.alert("Required", "Accept the declaration to continue");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!documents.deathReport || !documents.deceasedAadhaarDoc || !documents.applicantAadhaarDoc || !documents.addressProof) {
                Alert.alert("Required", "All documents are mandatory");
                return;
            }
            setCurrentStep(3);
        } else {
            if (!formData.finalDeclaration) {
                Alert.alert("Required", "Check final declaration");
                return;
            }

            setIsSubmitting(true);
            try {
                const token = await AsyncStorage.getItem('userToken');
                const body = new FormData();
                
                // Add text fields
                Object.keys(formData).forEach(key => {
                    const backendKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
                    body.append(backendKey, (formData as any)[key]);
                });

                // Add documents
                if (documents.deathReport) body.append('death_report', { uri: documents.deathReport.uri, name: 'death_report.pdf', type: 'application/pdf' } as any);
                if (documents.deceasedAadhaarDoc) body.append('deceased_aadhaar', { uri: documents.deceasedAadhaarDoc.uri, name: 'deceased_aadhaar.pdf', type: 'application/pdf' } as any);
                if (documents.applicantAadhaarDoc) body.append('applicant_aadhaar', { uri: documents.applicantAadhaarDoc.uri, name: 'applicant_aadhaar.pdf', type: 'application/pdf' } as any);
                if (documents.addressProof) body.append('address_proof', { uri: documents.addressProof.uri, name: 'address_proof.pdf', type: 'application/pdf' } as any);

                const response = await fetch(API_ENDPOINTS.DEATH_APPLY, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: body
                });
                const result = await response.json();
                if (result.success) {
                    setApplicationId(result.data.reference_id || result.data.applicationId);
                    setIsSubmitted(true);
                } else {
                    Alert.alert("Error", result.message || "Failed to submit application");
                }
            } catch (error) {
                Alert.alert("Error", "Submission failed");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicatorContainer}>
            <View style={styles.progressLine}>
                <View style={[styles.progressLineActive, { width: `${((currentStep - 1) / 2) * 100}%` }]} />
            </View>
            <View style={styles.stepsRow}>
                {[1, 2, 3].map((s) => (
                    <View key={s} style={styles.stepItem}>
                        <View style={[
                            styles.stepCircle,
                            currentStep >= s && styles.stepCircleActive,
                            currentStep > s && styles.stepCircleCompleted
                        ]}>
                            {currentStep > s ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Text style={[styles.stepNumber, currentStep >= s && styles.stepNumberActive]}>{s}</Text>}
                        </View>
                        <Text style={[styles.stepLabel, currentStep >= s && styles.stepLabelActive]}>
                            {s === 1 ? "Details" : s === 2 ? "Documents" : "Review"}
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
                    <Text style={styles.successSubtitle}>Your Death Certificate application has been received successfully.</Text>

                    <TouchableOpacity 
                        style={styles.idCard} 
                        onPress={() => {
                            Clipboard.setString(applicationId);
                            setShowCopied(true);
                            setTimeout(() => setShowCopied(false), 2000);
                        }}
                    >
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={styles.idValue}>{applicationId}</Text>
                            <Ionicons name="copy-outline" size={20} color="#0D47A1" />
                        </View>
                    </TouchableOpacity>

                    {showCopied && (
                        <View style={styles.toast}>
                            <Text style={styles.toastText}>Copied to clipboard</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.back()}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.btnGrad}>
                            <Text style={styles.mainBtnText}>Return to Services</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.timeEstimate}>Estimated Processing Time: 7-10 Working Days</Text>
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
                        <Text style={styles.headerTitle}>New Death Certificate</Text>
                        <Text style={styles.headerSubtitle}>Apply for registration</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Deceased Person Details" icon="person" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Full Name (as per Aadhaar) *" />
                                <Input value={formData.deceasedName} onChangeText={(v: string) => setFormData({ ...formData, deceasedName: v })} placeholder="Enter deceased person name" icon="person-outline" />

                                <Label text="Aadhaar Number *" />
                                <Input value={formData.deceasedAadhaar} onChangeText={(v: string) => setFormData({ ...formData, deceasedAadhaar: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} />

                                <Label text="Gender *" />
                                <View style={[styles.radioGroup, { marginBottom: 12 }]}>
                                    {["Male", "Female", "Other"].map(g => (
                                        <TouchableOpacity key={g} style={[styles.radioBtn, formData.gender === g && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, gender: g })}>
                                            <Text style={[styles.radioText, formData.gender === g && styles.radioTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Label text="Date of Birth (Optional)" />
                                <Input value={formData.dob} onChangeText={(v: string) => setFormData({ ...formData, dob: formatDate(v) })} placeholder="DD/MM/YYYY" icon="calendar-outline" keyboardType="number-pad" maxLength={10} />

                                <Label text="Date of Death *" />
                                <Input value={formData.dateOfDeath} onChangeText={(v: string) => setFormData({ ...formData, dateOfDeath: formatDate(v) })} placeholder="DD/MM/YYYY" icon="calendar-outline" keyboardType="number-pad" maxLength={10} />

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Time of Death" />
                                        <View style={{ marginTop: 5 }}>
                                            <Input value={formData.timeOfDeath} onChangeText={(v: string) => setFormData({ ...formData, timeOfDeath: formatTime(v) })} placeholder="HH:MM" icon="time-outline" keyboardType="number-pad" maxLength={5} />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Place of Death *" />
                                        <View style={[styles.radioGroup, { flexWrap: 'wrap' }]}>
                                            {["Hospital", "Home", "Other"].map(p => (
                                                <TouchableOpacity key={p} style={[styles.radioBtn, formData.placeOfDeath === p && styles.radioBtnActive, { minWidth: '45%', marginBottom: 8 }]} onPress={() => setFormData({ ...formData, placeOfDeath: p as any })}>
                                                    <Text style={[styles.radioText, formData.placeOfDeath === p && styles.radioTextActive]}>{p}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                {formData.placeOfDeath === "Hospital" && (
                                    <>
                                        <Label text="Hospital Name *" />
                                        <Input value={formData.hospitalName} onChangeText={(v: string) => setFormData({ ...formData, hospitalName: v })} placeholder="Enter hospital name" icon="business-outline" />
                                    </>
                                )}

                                <Label text="Cause of Death (Optional)" />
                                <Input value={formData.causeOfDeath} onChangeText={(v: string) => setFormData({ ...formData, causeOfDeath: v })} placeholder="If known" icon="medical-outline" />
                            </View>

                            <SectionTitle title="Applicant Details" icon="person-circle" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Full Name *" />
                                <Input value={formData.applicantName} onChangeText={(v: string) => setFormData({ ...formData, applicantName: v })} placeholder="Enter your full name" icon="person-outline" />

                                <Label text="Relationship with Deceased *" />
                                <Input value={formData.relationship} onChangeText={(v: string) => setFormData({ ...formData, relationship: v })} placeholder="e.g. Son, Daughter, Spouse" icon="people-outline" />

                                <Label text="Applicant Mobile Number *" />
                                <Input value={formData.mobileNumber} onChangeText={(v: string) => setFormData({ ...formData, mobileNumber: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} editable={!isApplicantVerified} />

                                <Label text="Applicant Aadhaar Number *" />
                                <View style={styles.otpRow}>
                                    <View style={{ flex: 1 }}>
                                        <Input value={formData.applicantAadhaar} onChangeText={(v: string) => setFormData({ ...formData, applicantAadhaar: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} editable={!isApplicantVerified} />
                                    </View>
                                    {!isApplicantVerified && (
                                        <TouchableOpacity style={[styles.otpBtn, isSendingApplicantOtp && styles.btnDisabled]} onPress={handleSendOTP} disabled={isSendingApplicantOtp}>
                                            {isSendingApplicantOtp ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpBtnText}>{isApplicantOtpSent ? "Resend" : "Send OTP"}</Text>}
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {isApplicantOtpSent && !isApplicantVerified && (
                                    <View style={styles.otpVerifyContainer}>
                                        <View style={{ flex: 1 }}>
                                            <Input value={applicantOtpCode} onChangeText={setApplicantOtpCode} placeholder="Enter 6-digit OTP" keyboardType="number-pad" maxLength={6} icon="shield-checkmark-outline" />
                                        </View>
                                        <TouchableOpacity style={[styles.otpBtn, isVerifyingApplicant && styles.btnDisabled, { backgroundColor: '#2E7D32' }]} onPress={handleVerifyOTP} disabled={isVerifyingApplicant}>
                                            {isVerifyingApplicant ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpBtnText}>Verify</Text>}
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {isApplicantVerified && <View style={styles.verifiedBadge}><Ionicons name="checkmark-circle" size={16} color="#2E7D32" /><Text style={styles.verifiedText}>Aadhaar verified</Text></View>}

                                <Label text="Email (Optional)" />
                                <Input value={formData.email} onChangeText={(v: string) => setFormData({ ...formData, email: v })} placeholder="Enter email address" icon="mail-outline" />
                            </View>

                            <SectionTitle title="Residential Address" icon="home" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="House/Flat No *" />
                                <Input value={formData.houseNo} onChangeText={(v: string) => setFormData({ ...formData, houseNo: v })} placeholder="Flat No / House No" />
                                <Label text="Street / Area" />
                                <Input value={formData.street} onChangeText={(v: string) => setFormData({ ...formData, street: v })} placeholder="Landmark / Area" />
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Village/City *" />
                                        <Input value={formData.village} onChangeText={(v: string) => setFormData({ ...formData, village: v })} placeholder="Village/City" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Taluka *" />
                                        <Input value={formData.taluka} onChangeText={(v: string) => setFormData({ ...formData, taluka: v })} placeholder="Taluka" />
                                    </View>
                                </View>
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="District *" />
                                        <Input value={formData.district} onChangeText={(v: string) => setFormData({ ...formData, district: v })} placeholder="District" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="State *" />
                                        <Input value={formData.state} onChangeText={(v: string) => setFormData({ ...formData, state: v })} placeholder="State" />
                                    </View>
                                </View>
                                <Label text="Pincode *" />
                                <Input value={formData.pincode} onChangeText={(v: string) => setFormData({ ...formData, pincode: v.replace(/\D/g, '').substring(0, 6) })} placeholder="6-digit" keyboardType="number-pad" maxLength={6} />
                            </View>

                            <SectionTitle title="Registration Type" icon="time" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Type *" />
                                <View style={styles.radioGroup}>
                                    {["Normal", "Late"].map(t => (
                                        <TouchableOpacity key={t} style={[styles.radioBtn, formData.registrationType === t && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, registrationType: t as any })}>
                                            <Text style={[styles.radioText, formData.registrationType === t && styles.radioTextActive]}>{t} Registration</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {formData.registrationType === "Late" && (
                                    <>
                                        <Label text="Reason for Delay *" />
                                        <Input value={formData.delayReason} onChangeText={(v: string) => setFormData({ ...formData, delayReason: v })} placeholder="Enter reason for late registration" icon="alert-circle-outline" multiline />
                                        <View style={styles.noticeBox}>
                                            <Ionicons name="information-circle" size={16} color="#EF6C00" />
                                            <Text style={styles.noticeText}>Late registration may require additional verification and an affidavit.</Text>
                                        </View>
                                    </>
                                )}
                            </View>

                            <TouchableOpacity style={styles.declarationBox} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}>
                                <View style={[styles.checkBox, formData.declaration && styles.checkBoxActive]}>
                                    {formData.declaration && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                </View>
                                <Text style={styles.declarationText}>I declare that the above information is true and correct to the best of my knowledge.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

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
                                {REQUIRED_DOCS.map((doc) => (
                                    <TouchableOpacity
                                        key={doc.id}
                                        style={[styles.docUploadCard, documents[doc.id] && styles.docUploadCardActive]}
                                        onPress={() => pickDocument(doc.id as keyof DocumentsState)}
                                    >
                                        <View style={[styles.docIconCircle, { backgroundColor: doc.color + '15' }]}>
                                            <MaterialCommunityIcons
                                                name={doc.icon as any}
                                                size={24}
                                                color={documents[doc.id] ? "#FFF" : doc.color}
                                                style={documents[doc.id] && { backgroundColor: doc.color, borderRadius: 12, padding: 4 }}
                                            />
                                        </View>
                                        <View style={styles.docTextContent}>
                                            <Text style={styles.docTitle}>{doc.name}</Text>
                                            <Text style={styles.docHint}>
                                                {documents[doc.id] ? documents[doc.id]!.name : doc.hint}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name={documents[doc.id] ? "checkmark-circle" : "cloud-upload"}
                                            size={24}
                                            color={documents[doc.id] ? "#2E7D32" : "#94A3B8"}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Review Your Application" icon="eye" color="#1A237E" />

                            <ReviewCard title="Deceased Details" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Full Name" value={formData.deceasedName} />
                                <ReviewItem label="Aadhaar" value={formData.deceasedAadhaar} />
                                <ReviewItem label="Date of Death" value={formData.dateOfDeath} />
                                <ReviewItem label="Time of Death" value={formData.timeOfDeath} />
                                <ReviewItem label="Place" value={formData.placeOfDeath} />
                                {formData.placeOfDeath === "Hospital" && <ReviewItem label="Hospital" value={formData.hospitalName} />}
                            </ReviewCard>

                            <ReviewCard title="Applicant Info" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Full Name" value={formData.applicantName} />
                                <ReviewItem label="Relationship" value={formData.relationship} />
                                <ReviewItem label="Mobile" value={formData.mobileNumber} />
                            </ReviewCard>

                            <ReviewCard title="Address" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Address" value={`${formData.houseNo}, ${formData.street}, ${formData.village}, ${formData.taluka}, ${formData.district}, ${formData.state} - ${formData.pincode}`} />
                            </ReviewCard>

                            <ReviewCard title="Registration" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Type" value={formData.registrationType} />
                                {formData.registrationType === "Late" && <ReviewItem label="Delay Reason" value={formData.delayReason} />}
                            </ReviewCard>

                            <ReviewCard title="Documents" onEdit={() => setCurrentStep(2)}>
                                <View style={styles.reviewDocList}>
                                    <View style={styles.reviewDocItem}>
                                        <Ionicons name={documents.deathReport ? "checkmark-circle" : "close-circle"} size={16} color={documents.deathReport ? "#2E7D32" : "#94A3B8"} />
                                        <Text style={styles.reviewDocName}>Death Report: {documents.deathReport?.name || "Missing"}</Text>
                                    </View>
                                    <View style={styles.reviewDocItem}>
                                        <Ionicons name={documents.deceasedAadhaarDoc ? "checkmark-circle" : "close-circle"} size={16} color={documents.deceasedAadhaarDoc ? "#2E7D32" : "#94A3B8"} />
                                        <Text style={styles.reviewDocName}>Deceased Aadhaar: {documents.deceasedAadhaarDoc?.name || "Missing"}</Text>
                                    </View>
                                    <View style={styles.reviewDocItem}>
                                        <Ionicons name={documents.applicantAadhaarDoc ? "checkmark-circle" : "close-circle"} size={16} color={documents.applicantAadhaarDoc ? "#2E7D32" : "#94A3B8"} />
                                        <Text style={styles.reviewDocName}>Applicant Aadhaar: {documents.applicantAadhaarDoc?.name || "Missing"}</Text>
                                    </View>
                                    <View style={styles.reviewDocItem}>
                                        <Ionicons name={documents.addressProof ? "checkmark-circle" : "close-circle"} size={16} color={documents.addressProof ? "#2E7D32" : "#94A3B8"} />
                                        <Text style={styles.reviewDocName}>Address Proof: {documents.addressProof?.name || "Missing"}</Text>
                                    </View>
                                </View>
                            </ReviewCard>

                            <TouchableOpacity style={styles.declarationBox} onPress={() => setFormData({ ...formData, finalDeclaration: !formData.finalDeclaration })}>
                                <View style={[styles.checkBox, formData.finalDeclaration && styles.checkBoxActive]}>
                                    {formData.finalDeclaration && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                </View>
                                <Text style={styles.declarationText}>I confirm that all documents submitted are genuine and the details provided are accurate as per civil registration laws.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 40 }} />

                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.mainBtn} onPress={handleContinue} disabled={isSubmitting}>
                            <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.btnGrad}>
                                {isSubmitting ? <ActivityIndicator color="#FFF" size="small" /> : (
                                    <>
                                        <Text style={styles.mainBtnText}>{currentStep === 3 ? "Submit Application" : "Continue"}</Text>
                                        <Ionicons name={currentStep === 3 ? "checkmark-done" : "arrow-forward"} size={18} color="#FFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const SectionTitle = ({ title, icon, color }: { title: string, icon: any, color: string }) => (
    <View style={styles.sectionHeader}>
        <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    </View>
);

const Label = ({ text }: { text: string }) => <Text style={styles.label}>{text}</Text>;

const Input = ({ icon, style, ...props }: any) => (
    <View style={[styles.inputContainer, style]}>
        {icon && <Ionicons name={icon} size={18} color="#94A3B8" style={{ marginRight: 10 }} />}
        <TextInput style={styles.field} placeholderTextColor="#94A3B8" {...props} />
    </View>
);


const ReviewCard = ({ title, children, onEdit }: any) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>{title}</Text>
            <TouchableOpacity onPress={onEdit}><Text style={styles.editBtn}>Edit</Text></TouchableOpacity>
        </View>
        <View style={styles.reviewContent}>{children}</View>
    </View>
);

const ReviewItem = ({ label, value }: any) => (
    <View style={styles.reviewItem}>
        <Text style={styles.reviewLabel}>{label}:</Text>
        <Text style={styles.reviewValue}>{value || "N/A"}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    headerSubtitle: { fontSize: 11, color: '#666', marginTop: 2 },
    placeholder: { width: 34 },

    stepIndicatorContainer: { backgroundColor: '#FFF', paddingVertical: 15, paddingHorizontal: 30 },
    progressLine: { position: 'absolute', top: 32, left: 60, right: 60, height: 2, backgroundColor: '#F1F5F9' },
    progressLineActive: { height: '100%', backgroundColor: '#0D47A1' },
    stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    stepItem: { alignItems: 'center' },
    stepCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    stepCircleActive: { borderColor: '#0D47A1' },
    stepCircleCompleted: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    stepNumber: { fontSize: 14, fontWeight: '700', color: '#CBD5E1' },
    stepNumberActive: { color: '#0D47A1' },
    stepLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 6 },
    stepLabelActive: { color: '#0D47A1' },

    scrollContent: { padding: 20 },
    stepWrapper: {},
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 20 },
    iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '700' },

    formCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 12 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 48 },
    field: { flex: 1, fontSize: 14, color: '#1E293B' },
    inputRow: { flexDirection: 'row' },

    radioGroup: { flexDirection: 'row', gap: 10 },
    radioBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
    radioBtnActive: { borderColor: '#0D47A1', backgroundColor: '#E3F2FD' },
    radioText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    radioTextActive: { color: '#0D47A1', fontWeight: '700' },

    declarationBox: { flexDirection: 'row', marginTop: 20, gap: 12, alignItems: 'flex-start', padding: 4 },
    checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#0D47A1', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    checkBoxActive: { backgroundColor: '#0D47A1' },
    declarationText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 10,
    },
    cardHeaderIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardHeaderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    cardHeaderSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },

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
        borderColor: '#F1F5F9',
    },
    docUploadCardActive: {
        borderColor: '#2E7D32',
        backgroundColor: '#F0FDF4',
    },
    docIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 12,
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

    reviewCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
    reviewContent: { marginTop: 4 },
    reviewTitle: { fontSize: 14, fontWeight: '800', color: '#0D47A1', textTransform: 'uppercase' },
    editBtn: { fontSize: 12, fontWeight: '700', color: '#1565C0' },
    reviewItem: { flexDirection: 'row', marginBottom: 6 },
    reviewLabel: { width: 100, fontSize: 13, color: '#64748B' },
    reviewValue: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1E293B' },
    reviewDocList: { gap: 6 },
    reviewDocItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    reviewDocName: { fontSize: 12, color: '#1E293B' },

    noticeBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF3E0', padding: 12, borderRadius: 10, marginTop: 10 },
    noticeText: { fontSize: 11, color: '#E65100', flex: 1 },

    bottomBar: { paddingVertical: 20 },
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    mainBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },

    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#FFF' },
    successIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
    successSubtitle: { color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
    idCard: { backgroundColor: '#F8FAFC', padding: 24, borderRadius: 20, width: '100%', alignItems: 'center', marginVertical: 32, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    idValue: { fontSize: 28, fontWeight: '800', color: '#0D47A1', marginTop: 4 },
    toast: { position: 'absolute', bottom: 120, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, alignSelf: 'center' },
    toastText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
    timeEstimate: { fontSize: 12, color: '#94A3B8', marginTop: 20 },

    otpVerifyContainer: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12, marginBottom: 15 },
    otpRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    otpBtn: { backgroundColor: '#0D47A1', paddingHorizontal: 15, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
    otpBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    btnDisabled: { opacity: 0.5 },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8 },
    verifiedText: { color: '#2E7D32', fontSize: 13, fontWeight: '700' },
});
