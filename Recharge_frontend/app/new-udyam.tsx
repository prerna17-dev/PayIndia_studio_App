import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    BackHandler,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

const ORG_TYPES = ["Proprietorship", "Partnership", "Pvt Ltd", "LLP"];
const ACTIVITIES = ["Manufacturing", "Services"];
const STATES = ["Maharashtra", "Karnataka", "Gujarat", "Tamil Nadu", "Delhi", "Other"];

const REQUIRED_DOCS = [
    { id: "aadhaar", name: "Aadhaar Card (Front & Back)", icon: "card-account-details-outline", color: "#2196F3" },
    { id: "pan", name: "PAN Card", icon: "card-bulleted-outline", color: "#4CAF50" },
    { id: "address", name: "Business Address Proof", icon: "home-city-outline", color: "#FF9800" },
    { id: "cheque", name: "Bank Cancelled Cheque", icon: "bank-outline", color: "#673AB7" },
    { id: "photo", name: "Photograph of Owner", icon: "account-box-outline", color: "#E53935" },
];

export default function NewUdyamRegistrationScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        aadhaar: "", name: "", mobile: "", orgType: "", pan: "", enterpriseName: "", dateOfCommencement: "",
        previousUA: "", flat: "", street: "", city: "", district: "", state: "Maharashtra", pincode: "",
        bankName: "", accountNumber: "", ifsc: "", activity: "", nicCode: "", employees: "", investment: "", turnover: "",
    });
    const [docs, setDocs] = useState<Record<string, any>>({});
    const [showOrgModal, setShowOrgModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showStateModal, setShowStateModal] = useState(false);
    const [agreedDeclaration, setAgreedDeclaration] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const backAction = () => {
            if (step > 1) {
                setStep(step - 1);
                return true;
            } else {
                router.replace("/udyam-services");
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction,
        );

        return () => backHandler.remove();
    }, [step]);

    const update = (k: string, v: string) => setForm({ ...form, [k]: v });

    const handleAadhaarChange = (t: string) => {
        const c = t.replace(/\D/g, "").substring(0, 12);
        const f = c.match(/.{1,4}/g)?.join(" ") || c;
        update("aadhaar", f);
    };

    const formatDate = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = "";
        if (cleaned.length <= 2) formatted = cleaned;
        else if (cleaned.length <= 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        else formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
        return formatted;
    };

    const handleSendOtp = () => {
        if (form.aadhaar.replace(/\s/g, "").length !== 12) return Alert.alert("Error", "Enter valid 12-digit Aadhaar");
        if (form.mobile.length !== 10) return Alert.alert("Error", "Enter valid 10-digit mobile");
        setIsOtpSent(true);
        Alert.alert("Success", "OTP sent to registered mobile");
    };

    const handleVerifyOtp = () => {
        if (otp.length !== 6) return Alert.alert("Error", "Enter 6-digit OTP");
        setIsVerified(true);
        Alert.alert("Success", "Aadhaar verified successfully");
    };

    const validateStep1 = () => {
        if (!isVerified) return Alert.alert("Required", "Please verify Aadhaar with OTP");
        if (!form.name.trim()) return Alert.alert("Required", "Enter entrepreneur name");
        if (form.mobile.length !== 10) return Alert.alert("Required", "Enter valid mobile number");
        if (!form.orgType) return Alert.alert("Required", "Select organization type");
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan)) return Alert.alert("Invalid", "Enter valid PAN (e.g., ABCDE1234F)");
        if (!form.enterpriseName.trim()) return Alert.alert("Required", "Enter enterprise name");
        if (!form.flat.trim() || !form.city.trim() || !form.district.trim()) return Alert.alert("Required", "Complete address");
        if (form.pincode.length !== 6) return Alert.alert("Required", "Enter valid 6-digit PIN code");
        if (!form.bankName.trim() || !form.accountNumber.trim()) return Alert.alert("Required", "Enter bank details");
        if (!form.activity) return Alert.alert("Required", "Select business activity");
        setStep(2);
    };

    const uploadDoc = async (id: string) => {
        try {
            const r = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"] });
            if (!r.canceled && r.assets?.[0]) {
                const f = r.assets[0];
                if (f.size && f.size > 2 * 1024 * 1024) return Alert.alert("Too Large", "Max 2MB");
                setDocs({ ...docs, [id]: f });
            }
        } catch (e) {
            Alert.alert("Error", "Upload failed");
        }
    };

    const validateStep2 = () => {
        const missing = REQUIRED_DOCS.filter(d => !docs[d.id]);
        if (missing.length) return Alert.alert("Required", `Upload: ${missing.map(d => d.name).join(", ")}`);
        setStep(3);
    };

    const handleSubmit = () => {
        if (!agreedDeclaration) return Alert.alert("Required", "Please agree to the declaration");
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            const refId = "UD2026" + Math.random().toString(36).substring(2, 9).toUpperCase();
            setApplicationId(refId);
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.replace("/udyam-services");
        }
    };

    if (isSubmitted) {
        return (
            <View style={s.root}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={s.successContainer}>
                    <View style={s.successIconCircle}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                    </View>
                    <Text style={s.successTitle}>Registration Submitted!</Text>
                    <Text style={s.successSubtitle}>Your Udyam Registration application has been received successfully.</Text>

                    <View style={s.idCard}>
                        <Text style={s.idLabel}>Reference ID</Text>
                        <Text style={s.idValue}>{applicationId}</Text>
                    </View>

                    <View style={s.successActions}>
                        <TouchableOpacity style={s.actionBtn}>
                            <View style={[s.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="download-outline" size={24} color="#0D47A1" />
                            </View>
                            <Text style={s.actionText}>Download{"\n"}Receipt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={s.actionBtn}>
                            <View style={[s.actionIcon, { backgroundColor: '#F1F8E9' }]}>
                                <Ionicons name="time-outline" size={24} color="#2E7D32" />
                            </View>
                            <Text style={s.actionText}>Track{"\n"}Status</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={s.mainBtn} onPress={() => router.replace("/udyam-services")}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                            <Text style={s.mainBtnText}>Return to Services</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={s.root}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />
            <SafeAreaView style={s.safe}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity style={s.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={s.headerCenter}>
                        <Text style={s.headerTitle}>New Udyam Registration</Text>
                        <Text style={s.headerSubtitle}>Identify your MSME enterprise</Text>
                    </View>
                    <View style={s.placeholder} />
                </View>

                {/* Step Indicator */}
                <View style={s.stepIndicatorContainer}>
                    <View style={s.progressLine}>
                        <View style={[s.progressLineActive, { width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }]} />
                    </View>

                    <View style={s.stepsRow}>
                        {[1, 2, 3].map((i) => (
                            <View key={i} style={s.stepItem}>
                                <View style={[
                                    s.stepCircle,
                                    step >= i && s.stepCircleActive,
                                    step > i && s.stepCircleCompleted
                                ]}>
                                    {step > i ? (
                                        <Ionicons name="checkmark" size={16} color="#FFF" />
                                    ) : (
                                        <Text style={[s.stepNumber, step >= i && s.stepNumberActive]}>{i}</Text>
                                    )}
                                </View>
                                <Text style={[s.stepLabel, step >= i && s.stepLabelActive]}>
                                    {i === 1 ? "Details" : i === 2 ? "Documents" : "Review"}
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
                        contentContainerStyle={s.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {step === 1 && (
                            <View style={s.stepWrapper}>
                                {/* A. Aadhaar Verification */}
                                <View style={s.cardHeader}>
                                    <View style={s.cardHeaderIcon}>
                                        <Ionicons name="card" size={20} color="#0D47A1" />
                                    </View>
                                    <View>
                                        <Text style={s.cardHeaderTitle}>Aadhaar Verification</Text>
                                        <Text style={s.cardHeaderSubtitle}>Primary identity check</Text>
                                    </View>
                                </View>

                                <View style={s.formCard}>
                                    <Text style={s.inputLabel}>Aadhaar Number *</Text>
                                    <View style={s.inputContainer}>
                                        <Ionicons name="finger-print-outline" size={18} color="#94A3B8" />
                                        <TextInput
                                            style={s.field}
                                            placeholder="XXXX XXXX XXXX"
                                            value={form.aadhaar}
                                            onChangeText={handleAadhaarChange}
                                            keyboardType="number-pad"
                                            maxLength={14}
                                        />
                                    </View>

                                    <Text style={s.inputLabel}>Entrepreneur Name (as per Aadhaar) *</Text>
                                    <View style={s.inputContainer}>
                                        <Ionicons name="person-outline" size={18} color="#94A3B8" />
                                        <TextInput style={s.field} placeholder="Full name" value={form.name} onChangeText={v => update('name', v)} />
                                    </View>

                                    <View style={s.otpRow}>
                                        <TouchableOpacity
                                            style={[s.otpBtn, { flex: 1, marginTop: 0 }, isVerified && { backgroundColor: '#E8F5E9' }]}
                                            onPress={handleSendOtp}
                                            disabled={isVerified}
                                        >
                                            <Text style={[s.otpBtnText, isVerified && { color: '#2E7D32' }]}>
                                                {isVerified ? "Aadhaar Verified" : isOtpSent ? "Resend OTP" : "Verify with Aadhaar OTP"}
                                            </Text>
                                            {isVerified && <Ionicons name="checkmark-circle" size={16} color="#2E7D32" style={{ marginLeft: 8 }} />}
                                        </TouchableOpacity>
                                    </View>

                                    {isOtpSent && !isVerified && (
                                        <View style={{ marginTop: 16 }}>
                                            <Text style={s.inputLabel}>Enter 6-digit OTP *</Text>
                                            <View style={s.inputRow}>
                                                <Ionicons name="key-outline" size={18} color="#94A3B8" />
                                                <TextInput
                                                    style={s.field}
                                                    placeholder="Enter OTP"
                                                    value={otp}
                                                    onChangeText={setOtp}
                                                    keyboardType="number-pad"
                                                    maxLength={6}
                                                />
                                                <TouchableOpacity onPress={handleVerifyOtp}>
                                                    <Text style={{ color: '#0D47A1', fontWeight: '700' }}>Verify</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    <Text style={s.inputLabel}>Mobile Number *</Text>
                                    <View style={s.inputContainer}>
                                        <Text style={s.dial}>+91</Text>
                                        <TextInput
                                            style={s.field}
                                            placeholder="10-digit mobile"
                                            value={form.mobile}
                                            onChangeText={v => update('mobile', v.replace(/\D/g, '').substring(0, 10))}
                                            keyboardType="phone-pad"
                                            maxLength={10}
                                        />
                                    </View>
                                </View>

                                {/* B. Enterprise Details */}
                                <View style={[s.cardHeader, { marginTop: 24 }]}>
                                    <View style={[s.cardHeaderIcon, { backgroundColor: '#E0F2F1' }]}>
                                        <Ionicons name="business" size={20} color="#00796B" />
                                    </View>
                                    <View>
                                        <Text style={s.cardHeaderTitle}>Enterprise Details</Text>
                                        <Text style={s.cardHeaderSubtitle}>Information about your business</Text>
                                    </View>
                                </View>

                                <View style={s.formCard}>
                                    <Text style={s.inputLabel}>Type of Organization *</Text>
                                    <TouchableOpacity style={s.inputContainer} onPress={() => setShowOrgModal(true)}>
                                        <Ionicons name="briefcase-outline" size={18} color="#94A3B8" />
                                        <Text style={[s.field, !form.orgType && { color: '#94A3B8' }]}>{form.orgType || 'Select organization type'}</Text>
                                        <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                                    </TouchableOpacity>

                                    <View style={s.inputRow}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={s.inputLabel}>PAN Number *</Text>
                                            <View style={s.inputContainer}>
                                                <TextInput style={s.field} placeholder="ABCDE1234F" value={form.pan} onChangeText={v => update('pan', v.toUpperCase())} autoCapitalize="characters" maxLength={10} />
                                            </View>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.inputLabel}>Commencement Date *</Text>
                                            <View style={s.inputContainer}>
                                                <TextInput style={s.field} placeholder="DD/MM/YYYY" value={form.dateOfCommencement} onChangeText={v => update('dateOfCommencement', formatDate(v))} keyboardType="number-pad" maxLength={10} />
                                            </View>
                                        </View>
                                    </View>

                                    <Text style={s.inputLabel}>Enterprise Name *</Text>
                                    <View style={s.inputContainer}>
                                        <TextInput style={s.field} placeholder="Name of your business" value={form.enterpriseName} onChangeText={v => update('enterpriseName', v)} />
                                    </View>

                                    <Text style={s.inputLabel}>Previous Udyog Aadhaar (if any)</Text>
                                    <View style={s.inputContainer}>
                                        <TextInput style={s.field} placeholder="UA Number" value={form.previousUA} onChangeText={v => update('previousUA', v)} />
                                    </View>
                                </View>

                                {/* C. Address Detail */}
                                <View style={[s.cardHeader, { marginTop: 24 }]}>
                                    <View style={[s.cardHeaderIcon, { backgroundColor: '#FFF3E0' }]}>
                                        <Ionicons name="location" size={20} color="#E65100" />
                                    </View>
                                    <View>
                                        <Text style={s.cardHeaderTitle}>Business Address</Text>
                                        <Text style={s.cardHeaderSubtitle}>Where is the unit located?</Text>
                                    </View>
                                </View>

                                <View style={s.formCard}>
                                    <Text style={s.inputLabel}>Flat / Building / Name *</Text>
                                    <View style={s.inputContainer}>
                                        <TextInput style={s.field} placeholder="Flat, Building No." value={form.flat} onChangeText={v => update('flat', v)} />
                                    </View>

                                    <Text style={s.inputLabel}>Street / Area</Text>
                                    <View style={s.inputContainer}>
                                        <TextInput style={s.field} placeholder="Street, Locality" value={form.street} onChangeText={v => update('street', v)} />
                                    </View>

                                    <View style={s.inputRow}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={s.inputLabel}>City *</Text>
                                            <View style={s.inputContainer}>
                                                <TextInput style={s.field} placeholder="City" value={form.city} onChangeText={v => update('city', v)} />
                                            </View>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.inputLabel}>District *</Text>
                                            <View style={s.inputContainer}>
                                                <TextInput style={s.field} placeholder="District" value={form.district} onChangeText={v => update('district', v)} />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={s.inputRow}>
                                        <View style={{ flex: 1.5, marginRight: 10 }}>
                                            <Text style={s.inputLabel}>State *</Text>
                                            <TouchableOpacity style={s.inputContainer} onPress={() => setShowStateModal(true)}>
                                                <Text style={s.field}>{form.state}</Text>
                                                <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.inputLabel}>Pincode *</Text>
                                            <View style={s.inputContainer}>
                                                <TextInput style={s.field} placeholder="6-digit" value={form.pincode} onChangeText={v => update('pincode', v.replace(/\D/g, '').substring(0, 6))} keyboardType="number-pad" maxLength={6} />
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* D. Bank Details */}
                                <View style={[s.cardHeader, { marginTop: 24 }]}>
                                    <View style={[s.cardHeaderIcon, { backgroundColor: '#F3E5F5' }]}>
                                        <Ionicons name="wallet" size={20} color="#7B1FA2" />
                                    </View>
                                    <View>
                                        <Text style={s.cardHeaderTitle}>Bank Details</Text>
                                        <Text style={s.cardHeaderSubtitle}>For financial verification</Text>
                                    </View>
                                </View>

                                <View style={s.formCard}>
                                    <Text style={s.inputLabel}>Bank Name *</Text>
                                    <View style={s.inputContainer}>
                                        <TextInput style={s.field} placeholder="Ex: State Bank of India" value={form.bankName} onChangeText={v => update('bankName', v)} />
                                    </View>
                                    <Text style={s.inputLabel}>Account Number *</Text>
                                    <View style={s.inputContainer}>
                                        <TextInput style={s.field} placeholder="Enter account number" value={form.accountNumber} onChangeText={v => update('accountNumber', v)} keyboardType="number-pad" />
                                    </View>
                                    <Text style={s.inputLabel}>IFSC Code *</Text>
                                    <View style={s.inputContainer}>
                                        <TextInput style={s.field} placeholder="SBIN0012345" value={form.ifsc} onChangeText={v => update('ifsc', v.toUpperCase())} autoCapitalize="characters" maxLength={11} />
                                    </View>
                                </View>

                                {/* E. Business activity */}
                                <View style={[s.cardHeader, { marginTop: 24 }]}>
                                    <View style={[s.cardHeaderIcon, { backgroundColor: '#E8EAF6' }]}>
                                        <Ionicons name="construct" size={20} color="#3F51B5" />
                                    </View>
                                    <View>
                                        <Text style={s.cardHeaderTitle}>Business Activity</Text>
                                        <Text style={s.cardHeaderSubtitle}>Nature of your enterprise</Text>
                                    </View>
                                </View>

                                <View style={s.formCard}>
                                    <Text style={s.inputLabel}>Major Activity *</Text>
                                    <TouchableOpacity style={s.inputContainer} onPress={() => setShowActivityModal(true)}>
                                        <Text style={[s.field, !form.activity && { color: '#94A3B8' }]}>{form.activity || 'Select Activity'}</Text>
                                        <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                                    </TouchableOpacity>

                                    <View style={s.inputRow}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={s.inputLabel}>Employees</Text>
                                            <View style={s.inputContainer}>
                                                <TextInput style={s.field} placeholder="Total count" value={form.employees} onChangeText={v => update('employees', v)} keyboardType="number-pad" />
                                            </View>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.inputLabel}>Annual Turnover</Text>
                                            <View style={s.inputContainer}>
                                                <Text style={s.dial}>₹</Text>
                                                <TextInput style={s.field} placeholder="Amount" value={form.turnover} onChangeText={v => update('turnover', v.replace(/\D/g, ''))} keyboardType="number-pad" />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {step === 2 && (
                            <View style={s.stepWrapper}>
                                <View style={s.cardHeader}>
                                    <View style={[s.cardHeaderIcon, { backgroundColor: '#E3F2FD' }]}>
                                        <Ionicons name="document-text" size={20} color="#1565C0" />
                                    </View>
                                    <View>
                                        <Text style={s.cardHeaderTitle}>Upload Documents</Text>
                                        <Text style={s.cardHeaderSubtitle}>Clear photos or PDF (Max 2MB)</Text>
                                    </View>
                                </View>

                                <View style={s.docList}>
                                    {REQUIRED_DOCS.map(d => (
                                        <TouchableOpacity
                                            key={d.id}
                                            style={[s.docUploadCard, docs[d.id] && s.docUploadCardActive]}
                                            onPress={() => uploadDoc(d.id)}
                                        >
                                            <View style={[s.docIconCircle, { backgroundColor: d.color + '15' }]}>
                                                <MaterialCommunityIcons name={d.icon as any} size={24} color={docs[d.id] ? "#FFF" : d.color} style={docs[d.id] && { backgroundColor: d.color, borderRadius: 12, padding: 4 }} />
                                            </View>
                                            <View style={s.docTextContent}>
                                                <Text style={s.docTitle}>{d.name}</Text>
                                                <Text style={s.docHint}>{docs[d.id] ? docs[d.id].name : "Required"}</Text>
                                            </View>
                                            <Ionicons
                                                name={docs[d.id] ? "checkmark-circle" : "cloud-upload"}
                                                size={24}
                                                color={docs[d.id] ? "#2E7D32" : "#94A3B8"}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {step === 3 && (
                            <View style={s.stepWrapper}>
                                <View style={s.cardHeader}>
                                    <View style={[s.cardHeaderIcon, { backgroundColor: '#F3E5F5' }]}>
                                        <Ionicons name="eye" size={20} color="#7B1FA2" />
                                    </View>
                                    <View>
                                        <Text style={s.cardHeaderTitle}>Review Details</Text>
                                        <Text style={s.cardHeaderSubtitle}>Verify MSME registration info</Text>
                                    </View>
                                </View>

                                <View style={s.reviewCard}>
                                    <View style={s.reviewSection}>
                                        <Text style={s.reviewSectionTitle}>Proprietor Details</Text>
                                        <View style={s.reviewItem}>
                                            <Text style={s.reviewLabel}>Name</Text>
                                            <Text style={s.reviewValue}>{form.name}</Text>
                                        </View>
                                        <View style={s.reviewItem}>
                                            <Text style={s.reviewLabel}>Aadhaar</Text>
                                            <Text style={s.reviewValue}>{form.aadhaar}</Text>
                                        </View>
                                        <View style={s.reviewItem}>
                                            <Text style={s.reviewLabel}>Mobile</Text>
                                            <Text style={s.reviewValue}>+91 {form.mobile}</Text>
                                        </View>
                                    </View>

                                    <View style={s.divider} />

                                    <View style={s.reviewSection}>
                                        <Text style={s.reviewSectionTitle}>Enterprise Details</Text>
                                        <View style={s.reviewItem}>
                                            <Text style={s.reviewLabel}>Org Type</Text>
                                            <Text style={s.reviewValue}>{form.orgType}</Text>
                                        </View>
                                        <View style={s.reviewItem}>
                                            <Text style={s.reviewLabel}>Enterprise</Text>
                                            <Text style={s.reviewValue}>{form.enterpriseName}</Text>
                                        </View>
                                        <View style={s.reviewItem}>
                                            <Text style={s.reviewLabel}>PAN</Text>
                                            <Text style={s.reviewValue}>{form.pan}</Text>
                                        </View>
                                    </View>

                                    <View style={s.divider} />

                                    <View style={s.reviewSection}>
                                        <Text style={s.reviewSectionTitle}>Documents Status</Text>
                                        {REQUIRED_DOCS.map(d => (
                                            <View key={d.id} style={s.reviewDocRow}>
                                                <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                                <Text style={s.reviewDocText}>{d.name}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={s.declarationBox}
                                    onPress={() => setAgreedDeclaration(!agreedDeclaration)}
                                >
                                    <View style={[s.checkBox, agreedDeclaration && s.checkBoxActive]}>
                                        {agreedDeclaration && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                    </View>
                                    <Text style={s.declarationText}>
                                        I declare that the information provided is correct and I accept all terms and conditions of MSME registration.
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Bottom Bar */}
                <View style={s.bottomBar}>
                    <TouchableOpacity
                        style={s.continueButton}
                        onPress={step === 1 ? validateStep1 : step === 2 ? validateStep2 : handleSubmit}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#0D47A1', '#1565C0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.buttonGradient}
                        >
                            <Text style={s.buttonText}>
                                {step === 3 ? "Submit Application" : "Continue"}
                            </Text>
                            <Ionicons
                                name={step === 3 ? "checkmark-done" : "arrow-forward"}
                                size={20}
                                color="#FFF"
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Modals */}
            <Modal visible={showOrgModal} transparent animationType="slide">
                <View style={s.modalBack}>
                    <View style={s.modal}>
                        <View style={s.modalHandle} />
                        <Text style={s.modalTitle}>Organization Type</Text>
                        <ScrollView>
                            {ORG_TYPES.map(o => (
                                <TouchableOpacity key={o} style={s.option} onPress={() => { update('orgType', o); setShowOrgModal(false); }}>
                                    <Text style={s.optionText}>{o}</Text>
                                    {form.orgType === o && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={showActivityModal} transparent animationType="slide">
                <View style={s.modalBack}>
                    <View style={s.modal}>
                        <View style={s.modalHandle} />
                        <Text style={s.modalTitle}>Business Activity</Text>
                        {ACTIVITIES.map(a => (
                            <TouchableOpacity key={a} style={s.option} onPress={() => { update('activity', a); setShowActivityModal(false); }}>
                                <Text style={s.optionText}>{a}</Text>
                                {form.activity === a && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            <Modal visible={showStateModal} transparent animationType="slide">
                <View style={s.modalBack}>
                    <View style={s.modal}>
                        <View style={s.modalHandle} />
                        <Text style={s.modalTitle}>Select State</Text>
                        <ScrollView>
                            {STATES.map(st => (
                                <TouchableOpacity key={st} style={s.option} onPress={() => { update('state', st); setShowStateModal(false); }}>
                                    <Text style={s.optionText}>{st}</Text>
                                    {form.state === st && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    safe: {
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
    field: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
    },
    dial: {
        fontSize: 15,
        fontWeight: '700',
        color: '#475569',
        marginLeft: 8,
    },
    inputRow: {
        flexDirection: 'row',
        marginTop: 0,
    },
    otpRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    otpBtn: {
        alignSelf: 'flex-start',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#BBDEFB',
    },
    otpBtnText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0D47A1',
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
        alignItems: 'center',
    },
    checkBox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#0D47A1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkBoxActive: {
        backgroundColor: '#0D47A1',
    },
    declarationText: {
        flex: 1,
        fontSize: 12,
        color: '#0D47A1',
        lineHeight: 18,
        fontWeight: '600',
        marginLeft: 8,
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

    // Modal
    modalBack: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modal: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHandle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E2E8F0',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1E293B",
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    optionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#475569",
    },
});