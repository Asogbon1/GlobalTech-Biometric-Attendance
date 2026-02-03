// WebAuthn helper functions for fingerprint authentication

export interface BiometricCredential {
  id: string;
  rawId: ArrayBuffer;
  type: string;
}

/**
 * Check if WebAuthn is supported in this browser
 */
export function isBiometricSupported(): boolean {
  return !!(navigator.credentials && navigator.credentials.create);
}

/**
 * Register a new fingerprint credential for a user
 */
export async function registerFingerprint(
  userId: number,
  userName: string
): Promise<BiometricCredential> {
  if (!isBiometricSupported()) {
    throw new Error("Biometric authentication is not supported on this device");
  }

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: "GlobalTech Attendance System",
      id: window.location.hostname,
    },
    user: {
      id: new Uint8Array(Buffer.from(userId.toString())),
      name: userName,
      displayName: userName,
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" },  // ES256
      { alg: -257, type: "public-key" }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Use built-in authenticator (fingerprint sensor)
      requireResidentKey: false,
      userVerification: "required",
    },
    timeout: 60000,
    attestation: "none",
  };

  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  }) as PublicKeyCredential;

  if (!credential) {
    throw new Error("Failed to create credential");
  }

  return {
    id: credential.id,
    rawId: credential.rawId,
    type: credential.type,
  };
}

/**
 * Authenticate using fingerprint
 */
export async function authenticateFingerprint(
  credentialId?: string
): Promise<BiometricCredential> {
  if (!isBiometricSupported()) {
    throw new Error("Biometric authentication is not supported on this device");
  }

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    timeout: 60000,
    userVerification: "required",
    ...(credentialId && {
      allowCredentials: [{
        id: base64ToBuffer(credentialId),
        type: "public-key",
        transports: ["internal"],
      }],
    }),
  };

  const assertion = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  }) as PublicKeyCredential;

  if (!assertion) {
    throw new Error("Failed to authenticate");
  }

  return {
    id: assertion.id,
    rawId: assertion.rawId,
    type: assertion.type,
  };
}

/**
 * Convert ArrayBuffer to base64 string
 */
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
