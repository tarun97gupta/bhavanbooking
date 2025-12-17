import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

dayjs.extend(customParseFormat);

const BookingSuccessScreen = ({ navigation, route }) => {
    const { booking, packageData } = route.params;
    const insets = useSafeAreaInsets();

    // Debug: Log the received booking data
    console.log('📦 BookingSuccessScreen received booking:', JSON.stringify(booking, null, 2));

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        try {
            // Try parsing DD-MM-YYYY format first
            let date = dayjs(dateString, 'DD-MM-YYYY', true);
            if (!date.isValid()) {
                // Fallback to ISO format
                date = dayjs(dateString);
            }
            return date.format('ddd, MMM D, YYYY');
        } catch (error) {
            return dateString;
        }
    };

    const handleViewBookings = () => {
        // Navigate to Bookings tab
        navigation.navigate('MainTabs', { screen: 'Bookings' });
    };

    const handleGoHome = () => {
        navigation.navigate('MainTabs', { screen: 'Home' });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xl }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Icon */}
                <View style={styles.successIcon}>
                    <View style={styles.successCircle}>
                        <Ionicons name="checkmark" size={64} color={colors.white} />
                    </View>
                </View>

                {/* Success Message */}
                <Text style={styles.successTitle}>Booking Successfully Done</Text>
                <Text style={styles.successSubtitle}>
                    Your booking has been confirmed and payment received successfully!
                </Text>

                {/* Booking Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.cardTitle}>Booking Details</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Booking ID</Text>
                        <Text style={styles.detailValue}>{booking.bookingReferenceId}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Package</Text>
                        <Text style={styles.detailValue}>
                            {packageData?.name?.replace(' Booking', '').replace(' Package', '') || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Check-in</Text>
                        <Text style={styles.detailValue}>{formatDateDisplay(booking.checkInDate)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Check-out</Text>
                        <Text style={styles.detailValue}>{formatDateDisplay(booking.checkOutDate)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Guest Name</Text>
                        <Text style={styles.detailValue}>{booking.guestDetails?.fullName || 'N/A'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Contact</Text>
                        <Text style={styles.detailValue}>{booking.guestDetails?.phoneNumber || 'N/A'}</Text>
                    </View>

                    <View style={styles.detailDivider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabelBold}>Total Amount Paid</Text>
                        <Text style={styles.detailValueBold}>
                            ₹{booking.finalAmount?.toLocaleString('en-IN') || '0'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.statusLabel}>Payment Status</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>✓ Paid</Text>
                        </View>
                    </View>
                </View>

                {/* Info Message */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                    <Text style={styles.infoText}>
                        A confirmation email has been sent to {booking.guestDetails?.email || 'your email'}
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleViewBookings}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>View Bookings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleGoHome}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryButtonText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },

    // Success Icon
    successIcon: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    successCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },

    // Success Message
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    successSubtitle: {
        fontSize: 15,
        color: colors.white,
        textAlign: 'center',
        opacity: 0.9,
        marginBottom: spacing.xl,
        lineHeight: 22,
    },

    // Details Card
    detailsCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        paddingVertical: spacing.xs,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    detailLabelBold: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '600',
        flex: 1,
    },
    detailValueBold: {
        fontSize: 18,
        color: colors.primary,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'right',
    },
    detailDivider: {
        height: 1,
        backgroundColor: '#E8E8E8',
        marginVertical: spacing.sm,
    },
    statusLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        flex: 1,
    },
    statusBadge: {
        backgroundColor: colors.success + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 13,
        color: colors.success,
        fontWeight: '600',
    },

    // Info Box
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 13,
        color: colors.white,
        marginLeft: spacing.sm,
        flex: 1,
        lineHeight: 18,
    },

    // Buttons
    buttonContainer: {
        gap: spacing.md,
    },
    primaryButton: {
        backgroundColor: colors.white,
        paddingVertical: spacing.md + 2,
        borderRadius: spacing.radiusMd,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: spacing.md + 2,
        borderRadius: spacing.radiusMd,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    secondaryButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default BookingSuccessScreen;