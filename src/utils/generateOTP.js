export const generateOTP = (length = 6) => {
   // Math.floor(1000 + Math.random() * 9000).toString();

   return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  ).toString();
};
