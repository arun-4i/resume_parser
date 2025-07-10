import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "@utils/logger";
import { config } from "@config/env";

// --------------------
// TYPES
// --------------------

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  authTag: string;
}

export interface DecryptionResult {
  success: boolean;
  data: string;
  error?: string;
}

export interface CreateTokenOptions extends Partial<SignOptions> {}

// --------------------
// CRYPTO UTILS
// --------------------

class CryptoUtils {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly IV_LENGTH = 16;
  private static readonly KEY_LENGTH = 32;
  private static readonly PBKDF2_ITERATIONS = 10000;

  static deriveKeyFromJWT(payload: JWTPayload, masterKey: Buffer): Buffer {
    const seed = `${payload.userId}:${payload.iat}:${payload.exp}`;
    const salt = Buffer.from(seed, "utf8");

    const derivedKey = crypto.pbkdf2Sync(
      masterKey,
      salt,
      this.PBKDF2_ITERATIONS,
      this.KEY_LENGTH,
      "sha256"
    );

    logger.debug("system", "Encryption key derived from JWT", {
      userId: payload.userId,
      keySize: derivedKey.length,
      algorithm: "PBKDF2-SHA256",
      iterations: this.PBKDF2_ITERATIONS,
    });

    return derivedKey;
  }

  static encrypt(data: string, key: Buffer): EncryptionResult {
    try {
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

      const encrypted =
        cipher.update(data, "utf8", "hex") + cipher.final("hex");

      const authTag = cipher.getAuthTag().toString("hex");

      logger.debug("system", "Data encrypted successfully", {
        algorithm: this.ALGORITHM,
        inputSize: data.length,
        outputSize: encrypted.length,
        ivLength: iv.length,
        authTagLength: authTag.length,
      });

      return {
        encryptedData: encrypted,
        iv: iv.toString("hex"),
        authTag,
      };
    } catch (error) {
      logger.error("system", "Encryption failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  static decrypt(
    encryptedData: string,
    iv: string,
    authTag: string,
    key: Buffer
  ): DecryptionResult {
    try {
      const ivBuffer = Buffer.from(iv, "hex");
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, ivBuffer);
      decipher.setAuthTag(Buffer.from(authTag, "hex"));

      const decrypted =
        decipher.update(encryptedData, "hex", "utf8") + decipher.final("utf8");

      logger.debug("system", "Data decrypted successfully", {
        algorithm: this.ALGORITHM,
        inputSize: encryptedData.length,
        outputSize: decrypted.length,
      });

      return { success: true, data: decrypted };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      logger.warn("system", "Decryption failed", {
        error: errorMessage,
        algorithm: this.ALGORITHM,
        inputSize: encryptedData.length,
      });

      return { success: false, data: "", error: errorMessage };
    }
  }

  static generateMasterKey(): string {
    const key = crypto.randomBytes(this.KEY_LENGTH).toString("hex");

    logger.info("system", "New master key generated", {
      keyLength: key.length,
      algorithm: "Random bytes",
      entropy: "High",
    });

    return key;
  }

  static validateMasterKey(key: string): boolean {
    const isValid = /^[0-9a-fA-F]{64}$/.test(key);
    logger.debug("system", "Master key validation", {
      valid: isValid,
      keyLength: key.length,
      expectedLength: 64,
    });
    return isValid;
  }
}

// --------------------
// JWT MANAGER
// --------------------

class JWTManager {
  private readonly secret: string;
  private readonly defaultOptions: SignOptions = {
    expiresIn: "24h",
    algorithm: "HS256",
  };

  constructor(secret: string) {
    this.secret = secret;
    logger.info("system", "JWT Manager initialized", {
      algorithm: this.defaultOptions.algorithm,
      defaultExpiry: this.defaultOptions.expiresIn,
      secretLength: secret.length,
    });
  }

  create(
    userId: string,
    email: string,
    role: string = "user",
    options?: CreateTokenOptions
  ): string {
    const finalOptions: SignOptions = {
      ...this.defaultOptions,
      ...options,
    };

    const payload = {
      userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, this.secret, finalOptions);

    logger.debug("auth", "JWT token created", {
      userId,
      email,
      role,
      algorithm: finalOptions.algorithm,
      expiresIn: finalOptions.expiresIn,
      tokenLength: token.length,
    });

    return token;
  }

