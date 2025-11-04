import { Socket } from "socket.io";

interface Clients {
  [key: string]: Socket;
}

/**
 * Generates a unique 4-character ID that doesn't contain confusing characters
 * and is not already in use
 */
export const generateId = (existingClients: Clients = {}): string => {
  const allowedChars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // Exclude 0, 1, O, I, L
  let id: string;
  do {
    id = "";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * allowedChars.length);
      id += allowedChars[randomIndex];
    }
  } while (Object.keys(existingClients).includes(id));
  return id;
};

/**
 * Checks if an ID contains any confusing characters
 */
export const hasConfusingCharacters = (id: string): boolean => {
  return (
    id.includes("0") ||
    id.includes("1") ||
    id.includes("O") ||
    id.includes("I") ||
    id.includes("L")
  );
};
