import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function MoreServicesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ✅ NEW: Add Bills Section */}
          <View style={styles.addBillsCard}>
            <View style={styles.addBillsContent}>
              <Text style={styles.addBillsTitle}>
                Add all bills in <Text style={styles.addBillsHighlight}>one click</Text>
              </Text>
              <Text style={styles.addBillsSubtitle}>
                Get reminders for all upcoming bills and never miss a due
              </Text>
              <TouchableOpacity
                style={styles.addNowButton}
                onPress={() => router.push('/add-all-bills')}>
                <Text style={styles.addNowButtonText}>Add now</Text>
              </TouchableOpacity>
              <Text style={styles.addBillsFootnote}>*Device SMS will be used</Text>
            </View>
            <View style={styles.addBillsIcon}>
              <View style={styles.billIconCircle}>
                <Ionicons name="document-text-outline" size={40} color="#2196F3" />
              </View>
            </View>
          </View>

          {/* ✅ NEW: My Bills Section */}
          <TouchableOpacity style={styles.myBillsCard}>
            <Text style={styles.myBillsText}>My bills</Text>
            <Ionicons name="chevron-forward" size={24} color="#1A1A1A" />
          </TouchableOpacity>

          {/* Suggested Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Suggested</Text>
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Popular</Text>
              </View>
            </View>

            <View style={styles.servicesGrid}>
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/electricity-bill')}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="bulb-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Electricity{'\n'}bill</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/credit-card-bill')}>
                <View style={styles.iconCircle}>
                  <Ionicons name="card-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Credit{'\n'}card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/fastag-recharge')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="highway" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>FASTag{'\n'}recharge</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/mobile-recharge')}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="phone-portrait-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Mobile{'\n'}recharge</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Telecom & Travel Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Telecom & travel</Text>

            <View style={styles.servicesGrid}>
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/mobile-recharge')}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="phone-portrait-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Mobile{'\n'}recharge</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/fastag-recharge')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="highway" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>FASTag{'\n'}recharge</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/mobile-postpaid')}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="phone-portrait" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Mobile{'\n'}postpaid</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/dth-recharge')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="satellite-variant" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>DTH{'\n'}recharge</Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>New</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/broadband-bill')}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="wifi-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Broadband{'\n'}bill</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceCard}
                onPress={() => router.push('/landline-bill')}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="phone-classic" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Landline{'\n'}bill</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceCard}
                onPress={() => router.push('/cable-tv')}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="television" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Cable{'\n'}TV</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* Finance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Finance</Text>
              {/* ✅ CHANGED: Yellow badge */}
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Popular</Text>
              </View>
            </View>

            <View style={styles.servicesGrid}>
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/credit-card-bill')}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="card-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Credit{'\n'}card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/loan-repayment')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="cash-multiple" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Loan{'\n'}repayment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/lic-insurance-payment')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="shield-check-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>LIC /{'\n'}insurance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/recurring-deposit-payment')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="calendar-clock" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Recurring{'\n'}deposit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Utilities Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Utilities</Text>

            <View style={styles.servicesGrid}>
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/electricity-bill')}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="bulb-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Electricity{'\n'}bill</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/lpg-cylinder')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="gas-cylinder" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>LPG{'\n'}cylinder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/water-bill-payment')}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="water-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Water{'\n'}bill</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/piped-gas-payment')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="pipe" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Piped{'\n'}gas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/municipal-services')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="office-building" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Municipal{'\n'}services</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/municipal-taxes')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="home-city-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Municipal{'\n'}taxes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceCard}
                onPress={() => router.push('/housing-apartment-services')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="home-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Housing /{'\n'}apartment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push('/clubs-associations')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="account-group-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Clubs &{'\n'}association</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* More Services Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>More services</Text>

            <View style={styles.servicesGrid}>
              <TouchableOpacity style={styles.serviceCard}
                onPress={() => router.push('/education-fees')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="school-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Education{'\n'}fees</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceCard}
                onPress={() => router.push('/charitable-donation')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="hand-heart-outline" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Charitable{'\n'}donation</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceCard}
                onPress={() => router.push('/ott-subscriptions')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="television-play" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>OTT &{'\n'}subscriptions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceCard}
                onPress={() => router.push('/hospital-pathology')}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="hospital-building" size={30} color="#0D47A1" />
                </View>
                <Text style={styles.serviceText}>Hospital &{'\n'}pathology</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Bill payments secured by</Text>
            <Text style={styles.footerBrand}>BharatConnect</Text>
          </View>
        </ScrollView>

        {/* Floating back button */}
        <TouchableOpacity
          style={styles.floatingBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999,
  },

  // ✅ NEW: Add Bills Card Styles
  addBillsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 100, // Space for back button
    marginBottom: 15,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  addBillsContent: {
    flex: 1,
    paddingRight: 10,
  },
  addBillsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  addBillsHighlight: {
    color: '#4CAF50', // Green color for "one click"
  },
  addBillsSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 15,
  },
  addNowButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  addNowButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  addBillsFootnote: {
    fontSize: 10,
    color: '#999',
  },
  addBillsIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  billIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F8FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ✅ NEW: My Bills Card Styles
  myBillsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  myBillsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  // ✅ CHANGED: Yellow badge instead of cream
  popularBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  serviceCard: {
    width: '22.5%',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 32.5,
    backgroundColor: '#F1F8FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  serviceText: {
    fontSize: 10,
    color: '#1A1A1A',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 13,
  },
  // ✅ CHANGED: Yellow "New" badge
  newBadge: {
    position: 'absolute',
    top: 0,
    right: 5,
    backgroundColor: '#4CAF50', // Green for "New" badge
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 5,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  footerBrand: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
});