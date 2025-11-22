# Crypto Utilities

This module provides TypeScript utility functions for encryption, decryption, signature verification, and JSON parsing with type conversions, designed for use with the Midway framework.

## Functions

### XorWithKey(data: string): string

Performs XOR encryption/decryption using 0x22 as the key. This function is reversible - applying it twice returns the original string.

**Note:** XOR on UTF-8 encoded bytes can corrupt multi-byte character sequences. This function works reliably with ASCII characters.

```typescript
import { XorWithKey } from '@midwayjs/security';

const original = 'Hello, World!';
const encrypted = XorWithKey(original);
const decrypted = XorWithKey(encrypted);

console.log(decrypted === original); // true
```

### decrypt(encryptedStr: string): string

Decrypts an XOR-encrypted string using 0x22 as the key. This is essentially an alias for `XorWithKey`.

```typescript
import { decrypt, XorWithKey } from '@midwayjs/security';

const original = 'Secret message';
const encrypted = XorWithKey(original);
const decrypted = decrypt(encrypted);

console.log(decrypted === original); // true
```

### bytesToLiteral(b: Buffer): string

Converts a buffer to an escaped string representation:
- Printable ASCII characters (32-126) are shown as-is
- Non-printable characters are converted to `\xHH` format (lowercase hex)

```typescript
import { bytesToLiteral } from '@midwayjs/security';

const buffer = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x00, 0x57, 0x6F, 0x72, 0x6C, 0x64]);
const result = bytesToLiteral(buffer);
console.log(result); // "Hello\x00World"
```

### verifySign(params: Record<string, string>, secretKey: string, signToVerify: string): boolean

Verifies an MD5 signature by:
1. Filtering out empty-value parameters (empty strings, null, undefined)
2. Sorting parameter keys in ASCII ascending order
3. Building signature string in format: `key1=value1&key2=value2&...&key=secretKey`
4. Calculating MD5 hash (uppercase)
5. Comparing with the provided signature

```typescript
import { verifySign } from '@midwayjs/security';
import * as crypto from 'crypto';

const params = {
  name: 'John',
  age: '30',
  email: 'john@example.com'
};
const secretKey = 'mySecretKey';

// Generate signature
const signString = 'age=30&email=john@example.com&name=John&key=mySecretKey';
const signature = crypto.createHash('md5')
  .update(signString, 'utf8')
  .digest('hex')
  .toUpperCase();

const isValid = verifySign(params, secretKey, signature);
console.log(isValid); // true
```

### parseJSONWithTypes(jsonString: string): any

Parses JSON with automatic type conversion:
- All numbers are converted to strings to preserve their original representation
- Handles nested objects and arrays recursively
- Includes proper error handling for invalid JSON

```typescript
import { parseJSONWithTypes } from '@midwayjs/security';

const jsonString = '{"score": 123456789, "active": true, "data": {"value": 42}}';
const parsed = parseJSONWithTypes(jsonString);

console.log(parsed.score); // "123456789" (string, not number)
console.log(typeof parsed.score); // "string"
console.log(parsed.active); // true (boolean unchanged)
console.log(parsed.data.value); // "42" (string)
```

## Usage Examples

### Complete Workflow Example

```typescript
import {
  XorWithKey,
  decrypt,
  bytesToLiteral,
  verifySign,
  parseJSONWithTypes
} from '@midwayjs/security';
import * as crypto from 'crypto';

// 1. Encrypt a message
const message = {
  user_id: '12345',
  action: 'login',
  timestamp: '1703123456789'
};

const messageJson = JSON.stringify(message);
const encrypted = XorWithKey(messageJson);
console.log('Encrypted:', bytesToLiteral(Buffer.from(encrypted, 'utf8')));

// 2. Generate and verify signature
const secretKey = 'myAppSecret2024';
const signString = `action=login&timestamp=1703123456789&user_id=12345&key=${secretKey}`;
const signature = crypto.createHash('md5')
  .update(signString, 'utf8')
  .digest('hex')
  .toUpperCase();

const isValid = verifySign(message, secretKey, signature);
console.log('Signature valid:', isValid);

// 3. Decrypt and parse
const decryptedJson = decrypt(encrypted);
const parsedMessage = parseJSONWithTypes(decryptedJson);
console.log('Decrypted message:', parsedMessage);
```

## Error Handling

The `parseJSONWithTypes` function throws descriptive errors for invalid JSON:

```typescript
try {
  const result = parseJSONWithTypes('{"invalid": json}');
} catch (error) {
  console.error('Parsing failed:', error.message);
}
```

## Limitations

- **Unicode Handling**: XOR encryption may not preserve multi-byte UTF-8 characters correctly. Use with ASCII or extended ASCII characters for reliable results.
- **Large Numbers**: JavaScript's Number type has precision limits for very large integers. Numbers exceeding `Number.MAX_SAFE_INTEGER` may lose precision.
- **Performance**: These utilities are designed for general-purpose use. For high-performance cryptographic needs, consider using specialized libraries.

## Dependencies

This module uses only Node.js built-in modules:
- `crypto` - for MD5 hash calculation
- `buffer` - for byte manipulation

No external dependencies are required.

## Testing

The module includes comprehensive unit tests covering all functions and edge cases:

```bash
# Run tests
npm test

# Run specific crypto-utils tests
npx jest test/crypto-utils.test.ts
```

## Integration with Midway

These utilities are exported from the `@midwayjs/security` package and can be used in any Midway application:

```typescript
import { Configuration } from '@midwayjs/core';
import { verifySign, parseJSONWithTypes } from '@midwayjs/security';

@Configuration()
export class AppConfiguration {
  // Use crypto utilities in your application
}
```