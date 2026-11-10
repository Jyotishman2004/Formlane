const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export function uid(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}
