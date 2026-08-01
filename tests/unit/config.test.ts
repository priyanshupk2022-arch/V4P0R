import { describe, it, expect } from 'vitest';
import { parseEnv } from '../../src/lib/config';

describe('Config Validation', () => {
  it('should parse valid env with defaults', () => {
    const env = {
      NODE_ENV: 'test',
    };
    const config = parseEnv(env);
    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(3000);
    expect(config.SUPABASE_URL).toBe('https://mock.supabase.co');
  });

  it('should throw when required variables are invalid in production', () => {
    const env = {
      NODE_ENV: 'production',
      // Missing other required keys
    };
    expect(() => parseEnv(env)).toThrow();
  });

  it('should parse PRAVA_BASE_URL correctly', () => {
    const env = {
      NODE_ENV: 'test',
    };
    const config = parseEnv(env);
    expect(config.PRAVA_BASE_URL).toBe('https://api.sandbox.prava.io');
    
    const envWithPrava = {
      NODE_ENV: 'test',
      PRAVA_BASE_URL: 'https://api.prava.io',
    };
    const configWithPrava = parseEnv(envWithPrava);
    expect(configWithPrava.PRAVA_BASE_URL).toBe('https://api.prava.io');
  });
});
