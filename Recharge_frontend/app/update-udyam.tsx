import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
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
    ActivityIndicator
} from 'react-native';

type UpdateType = 'address' | 'bank' | 'activity' | 'employees' | 'turnover';

const UPDATE_TYPES: { id: UpdateType; label: string; icon: string }[] = [
    { id: 'address', label: 'Address Change', icon: 'map-marker' },
    { id: 'bank', label: 'Bank Details', icon: 'bank' },
    { id: 'activity', label: 'Business Activity', icon: 'briefcase-variant' },
    { id: 'employees', label: 'Employee Count', icon: 'account-group' },
    { id: 'turnover', label: 'Annual Turnover', icon: 'currency-inr' },
];

// Required docs per update type
const REQUIRED_DOCS: Record<UpdateType, { id: string; label: string }[]> = {
    address: [
        { id: 'aadhaar', label: 'Aadhaar Card of Proprietor / Partner' },
        { id: 'addressProof', label: 'New Address Proof (Utility Bill / Rent Agreement)' },
    ],
    bank: [
        { id: 'aadhaar', label: 'Aadhaar Card of Account Holder' },
        { id: 'cheque', label: 'Cancelled Cheque of New Bank Account' },
        { id: 'passbook', label: 'Bank Passbook First Page (with Account Details)' },
    ],
    activity: [
        { id: 'aadhaar', label: 'Aadhaar Card of Proprietor' },
        { id: 'activityProof', label: 'Proof of New Business Activity (GST Certificate / Trade License)' },
    ],
    employees: [
        { id: 'aadhaar', label: 'Aadhaar Card of Proprietor' },
        { id: 'empProof', label: 'Employee Records / Payroll Statement' },
    ],
    turnover: [
        { id: 'aadhaar', label: 'Aadhaar Card of Proprietor' },
        { id: 'itr', label: 'Latest ITR / Audited Balance Sheet' },
        { id: 'gst', label: 'GST Returns (GSTR-3B)' },
    ],
};



export default function UpdateUdyamDetailsScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Step 1
    const [udyamNumber, setUdyamNumber] = useState('');
    const [aadhaar, setAadhaar] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Step 2 - single selection
    const [selectedUpdate, setSelectedUpdate] = useState<UpdateType | null>(null);
    const [form, setForm] = useState({
        flat: '', city: '', state: '', pincode: '',
        bankName: '', accountNumber: '', ifsc: '',
        activity: '', nicCode: '',
        employees: '', turnover: '',
    });
    const [docs, setDocs] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    useEffect(() => {
        const backAction = () => {
            if (step > 1) { setStep(step - 1); return true; }
            router.back();
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [step]);

    // Reset docs/form when type changes
    useEffect(() => {
        setDocs({});
        setForm({ flat: '', city: '', state: '', pincode: '', bankName: '', accountNumber: '', ifsc: '', activity: '', nicCode: '', employees: '', turnover: '' });
    }, [selectedUpdate]);

    const update = (k: string, v: string) => setForm({ ...form, [k]: v });

    const handleAadhaarChange = (t: string) => {
        const c = t.replace(/\D/g, '').substring(0, 12);
        const f = c.match(/.{1,4}/g)?.join(' ') || c;
        setAadhaar(f);
    };

    const handleVerify = () => {
        if (!udyamNumber.trim()) return Alert.alert('Required', 'Enter Udyam Registration Number');
        if (aadhaar.replace(/\s/g, '').length !== 12) return Alert.alert('Required', 'Enter valid 12-digit Aadhaar');
        setIsVerifying(true);
        setTimeout(() => { setIsVerifying(false); setStep(2); }, 1200);
    };

    const uploadDoc = async (id: string) => {
        try {
            const r = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'] });
            if (!r.canceled && r.assets?.[0]) {
                const f = r.assets[0];
                if (f.size && f.size > 5 * 1024 * 1024) return Alert.alert('Too Large', 'Max 5MB');
                setDocs({ ...docs, [id]: f });
            }
        } catch (e) { Alert.alert('Error', 'Upload failed'); }
    };

    const removeDoc = (id: string) => {
        const n = { ...docs }; delete n[id]; setDocs(n);
    };

    const validateStep2 = () => {
        if (!selectedUpdate) return Alert.alert('Required', 'Select an update type');

        if (selectedUpdate === 'address' && (!form.flat || !form.city || !form.pincode)) return Alert.alert('Required', 'Fill all address fields');
        if (selectedUpdate === 'bank' && (!form.bankName || !form.accountNumber || !form.ifsc)) return Alert.alert('Required', 'Fill all bank details');
        if (selectedUpdate === 'activity' && !form.activity) return Alert.alert('Required', 'Enter business activity');
        if (selectedUpdate === 'employees' && !form.employees) return Alert.alert('Required', 'Enter employee count');
        if (selectedUpdate === 'turnover' && !form.turnover) return Alert.alert('Required', 'Enter annual turnover');

        const requiredDocs = REQUIRED_DOCS[selectedUpdate] || [];
        const missingDocs = requiredDocs.filter(d => !docs[d.id]);
        if (missingDocs.length > 0) {
            return Alert.alert('Required', `Please upload:\n${missingDocs.map(d => "• " + d.label).join("\n")}`);
        }

        setStep(3);
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const refId = "UDY" + Math.random().toString(36).substr(2, 9).toUpperCase();
            setApplicationId(refId);
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
    };

    const getNewData = () => {
        switch (selectedUpdate) {
            case 'address': return `${form.flat}, ${form.city}, ${form.state} - ${form.pincode}`;
            case 'bank': return `${form.bankName} - ${form.accountNumber}`;
            case 'activity': return `${form.activity}${form.nicCode ? ` (NIC: ${form.nicCode})` : ''}`;
            case 'employees': return `${form.employees} Employees`;
            case 'turnover': return `₹${form.turnover}`;
            default: return '';
        }
    };

    const renderDocumentUploads = () => {
        if (!selectedUpdate) return null;
        const docList = REQUIRED_DOCS[selectedUpdate] || [];
        return (
            <View style={{ marginTop: 20 }}>
                <Text style={s.docSectionTitle}>Required Documents</Text>
                {docList.map((doc) => {
                    const uploaded = docs[doc.id];
                    return (
                        <View key={doc.id} style={s.docCard}>
                            <View style={s.docLabelRow}>
                                <Ionicons name="document-text-outline" size={18} color="#0D47A1" />
                                <Text style={s.docLabel}>{doc.label}</Text>
                            </View>
                            {uploaded ? (
                                <View style={s.uploadedRow}>
                                    <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                    <Text style={s.fileName} numberOfLines={1}>{uploaded.name}</Text>
                                    <TouchableOpacity onPress={() => removeDoc(doc.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={s.uploadBox} onPress={() => uploadDoc(doc.id)}>
                                    <Ionicons name="cloud-upload-outline" size={26} color="#0D47A1" />
                                    <Text style={s.uploadText}>Tap to Upload</Text>
                                    <Text style={s.uploadSub}>PDF or Image (Max 5MB)</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    if (isSubmitted) {
        return (
            <View style={s.root}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={s.safe}>
                    <View style={s.successContainer}>
                        <View style={s.successIconCircle}>
                            <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                        </View>
                        <Text style={s.successTitle}>Update Requested!</Text>
                        <Text style={s.successSubtitle}>Your Udyam registration update request has been submitted successfully.</Text>

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
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={s.root}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />
            <SafeAreaView style={s.safe}>
                {/* Header - plain back arrow, no circle */}
                <View style={s.header}>
                    <TouchableOpacity style={s.backBtn} onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={s.headerContent}>
                        <Text style={s.headerTitle}>Update Udyam</Text>
                        <Text style={s.headerSubtitle}>Enterprise registration update</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Step Indicator */}
                <View style={s.stepIndicator}>
                    {[1, 2, 3].map((i) => (
                        <React.Fragment key={i}>
                            <View style={s.stepItem}>
                                <View style={[s.stepCircle, step >= i && s.stepCircleActive, step > i && s.stepCircleDone]}>
                                    {step > i ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Text style={[s.stepNum, step >= i && s.stepNumActive]}>{i}</Text>}
                                </View>
                                <Text style={[s.stepLabel, step >= i && s.stepLabelActive]}>
                                    {i === 1 ? "Verify" : i === 2 ? "Update" : "Review"}
                                </Text>
                            </View>
                            {i < 3 && <View style={[s.stepLine, step > i && s.stepLineDone]} />}
                        </React.Fragment>
                    ))}
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                        {/* STEP 1 */}
                        {step === 1 && (
                            <View>
                                <View style={s.card}>
                                    <View style={s.cardHeader}>
                                        <Ionicons name="shield-checkmark-outline" size={20} color="#0D47A1" />
                                        <Text style={s.cardHeaderTitle}>Enterprise Verification</Text>
                                    </View>
                                    <Text style={s.inputLabel}>Udyam Registration Number *</Text>
                                    <View style={s.inputRow}>
                                        <TextInput style={s.field} placeholder="UDYAM-XX-00-0000000" value={udyamNumber} onChangeText={setUdyamNumber} autoCapitalize="characters" />
                                    </View>
                                    <Text style={s.inputLabel}>Aadhaar Number *</Text>
                                    <View style={s.inputRow}>
                                        <TextInput style={s.field} placeholder="XXXX XXXX XXXX" value={aadhaar} onChangeText={handleAadhaarChange} keyboardType="numeric" maxLength={14} />
                                    </View>
                                </View>

                                <TouchableOpacity style={s.mainBtn} onPress={handleVerify} disabled={isVerifying}>
                                    <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                                        {isVerifying ? <ActivityIndicator color="#FFF" /> : <><Text style={s.btnText}>Verify & Proceed</Text><Ionicons name="arrow-forward" size={18} color="#FFF" /></>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={s.iconBadge}><Ionicons name="create-outline" size={20} color="#007961" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Select Update Type</Text>
                                        <Text style={s.sectionSub}>Choose one field to update</Text>
                                    </View>
                                </View>

                                {/* Single-select grid */}
                                <View style={s.typeGrid}>
                                    {UPDATE_TYPES.map(u => (
                                        <TouchableOpacity
                                            key={u.id}
                                            style={[s.typeCard, selectedUpdate === u.id && s.typeCardActive]}
                                            onPress={() => setSelectedUpdate(u.id)}
                                        >
                                            <MaterialCommunityIcons name={u.icon as any} size={26} color={selectedUpdate === u.id ? "#FFF" : "#0D47A1"} />
                                            <Text style={[s.typeCardLabel, selectedUpdate === u.id && s.typeCardLabelActive]}>{u.label}</Text>
                                            {selectedUpdate === u.id && (
                                                <View style={s.selectedBadge}><Ionicons name="checkmark" size={10} color="#0D47A1" /></View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {selectedUpdate && (
                                    <View>
                                        {/* Input form */}
                                        <View style={s.card}>
                                            <Text style={s.cardHeaderTitle}>Enter New Details</Text>

                                            {selectedUpdate === 'address' && (
                                                <View>
                                                    <Text style={s.inputLabel}>Flat / Building / Street *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="House No, Building, Street" value={form.flat} onChangeText={v => update('flat', v)} /></View>
                                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={s.inputLabel}>City *</Text>
                                                            <View style={s.inputRow}><TextInput style={s.field} placeholder="City" value={form.city} onChangeText={v => update('city', v)} /></View>
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={s.inputLabel}>State *</Text>
                                                            <View style={s.inputRow}><TextInput style={s.field} placeholder="State" value={form.state} onChangeText={v => update('state', v)} /></View>
                                                        </View>
                                                    </View>
                                                    <Text style={s.inputLabel}>PIN Code *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="6-digit PIN" value={form.pincode} onChangeText={v => update('pincode', v.replace(/\D/g, ''))} keyboardType="numeric" maxLength={6} /></View>
                                                </View>
                                            )}

                                            {selectedUpdate === 'bank' && (
                                                <View>
                                                    <Text style={s.inputLabel}>Bank Name *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="e.g. HDFC Bank" value={form.bankName} onChangeText={v => update('bankName', v)} /></View>
                                                    <Text style={s.inputLabel}>Account Number *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="Account number" value={form.accountNumber} onChangeText={v => update('accountNumber', v)} keyboardType="numeric" /></View>
                                                    <Text style={s.inputLabel}>IFSC Code *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="IFSC Code" value={form.ifsc} onChangeText={v => update('ifsc', v.toUpperCase())} autoCapitalize="characters" maxLength={11} /></View>
                                                </View>
                                            )}

                                            {selectedUpdate === 'activity' && (
                                                <View>
                                                    <Text style={s.inputLabel}>New Business Activity *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="e.g. Textile Manufacturing" value={form.activity} onChangeText={v => update('activity', v)} /></View>
                                                    <Text style={s.inputLabel}>NIC Code (if known)</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="5-digit NIC code" value={form.nicCode} onChangeText={v => update('nicCode', v)} keyboardType="numeric" maxLength={5} /></View>
                                                </View>
                                            )}

                                            {selectedUpdate === 'employees' && (
                                                <View>
                                                    <Text style={s.inputLabel}>Updated Employee Count *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="Total number of employees" value={form.employees} onChangeText={v => update('employees', v.replace(/\D/g, ''))} keyboardType="numeric" /></View>
                                                </View>
                                            )}

                                            {selectedUpdate === 'turnover' && (
                                                <View>
                                                    <Text style={s.inputLabel}>Annual Turnover (₹) *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="e.g. 7500000" value={form.turnover} onChangeText={v => update('turnover', v.replace(/\D/g, ''))} keyboardType="numeric" /></View>
                                                    <Text style={s.helperText}>Enter amount in rupees (without ₹ symbol)</Text>
                                                </View>
                                            )}

                                            {/* Document uploads */}
                                            {renderDocumentUploads()}
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity style={[s.mainBtn, !selectedUpdate && s.btnDisabled]} disabled={!selectedUpdate} onPress={validateStep2}>
                                    <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                                        <Text style={s.btnText}>Continue to Review</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#F3E5F5' }]}><Ionicons name="eye-outline" size={20} color="#7B1FA2" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Review Changes</Text>
                                        <Text style={s.sectionSub}>Confirm before submitting</Text>
                                    </View>
                                </View>

                                <View style={s.card}>
                                    <View style={s.reviewRow}>
                                        <Text style={s.reviewLabel}>Udyam Number</Text>
                                        <Text style={s.reviewVal}>{udyamNumber}</Text>
                                    </View>
                                    <View style={s.divider} />
                                    <View style={s.reviewRow}>
                                        <Text style={s.reviewLabel}>Update Field</Text>
                                        <Text style={s.reviewVal}>{UPDATE_TYPES.find(u => u.id === selectedUpdate)?.label}</Text>
                                    </View>
                                    <View style={s.divider} />
                                    <View style={{ paddingVertical: 12 }}>
                                        <Text style={s.reviewTypeLabel}>New Value</Text>
                                        <Text style={s.compareNew}>{getNewData()}</Text>
                                    </View>
                                    <View style={s.divider} />
                                    <View style={s.reviewRow}>
                                        <Text style={s.reviewLabel}>Documents</Text>
                                        <Text style={s.reviewVal}>{Object.keys(docs).length} Uploaded</Text>
                                    </View>
                                </View>

                                <View style={s.infoBox}>
                                    <Ionicons name="information-circle-outline" size={20} color="#0D47A1" />
                                    <Text style={s.infoText}>Udyam details update usually takes 2-3 working days for verification after submission.</Text>
                                </View>

                                <TouchableOpacity style={s.mainBtn} onPress={handleSubmit} disabled={isSubmitting}>
                                    <LinearGradient colors={['#2E7D32', '#388E3C']} style={s.btnGrad}>
                                        {isSubmitting ? <ActivityIndicator color="#FFF" /> : <><Text style={s.btnText}>Confirm & Submit Update</Text><Ionicons name="checkmark-done" size={18} color="#FFF" /></>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    safe: { flex: 1 },
    // Header - no circle behind arrow
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#FFF' },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerContent: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },

    stepIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 20, backgroundColor: '#FFF' },
    stepItem: { alignItems: 'center', zIndex: 2 },
    stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
    stepCircleActive: { borderColor: '#0D47A1' },
    stepCircleDone: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    stepNum: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
    stepNumActive: { color: '#0D47A1' },
    stepLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8', marginTop: 6 },
    stepLabelActive: { color: '#0D47A1' },
    stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: -10, marginTop: -15 },
    stepLineDone: { backgroundColor: '#2E7D32' },

    scroll: { padding: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    iconBadge: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#E0F2F1', alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    sectionSub: { fontSize: 12, color: '#64748B' },

    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, marginBottom: 20 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    cardHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 },

    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 12 },
    inputRow: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 48, justifyContent: 'center' },
    field: { flex: 1, fontSize: 14, color: '#1E293B' },
    helperText: { fontSize: 11, color: '#94A3B8', marginTop: 6 },

    mainBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
    btnDisabled: { opacity: 0.6 },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    btnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

    // Single-select grid
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    typeCard: { width: '48%', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, borderWidth: 2, borderColor: 'transparent', position: 'relative' },
    typeCardActive: { backgroundColor: '#0D47A1', borderColor: '#0D47A1' },
    typeCardLabel: { fontSize: 12, fontWeight: '700', color: '#475569', textAlign: 'center' },
    typeCardLabelActive: { color: '#FFF' },
    selectedBadge: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },

    reviewTypeLabel: { fontSize: 12, fontWeight: '700', color: '#0D47A1', marginBottom: 6 },
    docSectionTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
    docCard: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
    docLabelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
    docLabel: { flex: 1, fontSize: 12, fontWeight: '700', color: '#1E293B', lineHeight: 18 },
    uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1', borderRadius: 12, padding: 16, alignItems: 'center', backgroundColor: '#F8FAFC' },
    uploadText: { fontSize: 13, fontWeight: '700', color: '#0D47A1', marginTop: 6 },
    uploadSub: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
    uploadedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#E8F5E9', padding: 8, borderRadius: 8 },
    fileName: { flex: 1, fontSize: 12, color: '#2E7D32', fontWeight: '600' },

    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, alignItems: 'center' },
    reviewLabel: { fontSize: 14, color: '#64748B' },
    reviewVal: { fontSize: 14, fontWeight: '800', color: '#1E293B', flex: 1, textAlign: 'right', marginLeft: 12 },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
    compareNew: { fontSize: 14, color: '#2E7D32', fontWeight: '700' },

    infoBox: { flexDirection: 'row', backgroundColor: '#E3F2FD', borderRadius: 16, padding: 16, marginBottom: 24, gap: 12 },
    infoText: { flex: 1, fontSize: 12, color: '#0D47A1', lineHeight: 18, fontWeight: '600' },

    // Success Screen
    successContainer: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
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
    mainBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
