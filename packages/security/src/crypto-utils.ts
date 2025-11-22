import * as crypto from 'crypto';

/**
 * XOR encryption/decryption using 0x22 as the key
 * @param data - The string to encrypt/decrypt
 * @returns XOR processed string
 */
export function XorWithKey(data: string): string {
  if (!data) return '';

  // Convert string to buffer to handle Unicode properly
  const buffer = Buffer.from(data, 'utf8');
  const result = Buffer.alloc(buffer.length);

  for (let i = 0; i < buffer.length; i++) {
    result[i] = buffer[i] ^ 0x22;
  }

  return result.toString('utf8');
}

/**
 * XOR decrypt using 0x22 key
 * @param encryptedStr - The encrypted string to decrypt
 * @returns Decrypted string
 */
export function decrypt(encryptedStr: string): string {
  return XorWithKey(encryptedStr);
}

/**
 * Convert bytes to escaped string representation
 * @param b - The buffer to convert
 * @returns String with printable ASCII as-is and non-printable as \xHH format
 */
export function bytesToLiteral(b: Buffer): string {
  let result = '';

  for (let i = 0; i < b.length; i++) {
    const byte = b[i];

    // Printable ASCII characters (32-126) shown as-is
    if (byte >= 32 && byte <= 126) {
      result += String.fromCharCode(byte);
    } else {
      // Non-printable characters as \xHH format (lowercase hex)
      result += '\\x' + byte.toString(16).padStart(2, '0');
    }
  }

  return result;
}

/**
 * Filter out empty-value parameters from an object
 * @param params - Parameters object
 * @returns Filtered parameters object
 */
function filterEmptyParams(
  params: Record<string, string>
): Record<string, string> {
  const filtered: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) {
      filtered[key] = value;
    }
  }

  return filtered;
}

/**
 * Verify signature using MD5 hash
 * @param params - Parameters object
 * @param secretKey - Secret key for signature
 * @param signToVerify - Signature to verify against
 * @returns True if signature matches, false otherwise
 */
export function verifySign(
  params: Record<string, string>,
  secretKey: string,
  signToVerify: string
): boolean {
  // Filter out empty-value parameters
  const filteredParams = filterEmptyParams(params);

  // Sort parameter keys in ASCII ascending order
  const sortedKeys = Object.keys(filteredParams).sort();

  // Build signature string
  const paramPairs = sortedKeys.map(key => `${key}=${filteredParams[key]}`);
  const paramString = paramPairs.join('&');
  const signString = paramString
    ? `${paramString}&key=${secretKey}`
    : `key=${secretKey}`;

  // Calculate MD5 hash (uppercase)
  const calculatedSign = crypto
    .createHash('md5')
    .update(signString, 'utf8')
    .digest('hex')
    .toUpperCase();

  // Compare with provided signature
  return calculatedSign === signToVerify;
}

/**
 * Parse JSON string with proper type conversions
 * @param jsonString - JSON string to parse
 * @returns Parsed object with proper type conversions
 */
export function parseJSONWithTypes(jsonString: string): any {
  try {
    // Use a custom reviver function to convert numbers to strings during parsing
    const parsed = JSON.parse(jsonString, (key, value) => {
      if (typeof value === 'number') {
        // Convert numbers to strings to preserve their original representation
        return value.toString();
      }
      return value;
    });

    return parsed;
  } catch (error) {
    throw new Error(
      `JSON parsing failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Demo function showing all operations
 */
export function demo(): void {
  console.log('=== Crypto Utility Demo ===');

  // Test XOR encryption/decryption
  const testString = 'Hello, 世界! 🌍';
  console.log(`Original: ${testString}`);

  const encrypted = XorWithKey(testString);
  console.log(`Encrypted: ${bytesToLiteral(Buffer.from(encrypted, 'utf8'))}`);

  const decrypted = decrypt(encrypted);
  console.log(`Decrypted: ${decrypted}`);
  console.log(`Round-trip successful: ${testString === decrypted}`);

  // Test signature verification
  const params = {
    name: 'John',
    age: '30',
    email: 'john@example.com',
    empty: '',
    nullValue: null as any,
  };
  const secretKey = 'mySecretKey123';

  // Generate correct signature
  const filteredParams = filterEmptyParams(params);
  const sortedKeys = Object.keys(filteredParams).sort();
  const paramPairs = sortedKeys.map(key => `${key}=${filteredParams[key]}`);
  const signString = paramPairs.join('&') + `&key=${secretKey}`;
  const correctSign = crypto
    .createHash('md5')
    .update(signString, 'utf8')
    .digest('hex')
    .toUpperCase();

  console.log('\nSignature verification test:');
  console.log('Params:', filteredParams);
  console.log(`Sign string: ${signString}`);
  console.log(`Generated signature: ${correctSign}`);
  console.log(
    `Verification result: ${verifySign(params, secretKey, correctSign)}`
  );
  console.log(
    `Invalid signature test: ${verifySign(params, secretKey, 'INVALID')}`
  );

  // Test JSON parsing with type conversions
  const jsonWithNumbers =
    '{"name": "Alice", "score": 123456789, "data": {"value": 987654321, "items": [1, 2, 3]}}';
  console.log('\nJSON parsing test:');
  console.log(`Original JSON: ${jsonWithNumbers}`);

  try {
    const parsed = parseJSONWithTypes(jsonWithNumbers);
    console.log('Parsed with type conversions:', parsed);
    console.log(`Score type: ${typeof parsed.score}, value: ${parsed.score}`);
    console.log(
      `Data.value type: ${typeof parsed.data.value}, value: ${
        parsed.data.value
      }`
    );
  } catch (error) {
    console.error('JSON parsing error:', error);
  }

  // Test invalid JSON
  try {
    parseJSONWithTypes('{"invalid": json}');
  } catch (error) {
    console.log(
      `\nInvalid JSON test: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
