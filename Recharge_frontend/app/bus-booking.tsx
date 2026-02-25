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

interface City {
    name: string;
    state: string;
}

export default function BusBookingScreen() {
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

    const [fromCity, setFromCity] = useState<City | null>(null);
    const [toCity, setToCity] = useState<City | null>(null);
    const [travelDate, setTravelDate] = useState("");
    const [busType, setBusType] = useState("All Types");
    const [showCityModal, setShowCityModal] = useState(false);
    const [citySelectionFor, setCitySelectionFor] = useState<"from" | "to">("from");
    const [showBusTypeModal, setShowBusTypeModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [errors, setErrors] = useState({ from: "", to: "", date: "" });

    const cities: City[] = [
        { name: "Mumbai", state: "Maharashtra" },
        { name: "Pune", state: "Maharashtra" },
        { name: "Delhi", state: "Delhi" },
        { name: "Bangalore", state: "Karnataka" },
        { name: "Hyderabad", state: "Telangana" },
        { name: "Chennai", state: "Tamil Nadu" },
        { name: "Kolkata", state: "West Bengal" },
        { name: "Ahmedabad", state: "Gujarat" },
        { name: "Surat", state: "Gujarat" },
        { name: "Jaipur", state: "Rajasthan" },
    ];

    const busTypes = ["All Types", "AC Seater", "Non-AC Seater", "AC Sleeper", "Non-AC Sleeper", "Volvo AC", "Multi-Axle"];

    const handleSwapCities = () => {
        const temp = fromCity;
        setFromCity(toCity);
        setToCity(temp);
    };

    const handleCitySelect = (city: City) => {
        if (citySelectionFor === "from") {
            setFromCity(city);
            setErrors({ ...errors, from: "" });
        } else {
            setToCity(city);
            setErrors({ ...errors, to: "" });
        }
        setShowCityModal(false);
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

        if (!fromCity) {
            newErrors.from = "Select departure city";
            hasError = true;
        }
        if (!toCity) {
            newErrors.to = "Select arrival city";
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
            Alert.alert("Redirecting", "Redirecting to secure bus booking partner...", [{ text: "OK" }]);
        }, 2000);
    };

    return (
        <View style={s.root}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <LinearGradient colors={['#00897B', '#00695C']} style={s.headerGradient}>
                <SafeAreaView>
                    <View style={s.header}>
                        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={s.headerCenter}>
                            <Text style={s.headerTitle}>Bus Booking</Text>
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
                            setCitySelectionFor("from");
                            setShowCityModal(true);
                        }}
                    >
                        <View style={s.iconCircle}>
                            <MaterialCommunityIcons name="bus" size={20} color="#00897B" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>From</Text>
                            {fromCity ? (
                                <>
                                    <Text style={s.value}>{fromCity.name}</Text>
                                    <Text style={s.subValue}>{fromCity.state}</Text>
                                </>
                            ) : (
                                <Text style={s.placeholder}>Select departure city</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    {errors.from ? <Text style={s.error}>{errors.from}</Text> : null}

                    <TouchableOpacity style={s.swapBtn} onPress={handleSwapCities}>
                        <MaterialCommunityIcons name="swap-vertical" size={24} color="#00897B" />
                    </TouchableOpacity>

                    <View style={s.divider} />

                    <TouchableOpacity
                        style={s.row}
                        onPress={() => {
                            setCitySelectionFor("to");
                            setShowCityModal(true);
                        }}
                    >
                        <View style={s.iconCircle}>
                            <Ionicons name="location" size={20} color="#00897B" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>To</Text>
                            {toCity ? (
                                <>
                                    <Text style={s.value}>{toCity.name}</Text>
                                    <Text style={s.subValue}>{toCity.state}</Text>
                                </>
                            ) : (
                                <Text style={s.placeholder}>Select arrival city</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    {errors.to ? <Text style={s.error}>{errors.to}</Text> : null}
                </View>

                <View style={s.card}>
                    <TouchableOpacity style={s.row} onPress={handleDateSelect}>
                        <View style={s.iconCircle}>
                            <Ionicons name="calendar-outline" size={20} color="#00897B" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>Travel Date</Text>
                            <Text style={[s.value, !travelDate && s.placeholder]}>
                                {travelDate || "Select date"}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    {errors.date ? <Text style={s.error}>{errors.date}</Text> : null}
                </View>

                <View style={s.card}>
                    <TouchableOpacity style={s.row} onPress={() => setShowBusTypeModal(true)}>
                        <View style={s.iconCircle}>
                            <MaterialCommunityIcons name="bus-side" size={20} color="#00897B" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>Bus Type</Text>
                            <Text style={s.value}>{busType}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={s.searchBtn} onPress={handleSearch} disabled={isSearching}>
                    <LinearGradient colors={['#00897B', '#00695C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.searchGrad}>
                        {isSearching ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="search" size={20} color="#FFF" />
                                <Text style={s.searchText}>Search Buses</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={s.infoBox}>
                    <Ionicons name="information-circle-outline" size={16} color="#00695C" />
                    <Text style={s.infoText}>Redirects to secure bus booking partner</Text>
                </View>

                <View style={s.popularSection}>
                    <Text style={s.popularTitle}>Popular Routes</Text>
                    <View style={s.routesGrid}>
                        {["Mumbai → Pune", "Delhi → Jaipur", "Bangalore → Chennai", "Hyderabad → Vijayawada"].map((route) => (
                            <TouchableOpacity key={route} style={s.routeCard}>
                                <MaterialCommunityIcons name="bus-clock" size={20} color="#00897B" />
                                <Text style={s.routeText}>{route}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <Modal visible={showCityModal} transparent animationType="slide" onRequestClose={() => setShowCityModal(false)}>
                <View style={s.modalBack}>
                    <View style={s.modal}>
                        <View style={s.modalHandle} />
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Select {citySelectionFor === "from" ? "Departure" : "Arrival"} City</Text>
                            <TouchableOpacity onPress={() => setShowCityModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {cities.map((city, idx) => (
                                <TouchableOpacity key={idx} style={s.modalItem} onPress={() => handleCitySelect(city)}>
                                    <View style={s.cityIcon}>
                                        <MaterialCommunityIcons name="city" size={20} color="#00897B" />
                                    </View>
                                    <View style={s.cityInfo}>
                                        <Text style={s.cityName}>{city.name}</Text>
                                        <Text style={s.cityState}>{city.state}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={showBusTypeModal} transparent animationType="slide" onRequestClose={() => setShowBusTypeModal(false)}>
                <View style={s.modalBack}>
                    <View style={s.modal}>
                        <View style={s.modalHandle} />
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Bus Type</Text>
                            <TouchableOpacity onPress={() => setShowBusTypeModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        {busTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={s.modalItem}
                                onPress={() => {
                                    setBusType(type);
                                    setShowBusTypeModal(false);
                                }}
                            >
                                <Text style={s.modalItemText}>{type}</Text>
                                {busType === type && <Ionicons name="checkmark-circle" size={24} color="#00897B" />}
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
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0F2F1', alignItems: 'center', justifyContent: 'center' },
    textContainer: { flex: 1 },
    label: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
    value: { fontSize: 16, fontWeight: '600', color: '#111827' },
    subValue: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    placeholder: { fontSize: 15, color: '#9CA3AF' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
    swapBtn: { position: 'absolute', right: 16, top: 62, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E0F2F1', zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    error: { fontSize: 12, color: '#EF4444', marginTop: 8 },
    searchBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, shadowColor: '#00897B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    searchGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
    searchText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E0F2F1', borderRadius: 12, padding: 12, marginBottom: 16 },
    infoText: { fontSize: 12, color: '#00695C', flex: 1 },
    popularSection: { marginTop: 8 },
    popularTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
    routesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    routeCard: { width: '48%', backgroundColor: '#FFF', padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    routeText: { fontSize: 13, fontWeight: '600', color: '#111827', flex: 1 },
    modalBack: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingBottom: 20 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginTop: 12, marginBottom: 16 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalItemText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#111827' },
    cityIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0F2F1', alignItems: 'center', justifyContent: 'center' },
    cityInfo: { flex: 1, marginLeft: 12 },
    cityName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
    cityState: { fontSize: 12, color: '#6B7280' },
});