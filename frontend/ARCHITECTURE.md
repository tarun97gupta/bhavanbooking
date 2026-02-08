# Frontend Architecture Documentation

## Overview
This document outlines the architecture and structure of the Darus Salam Bhavan frontend application, following industry best practices and market standards.

## Directory Structure

```
frontend/src/
├── components/              # Reusable UI components
│   ├── common/             # Shared components across app
│   │   ├── LoadingScreen.js
│   │   ├── ImageCarousel.js
│   │   └── ContactModal.js
│   └── home/               # Home screen specific components
│       ├── EnhancedHeader.js
│       ├── AboutSection.js
│       ├── PackageSelector.js
│       ├── QuickScenarios.js
│       ├── ContactSection.js
│       ├── AboutModal.js
│       └── PackageSelectionModal.js
├── constants/              # App-wide constants
│   └── app.js             # All constant values
├── navigation/             # Navigation configuration
│   └── AppNavigator.js
├── screens/               # Screen components (lightweight)
│   ├── SplashScreen.js
│   ├── HomeScreen.js
│   └── PackageDetailScreen.js
├── services/              # API and external services
│   └── api/
│       └── packages.js
├── styles/                # Theme and shared styles
│   ├── colors.js
│   └── spacing.js
└── utils/                 # Utility functions
    ├── categoryHelpers.js
    └── linkHelpers.js
```

## Architecture Principles

### 1. **Component-Based Architecture**
- **Atomic Design**: Components are broken down into small, reusable pieces
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Complex UIs built by composing simple components

### 2. **Separation of Concerns**
- **Components**: UI rendering only
- **Utils**: Business logic and helper functions
- **Constants**: All hardcoded values in one place
- **Services**: API calls and external integrations
- **Screens**: Orchestration layer, lightweight coordinators

### 3. **Code Organization**

#### Components
**Common Components** (`components/common/`):
- Reusable across multiple screens
- No screen-specific logic
- Examples: LoadingScreen, ImageCarousel, ContactModal

**Feature-Specific Components** (`components/home/`):
- Specific to one screen or feature
- Can be reused within that feature
- Examples: EnhancedHeader, QuickScenarios, ContactSection

#### Constants (`constants/app.js`)
Centralized location for:
- Contact information
- Quick scenarios data
- Category mappings (colors, icons)
- Carousel images
- About content
- Business hours
- App configuration

#### Utils
**categoryHelpers.js**:
- `getCategoryColor(category)`: Returns color for category
- `getCategoryIcon(category)`: Returns icon name for category

**linkHelpers.js**:
- `openPhoneCall()`: Opens phone dialer
- `openWhatsApp(message)`: Opens WhatsApp
- `openEmail(subject, body)`: Opens email client
- `openMaps()`: Opens Google Maps

#### Services
**packages.js**:
- `fetchPackages(category)`: Fetch all packages
- `fetchPackageById(id)`: Fetch single package details

### 4. **Component Design Patterns**

#### Presentational Components
- Pure UI components
- Receive data via props
- Emit events via callbacks
- No business logic

Example:
```javascript
const AboutSection = ({ onReadMore }) => {
  return (
    // JSX rendering
  );
};
```

#### Container Pattern
- Screens act as containers
- Manage state and side effects
- Pass data down to presentational components

Example:
```javascript
const HomeScreen = ({ navigation }) => {
  const [packages, setPackages] = useState([]);
  // ... state management
  
  return (
    <>
      <EnhancedHeader />
      <AboutSection onReadMore={handleReadMore} />
      {/* ... */}
    </>
  );
};
```

### 5. **State Management**
- **Local State**: Using React hooks (`useState`, `useEffect`)
- **No Global State Needed**: App is simple enough without Context or Redux
- State is managed at screen level and passed down as props

### 6. **Navigation**
- Stack Navigation for linear flow
- Screens: Splash → Home → PackageDetail
- No authentication or complex routing needed

## Best Practices Implemented

### ✅ Code Quality
- **DRY (Don't Repeat Yourself)**: Reusable components and utilities
- **KISS (Keep It Simple)**: Simple, focused components
- **SOLID Principles**: Single responsibility, dependency inversion

### ✅ Maintainability
- **Clear file structure**: Easy to find and modify code
- **Consistent naming**: PascalCase for components, camelCase for functions
- **Modular design**: Easy to add, remove, or modify features

### ✅ Scalability
- **Component composition**: Easy to build complex UIs
- **Centralized constants**: Easy to update values
- **Utility functions**: Easy to add new helpers

### ✅ Performance
- **Lazy imports**: Components loaded on demand
- **Memoization ready**: Structure supports React.memo if needed
- **Optimized renders**: Proper state management prevents unnecessary re-renders

## Component Usage Examples

### Using ImageCarousel
```javascript
import ImageCarousel from '../components/common/ImageCarousel';
import { CAROUSEL_IMAGES } from '../constants/app';

<ImageCarousel
  images={CAROUSEL_IMAGES}
  autoScroll={true}
  autoScrollInterval={3000}
  height={250}
  showArrows={true}
  showPagination={true}
/>
```

### Using ContactModal
```javascript
import ContactModal from '../components/common/ContactModal';

const [showModal, setShowModal] = useState(false);

<ContactModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  packageName="Full Bhavan Package"
/>
```

### Using Helper Functions
```javascript
import { openPhoneCall, openWhatsApp } from '../utils/linkHelpers';
import { getCategoryColor } from '../utils/categoryHelpers';

// Open phone
<TouchableOpacity onPress={openPhoneCall}>

// Get category color
const color = getCategoryColor('full_venue');
```

## Future Enhancements

### Potential Additions
1. **Custom Hooks** (`hooks/`):
   - `usePackages()`: Fetch and manage packages
   - `useDebounce()`: Debounce user input
   - `useAsync()`: Handle async operations

2. **Theme System**:
   - Dark mode support
   - Theme provider for dynamic theming

3. **Error Boundary**:
   - Catch and handle component errors gracefully

4. **Performance Monitoring**:
   - Analytics integration
   - Performance tracking

## Conclusion

This architecture follows React Native and React best practices, ensuring:
- **Maintainable**: Easy to understand and modify
- **Scalable**: Can grow with new features
- **Testable**: Components are isolated and pure
- **Professional**: Follows industry standards

The refactored codebase is now production-ready and follows market standards used by major companies and development teams.
