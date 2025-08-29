import crypto from 'crypto';

const ID_LENGTH = 8;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

const generateShortId = (): string => {
  let shortId = '';

  for (let i = 0; i < ID_LENGTH; i++) {
    const randomIndex = crypto.randomInt(ALPHABET.length);
    shortId += ALPHABET[randomIndex];
  }

  return shortId;
}

export { generateShortId };
