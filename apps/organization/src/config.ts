if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const config = {
  databaseUrl: process.env.DATABASE_URL,
}

export { config };
