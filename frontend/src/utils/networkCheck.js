import NetInfo from '@react-native-community/netinfo';

// Check if device is connected to internet
export const checkInternetConnection = async () => {
  try {
    const state = await NetInfo.fetch();
    
    return {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      details: state.details
    };
  } catch (error) {
    console.error('Error checking internet connection:', error);
    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown',
      details: null
    };
  }
};

// Subscribe to network state changes
export const subscribeToNetworkChanges = (callback) => {
  return NetInfo.addEventListener(state => {
    callback({
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type
    });
  });
};