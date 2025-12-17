import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator, // ✅ Add this
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import packageService from '../services/api/packages'; // ✅ Add this

const { width } = Dimensions.get('window');


const BookingWidget = ({ onCheckAvailability }) => {
  // State management
  const [packages, setPackages] = useState([]); // ✅ Add this
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [numberOfNights, setNumberOfNights] = useState(0);
  const [roomQuantity, setRoomQuantity] = useState(1); // ✅ Add room quantity state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  // Calculate number of nights when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const nights = dayjs(checkOutDate).diff(dayjs(checkInDate), 'day');
      setNumberOfNights(nights);
    }
  }, [checkInDate, checkOutDate]);

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoadingPackages(true);
      const result = await packageService.fetchPackages();

      // Transform packages to match dropdown format
      const formattedPackages = result.packages.map((pkg) => ({
        id: pkg._id,
        name: pkg.name,
        category: pkg.category,
        icon: getCategoryIcon(pkg.category),
        basePrice: pkg.pricing.basePrice,
        packageData: pkg // Store full package data
      }));

      setPackages(formattedPackages);
      console.log('✅ Packages loaded:', formattedPackages.length);
    } catch (error) {
      console.error('Error fetching packages:', error);
      Alert.alert('Error', 'Failed to load booking categories. Please try again.');
    } finally {
      setLoadingPackages(false);
    }
  };

  // Helper to get icon based on category
  const getCategoryIcon = (category) => {
    const icons = {
      full_venue: '🏢',
      function_hall_dining: '🍽️',
      function_hall_only: '🎪',
      rooms_dining_mini_hall: '🛏️',
      rooms_mini_hall: '🏨',
      mini_hall: '🏛️',
      rooms_only: '🛏️'
    };
    return icons[category] || '🏨';
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
    // Reset room quantity when changing category
    setRoomQuantity(1);
  };

  // Handle date selection in calendar
  const handleDayPress = (day) => {
    const selectedDate = day.dateString;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // First selection or reset selection
      setCheckInDate(selectedDate);
      setCheckOutDate(null);
      setMarkedDates({
        [selectedDate]: {
          startingDay: true,
          color: colors.primary,
          textColor: colors.white,
        },
      });
    } else if (checkInDate && !checkOutDate) {
      // Second selection
      if (dayjs(selectedDate).isBefore(dayjs(checkInDate))) {
        // If selected date is before check-in, reset
        setCheckInDate(selectedDate);
        setCheckOutDate(null);
        setMarkedDates({
          [selectedDate]: {
            startingDay: true,
            color: colors.primary,
            textColor: colors.white,
          },
        });
      } else {
        // Valid check-out date
        setCheckOutDate(selectedDate);
        // Mark range
        const range = getDateRange(checkInDate, selectedDate);
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

      if (dateString === start) {
        range[dateString] = {
          startingDay: true,
          color: colors.primary,
          textColor: colors.white,
        };
      } else if (dateString === end) {
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

  // Confirm date selection
  const handleConfirmDates = () => {
    if (checkInDate && checkOutDate) {
      setShowDateModal(false);
    } else {
      Alert.alert('Incomplete Selection', 'Please select both check-in and check-out dates');
    }
  };

  // Handle Check Availability
  const handleCheckAvailability = () => {
    if (!selectedCategory || !checkInDate || !checkOutDate) {
      Alert.alert('Incomplete Selection', 'Please select a category and dates.');
      return;
    }

    // ✅ Validate room quantity for rooms_only packages
    if (selectedCategory.category === 'rooms_only' && (!roomQuantity || roomQuantity < 1)) {
      Alert.alert('Room Quantity Required', 'Please select the number of rooms.');
      return;
    }

    console.log('🔍 Checking availability for:', selectedCategory.name);

    // Call parent callback
    if (onCheckAvailability) {
      onCheckAvailability({
        category: selectedCategory,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfNights: numberOfNights,
        roomQuantity: selectedCategory.category === 'rooms_only' ? roomQuantity : null, // ✅ Add roomQuantity
      });
    }
  };
  
  // Check if selected category is rooms_only
  const isRoomsOnly = selectedCategory?.category === 'rooms_only';

  // Format date for display
  const formatDate = (dateString) => {
    return dayjs(dateString).format('ddd, MMM D');
  };

  // Get minimum date (today)
  const minDate = dayjs().format('YYYY-MM-DD');

  return (
    <View style={styles.container}>
      {loadingPackages && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      )}
      
      {/* Category Selector */}
      <View>
        <TouchableOpacity
          style={[
            styles.categorySelector,
            showCategoryDropdown && styles.categorySelectorActive
          ]}
          onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          activeOpacity={0.7}
        >
          <View style={styles.categoryLeft}>
            <Ionicons 
              name="list" 
              size={20} 
              color={colors.textSecondary} 
              style={styles.categoryIcon} 
            />
            <View style={styles.categoryTextContainer}>
              <Text style={selectedCategory ? styles.categoryValue : styles.categoryPlaceholder}>
                {selectedCategory ? selectedCategory.name : 'Select Categories'}
              </Text>
            </View>
          </View>
          <Ionicons
            name={showCategoryDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Inline Dropdown List */}
        {showCategoryDropdown && (
          <View style={styles.categoryDropdown}>
            <ScrollView style={styles.categoryScrollView}>
              {packages.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory?.id === category.id && styles.categoryOptionSelected,
                    index === packages.length - 1 && styles.categoryOptionLast
                  ]}
                  onPress={() => handleCategorySelect(category)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                  <View style={styles.categoryOptionTextContainer}>
                    <Text style={[
                      styles.categoryOptionName,
                      selectedCategory?.id === category.id && styles.categoryOptionNameSelected,
                    ]}>
                      {category.name}
                    </Text>
                    {category.basePrice > 0 && (
                      <Text style={styles.categoryOptionPrice}>
                        ₹{category.basePrice.toLocaleString('en-IN')}/day
                      </Text>
                    )}
                  </View>
                  {selectedCategory?.id === category.id && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Date Selector */}
      <TouchableOpacity
        style={[
          styles.dateSelector,
          showDateModal && styles.dateSelectorActive
        ]}
        onPress={() => setShowDateModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.dateLeft}>
          <View style={styles.dateIconContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color={colors.textSecondary} 
            />
          </View>
          <View style={styles.dateTextContainer}>
            <Text style={checkInDate && checkOutDate ? styles.dateValue : styles.datePlaceholder}>
              {checkInDate && checkOutDate
                ? `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`
                : 'Select Dates'}
            </Text>
          </View>
        </View>
        {checkInDate && checkOutDate && numberOfNights > 0 && (
          <Text style={styles.nightsText}>{numberOfNights} night{numberOfNights > 1 ? 's' : ''}</Text>
        )}
      </TouchableOpacity>

      {/* Room Quantity Selector - Only for rooms_only */}
      {isRoomsOnly && (
        <View style={styles.roomQuantityContainer}>
          <View style={styles.roomQuantityLeft}>
            <Ionicons name="bed-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.roomQuantityLabel}>Number of Rooms</Text>
          </View>
          <View style={styles.roomQuantityControls}>
            <TouchableOpacity
              style={[styles.quantityBtn, roomQuantity === 1 && styles.quantityBtnDisabled]}
              onPress={() => setRoomQuantity(Math.max(1, roomQuantity - 1))}
              disabled={roomQuantity === 1}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={18} color={roomQuantity === 1 ? colors.textSecondary : colors.primary} />
            </TouchableOpacity>
            <Text style={styles.roomQuantityValue}>{roomQuantity}</Text>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => setRoomQuantity(roomQuantity + 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Check Availability Button */}
      <TouchableOpacity
        style={[
          styles.checkButton,
          (!selectedCategory || !checkInDate || !checkOutDate) && styles.checkButtonDisabled,
        ]}
        onPress={handleCheckAvailability}
        disabled={!selectedCategory || !checkInDate || !checkOutDate}
      >
        <Text style={[
          styles.checkButtonText,
          (!selectedCategory || !checkInDate || !checkOutDate) && styles.checkButtonTextDisabled
        ]}>
          Check Availability
        </Text>
      </TouchableOpacity>

      {/* Date Selection Modal */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Dates</Text>
              <TouchableOpacity
                onPress={() => setShowDateModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <Calendar
              minDate={minDate}
              onDayPress={handleDayPress}
              markingType="period"
              markedDates={markedDates}
              theme={{
                todayTextColor: colors.primary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.white,
                arrowColor: colors.primary,
                monthTextColor: colors.text,
                textMonthFontWeight: 'bold',
                textDayFontSize: 14,
                textMonthFontSize: 16,
              }}
            />

            {/* Confirm Button */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  (!checkInDate || !checkOutDate) && styles.checkButtonDisabled,
                ]}
                onPress={handleConfirmDates}
                disabled={!checkInDate || !checkOutDate}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmButtonText}>Confirm Dates</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,

    // Shadow for Android
    elevation: 4,
  },

  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // ==================== SELECT CATEGORIES ====================

  // Category Dropdown (Collapsed)
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: spacing.sm,
  },
  categorySelectorActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: spacing.sm,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  categoryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  categoryPlaceholder: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  dropdownIcon: {
    marginLeft: spacing.sm,
  },

  // Category Dropdown (Expanded - below selector)
  categoryDropdown: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: spacing.sm,
    maxHeight: 250,
    overflow: 'hidden',

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 2,
  },
  categoryScrollView: {
    maxHeight: 250,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  categoryOptionLast: {
    borderBottomWidth: 0,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary + '08',
  },
  categoryOptionIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  categoryOptionTextContainer: {
    flex: 1,
  },
  categoryOptionName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  categoryOptionNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  categoryOptionPrice: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedCheck: {
    marginLeft: spacing.sm,
  },

  // ==================== DATE SELECTION ====================

  // Date Selector
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: spacing.md,
  },
  dateSelectorActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateIconContainer: {
    marginRight: spacing.sm,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  datePlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  nightsText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },

  // Date Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalScrollView: {
    flex: 1,
  },
  modalBody: {
    padding: spacing.lg,
  },

  // Calendar
  calendarContainer: {
    marginBottom: spacing.lg,
  },

  // Modal Buttons
  modalButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

  // ==================== ROOM QUANTITY SELECTOR ====================
  roomQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roomQuantityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roomQuantityLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  roomQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBtnDisabled: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F5F5F5',
  },
  roomQuantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    minWidth: 30,
    textAlign: 'center',
  },

  // ==================== CHECK AVAILABILITY BUTTON ====================

  checkButton: {
    backgroundColor: '#FFD93D', // Yellow color from screenshot
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 3,
  },
  checkButtonDisabled: {
    backgroundColor: '#E8E8E8',
    elevation: 0,
    shadowOpacity: 0,
  },
  checkButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  checkButtonTextDisabled: {
    color: '#999999',
  },

  // ==================== DIVIDER ====================

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: spacing.sm,
  },
});

export default BookingWidget;

