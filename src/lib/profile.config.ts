// Profile configuration — single source of truth for the feedback recipient's identity.
// Change these values to personalise the app for a different person.

export const PROFILE = {
  name: "Matt",
  pronouns: {
    subject: "he", // he / she / they
    object: "him", // him / her / them
    possessive: "his", // his / her / their
  },
  lineManager: {
    name: "Line Manager", // Replace with actual name
    email: "linemanager@example.com", // Replace with actual email
  },
} as const;
