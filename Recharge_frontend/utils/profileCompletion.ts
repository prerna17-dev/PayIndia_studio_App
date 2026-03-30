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
