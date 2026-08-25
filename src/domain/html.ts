/** Escapes text for Telegram's HTML parse mode (only &, < and > are special there). */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
