import { Socket } from "socket.io";

interface Clients {
  [key: string]: Socket;
}

/**
 * Generates a unique 4-character ID that doesn't contain confusing characters
 * and is not already in use
 */
export const generateId = (existingClients: Clients = {}): string => {
  let id: string;
  do {
    id = Math.random().toString(36).substring(2, 6).toUpperCase();
  } while (
    id.length < 4 || // Ensure we have 4 characters
    id.includes("0") ||
    id.includes("1") ||
    id.includes("O") ||
    id.includes("I") ||
    id.includes("L") ||
    Object.keys(existingClients).includes(id)
  );
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
