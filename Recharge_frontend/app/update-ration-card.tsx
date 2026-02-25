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
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface UpdateType {
    id: string;
    label: string;
    selected: boolean;
    icon: any;
}

export default function UpdateRationCardScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const [rationCardNumber, setRationCardNumber] = useState("");
    const [headAadhaar, setHeadAadhaar] = useState("");
    const [applicationId, setApplicationId] = useState("");

    const [updateTypes, setUpdateTypes] = useState<UpdateType[]>([
        { id: "add", label: "Add Member", selected: false, icon: "account-plus" },
        { id: "remove", label: "Remove Member", selected: false, icon: "account-minus" },
        { id: "address", label: "Address Change", selected: false, icon: "map-marker" },
        { id: "head", label: "Change Head", selected: false, icon: "account-star" },
        { id: "name", label: "Name Correction", selected: false, icon: "pencil" },
        { id: "mobile", label: "Mobile Update", selected: false, icon: "phone" },
    ]);

    const [documents, setDocuments] = useState<any>({});

    // Handle back
    useEffect(() => {
        const backAction = () => {
            if (isSubmitted) {
                router.replace("/ration-card-services");
                return true;
            }
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.replace("/ration-card-services");
                return true;
            }
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [currentStep, isSubmitted]);

    const toggleUpdateType = (id: string) => {
        setUpdateTypes(updateTypes.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
    };

    const handleFileUpload = async (key: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"] });
            if (!result.canceled && result.assets[0]) {
                setDocuments({ ...documents, [key]: result.assets[0] });
            }
        } catch (e) { Alert.alert("Error", "Upload failed"); }
    };

    const handleVerifyToken = () => {
        if (!rationCardNumber || headAadhaar.length !== 12) {
            Alert.alert("Required", "Please enter Ration Card number and 12-digit Aadhaar");
            return;
        }
        setIsVerified(true);
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            if (!isVerified) { Alert.alert("Verification", "Please verify your details first"); return; }
            if (!updateTypes.some(t => t.selected)) { Alert.alert("Select", "Choose at least one update type"); return; }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!documents.existingCard) { Alert.alert("Required", "Please upload existing Ration Card copy"); return; }
            setCurrentStep(3);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const refId = "RAT" + Math.random().toString(36).substr(2, 9).toUpperCase();
            setApplicationId(refId);
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
    };

    if (isSubmitted) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.successContainer}>
                    <View style={styles.successIconCircle}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                    </View>
                    <Text style={styles.successTitle}>Update Requested!</Text>
                    <Text style={styles.successSubtitle}>Your Ration Card correction request has been submitted successfully.</Text>

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

                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/ration-card-services")}>
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
                    <TouchableOpacity style={styles.backButton} onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.replace("/ration-card-services")}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Update Ration Card</Text>
                        <Text style={styles.headerSubtitle}>Official Correction Service</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Progress Indicators */}
                <View style={styles.stepContainer}>
                    {[1, 2, 3].map((i) => (
                        <React.Fragment key={i}>
                            <View style={styles.stepItem}>
                                <View style={[styles.stepCircle, currentStep >= i && styles.stepCircleActive, currentStep > i && styles.stepCircleDone]}>
                                    {currentStep > i ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Text style={[styles.stepNum, currentStep >= i && styles.stepNumActive]}>{i}</Text>}
                                </View>
                                <Text style={[styles.stepLabelText, currentStep >= i && styles.stepLabelActive]}>
                                    {i === 1 ? "Verify" : i === 2 ? "Update" : "Confirm"}
                                </Text>
                            </View>
                            {i < 3 && <View style={[styles.stepLine, currentStep > i && styles.stepLineDone]} />}
                        </React.Fragment>
                    ))}
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {currentStep === 1 && (
                        <View>
                            {!isVerified ? (
                                <View>
                                    <View style={styles.sectionHeader}>
                                        <View style={styles.iconBadge}><Ionicons name="shield-checkmark" size={20} color="#0D47A1" /></View>
                                        <View>
                                            <Text style={styles.sectionTitle}>Identity Check</Text>
                                            <Text style={styles.sectionSub}>Verify card ownership</Text>
                                        </View>
                                    </View>
                                    <View style={styles.formCard}>
                                        <Text style={styles.inputLabel}>Ration Card Number *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput style={styles.input} placeholder="Enter existing number" value={rationCardNumber} onChangeText={setRationCardNumber} />
                                        </View>
                                        <Text style={styles.inputLabel}>Head Aadhaar Number *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput style={styles.input} placeholder="12 digit Aadhaar" keyboardType="number-pad" maxLength={12} value={headAadhaar} onChangeText={setHeadAadhaar} />
                                        </View>
                                        <TouchableOpacity style={[styles.verifyBtn, { marginTop: 20 }]} onPress={handleVerifyToken}>
                                            <Text style={styles.verifyText}>Verify & Proceed</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <View style={styles.verifiedBox}>
                                        <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                        <Text style={styles.verifiedText}>Verified: {rationCardNumber}</Text>
                                    </View>
                                    <Text style={styles.sectionTitle}>Select Update Types</Text>
                                    <View style={styles.typeGrid}>
                                        {updateTypes.map(type => (
                                            <TouchableOpacity key={type.id} style={[styles.typeItem, type.selected && styles.typeSelected]} onPress={() => toggleUpdateType(type.id)}>
                                                <View style={[styles.typeIconBox, type.selected && styles.typeIconActive]}>
                                                    <MaterialCommunityIcons name={type.icon} size={22} color={type.selected ? "#FFF" : "#64748B"} />
                                                </View>
                                                <Text style={[styles.typeLabel, type.selected && styles.typeLabelActive]}>{type.label}</Text>
                                                <Ionicons name={type.selected ? "checkbox" : "square-outline"} size={20} color={type.selected ? "#0D47A1" : "#CCC"} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View>
                            <View style={styles.sectionHeader}>
                                <View style={styles.iconBadge}><Ionicons name="cloud-upload" size={20} color="#0D47A1" /></View>
                                <View>
                                    <Text style={styles.sectionTitle}>Required Proofs</Text>
                                    <Text style={styles.sectionSub}>Documents for chosen updates</Text>
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.uploadLabel}>Existing Ration Card Copy *</Text>
                                <TouchableOpacity style={styles.uploadBtn} onPress={() => handleFileUpload("existingCard")}>
                                    <Text style={styles.uploadBtnText}>{documents.existingCard ? documents.existingCard.name : "Select File"}</Text>
                                </TouchableOpacity>

                                {updateTypes.find(t => t.id === 'address' && t.selected) && (
                                    <>
                                        <Text style={styles.uploadLabel}>New Address Proof *</Text>
                                        <TouchableOpacity style={styles.uploadBtn} onPress={() => handleFileUpload("addressProof")}>
                                            <Text style={styles.uploadBtnText}>{documents.addressProof ? documents.addressProof.name : "Select File"}</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View>
                            <View style={styles.sectionHeader}>
                                <View style={styles.iconBadge}><Ionicons name="list" size={20} color="#0D47A1" /></View>
                                <View>
                                    <Text style={styles.sectionTitle}>Review Updates</Text>
                                    <Text style={styles.sectionSub}>Confirm your changes</Text>
                                </View>
                            </View>

                            <View style={styles.reviewCard}>
                                <Text style={styles.reviewLabelMain}>Ration Card: {rationCardNumber}</Text>
                                <View style={styles.divider} />
                                <Text style={styles.modifyTitle}>MODIFICATIONS SELECTED:</Text>
                                {updateTypes.filter(t => t.selected).map(t => (
                                    <View key={t.id} style={styles.updateRow}>
                                        <Ionicons name="radio-button-on" size={14} color="#0D47A1" />
                                        <Text style={styles.updateLabelText}>{t.label}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.declarationBox}>
                                <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                                <Text style={styles.declText}>I confirm that all requested changes are accurate and verified by me.</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={[styles.continueButton, !isVerified && styles.btnDisabled]} disabled={!isVerified} onPress={handleContinue}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.buttonGradient}>
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>{currentStep === 3 ? "Process Request" : "Continue"}</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
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
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#FFF" },
    backButton: { padding: 4 },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2 },

    // Step Indicator
    stepContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 20, backgroundColor: '#FFF' },
    stepItem: { alignItems: 'center', zIndex: 1, backgroundColor: '#FFF', paddingHorizontal: 8 },
    stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
    stepCircleActive: { backgroundColor: '#E3F2FD', borderColor: '#0D47A1' },
    stepCircleDone: { backgroundColor: '#0D47A1', borderColor: '#0D47A1' },
    stepNum: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
    stepNumActive: { color: '#0D47A1' },
    stepLabelText: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginTop: 6 },
    stepLabelActive: { color: '#0D47A1' },
    stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: -15, marginTop: -15 },
    stepLineDone: { backgroundColor: '#0D47A1' },

    scroll: { padding: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    sectionSub: { fontSize: 12, color: '#64748B' },

    formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 16 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 48 },
    input: { flex: 1, fontSize: 15, color: '#1E293B' },

    verifyBtn: { backgroundColor: "#0D47A1", borderRadius: 12, padding: 15, alignItems: "center" },
    verifyText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
    verifiedBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F5E9', padding: 12, borderRadius: 12, marginBottom: 20 },
    verifiedText: { color: '#2E7D32', fontWeight: '800' },

    typeGrid: { gap: 12 },
    typeItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#F1F5F9", gap: 12, elevation: 2, shadowColor: '#64748B', shadowOpacity: 0.05, shadowRadius: 8 },
    typeSelected: { borderColor: "#0D47A1", backgroundColor: "#F0F7FF" },
    typeIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    typeIconActive: { backgroundColor: '#0D47A1' },
    typeLabel: { flex: 1, fontSize: 15, color: "#475569", fontWeight: '600' },
    typeLabelActive: { color: "#0D47A1", fontWeight: "800" },

    uploadLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8, color: "#475569", marginTop: 12 },
    uploadBtn: { backgroundColor: "#F8FAFC", borderRadius: 14, padding: 12, alignItems: "center", borderStyle: "dashed", borderWidth: 1.5, borderColor: "#0D47A1", marginBottom: 15 },
    uploadBtnText: { color: "#0D47A1", fontSize: 13, fontWeight: "800" },

    reviewCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#64748B', shadowRadius: 12 },
    reviewLabelMain: { fontSize: 16, fontWeight: "800", color: "#1E293B" },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
    modifyTitle: { fontSize: 12, fontWeight: '800', color: '#0D47A1', marginBottom: 12, letterSpacing: 1 },
    updateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    updateLabelText: { color: '#475569', fontSize: 14, fontWeight: '600' },
    declarationBox: { flexDirection: 'row', backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, marginTop: 20, gap: 12, borderWidth: 1, borderColor: '#DCFCE7' },
    declText: { flex: 1, fontSize: 12, color: '#166534', lineHeight: 18, fontWeight: '600' },

    bottomBar: { backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    continueButton: { borderRadius: 16, overflow: 'hidden' },
    buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
    buttonText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
    btnDisabled: { opacity: 0.5 },

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
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    btnGrad: { paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
    mainBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
