import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
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

type UpdateType = "name" | "dob" | "gender" | "address" | "mobile";

interface UploadedFile {
    name: string;
    size: string;
    uri: string;
}

export default function AadhaarUpdateRedesign() {
    const router = useRouter();

    // Section 1 States
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Section 2 States
    const [selectedType, setSelectedType] = useState<UpdateType | null>(null);

    // Dynamic Form States
    const [newName, setNewName] = useState("");
    const [newDob, setNewDob] = useState("");
    const [newGender, setNewGender] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [newState, setNewState] = useState("");
    const [newDistrict, setNewDistrict] = useState("");
    const [newPincode, setNewPincode] = useState("");
    const [newMobile, setNewMobile] = useState("");
    const [updateMobileOtp, setUpdateMobileOtp] = useState("");
    const [isUpdateMobileOtpSent, setIsUpdateMobileOtpSent] = useState(false);
    const [isUpdateMobileVerified, setIsUpdateMobileVerified] = useState(false);

    // Document States
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedFile>>({});

    // Handle Back
    useEffect(() => {
        const backAction = () => {
            router.back();
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, []);

    // Aadhaar Formatting: XXXX XXXX XXXX
    const formatAadhaar = (text: string) => {
        const cleaned = text.replace(/\s/g, "");
        let formatted = "";
        for (let i = 0; i < cleaned.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += " ";
            formatted += cleaned[i];
        }
        setAadhaarNumber(formatted);
    };

    // DOB Formatting: DD/MM/YYYY
    const formatDob = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = "";
        if (cleaned.length <= 2) {
            formatted = cleaned;
        } else if (cleaned.length <= 4) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        } else {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
        }
        setNewDob(formatted);
    };

    const handleSendOtp = () => {
        if (mobileNumber.length !== 10) {
            Alert.alert("Invalid Mobile", "Please enter 10 digit mobile number");
            return;
        }
        setIsOtpSent(true);
        Alert.alert("OTP Sent", "Verification code has been sent to your mobile");
    };

    const handleVerifyOtp = () => {
        if (otp.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter 6 digit OTP");
            return;
        }
        setIsVerifying(true);
        setTimeout(() => {
            setIsOtpVerified(true);
            setIsVerifying(false);
        }, 1500);
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
        if (!isOtpVerified || !selectedType) return false;

        switch (selectedType) {
            case "name":
                return newName.trim().length > 0 && !!uploadedDocs.name;
            case "dob":
                return newDob.length === 10 && !!uploadedDocs.dob;
            case "gender":
                return newGender.length > 0;
            case "address":
                return newAddress.trim().length > 0 && newState && newDistrict && newPincode.length === 6 && !!uploadedDocs.address;
            case "mobile":
                return newMobile.length === 10 && isUpdateMobileVerified;
            default:
                return false;
        }
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
                        <Text style={styles.headerTitle}>Aadhaar Update</Text>
                        <Text style={styles.headerSubtitle}>Update your Aadhaar details securely</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                    {/* SECTION 1: Basic Verification */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Verification Details</Text>
                        <View style={styles.card}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Aadhaar Number*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="XXXX XXXX XXXX"
                                    keyboardType="numeric"
                                    maxLength={14}
                                    value={aadhaarNumber}
                                    onChangeText={formatAadhaar}
                                />
                                {aadhaarNumber.replace(/\s/g, "").length > 0 && aadhaarNumber.replace(/\s/g, "").length !== 12 && (
                                    <Text style={styles.errorText}>Aadhaar must be exactly 12 digits</Text>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Registered Mobile Number*</Text>
                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Enter 10 digit mobile"
                                        keyboardType="numeric"
                                        maxLength={10}
                                        value={mobileNumber}
                                        onChangeText={setMobileNumber}
                                    />
                                    <TouchableOpacity
                                        style={[styles.smallButton, mobileNumber.length !== 10 && styles.disabledButton]}
                                        onPress={handleSendOtp}
                                        disabled={mobileNumber.length !== 10}
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

                    {/* SECTION 2: Select Update Type */}
                    {isOtpVerified && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Update Type</Text>
                            <View style={styles.typeGrid}>
                                {[
                                    { id: "name", label: "Name Update", icon: "account" },
                                    { id: "dob", label: "DOB Update", icon: "calendar" },
                                    { id: "gender", label: "Gender Update", icon: "gender-male-female" },
                                    { id: "address", label: "Address Update", icon: "home" },
                                    { id: "mobile", label: "Mobile Update", icon: "cellphone" },
                                ].map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.typeCard,
                                            selectedType === type.id && styles.typeCardSelected
                                        ]}
                                        onPress={() => setSelectedType(type.id as UpdateType)}
                                    >
                                        <MaterialCommunityIcons
                                            name={type.icon as any}
                                            size={28}
                                            color={selectedType === type.id ? "#0A4DA3" : "#666"}
                                        />
                                        <Text style={[
                                            styles.typeLabel,
                                            selectedType === type.id && styles.typeLabelSelected
                                        ]}>{type.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* SECTION 3: Dynamic Form */}
                    {selectedType && isOtpVerified && (
                        <View style={styles.section}>
                            <Text style={styles.dynamicFormTitle}>Update Details</Text>
                            <View style={styles.card}>
                                {selectedType === "name" && (
                                    <View>
                                        <Text style={styles.formSubtitle}>🔹Name Update</Text>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>New Full Name*</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter full name"
                                                value={newName}
                                                onChangeText={setNewName}
                                            />
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Documents Required (Any ONE)*</Text>
                                            <Text style={[styles.uploadNote, { marginBottom: 10 }]}>
                                                Marriage Certificate / Gazette Notification / Passport / PAN Card / Driving License / Government Photo ID / Pension Card / Ration Card (with photo)
                                            </Text>
                                            {renderUploadBox("name")}
                                        </View>
                                        <View style={styles.noteBox}>
                                            <Text style={styles.noteText}>📌 Mandatory: Valid proof showing correct updated name</Text>
                                            <Text style={styles.noteText}>📌 Limit: 2 times in lifetime</Text>
                                        </View>
                                    </View>
                                )}

                                {selectedType === "dob" && (
                                    <View>
                                        <Text style={styles.formSubtitle}>🔹Date of Birth Update</Text>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Correct Date of Birth*</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="DD/MM/YYYY"
                                                keyboardType="numeric"
                                                maxLength={10}
                                                value={newDob}
                                                onChangeText={formatDob}
                                            />
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Valid DOB Proof*</Text>
                                            <Text style={[styles.uploadNote, { marginBottom: 10 }]}>Birth Certificate</Text>
                                            {renderUploadBox("dob")}
                                        </View>
                                        <View style={styles.noteBox}>
                                            <Text style={styles.noteText}>📌 Limit: 1 time in lifetime</Text>
                                            <Text style={styles.noteText}>📌 DOB must be in DD/MM/YYYY format</Text>
                                        </View>
                                    </View>
                                )}

                                {selectedType === "gender" && (
                                    <View>
                                        <Text style={styles.formSubtitle}>🔹Gender Update</Text>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Select Gender*</Text>
                                            <View style={styles.genderRow}>
                                                {["Male", "Female", "Other"].map(g => (
                                                    <TouchableOpacity
                                                        key={g}
                                                        style={[
                                                            styles.genderBtn,
                                                            newGender === g && styles.genderBtnSelected
                                                        ]}
                                                        onPress={() => setNewGender(g)}
                                                    >
                                                        <Text style={[
                                                            styles.genderBtnText,
                                                            newGender === g && styles.genderBtnTextSelected
                                                        ]}>{g}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                        <View style={styles.noteBox}>
                                            <Text style={styles.noteText}>❌ No document required normally</Text>
                                            <Text style={styles.noteText}>✔ Self declaration sufficient</Text>
                                            <Text style={styles.noteText}>📌 Limit: 1 time in lifetime</Text>
                                        </View>
                                    </View>
                                )}

                                {selectedType === "address" && (
                                    <View>
                                        <Text style={styles.formSubtitle}>🔹Address Update</Text>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>New Full Address*</Text>
                                            <TextInput
                                                style={[styles.input, styles.textArea]}
                                                placeholder="Enter detailed address"
                                                multiline
                                                numberOfLines={4}
                                                value={newAddress}
                                                onChangeText={setNewAddress}
                                            />
                                        </View>
                                        <View style={styles.row}>
                                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                                <Text style={styles.label}>State*</Text>
                                                <View style={styles.input}>
                                                    <Text style={{ color: newState ? '#1A1A1A' : '#999' }} onPress={() => setNewState("State Selected")}>
                                                        {newState || "Select State"}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                                <Text style={styles.label}>District*</Text>
                                                <View style={styles.input}>
                                                    <Text style={{ color: newDistrict ? '#1A1A1A' : '#999' }} onPress={() => setNewDistrict("District Selected")}>
                                                        {newDistrict || "Select District"}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Pincode*</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="6 digits"
                                                keyboardType="numeric"
                                                maxLength={6}
                                                value={newPincode}
                                                onChangeText={setNewPincode}
                                            />
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Any ONE address proof*</Text>
                                            <Text style={[styles.uploadNote, { marginBottom: 10 }]}>Electricity Bill (not older than 3 months) / Ration Card</Text>
                                            {renderUploadBox("address")}
                                        </View>
                                        <View style={styles.noteBox}>
                                            <Text style={styles.noteText}>📌 No fixed limit (subject to validation)</Text>
                                        </View>
                                    </View>
                                )}

                                {selectedType === "mobile" && (
                                    <View>
                                        <Text style={styles.formSubtitle}>🔹Mobile Number Update</Text>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>New Mobile Number*</Text>
                                            <View style={styles.row}>
                                                <TextInput
                                                    style={[styles.input, { flex: 1 }]}
                                                    placeholder="Enter 10 digits"
                                                    keyboardType="numeric"
                                                    maxLength={10}
                                                    value={newMobile}
                                                    onChangeText={setNewMobile}
                                                />
                                                <TouchableOpacity
                                                    style={[styles.smallButton, newMobile.length !== 10 && styles.disabledButton]}
                                                    onPress={() => setIsUpdateMobileOtpSent(true)}
                                                >
                                                    <Text style={styles.smallButtonText}>Send OTP</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {isUpdateMobileOtpSent && (
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.label}>OTP Verification Field*</Text>
                                                <View style={styles.row}>
                                                    <TextInput
                                                        style={[styles.input, { flex: 1 }]}
                                                        placeholder="6 digits"
                                                        keyboardType="numeric"
                                                        maxLength={6}
                                                        value={updateMobileOtp}
                                                        onChangeText={setUpdateMobileOtp}
                                                    />
                                                    <TouchableOpacity
                                                        style={[styles.smallButton, updateMobileOtp.length !== 6 && styles.disabledButton]}
                                                        onPress={() => setIsUpdateMobileVerified(true)}
                                                    >
                                                        <Text style={styles.smallButtonText}>Verify</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                {isUpdateMobileVerified && (
                                                    <Text style={styles.successText}>Mobile verified successfully!</Text>
                                                )}
                                            </View>
                                        )}
                                        <View style={styles.noteBox}>
                                            <Text style={styles.noteText}>❌ No document required</Text>
                                            <Text style={styles.noteText}>✔ OTP verification mandatory</Text>
                                            <Text style={styles.noteText}>✔ Biometric authentication may be required at center</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    <View style={styles.disclaimerBox}>
                        <Text style={styles.disclaimerText}>
                            "Final verification may require visit to Aadhaar Enrollment/Update Center."
                        </Text>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.continueButton, !isFormValid() && styles.continueButtonDisabled]}
                        disabled={!isFormValid()}
                        onPress={() => Alert.alert("Success", "Update request submitted!")}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
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
    textArea: { height: 100, textAlignVertical: "top" },
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
    errorText: { color: "#D32F2F", fontSize: 12, marginTop: 5 },
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
    },
    typeCardSelected: { borderColor: "#0A4DA3", backgroundColor: "#F0F7FF" },
    typeLabel: { fontSize: 11, color: "#666", marginTop: 8, textAlign: "center" },
    typeLabelSelected: { color: "#0A4DA3", fontWeight: "bold" },
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
        marginHorizontal: 20,
        marginBottom: 10,
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
    genderRow: { flexDirection: "row", gap: 10 },
    genderBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#E2E8F0",
        alignItems: "center",
    },
    genderBtnSelected: { borderColor: "#2E7D32", backgroundColor: "#E8F5E9" },
    genderBtnText: { fontSize: 14, color: "#666", fontWeight: "600" },
    genderBtnTextSelected: { color: "#2E7D32" },
    successText: { color: "#2E7D32", fontSize: 12, fontWeight: "600", marginTop: 5 },
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