  verify(token: string): JWTPayload | null {
    try {
      const payload = jwt.verify(token, this.secret) as JWTPayload;

      logger.debug("auth", "JWT token verified", {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        issuedAt: new Date(payload.iat * 1000).toISOString(),
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      });

      return payload;
    } catch (error) {
      logger.warn("auth", "JWT verification failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        tokenLength: token.length,
      });
      return null;
    }
  }

  decode(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      logger.warn("auth", "JWT decode failed");
      return null;
    }
  }

  isExpiringSoon(token: string, thresholdMinutes = 30): boolean {
    const payload = this.verify(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = payload.exp - now;
    const thresholdSeconds = thresholdMinutes * 60;

    const expiringSoon = timeLeft <= thresholdSeconds;

    logger.debug("auth", "Token expiry check", {
      userId: payload.userId,
      timeLeft,
      thresholdSeconds,
      expiringSoon,
    });

    return expiringSoon;
  }

  getExpiryDate(token: string): Date | null {
    const payload = this.decode(token);
    return payload ? new Date(payload.exp * 1000) : null;
  }

  getTokenAge(token: string): number | null {
    const payload = this.decode(token);
    if (!payload) return null;

    return Math.floor(Date.now() / 1000) - payload.iat;
  }
}

// --------------------
// MAIN SERVICE
// --------------------

export class JWTCryptoService {
  private static instance: JWTCryptoService;
  private readonly masterKey: Buffer;
  private readonly jwtManager: JWTManager;

  private constructor() {
    logger.info("system", "Initializing JWTCryptoService");

    const masterKeyHex = this.initMasterKey();
    this.masterKey = Buffer.from(masterKeyHex, "hex");

    this.jwtManager = new JWTManager(config.JWT_SECRET);

    logger.info("system", "JWTCryptoService initialized", {
      masterKeyLength: this.masterKey.length,
      jwtSecretLength: config.JWT_SECRET.length,
    });
  }

  static getInstance(): JWTCryptoService {
    if (!JWTCryptoService.instance) {
      JWTCryptoService.instance = new JWTCryptoService();
    }
    return JWTCryptoService.instance;
  }

  // JWT OPERATIONS

  createJWT(
    userId: string,
    email: string,
    role = "user",
    options?: CreateTokenOptions
  ): string {
    const token = this.jwtManager.create(userId, email, role, options);

    logger.info("userAction", "JWT created", {
      userId,
      email,
      role,
      expiresAt: this.jwtManager.getExpiryDate(token)?.toISOString(),
      tokenSize: token.length,
    });

    return token;
  }

  verifyJWT(token: string): JWTPayload | null {
    const payload = this.jwtManager.verify(token);

    if (!payload) {
      logger.warn("auth", "JWT verification failed", {
        tokenAge: this.jwtManager.getTokenAge(token),
        expired: this.isTokenExpired(token),
      });
    }

    return payload;
  }

  decodeJWT(token: string): JWTPayload | null {
    return this.jwtManager.decode(token);
  }

  isTokenExpiringSoon(token: string, thresholdMinutes = 30): boolean {
    return this.jwtManager.isExpiringSoon(token, thresholdMinutes);
  }

  isTokenExpired(token: string): boolean {
    const payload = this.jwtManager.decode(token);
    if (!payload) return true;

    return Math.floor(Date.now() / 1000) >= payload.exp;
  }

  getTokenInfo(token: string) {
    const payload = this.jwtManager.verify(token);
    const expiringSoon = payload
      ? this.jwtManager.isExpiringSoon(token)
      : false;

    return {
      valid: !!payload,
      payload,
      expiresAt: this.jwtManager.getExpiryDate(token),
      ageSeconds: this.jwtManager.getTokenAge(token),
      expiringSoon,
    };
  }

  // ENCRYPTION OPERATIONS

  encrypt(data: string, jwtToken: string): EncryptionResult {
    const start = Date.now();

    const payload = this.verifyJWT(jwtToken);
    if (!payload) throw new Error("Invalid JWT token for encryption");

    const key = CryptoUtils.deriveKeyFromJWT(payload, this.masterKey);
    const encrypted = CryptoUtils.encrypt(data, key);

    logger.debug("system", "Data encrypted", {
      userId: payload.userId,
      dataSize: data.length,
      encryptedSize: encrypted.encryptedData.length,
      durationMs: Date.now() - start,
    });

    return encrypted;
  }

