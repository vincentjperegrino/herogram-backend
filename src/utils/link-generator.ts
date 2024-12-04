export const generateSharedLink = (): string => {
  return Math.random().toString(36).substr(2, 9); // Generate a random 9-character link
};

export default generateSharedLink;