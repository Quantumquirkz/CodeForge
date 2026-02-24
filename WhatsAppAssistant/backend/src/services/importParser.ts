/**
 * Parses WhatsApp chat export .txt format:
 * [dd/mm/yyyy, hh:mm:ss] Sender Name: message text
 */
const LINE_RE = /^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2}:\d{2})\]\s*([^:]+):\s*(.*)$/;

export type ParsedMessage = {
  date: string;
  time: string;
  sender: string;
  content: string;
};

export function parseWhatsAppExport(text: string): {
  messages: ParsedMessage[];
  contactName: string | null;
} {
  const lines = text.split(/\r?\n/);
  const messages: ParsedMessage[] = [];
  const senders = new Set<string>();

  for (const line of lines) {
    const m = line.match(LINE_RE);
    if (!m) continue;
    const [, date, time, sender, content] = m;
    const trimmedSender = sender.trim();
    const trimmedContent = content.trim();
    if (!trimmedContent) continue;
    senders.add(trimmedSender);
    messages.push({
      date: date ?? "",
      time: time ?? "",
      sender: trimmedSender,
      content: trimmedContent,
    });
  }

  const contactName =
    senders.size === 1 ? [...senders][0]! : senders.size === 2 ? null : null;
  return { messages, contactName };
}