  decrypt(
    encryptedData: string,
    iv: string,
    authTag: string,
    jwtToken: string
  ): DecryptionResult {
    const start = Date.now();

    const payload = this.verifyJWT(jwtToken);
    if (!payload)
      return {
        success: false,
        data: "",
        error: "Invalid JWT token for decryption",
      };

    const key = CryptoUtils.deriveKeyFromJWT(payload, this.masterKey);
    const result = CryptoUtils.decrypt(encryptedData, iv, authTag, key);

    if (result.success) {
      logger.debug("system", "Data decrypted", {
        userId: payload.userId,
        encryptedSize: encryptedData.length,
        decryptedSize: result.data.length,
        durationMs: Date.now() - start,
      });
    } else {
      logger.error("system", "Decryption failed", {
        userId: payload.userId,
        error: result.error,
        durationMs: Date.now() - start,
      });
    }

    return result;
  }

  // UTILITIES

  generateMasterKey(): string {
    const key = CryptoUtils.generateMasterKey();
    logger.warn("system", "New master key generated - store securely!", {
      keyLength: key.length,
      note: "Add this to your environment config",
    });
    return key;
  }

  validateMasterKey(key: string): boolean {
    return CryptoUtils.validateMasterKey(key);
  }

  testCrypto(userId = "test", email = "test@example.com"): boolean {
    try {
      logger.info("system", "Running crypto test", { userId, email });

      const testToken = this.createJWT(userId, email, "test");

      const testData = JSON.stringify({
        message: "test encryption/decryption",
        timestamp: Date.now(),
        random: Math.random().toString(36),
      });

      const encrypted = this.encrypt(testData, testToken);

      const decrypted = this.decrypt(
        encrypted.encryptedData,
        encrypted.iv,
        encrypted.authTag,
        testToken
      );

      const success = decrypted.success && decrypted.data === testData;

      logger.info("system", "Crypto test completed", {
        success,
        testDataSize: testData.length,
        encryptedSize: encrypted.encryptedData.length,
        roundTripSuccess: success,
      });

      return success;
    } catch (error) {
      logger.error("system", "Crypto test failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  getHealthStatus() {
    const masterKeyValid = this.masterKey.length === 32;
    const jwtSecretValid = config.JWT_SECRET.length >= 32;
    const cryptoTest =
      masterKeyValid && jwtSecretValid ? this.testCrypto() : false;

    const status =
      masterKeyValid && jwtSecretValid && cryptoTest ? "healthy" : "unhealthy";

    const health = {
      status,
      masterKeyValid,
      jwtSecretValid,
      cryptoTest,
      timestamp: new Date().toISOString(),
    };

    logger.info("system", "Health status checked", health);

    return health;
  }

  // PRIVATE

  private initMasterKey(): string {
    let key = config.MASTER_ENCRYPTION_KEY;

    if (key && CryptoUtils.validateMasterKey(key)) {
      logger.info("system", "Master key loaded from config");
      return key;
    }

    if (key) {
      logger.warn("system", "Invalid master key in config, generating new one");
    } else {
      logger.warn("system", "No master key in config, generating new one");
    }

    key = CryptoUtils.generateMasterKey();

    logger.warn("system", "Store this master key securely!", {
      key,
      envVar: "MASTER_ENCRYPTION_KEY",
    });

    return key;
  }
}

// --------------------
// EXPORT SINGLETON & HELPERS
// --------------------

export const jwtCryptoService = JWTCryptoService.getInstance();

export const createToken = (userId: string, email: string, role?: string) =>
  jwtCryptoService.createJWT(userId, email, role);

export const verifyToken = (token: string) => jwtCryptoService.verifyJWT(token);

export const encryptData = (data: string, token: string) =>
  jwtCryptoService.encrypt(data, token);

export const decryptData = (
  encrypted: string,
  iv: string,
  authTag: string,
  token: string
) => jwtCryptoService.decrypt(encrypted, iv, authTag, token);

export default jwtCryptoService;
