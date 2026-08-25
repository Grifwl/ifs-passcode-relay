// Excludes visually ambiguous characters (0/O, 1/I/L) so a code read
// aloud or copied by hand at a live event is less error-prone.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

/** Generates a short, human-typable join code for a new IFS event, e.g. "7KPQ2M". */
export function generateEventCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = Math.floor(Math.random() * CODE_ALPHABET.length);
    code += CODE_ALPHABET[index];
  }
  return code;
}
