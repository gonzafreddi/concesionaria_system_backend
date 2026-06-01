type NodeEnv = 'development' | 'test' | 'production' | string;

export function getNodeEnv(): NodeEnv {
  return process.env.NODE_ENV || 'development';
}

export function isProduction(): boolean {
  return getNodeEnv() === 'production';
}

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function parsePort(value: string, name = 'PORT'): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be a valid TCP port`);
  }

  return port;
}

export function getDatabaseConfig() {
  if (isProduction()) {
    return {
      host: requireEnv('DB_HOST'),
      port: parsePort(requireEnv('DB_PORT'), 'DB_PORT'),
      username: requireEnv('DB_USER'),
      password: requireEnv('DB_PASS'),
      database: requireEnv('DB_NAME'),
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT
      ? parsePort(process.env.DB_PORT, 'DB_PORT')
      : 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'concesionaria',
  };
}

export function shouldSynchronizeSchema(): boolean {
  return !isProduction() && process.env.TYPEORM_SYNCHRONIZE === 'true';
}

export function validateRequiredEnvironment(): void {
  requireEnv('JWT_SECRET');

  if (isProduction()) {
    requireEnv('DB_HOST');
    requireEnv('DB_PORT');
    requireEnv('DB_USER');
    requireEnv('DB_PASS');
    requireEnv('DB_NAME');
    requireEnv('CORS_ORIGINS');
    requireEnv('CLOUDINARY_CLOUD_NAME');
    requireEnv('CLOUDINARY_API_KEY');
    requireEnv('CLOUDINARY_API_SECRET');
  }
}

export function getJwtSecret(): string {
  if (getNodeEnv() === 'test') {
    return process.env.JWT_SECRET || 'test-jwt-secret';
  }

  return requireEnv('JWT_SECRET');
}
