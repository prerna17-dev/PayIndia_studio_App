import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
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

interface UploadedFile {
    name: string;
    size: string;
    uri: string;
}

export default function PANCorrectionScreen() {
    const router = useRouter();

    // Section 1 States
    const [panNumber, setPanNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Section 2 States
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    // Dynamic Form States
    const [newName, setNewName] = useState("");
    const [newDob, setNewDob] = useState("");
    const [newFatherName, setNewFatherName] = useState("");
    const [newContact, setNewContact] = useState("");

    // Document States
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedFile>>({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle Back
    useEffect(() => {
        const backAction = () => {
            router.back();
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, []);

    const handleSendOtp = () => {
        if (panNumber.length !== 10 || mobileNumber.length !== 10) {
            Alert.alert("Error", "Please enter valid PAN and Mobile number");
            return;
        }
        setIsOtpSent(true);
        Alert.alert("OTP Sent", "Verification code has been sent to your mobile");
    };

    const handleVerifyOtp = () => {
        if (otp.length !== 6) {
            Alert.alert("Error", "Please enter 6 digit OTP");
            return;
        }
        setIsVerifying(true);
        setTimeout(() => {
            setIsOtpVerified(true);
            setIsVerifying(false);
        }, 1500);
    };

    const toggleType = (id: string) => {
        if (selectedTypes.includes(id)) {
            setSelectedTypes(selectedTypes.filter(t => t !== id));
        } else {
            setSelectedTypes([...selectedTypes, id]);
        }
    };

    const handleFileUpload = async (type: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                const sizeInMb = asset.size ? (asset.size / (1024 * 1024)).toFixed(1) : "0.5";
                setUploadedDocs(prev => ({
                    ...prev,
                    [type]: {
                        name: asset.name,
                        size: `${sizeInMb} MB`,
                        uri: asset.uri
                    }
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const isFormValid = () => {
        if (!isOtpVerified || selectedTypes.length === 0) return false;
        if (selectedTypes.includes('name') && !newName) return false;
        if (selectedTypes.includes('dob') && !newDob) return false;
        if (selectedTypes.includes('father') && !newFatherName) return false;
        if (Object.keys(uploadedDocs).length === 0) return false;
        return true;
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert("Success", "Request submitted successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        }, 2000);
    };

    const renderUploadBox = (type: string) => {
        const doc = uploadedDocs[type];
        if (doc) {
            return (
                <View style={styles.uploadedBox}>
                    <View style={styles.uploadedInfo}>
                        <MaterialCommunityIcons name="file-document" size={28} color="#0A4DA3" />
                        <View style={styles.uploadedTextContainer}>
                            <Text style={styles.uploadedName} numberOfLines={1}>{doc.name}</Text>
                            <Text style={styles.uploadedSize}>{doc.size}</Text>
                            <View style={styles.row}>
                                <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                <Text style={styles.uploadedStatusText}>Uploaded Successfully</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => setUploadedDocs(prev => {
                        const next = { ...prev };
                        delete next[type];
                        return next;
                    })}>
                        <Text style={styles.removeText}>Remove & Re-upload</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <TouchableOpacity style={styles.uploadBox} onPress={() => handleFileUpload(type)}>
                <Ionicons name="cloud-upload-outline" size={32} color="#0A4DA3" />
                <Text style={styles.uploadText}>Upload Proof Document*</Text>
                <Text style={styles.uploadNote}>PDF, JPG or PNG (2MB - 5MB)</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>PAN Correction</Text>
                        <Text style={styles.headerSubtitle}>Update your PAN details securely</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                        {/* SECTION 1: Verification */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Verification Details</Text>
                            <View style={styles.card}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>PAN Number*</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter 10-digit PAN"
                                        value={panNumber}
                                        onChangeText={(t) => setPanNumber(t.toUpperCase())}
                                        autoCapitalize="characters"
                                        maxLength={10}
                                        editable={!isOtpVerified}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Registered Mobile Number*</Text>
                                    <View style={styles.row}>
                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            placeholder="10-digit mobile number"
                                            value={mobileNumber}
                                            onChangeText={setMobileNumber}
                                            keyboardType="phone-pad"
                                            maxLength={10}
                                            editable={!isOtpSent}
                                        />
                                        <TouchableOpacity
                                            style={[styles.smallButton, (mobileNumber.length !== 10 || panNumber.length !== 10) && styles.disabledButton]}
                                            onPress={handleSendOtp}
                                            disabled={mobileNumber.length !== 10 || isOtpVerified}
                                        >
                                            <Text style={styles.smallButtonText}>{isOtpSent ? "Resend" : "Send OTP"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {isOtpSent && (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>OTP Verification Field*</Text>
                                        <View style={styles.row}>
                                            <TextInput
                                                style={[styles.input, { flex: 1 }]}
                                                placeholder="6 digit OTP"
                                                keyboardType="numeric"
                                                maxLength={6}
                                                value={otp}
                                                onChangeText={setOtp}
                                                editable={!isOtpVerified}
                                            />
                                            {!isOtpVerified ? (
                                                <TouchableOpacity
                                                    style={[styles.smallButton, otp.length !== 6 && styles.disabledButton]}
                                                    onPress={handleVerifyOtp}
                                                    disabled={otp.length !== 6 || isVerifying}
                                                >
                                                    {isVerifying ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.smallButtonText}>Verify</Text>}
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={styles.successBadge}>
                                                    <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                                                    <Text style={styles.successBadgeText}>Verified</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* SECTION 2: Correction Type Selection */}
                        {isOtpVerified && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Select Update Type</Text>
                                <View style={styles.typeGrid}>
                                    {[
                                        { id: 'name', label: 'Full Name', icon: 'account' },
                                        { id: 'dob', label: 'Date of Birth', icon: 'calendar' },
                                        { id: 'father', label: "Father's Name", icon: 'account-plus' },
                                        { id: 'contact', label: 'Email/Mobile', icon: 'cellphone-link' },
                                        { id: 'address', label: 'Address Update', icon: 'home' },
                                        { id: 'photo', label: 'Photo Update', icon: 'camera' },
                                    ].map((type) => (
                                        <TouchableOpacity
                                            key={type.id}
                                            style={[
                                                styles.typeCard,
                                                selectedTypes.includes(type.id) && styles.typeCardSelected
                                            ]}
                                            onPress={() => toggleType(type.id)}
                                        >
                                            <MaterialCommunityIcons
                                                name={type.icon as any}
                                                size={28}
                                                color={selectedTypes.includes(type.id) ? "#0A4DA3" : "#666"}
                                            />
                                            <Text style={[
                                                styles.typeLabel,
                                                selectedTypes.includes(type.id) && styles.typeLabelSelected
                                            ]}>{type.label}</Text>
                                            {selectedTypes.includes(type.id) && (
                                                <View style={styles.checkBadge}>
                                                    <Ionicons name="checkmark" size={10} color="#FFF" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* SECTION 3: Dynamic Forms */}
                        {selectedTypes.length > 0 && isOtpVerified && (
                            <View style={styles.section}>
                                <Text style={styles.dynamicFormTitle}>Update Details</Text>
                                <View style={styles.card}>
                                    {selectedTypes.includes('name') && (
                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={styles.formSubtitle}>🔹Name Update</Text>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>New Full Name*</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter correct full name"
                                                    value={newName}
                                                    onChangeText={setNewName}
                                                />
                                            </View>
                                            <View style={styles.noteBox}>
                                                <Text style={styles.noteText}>📌 Mandatory: Valid proof showing correct updated name</Text>
                                            </View>
                                        </View>
                                    )}

                                    {selectedTypes.includes('dob') && (
                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={styles.formSubtitle}>🔹Date of Birth Update</Text>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>Correct Date of Birth*</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="DD/MM/YYYY"
                                                    value={newDob}
                                                    onChangeText={setNewDob}
                                                    keyboardType="numeric"
                                                    maxLength={10}
                                                />
                                            </View>
                                            <View style={styles.noteBox}>
                                                <Text style={styles.noteText}>📌 Format: DD/MM/YYYY</Text>
                                            </View>
                                        </View>
                                    )}

                                    {selectedTypes.includes('father') && (
                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={styles.formSubtitle}>🔹Father's Name Update</Text>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>New Father's Name*</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter correct father's name"
                                                    value={newFatherName}
                                                    onChangeText={setNewFatherName}
                                                />
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Supporting Proof Documents*</Text>
                                        {renderUploadBox("mainProof")}
                                    </View>
                                </View>
                            </View>
                        )}

                        <View style={styles.disclaimerBox}>
                            <Text style={styles.disclaimerText}>
                                "Final verification may require official document validation."
                            </Text>
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>
                </KeyboardAvoidingView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.continueButton, !isFormValid() && styles.continueButtonDisabled]}
                        disabled={!isFormValid() || isSubmitting}
                        onPress={handleSubmit}
                    >
                        {isSubmitting ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.continueButtonText}>Submit Correction</Text>}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F7FA" },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
        paddingTop: 50,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1A1A1A", textAlign: 'center' },
    headerSubtitle: { fontSize: 13, color: "#666", textAlign: 'center' },
    placeholder: { width: 40 },
    scrollContainer: { padding: 20 },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2E7D32", marginBottom: 15 },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 8 },
    input: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: "#1A1A1A",
    },
    row: { flexDirection: "row", alignItems: "center", gap: 10 },
    smallButton: {
        backgroundColor: "#0A4DA3",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        minWidth: 80,
        alignItems: "center",
    },
    smallButtonText: { color: "#FFF", fontSize: 13, fontWeight: "bold" },
    disabledButton: { backgroundColor: "#CBD5E1" },
    successBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 5,
    },
    successBadgeText: { color: "#2E7D32", fontSize: 13, fontWeight: "600" },
    typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    typeCard: {
        width: "31%",
        aspectRatio: 1,
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "transparent",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        position: 'relative',
    },
    typeCardSelected: { borderColor: "#0A4DA3", backgroundColor: "#F0F7FF" },
    typeLabel: { fontSize: 11, color: "#666", marginTop: 8, textAlign: "center" },
    typeLabelSelected: { color: "#0A4DA3", fontWeight: "bold" },
    checkBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#0A4DA3',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dynamicFormTitle: { fontSize: 18, fontWeight: "bold", color: "#0A4DA3", marginBottom: 15 },
    formSubtitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 15 },
    uploadBox: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#CBD5E1",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    uploadText: { fontSize: 14, fontWeight: "600", color: "#0A4DA3", marginTop: 5 },
    uploadNote: { fontSize: 11, color: "#999", marginTop: 2 },
    uploadedBox: {
        backgroundColor: "#F0F7FF",
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: "#BBDEFB",
    },
    uploadedInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
    uploadedTextContainer: { flex: 1 },
    uploadedName: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
    uploadedStatusText: { fontSize: 13, color: "#2E7D32", fontWeight: "600", marginTop: 2 },
    uploadedSize: { fontSize: 11, color: "#666", marginTop: 2 },
    removeText: { fontSize: 12, color: "#D32F2F", fontWeight: "600", marginTop: 10, textAlign: "right" },
    disclaimerBox: {
        backgroundColor: "#F8FAFC",
        padding: 15,
        marginHorizontal: 0,
        marginTop: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    disclaimerText: { fontSize: 12, color: "#666", textAlign: "center", fontStyle: "italic" },
    noteBox: {
        backgroundColor: "#FFF7ED",
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#F57C00",
        marginTop: 10
    },
    noteText: { fontSize: 12, color: "#C2410C", fontWeight: "500", marginBottom: 2 },
    footer: {
        padding: 20,
        backgroundColor: "#FFF",
        borderTopWidth: 1,
        borderTopColor: "#EEE",
    },
    continueButton: {
        backgroundColor: "#0A4DA3",
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    continueButtonDisabled: { backgroundColor: "#CBD5E1", opacity: 0.7 },
    continueButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
