import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import packageService from '../../services/api/packages';
import bookingService from '../../services/api/bookings';
import BookingDetailScreen from '../main/BookingDetailScreen';


const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width;
const IMAGE_HEIGHT = 200;


const PackageDetailScreen = ({ route, navigation }) => {
    const { packageId, checkInDate, checkOutDate, numberOfNights } = route.params;
    const initialRoomQuantity = route.params.roomQuantity || 1; // ✅ Get from route params
    const insets = useSafeAreaInsets();

    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [availability, setAvailability] = useState(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [roomQuantity, setRoomQuantity] = useState(initialRoomQuantity); // ✅ Initialize with param
    const [showEditModal, setShowEditModal] = useState(false); // ✅ Add edit modal state
    
    // Edit modal states
    const [editCheckInDate, setEditCheckInDate] = useState(null);
    const [editCheckOutDate, setEditCheckOutDate] = useState(null);
    const [editRoomQuantity, setEditRoomQuantity] = useState(initialRoomQuantity);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [markedDates, setMarkedDates] = useState({});
    
    const flatListRef = useRef(null);

    useEffect(() => {
        loadPackageDetails();
    }, [packageId]);

    // Check availability after package data is loaded
    useEffect(() => {
        if (packageData && checkInDate && checkOutDate) {
            checkPackageAvailability();
        }
    }, [packageData]);

    // Re-check availability when room quantity changes (for rooms_only)
    useEffect(() => {
        if (packageData?.category === 'rooms_only' && checkInDate && checkOutDate) {
            checkPackageAvailability();
        }
    }, [roomQuantity]);

    const loadPackageDetails = async () => {
        try {
            setLoading(true);
            const result = await packageService.fetchPackageById(packageId);
            setPackageData(result.package);
            console.log('📦 Package loaded:', result.package.name);
        } catch (error) {
            console.error('Error loading package:', error);
            Alert.alert('Error', error.message || 'Failed to load package details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const checkPackageAvailability = async () => {
        if (!checkInDate || !checkOutDate) return;

        try {
            setCheckingAvailability(true);
            
            // Check if package is rooms_only and pass roomQuantity
            const isRoomsOnly = packageData?.category === 'rooms_only';
            
            console.log('🔍 Checking availability:', {
                packageId,
                checkInDate: formatDateForAPI(checkInDate),
                checkOutDate: formatDateForAPI(checkOutDate),
                isRoomsOnly,
                roomQuantity,
                willPassToAPI: isRoomsOnly ? roomQuantity : null
            });
            
            const result = await bookingService.checkAvailability(
                packageId,
                formatDateForAPI(checkInDate),
                formatDateForAPI(checkOutDate),
                isRoomsOnly ? roomQuantity : null
            );
            setAvailability(result.data);
            console.log('✅ Availability checked:', result.available);
        } catch (error) {
            console.error('Error checking availability:', error);
            Alert.alert('Availability Check Failed', error.message);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const formatDateForAPI = (dateString) => {
        // If already in DD-MM-YYYY format, return as is
        if (dateString.includes('-') && dateString.split('-')[0].length <= 2) {
            return dateString;
        }
        // If in YYYY-MM-DD format, convert to DD-MM-YYYY
        return dayjs(dateString).format('DD-MM-YYYY');
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        // Handle both YYYY-MM-DD and DD-MM-YYYY formats
        if (dateString.includes('-')) {
            const parts = dateString.split('-');
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                return dayjs(dateString).format('ddd, MMM D');
            } else {
                // DD-MM-YYYY
                return dayjs(dateString, 'DD-MM-YYYY').format('ddd, MMM D');
            }
        }
        return dateString;
    };

    const handleImageScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / IMAGE_WIDTH);
        setCurrentImageIndex(index);
    };

    const handleContinue = () => {
        if (!checkInDate || !checkOutDate) {
            Alert.alert('Dates Required', 'Please select check-in and check-out dates from the home screen.');
            return;
        }

        if (availability && !availability.available) {
            Alert.alert('Not Available', 'This package is not available for the selected dates.');
            return;
        }

        // Check if package is rooms_only
        const isRoomsOnly = packageData?.category === 'rooms_only';

        // Navigate to booking details screen ✅ Updated
        navigation.navigate('BookingDetails', {
            packageId: packageData._id,
            packageName: packageData.name,
            checkInDate: formatDateForAPI(checkInDate),
            checkOutDate: formatDateForAPI(checkOutDate),
            numberOfNights: numberOfNights || calculateNights(),
            pricing: availability?.pricing || packageData.pricing,
            roomQuantity: isRoomsOnly ? roomQuantity : null, // ✅ Pass roomQuantity for rooms_only
        });
    };

    const calculateNights = () => {
        if (!checkInDate || !checkOutDate) return 0;
        const start = dayjs(checkInDate);
        const end = dayjs(checkOutDate);
        return end.diff(start, 'day');
    };

    const getEstimatedTotal = () => {
        if (availability?.pricing?.finalAmount) {
            return availability.pricing.finalAmount;
        }
        if (packageData?.pricing?.basePrice && numberOfNights) {
            const base = packageData.pricing.basePrice * (numberOfNights || 1);
            const gst = base * (packageData.pricing.gstPercentage / 100);
            return Math.round(base + gst);
        }
        return packageData?.pricing?.basePrice || 0;
    };

    // Handle opening edit modal
    const handleOpenEditModal = () => {
        // Initialize edit states with current values
        setEditCheckInDate(checkInDate);
        setEditCheckOutDate(checkOutDate);
        setEditRoomQuantity(roomQuantity);
        
        // Initialize marked dates if dates exist
        if (checkInDate && checkOutDate) {
            const range = getDateRange(checkInDate, checkOutDate);
            setMarkedDates(range);
        }
        
        setShowEditModal(true);
    };

    // Handle date selection in edit modal
    const handleDayPress = (day) => {
        const selectedDate = day.dateString;

        if (!editCheckInDate || (editCheckInDate && editCheckOutDate)) {
            // First selection or reset
            setEditCheckInDate(selectedDate);
            setEditCheckOutDate(null);
            setMarkedDates({
                [selectedDate]: {
                    startingDay: true,
                    color: colors.primary,
                    textColor: colors.white,
                },
            });
        } else if (editCheckInDate && !editCheckOutDate) {
            // Second selection
            if (dayjs(selectedDate).isBefore(dayjs(editCheckInDate))) {
                // Reset if selected date is before check-in
                setEditCheckInDate(selectedDate);
                setEditCheckOutDate(null);
                setMarkedDates({
                    [selectedDate]: {
                        startingDay: true,
                        color: colors.primary,
                        textColor: colors.white,
                    },
                });
            } else {
                // Valid check-out date
                setEditCheckOutDate(selectedDate);
                const range = getDateRange(editCheckInDate, selectedDate);
                setMarkedDates(range);
            }
        }
    };

    // Get date range for marking calendar
    const getDateRange = (start, end) => {
        const range = {};
        let currentDate = dayjs(start);
        const endDate = dayjs(end);

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
            const dateString = currentDate.format('YYYY-MM-DD');

            if (dateString === dayjs(start).format('YYYY-MM-DD')) {
                range[dateString] = {
                    startingDay: true,
                    color: colors.primary,
                    textColor: colors.white,
                };
            } else if (dateString === dayjs(end).format('YYYY-MM-DD')) {
                range[dateString] = {
                    endingDay: true,
                    color: colors.primary,
                    textColor: colors.white,
                };
            } else {
                range[dateString] = {
                    color: colors.primaryLight || '#E8EEFB',
                    textColor: colors.text,
                };
            }

            currentDate = currentDate.add(1, 'day');
        }

        return range;
    };

    // Apply changes from edit modal
    const handleApplyChanges = () => {
        if (!editCheckInDate || !editCheckOutDate) {
            Alert.alert('Incomplete Selection', 'Please select both check-in and check-out dates');
            return;
        }

        // Update the main state with edited values
        // Since we can't directly update route params, we'll navigate back with new params
        navigation.replace('PackageDetail', {
            packageId: packageData._id,
            checkInDate: editCheckInDate,
            checkOutDate: editCheckOutDate,
            numberOfNights: dayjs(editCheckOutDate).diff(dayjs(editCheckInDate), 'day'),
            roomQuantity: packageData.category === 'rooms_only' ? editRoomQuantity : null,
        });
        
        setShowEditModal(false);
    };

    const images = (packageData?.images && packageData.images.length) > 0
        ? packageData.images
        : [`https://placehold.co/400x200/0D34B7/FFFFFF?text=${packageData?.name?.split(' ').slice(0, 2).join('+')}`];


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading package details...</Text>
            </View>
        );
    }

    if (!packageData) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
                <Text style={styles.errorText}>Package not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.headerCenter}
                    onPress={handleOpenEditModal}
                    activeOpacity={0.7}
                >
                    <Text style={styles.headerTitle}>{packageData.name.replace(' Booking', '').replace(' Package', '')}</Text>
                    {checkInDate && checkOutDate && (
                        <View style={styles.headerSubtitleRow}>
                            <Text style={styles.headerSubtitle}>
                                {formatDateDisplay(checkInDate)} - {formatDateDisplay(checkOutDate)}
                            </Text>
                            {packageData.category === 'rooms_only' && (
                                <Text style={styles.headerSubtitle}> • {roomQuantity} Room{roomQuantity > 1 ? 's' : ''}</Text>
                            )}
                        </View>
                    )}
                    <Ionicons name="pencil" size={14} color={colors.white} style={{ marginTop: 2 }} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.headerButton}
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
                {/* Image Carousel */}
                <View style={styles.imageCarouselContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleImageScroll}
                        scrollEventThrottle={16}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={styles.carouselImage} />
                        )}
                    />

                    {/* Pagination Dots */}
                    <View style={styles.paginationContainer}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    currentImageIndex === index && styles.paginationDotActive,
                                ]}
                            />
                        ))}
                        {images.length > 1 && (
                            <View style={styles.paginationCount}>
                                <Text style={styles.paginationCountText}>
                                    {currentImageIndex + 1}/{images.length}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Content Container */}
                <View style={styles.contentContainer}>
                    {/* Package Info */}
                    <View style={styles.section}>
                        <Text style={styles.packageName}>{packageData.name.replace(' Booking', '').replace(' Package', '')}</Text>
                        <Text style={styles.packageDescription}>{packageData.description}</Text>

                        {/* Address (if available) */}
                        <View style={styles.addressContainer}>
                            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                            <Text style={styles.addressText}>
                                14-1-378, Darus Salam, Aghapura, Hyderabad, Telangana 500006
                            </Text>
                        </View>
                    </View>

                    {/* Details & Amenities */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Details & Amenities</Text>

                        <View style={styles.amenitiesGrid}>
                            {/* Capacity */}
                            {packageData.includes?.resources?.some(r => r.resource.capacity) && (
                                <View style={styles.amenityItem}>
                                    <Ionicons name="people-outline" size={20} color={colors.text} />
                                    <Text style={styles.amenityText}>
                                        {packageData.includes.resources.reduce((max, r) =>
                                            Math.max(max, r.resource.capacity || 0), 0)} people
                                    </Text>
                                </View>
                            )}

                            {/* Stage available (for halls) */}
                            {packageData.category.includes('hall') && (
                                <View style={styles.amenityItem}>
                                    <Ionicons name="easel-outline" size={20} color={colors.text} />
                                    <Text style={styles.amenityText}>Stage available</Text>
                                </View>
                            )}

                            {/* Chairs */}
                            {packageData.category.includes('hall') && (
                                <View style={styles.amenityItem}>
                                    <Ionicons name="square-outline" size={20} color={colors.text} />
                                    <Text style={styles.amenityText}>200 chairs</Text>
                                </View>
                            )}

                            {/* AC Available */}
                            <View style={styles.amenityItem}>
                                <Ionicons name="snow-outline" size={20} color={colors.text} />
                                <Text style={styles.amenityText}>AC Available</Text>
                            </View>

                            {/* Area */}
                            {packageData.category.includes('hall') && (
                                <View style={styles.amenityItem}>
                                    <Ionicons name="expand-outline" size={20} color={colors.text} />
                                    <Text style={styles.amenityText}>1000sq.ft</Text>
                                </View>
                            )}

                            {/* Rooms */}
                            {packageData.includes?.resources?.filter(r => r.resource.facilityType === 'guest_room').length > 0 && (
                                <View style={styles.amenityItem}>
                                    <Ionicons name="bed-outline" size={20} color={colors.text} />
                                    <Text style={styles.amenityText}>
                                        {packageData.includes.resources.filter(r => r.resource.facilityType === 'guest_room')
                                            .reduce((sum, r) => sum + r.quantity, 0)} rooms available
                                    </Text>
                                </View>
                            )}

                            {/* Parking */}
                            <View style={styles.amenityItem}>
                                <Ionicons name="car-outline" size={20} color={colors.text} />
                                <Text style={styles.amenityText}>Parking Available</Text>
                            </View>

                            {/* Kitchen */}
                            {packageData.includes?.dining && (
                                <View style={styles.amenityItem}>
                                    <Ionicons name="restaurant-outline" size={20} color={colors.text} />
                                    <Text style={styles.amenityText}>Kitchen Available</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Rules and Regulations */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Rules and Regulations</Text>

                        {packageData.termsAndConditions && packageData.termsAndConditions.length > 0 ? (
                            packageData.termsAndConditions.map((rule, index) => (
                                <View key={index} style={styles.ruleItem}>
                                    <Ionicons name="checkmark-outline" size={18} color={colors.textSecondary} />
                                    <Text style={styles.ruleText}>{rule}</Text>
                                </View>
                            ))
                        ) : (
                            <>
                                <View style={styles.ruleItem}>
                                    <Ionicons name="close-outline" size={18} color={colors.error} />
                                    <Text style={styles.ruleText}>Alcohol consumption NOT allowed</Text>
                                </View>
                                <View style={styles.ruleItem}>
                                    <Ionicons name="checkmark-outline" size={18} color={colors.textSecondary} />
                                    <Text style={styles.ruleText}>ID proof required for check-in</Text>
                                </View>
                                <View style={styles.ruleItem}>
                                    <Ionicons name="checkmark-outline" size={18} color={colors.textSecondary} />
                                    <Text style={styles.ruleText}>Advance payment required</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Cancellation Policy */}
                    {packageData.bookingRules?.cancellationPolicy && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Cancellation Policy</Text>
                            <Text style={styles.policyText}>{packageData.bookingRules.cancellationPolicy}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Sticky Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Estimated Total</Text>
                    <Text style={styles.priceValue}>₹ {getEstimatedTotal().toLocaleString('en-IN')}</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        checkingAvailability && styles.continueButtonDisabled
                    ]}
                    onPress={handleContinue}
                    disabled={checkingAvailability}
                    activeOpacity={0.8}
                >
                    {checkingAvailability ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <Text style={styles.continueButtonText}>Continue</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Edit Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.editModalContent}>
                        <View style={styles.editModalHeader}>
                            <Text style={styles.editModalTitle}>Edit Booking Details</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.editModalBody} showsVerticalScrollIndicator={false}>
                            {/* Category Display (Read-only) */}
                            <View style={styles.editSection}>
                                <Text style={styles.editLabel}>Package</Text>
                                <View style={styles.editReadOnly}>
                                    <Text style={styles.editValue}>
                                        {packageData?.name}
                                    </Text>
                                    <Text style={styles.editHint}>Go back to home to change package</Text>
                                </View>
                            </View>

                            {/* Dates Selector (Editable) */}
                            <View style={styles.editSection}>
                                <Text style={styles.editLabel}>Select Dates</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePicker(!showDatePicker)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                    <Text style={styles.dateButtonText}>
                                        {editCheckInDate && editCheckOutDate
                                            ? `${formatDateDisplay(editCheckInDate)} - ${formatDateDisplay(editCheckOutDate)}`
                                            : 'Tap to select dates'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>

                                {/* Calendar */}
                                {showDatePicker && (
                                    <View style={styles.calendarContainer}>
                                        <Calendar
                                            minDate={dayjs().format('YYYY-MM-DD')}
                                            onDayPress={handleDayPress}
                                            markingType={'period'}
                                            markedDates={markedDates}
                                            theme={{
                                                selectedDayBackgroundColor: colors.primary,
                                                todayTextColor: colors.primary,
                                                arrowColor: colors.primary,
                                            }}
                                        />
                                        {editCheckInDate && editCheckOutDate && (
                                            <Text style={styles.nightsInfo}>
                                                {dayjs(editCheckOutDate).diff(dayjs(editCheckInDate), 'day')} night(s) selected
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </View>

                            {/* Room Quantity (Editable for rooms_only) */}
                            {packageData?.category === 'rooms_only' && (
                                <View style={styles.editSection}>
                                    <Text style={styles.editLabel}>Number of Rooms</Text>
                                    <View style={styles.roomQuantityControls}>
                                        <TouchableOpacity
                                            style={[styles.quantityButton, editRoomQuantity === 1 && styles.quantityButtonDisabled]}
                                            onPress={() => setEditRoomQuantity(Math.max(1, editRoomQuantity - 1))}
                                            disabled={editRoomQuantity === 1}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="remove" size={24} color={editRoomQuantity === 1 ? colors.textSecondary : colors.primary} />
                                        </TouchableOpacity>
                                        
                                        <View style={styles.quantityDisplay}>
                                            <Text style={styles.quantityNumber}>{editRoomQuantity}</Text>
                                            <Text style={styles.quantityLabel}>{editRoomQuantity === 1 ? 'Room' : 'Rooms'}</Text>
                                        </View>
                                        
                                        <TouchableOpacity
                                            style={[
                                                styles.quantityButton,
                                                packageData.includes?.resources?.[0]?.resource?.totalUnits &&
                                                editRoomQuantity >= packageData.includes.resources[0].resource.totalUnits &&
                                                styles.quantityButtonDisabled
                                            ]}
                                            onPress={() => {
                                                const maxRooms = packageData.includes?.resources?.[0]?.resource?.totalUnits || 10;
                                                if (editRoomQuantity < maxRooms) {
                                                    setEditRoomQuantity(editRoomQuantity + 1);
                                                } else {
                                                    Alert.alert('Maximum Reached', `Only ${maxRooms} rooms available`);
                                                }
                                            }}
                                            disabled={packageData.includes?.resources?.[0]?.resource?.totalUnits && editRoomQuantity >= packageData.includes.resources[0].resource.totalUnits}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons
                                                name="add"
                                                size={24}
                                                color={
                                                    packageData.includes?.resources?.[0]?.resource?.totalUnits &&
                                                    editRoomQuantity >= packageData.includes.resources[0].resource.totalUnits
                                                        ? colors.textSecondary
                                                        : colors.primary
                                                }
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.quantityHint}>
                                        {packageData.includes?.resources?.[0]?.resource?.totalUnits
                                            ? `Maximum ${packageData.includes.resources[0].resource.totalUnits} rooms available`
                                            : 'Select the number of rooms you need'}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.editModalFooter}>
                            <TouchableOpacity
                                style={styles.editModalButton}
                                onPress={handleApplyChanges}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.editModalButtonText}>Apply Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
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
        paddingHorizontal: spacing.xl,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },
    backButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: spacing.radiusMd,
    },
    backButtonText: {
        color: colors.white,
        fontSize: 16,
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
    headerButton: {
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
    headerSubtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Edit Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    editModalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    editModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    editModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    editModalBody: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    editSection: {
        marginBottom: spacing.lg,
    },
    editLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    editReadOnly: {
        backgroundColor: '#F9FAFB',
        padding: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    editValue: {
        fontSize: 15,
        color: colors.text,
        marginBottom: 4,
    },
    editHint: {
        fontSize: 12,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    editModalFooter: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    editModalButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    editModalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.white,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    dateButtonText: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    calendarContainer: {
        marginTop: spacing.md,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    nightsInfo: {
        textAlign: 'center',
        padding: spacing.sm,
        fontSize: 13,
        color: colors.primary,
        fontWeight: '600',
        backgroundColor: colors.primaryLight,
    },
    roomQuantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: spacing.md,
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },

    // Image Carousel
    imageCarouselContainer: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        position: 'relative',
    },
    carouselImage: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        resizeMode: 'cover',
    },
    paginationContainer: {
        position: 'absolute',
        bottom: spacing.md,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: colors.white,
        width: 24,
    },
    paginationCount: {
        position: 'absolute',
        right: spacing.md,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    paginationCountText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },

    // Content
    contentContainer: {
        backgroundColor: colors.white,
    },
    section: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    // Package Info
    packageName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    packageDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    addressText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
        flex: 1,
        lineHeight: 18,
    },

    // Section Title
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
    },

    // Room Quantity Selector
    roomQuantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    quantityButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    quantityButtonDisabled: {
        borderColor: '#D1D5DB',
        backgroundColor: '#F0F0F0',
    },
    quantityDisplay: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing.xl,
        minWidth: 80,
    },
    quantityNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    quantityLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    quantityHint: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },

    // Amenities Grid
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing.xs,
    },
    amenityItem: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.sm,
    },
    amenityText: {
        fontSize: 14,
        color: colors.text,
        marginLeft: spacing.sm,
        flex: 1,
    },

    // Rules
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    ruleText: {
        fontSize: 14,
        color: colors.text,
        marginLeft: spacing.sm,
        flex: 1,
        lineHeight: 20,
    },

    // Policy
    policyText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',

        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,

        // Shadow for Android
        elevation: 8,
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    priceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    continueButton: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.xl + spacing.md,
        paddingVertical: spacing.md + 2,
        borderRadius: spacing.radiusMd,
        marginLeft: spacing.md,
    },
    continueButtonDisabled: {
        opacity: 0.6,
    },
    continueButtonText: {
        color: colors.black,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PackageDetailScreen;