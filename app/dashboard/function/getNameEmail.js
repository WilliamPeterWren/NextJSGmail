export const getUsernameOrEmail = (email) => {
  const displayNameMatch = email?.match(/"([^"]+)"|([^<]+) <[^>]+>/);
  return displayNameMatch ? displayNameMatch[1] || displayNameMatch[2].trim() : email;
};

export const getUsername = (email) => {
  const displayNameMatch = email?.match(/"([^"]+)"|([^<]+) <[^>]+>/);
  return displayNameMatch ? displayNameMatch[1] || displayNameMatch[2].trim() : "";
};

export const getEmail = (email) => {
  const emailMatch = email?.match(/<([^>]+)>/);
  return emailMatch ? emailMatch[1] : email;
};