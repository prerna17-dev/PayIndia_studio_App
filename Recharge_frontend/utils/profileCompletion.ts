/**
 * Persistent memory cache for user profile data to ensure instant UI updates
 * across different screens (Explore, Account, etc.) without storage latency.
 */
let cachedProfileData: any = null;
let cachedProfilePercentage: number = 0;

/**
 * Calculates the completion percentage of a user's profile.
 * Fields checked: Name, Mobile Number, Email, Gender, Date of Birth, Profile Image.
 * Each field contributes ~16.66% to the total 100%.
 */
export const calculateProfileCompletion = (userData: any): number => {
  if (!userData) return 0;

  const fields = [
    userData.name,
    userData.mobile_number,
    userData.user_email,
    userData.gender,
    userData.date_of_birth,
    userData.profile_image,
  ];

  const completedFields = fields.filter((field) => {
    if (typeof field === "string") {
      return field.trim().length > 0;
    }
    return !!field;
  });

  const percentage = (completedFields.length / fields.length) * 100;
  return Math.round(percentage);
};

/**
 * Updates the in-memory cache and returns the new percentage.
 * This is used to synchronize data between screens.
 */
export const syncProfileCache = (userData: any) => {
  if (!userData) return;
  cachedProfileData = userData;
  cachedProfilePercentage = calculateProfileCompletion(userData);
  return {
    data: cachedProfileData,
    percentage: cachedProfilePercentage
  };
};

/**
 * Getters for the current cached profile state.
 */
export const getCachedProfile = () => ({
  data: cachedProfileData,
  percentage: cachedProfilePercentage
});
