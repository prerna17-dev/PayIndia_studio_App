import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const CATEGORIES = ['Popular', 'Data', 'Unlimited', 'Validity', 'ISD'];

const PLANS_BY_CATEGORY: Record<string, any[]> = {
    'Popular': [
        { id: '1', price: '₹299', data: '1.5GB/day', validity: '28 Days', benefit: 'Unlimited Calls + 100 SMS/day' },
        { id: '2', price: '₹719', data: '1.5GB/day', validity: '84 Days', benefit: 'Best seller for 3 months' },
        { id: '3', price: '₹399', data: '2GB/day', validity: '28 Days', benefit: 'Extra 5GB Data included' },
        { id: '4', price: '₹666', data: '1.5GB/day', validity: '84 Days', benefit: 'Unlimited Calls + 100 SMS/day' },
        { id: '5', price: '₹239', data: '1.5GB/day', validity: '28 Days', benefit: 'Truly Unlimited' },
        { id: '6', price: '₹479', data: '1.5GB/day', validity: '56 Days', benefit: 'Long term connectivity' },
        { id: '7', price: '₹2999', data: '2.5GB/day', validity: '365 Days', benefit: 'Annual pack with full benefits' },
        { id: '8', price: '₹999', data: '3GB/day', validity: '84 Days', benefit: 'Heavy data usage pack' },
    ],
    'Data': [
        { id: 'd1', price: '₹15', data: '1GB', validity: 'Existing Pack', benefit: 'Data Booster' },
        { id: 'd2', price: '₹25', data: '2GB', validity: '1 Day', benefit: 'Quick Data Add-on' },
        { id: 'd3', price: '₹61', data: '6GB', validity: 'Existing Pack', benefit: 'Extra Data' },
        { id: 'd4', price: '₹121', data: '12GB', validity: 'Existing Pack', benefit: 'Work from home data' },
        { id: 'd5', price: '₹148', data: '15GB', validity: 'Existing Pack', benefit: 'Gaming & Streaming data' },
        { id: 'd6', price: '₹301', data: '50GB', validity: '30 Days', benefit: 'Bulk data add-on' },
    ],
    'Unlimited': [
        { id: 'u1', price: '₹239', data: '1.5GB/day', validity: '28 Days', benefit: 'Truly Unlimited' },
        { id: 'u2', price: '₹479', data: '1.5GB/day', validity: '56 Days', benefit: 'Long terminal connectivity' },
    ],
    'Validity': [
        { id: 'v1', price: '₹155', data: '2GB', validity: '24 Days', benefit: 'Basic connectivity' },
        { id: 'v2', price: '₹179', data: '2GB', validity: '28 Days', benefit: 'Affordable monthly pack' },
    ],
    'ISD': [
        { id: 'i1', price: '₹501', data: 'N/A', validity: '28 Days', benefit: 'ISD Calling pack' },
    ]
};

export default function RechargePlansScreen() {
    const router = useRouter();
    const { number, operator, circle } = useLocalSearchParams<{ number: string; operator: string; circle: string }>();
    const [activeTab, setActiveTab] = useState('Popular');

    const handleSelectPlan = (plan: any) => {
        const cleanPrice = plan.price.replace(/[^0-9.]/g, '');
        router.push({
            pathname: '/recharge-payment',
            params: {
                number: number,
                operator: operator,
                circle: circle,
                amount: cleanPrice,
                planName: plan.data + ' | ' + plan.validity,
                planBenefit: plan.benefit
            }
        });
    };

    const renderPlanCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.planCard}
            onPress={() => handleSelectPlan(item)}
            activeOpacity={0.7}
            delayPressIn={100}
        >
            <View style={styles.planHeader}>
                <Text style={styles.planPrice}>{item.price}</Text>
                <View style={styles.selectButton}>
                    <Text style={styles.selectText}>Select</Text>
                </View>
            </View>
            <View style={styles.planDetailsContainer}>
                <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>Data</Text>
                    <Text style={styles.detailValue}>{item.data}</Text>
                </View>
                <View style={styles.detailSeparator} />
                <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>Validity</Text>
                    <Text style={styles.detailValue}>{item.validity}</Text>
                </View>
            </View>
            <Text style={styles.benefitText}>{item.benefit}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>{operator} Plans</Text>
                        <Text style={styles.headerSubtitle}>{number} • {circle || 'Maharashtra'}</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {/* Horizontal Tabs */}
                <View style={styles.tabsWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.tab, activeTab === cat && styles.activeTab]}
                                onPress={() => setActiveTab(cat)}
                            >
                                <Text style={[styles.tabText, activeTab === cat && styles.activeTabText]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Plans List */}
                <FlatList
                    data={PLANS_BY_CATEGORY[activeTab]}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPlanCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps="handled"
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FB',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 5,
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    placeholder: {
        width: 34,
    },
    tabsWrapper: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    tabsContent: {
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#F1F8FE',
    },
    activeTab: {
        backgroundColor: '#2196F3',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    planCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    planPrice: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    selectButton: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 15,
    },
    selectText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1976D2',
    },
    planDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FBFE',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    detailBox: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    detailSeparator: {
        width: 1,
        height: 20,
        backgroundColor: '#D1E3F5',
        marginHorizontal: 15,
    },
    benefitText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    }
});
