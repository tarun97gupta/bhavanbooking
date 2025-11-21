import { useState, useEffect } from 'react';
import { isFirstTimeUser, markWelcomeAsSeen } from '../utils/storage';

/**
 * Custom hook to detect if user is opening app for the first time
 * @returns {Object} { isFirstTime, isLoading, markAsComplete }
 */

const useFirstTimeUser = () => {
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        checkFirstTimeUser();
    }, [])

    /**
   * Check if this is user's first time opening the app
   */
    const checkFirstTimeUser = async () => {
        try {
            setIsLoading(true);
            const isFirst = await isFirstTimeUser();
            setIsFirstTime(isFirst);
        } catch (error) {
            console.error('Error checking first time user:', error);
            setIsFirstTime(false);
        } finally {
            setIsLoading(false);
        }
    }

    /**
    * Mark onboarding as complete
    * Call this after user clicks "Get Started"
    */
    const markAsComplete = async () => {
        try {
            await markWelcomeAsSeen();
            setIsFirstTime(false);
        } catch (error) {
            console.error('Error marking onboarding as complete:', error);
        }
    };


    return { isFirstTime, isLoading, markAsComplete };
};

export default useFirstTimeUser;




