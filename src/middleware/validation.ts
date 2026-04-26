export const validateId = (id: string): boolean => {
  // Allow custom IDs (lowercase alphanumeric with hyphens/underscores)
  const customIdPattern = /^[a-z0-9_-]+$/;
  // Allow MongoDB ObjectIds (24 hex characters)
  const objectIdPattern = /^[a-f0-9]{24}$/i;
  
  return (customIdPattern.test(id) && id.length <= 50) || objectIdPattern.test(id);
};
