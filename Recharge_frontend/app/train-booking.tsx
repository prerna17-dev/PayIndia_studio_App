import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    BackHandler,
    Modal,
    ActivityIndicator,
    Alert,
} from "react-native";

interface Station {
    code: string;
    name: string;
    city: string;
}

export default function TrainBookingScreen() {
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {
                router.back();
                return true;
            };
            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => backHandler.remove();
        }, [router])
    );

    const [fromStation, setFromStation] = useState<Station | null>(null);
    const [toStation, setToStation] = useState<Station | null>(null);
    const [travelDate, setTravelDate] = useState("");
    const [trainClass, setTrainClass] = useState("Sleeper (SL)");
    const [quota, setQuota] = useState("General");
    const [showStationModal, setShowStationModal] = useState(false);
    const [stationSelectionFor, setStationSelectionFor] = useState<"from" | "to">("from");
    const [showClassModal, setShowClassModal] = useState(false);
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [errors, setErrors] = useState({ from: "", to: "", date: "" });

    const stations: Station[] = [
        { code: "NDLS", name: "New Delhi", city: "Delhi" },
        { code: "BCT", name: "Mumbai Central", city: "Mumbai" },
        { code: "HWH", name: "Howrah Junction", city: "Kolkata" },
        { code: "MAS", name: "Chennai Central", city: "Chennai" },
        { code: "SBC", name: "Bangalore City", city: "Bangalore" },
        { code: "SC", name: "Secunderabad Jn", city: "Hyderabad" },
        { code: "PNBE", name: "Patna Junction", city: "Patna" },
        { code: "LKO", name: "Lucknow", city: "Lucknow" },
        { code: "JP", name: "Jaipur Junction", city: "Jaipur" },
        { code: "ADI", name: "Ahmedabad Jn", city: "Ahmedabad" },
    ];

    const trainClasses = ["1AC - First AC", "2AC - Second AC", "3AC - Third AC", "Sleeper (SL)", "Second Sitting (2S)", "Chair Car (CC)", "Executive Class (EC)"];
    const quotas = ["General", "Tatkal", "Ladies", "Senior Citizen", "Premium Tatkal"];

    const handleSwapStations = () => {
        const temp = fromStation;
        setFromStation(toStation);
        setToStation(temp);
    };

    const handleStationSelect = (station: Station) => {
        if (stationSelectionFor === "from") {
            setFromStation(station);
            setErrors({ ...errors, from: "" });
        } else {
            setToStation(station);
            setErrors({ ...errors, to: "" });
        }
        setShowStationModal(false);
    };

    const handleDateSelect = () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        const dateStr = `${date.getDate()} ${date.toLocaleDateString('en', { month: 'short' })} ${date.getFullYear()}`;
        setTravelDate(dateStr);
        setErrors(prev => ({ ...prev, date: "" }));
    };

    const handleSearch = () => {
        let hasError = false;
        const newErrors = { from: "", to: "", date: "" };

        if (!fromStation) {
            newErrors.from = "Select departure station";
            hasError = true;
        }
        if (!toStation) {
            newErrors.to = "Select arrival station";
            hasError = true;
        }
        if (!travelDate) {
            newErrors.date = "Select travel date";
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;

        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            Alert.alert("Redirecting", "Redirecting to IRCTC or secure railway partner...", [{ text: "OK" }]);
        }, 2000);
    };

    return (
        <View style={s.root}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <LinearGradient colors={['#D84315', '#BF360C']} style={s.headerGradient}>
                <SafeAreaView>
                    <View style={s.header}>
                        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={s.headerCenter}>
                            <Text style={s.headerTitle}>Train Booking</Text>
                            <Text style={s.headerSub}>Book Tickets Across India</Text>
                        </View>
                        <View style={s.headerRight} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                <View style={s.card}>
                    <TouchableOpacity
                        style={s.row}
                        onPress={() => {
                            setStationSelectionFor("from");
                            setShowStationModal(true);
                        }}
                    >
                        <View style={s.iconCircle}>
                            <MaterialCommunityIcons name="train" size={20} color="#D84315" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>From Station</Text>
                            {fromStation ? (
                                <>
                                    <Text style={s.value}>{fromStation.name}</Text>
                                    <Text style={s.subValue}>{fromStation.code} • {fromStation.city}</Text>
                                </>
                            ) : (
                                <Text style={s.placeholder}>Select departure station</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    {errors.from ? <Text style={s.error}>{errors.from}</Text> : null}

                    <TouchableOpacity style={s.swapBtn} onPress={handleSwapStations}>
                        <MaterialCommunityIcons name="swap-vertical" size={24} color="#D84315" />
                    </TouchableOpacity>

                    <View style={s.divider} />

                    <TouchableOpacity
                        style={s.row}
                        onPress={() => {
                            setStationSelectionFor("to");
                            setShowStationModal(true);
                        }}
                    >
                        <View style={s.iconCircle}>
                            <Ionicons name="location" size={20} color="#D84315" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>To Station</Text>
                            {toStation ? (
                                <>
                                    <Text style={s.value}>{toStation.name}</Text>
                                    <Text style={s.subValue}>{toStation.code} • {toStation.city}</Text>
                                </>
                            ) : (
                                <Text style={s.placeholder}>Select arrival station</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    {errors.to ? <Text style={s.error}>{errors.to}</Text> : null}
                </View>

                <View style={s.card}>
                    <TouchableOpacity style={s.row} onPress={handleDateSelect}>
                        <View style={s.iconCircle}>
                            <Ionicons name="calendar-outline" size={20} color="#D84315" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>Journey Date</Text>
                            <Text style={[s.value, !travelDate && s.placeholder]}>
                                {travelDate || "Select date"}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    {errors.date ? <Text style={s.error}>{errors.date}</Text> : null}
                </View>

                <View style={s.card}>
                    <TouchableOpacity style={s.row} onPress={() => setShowClassModal(true)}>
                        <View style={s.iconCircle}>
                            <MaterialCommunityIcons name="seat-passenger" size={20} color="#D84315" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>Class</Text>
                            <Text style={s.value}>{trainClass}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View style={s.divider} />

                    <TouchableOpacity style={s.row} onPress={() => setShowQuotaModal(true)}>
                        <View style={s.iconCircle}>
                            <Ionicons name="ticket-outline" size={20} color="#D84315" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>Quota</Text>
                            <Text style={s.value}>{quota}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={s.searchBtn} onPress={handleSearch} disabled={isSearching}>
                    <LinearGradient colors={['#D84315', '#BF360C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.searchGrad}>
                        {isSearching ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="search" size={20} color="#FFF" />
                                <Text style={s.searchText}>Search Trains</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={s.infoBox}>
                    <Ionicons name="information-circle-outline" size={16} color="#BF360C" />
                    <Text style={s.infoText}>Redirects to IRCTC or secure railway partner</Text>
                </View>
            </ScrollView>

            <Modal visible={showStationModal} transparent animationType="slide" onRequestClose={() => setShowStationModal(false)}>
                <View style={s.modalBack}>
                    <View style={s.modal}>
                        <View style={s.modalHandle} />
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Select {stationSelectionFor === "from" ? "Departure" : "Arrival"} Station</Text>
                            <TouchableOpacity onPress={() => setShowStationModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {stations.map((station) => (
                                <TouchableOpacity key={station.code} style={s.modalItem} onPress={() => handleStationSelect(station)}>
                                    <View style={s.stationCode}>
                                        <Text style={s.stationCodeText}>{station.code}</Text>
                                    </View>
                                    <View style={s.stationInfo}>
                                        <Text style={s.stationName}>{station.name}</Text>
                                        <Text style={s.stationCity}>{station.city}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={showClassModal} transparent animationType="slide" onRequestClose={() => setShowClassModal(false)}>
                <View style={s.modalBack}>
                    <View style={s.modal}>
                        <View style={s.modalHandle} />
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Train Class</Text>
                            <TouchableOpacity onPress={() => setShowClassModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        {trainClasses.map((cls) => (
                            <TouchableOpacity
                                key={cls}
                                style={s.modalItem}
                                onPress={() => {
                                    setTrainClass(cls);
                                    setShowClassModal(false);
                                }}
                            >
                                <Text style={s.modalItemText}>{cls}</Text>
                                {trainClass === cls && <Ionicons name="checkmark-circle" size={24} color="#D84315" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            <Modal visible={showQuotaModal} transparent animationType="slide" onRequestClose={() => setShowQuotaModal(false)}>
                <View style={s.modalBack}>
                    <View style={s.modal}>
                        <View style={s.modalHandle} />
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Quota</Text>
                            <TouchableOpacity onPress={() => setShowQuotaModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        {quotas.map((q) => (
                            <TouchableOpacity
                                key={q}
                                style={s.modalItem}
                                onPress={() => {
                                    setQuota(q);
                                    setShowQuotaModal(false);
                                }}
                            >
                                <Text style={s.modalItemText}>{q}</Text>
                                {quota === q && <Ionicons name="checkmark-circle" size={24} color="#D84315" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F5F7FA' },
    headerGradient: { paddingTop: 0 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
    headerRight: { width: 40 },
    scroll: { padding: 16 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, position: 'relative' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FBE9E7', alignItems: 'center', justifyContent: 'center' },
    textContainer: { flex: 1 },
    label: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
    value: { fontSize: 16, fontWeight: '600', color: '#111827' },
    subValue: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    placeholder: { fontSize: 15, color: '#9CA3AF' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
    swapBtn: { position: 'absolute', right: 16, top: 62, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FBE9E7', zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    error: { fontSize: 12, color: '#EF4444', marginTop: 8 },
    searchBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, shadowColor: '#D84315', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    searchGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
    searchText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FBE9E7', borderRadius: 12, padding: 12 },
    infoText: { fontSize: 12, color: '#BF360C', flex: 1 },
    modalBack: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingBottom: 20 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginTop: 12, marginBottom: 16 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalItemText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#111827' },
    stationCode: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FBE9E7', alignItems: 'center', justifyContent: 'center' },
    stationCodeText: { fontSize: 12, fontWeight: '700', color: '#D84315' },
    stationInfo: { flex: 1, marginLeft: 12 },
    stationName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
    stationCity: { fontSize: 12, color: '#6B7280' },
});