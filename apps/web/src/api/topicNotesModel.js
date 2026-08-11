export const TOPIC_NOTE_MAX_LENGTH = 5000;

export function normalizeTopicNote(value) {
  return String(value ?? '').trim();
}

export function validateTopicNote(value) {
  const note = normalizeTopicNote(value);
  if (!note) return { note, error: 'Escreva uma anotação antes de salvar.' };
  if (note.length > TOPIC_NOTE_MAX_LENGTH) {
    return { note, error: `A anotação deve ter no máximo ${TOPIC_NOTE_MAX_LENGTH} caracteres.` };
  }
  return { note, error: null };
}
