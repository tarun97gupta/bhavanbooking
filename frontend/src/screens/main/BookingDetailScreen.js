import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import packageService from '../../services/api/packages';
import * as storage from '../../utils/storage'; //

const BookingDetailScreen = ({ route, navigation }) => {
    const {
        packageId,
        packageName,
        checkInDate,
        checkOutDate,
        numberOfNights,
        pricing,
        roomQuantity, // ✅ Add roomQuantity param
    } = route.params;

    const insets = useSafeAreaInsets();

    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingUser, setLoadingUser] = useState(true); // ✅ Add this

    // Form state - Only 3 fields now ✅
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');

    // Validation state
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadPackageDetails();
        loadUserData(); // ✅ Add this
    }, [packageId]);

    const loadPackageDetails = async () => {
        try {
            setLoading(true);
            const result = await packageService.fetchPackageById(packageId);
            setPackageData(result.package);
            console.log('📦 Package loaded for booking:', result.package.name);
        } catch (error) {
            console.error('Error loading package:', error);
            Alert.alert('Error', 'Failed to load package details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    // ✅ Add this new function
    const loadUserData = async () => {
        try {
            setLoadingUser(true);
            const userData = await storage.getUser();

            if (userData) {
                // Pre-fill form with user data
                setFullName(userData.fullName || '');
                setPhoneNumber(userData.phoneNumber?.replace('+91', '') || '');
                setEmail(userData.email || '');
                console.log('✅ User data pre-filled:', userData.fullName);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            // Don't show error, just let user fill manually
        } finally {
            setLoadingUser(false);
        }
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';

        try {
            const ddMmYyyyPattern = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
            const ddMmYyyyMatch = dateString.match(ddMmYyyyPattern);

            if (ddMmYyyyMatch) {
                const [, day, month, year] = ddMmYyyyMatch;
                const parsedDate = dayjs(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
                return parsedDate.format('ddd, MMM D');
            } else if (dateString.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                return dayjs(dateString).format('ddd, MMM D');
            }

            return dayjs(dateString).format('ddd, MMM D');
        } catch (error) {
            return dateString;
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Full Name validation
        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (fullName.trim().length < 3) {
            newErrors.fullName = 'Name must be at least 3 characters';
        }

        // Phone Number validation
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!phoneRegex.test(phoneNumber)) {
            newErrors.phoneNumber = 'Enter valid 10-digit mobile number';
        }

        // Email validation (now required) ✅
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = 'Enter valid email address';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fill all required fields correctly');
            return;
        }

        // Navigate to confirmation screen
        navigation.navigate('BookingConfirmation', {
            packageId: packageData._id,
            packageName: packageData.name,
            packageData: packageData,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            numberOfNights: numberOfNights,
            pricing: pricing,
            roomQuantity: roomQuantity, // ✅ Pass roomQuantity for rooms_only
            userDetails: {
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                email: email.trim(),
            },
        });
    };

    const getTotalAmount = () => {
        return pricing?.finalAmount || pricing?.basePrice || 10000;
    };

    const getRoomsCount = () => {
        if (!packageData?.includes?.resources) return 0;
        return packageData.includes.resources
            .filter((r) => r.resource.facilityType === 'guest_room')
            .reduce((sum, r) => sum + r.quantity, 0);
    };

    const getPackageImage = () => {
        if (packageData?.images && packageData.images.length > 0) {
            return packageData.images[0];
        }
        return `https://placehold.co/400x200/0D34B7/FFFFFF?text=${packageData?.name?.split(' ').slice(0, 2).join('+')}`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading booking details...</Text>
            </View>
        );
    }

    if (!packageData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Package not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Booking Details</Text>
                    <Text style={styles.headerSubtitle}>
                        {formatDateDisplay(checkInDate)} - {formatDateDisplay(checkOutDate)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.notificationButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="notifications-outline" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Package Card */}
                <View style={styles.packageCard}>
                    <Image source={{ uri: getPackageImage() }} style={styles.packageImage} />
                    <View style={styles.packageInfo}>
                        <Text style={styles.packageName}>
                            {packageData.name.replace(' Booking', '').replace(' Package', '')}
                        </Text>
                        <Text style={styles.packageDescription}>
                            {packageData.shortDescription || packageData.description}
                        </Text>

                        {/* Booking Dates */}
                        <View style={styles.bookingInfoRow}>
                            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                            <Text style={styles.bookingInfoText}>
                                {formatDateDisplay(checkInDate)} - {formatDateDisplay(checkOutDate)}
                            </Text>
                        </View>

                        {/* Number of Nights */}
                        {numberOfNights > 0 && (
                            <View style={styles.bookingInfoRow}>
                                <Ionicons name="moon-outline" size={16} color={colors.primary} />
                                <Text style={styles.bookingInfoText}>
                                    {numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'}
                                </Text>
                            </View>
                        )}

                        {/* Rooms Included */}
                        {getRoomsCount() > 0 && (
                            <View style={styles.bookingInfoRow}>
                                <Ionicons name="bed-outline" size={16} color={colors.primary} />
                                <Text style={styles.bookingInfoText}>{getRoomsCount()} rooms included</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* User Details Form */}
                <View style={styles.formSection}>
                    <View style={styles.formHeader}>
                        <Text style={styles.sectionTitle}>Enter your Details</Text>
                        {loadingUser && (
                            <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: spacing.sm }} />
                        )}
                    </View>

                    {/* Full Name */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, errors.fullName && styles.inputError]}
                            placeholder="Enter your full name"
                            placeholderTextColor={colors.textSecondary}
                            value={fullName}
                            onChangeText={(text) => {
                                setFullName(text);
                                if (errors.fullName) setErrors({ ...errors, fullName: null });
                            }}
                            autoCapitalize="words"
                        />
                        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputContainer}>
                        <View style={styles.phoneInputWrapper}>
                            <Text style={styles.phonePrefix}>+91</Text>
                            <TextInput
                                style={[styles.phoneInput, errors.phoneNumber && styles.inputError]}
                                placeholder="Enter Whatsapp mobile no."
                                placeholderTextColor={colors.textSecondary}
                                value={phoneNumber}
                                onChangeText={(text) => {
                                    setPhoneNumber(text.replace(/[^0-9]/g, ''));
                                    if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: null });
                                }}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>
                        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                    </View>

                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="Enter your Email id"
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) setErrors({ ...errors, email: null });
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceValue}>₹ {getTotalAmount().toLocaleString('en-IN')}</Text>
                    <Text style={styles.priceLabel}>(total with taxes & fees)</Text>
                </View>
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 16,
        color: colors.textSecondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    backText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
    },

    // Header
    header: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.white,
        opacity: 0.9,
        marginTop: 2,
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },

    // Package Card
    packageCard: {
        backgroundColor: colors.white,
        flexDirection: 'row',
        padding: spacing.md,
        margin: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    packageImage: {
        width: 100,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#E8E8E8',
    },
    packageInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    packageName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    packageDescription: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        lineHeight: 18,
    },
    bookingInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    bookingInfoText: {
        fontSize: 13,
        color: colors.text,
        marginLeft: spacing.xs,
        fontWeight: '500',
    },

    // Form Section
    formSection: {
        backgroundColor: colors.white,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        padding: spacing.lg,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    input: {
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: 15,
        color: colors.text,
    },
    inputError: {
        borderColor: colors.error,
    },
    phoneInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 8,
        paddingHorizontal: spacing.md,
    },
    phonePrefix: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '500',
        marginRight: spacing.sm,
    },
    phoneInput: {
        flex: 1,
        paddingVertical: spacing.md,
        fontSize: 15,
        color: colors.text,
        backgroundColor: 'transparent',
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },

    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    priceContainer: {
        flex: 1,
    },
    priceValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    priceLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
    },
    continueButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl + spacing.lg,
        paddingVertical: spacing.md + 2,
        borderRadius: spacing.radiusMd,
        marginLeft: spacing.md,
    },
    continueButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default BookingDetailScreen;