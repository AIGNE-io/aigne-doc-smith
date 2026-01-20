import { describe, test, expect } from "bun:test";
import {
  DISCUSS_KIT_DID,
  MEDIA_KIT_DID,
  PAYMENT_KIT_DID,
  CLOUD_SERVICE_URL_PROD,
  CLOUD_SERVICE_URL_STAGING,
  DISCUSS_KIT_STORE_URL,
  BLOCKLET_ADD_COMPONENT_DOCS,
  SUPPORTED_LANGUAGES,
} from "../../utils/constants.mjs";

describe("constants.mjs", () => {
  describe("DID Constants", () => {
    test("DISCUSS_KIT_DID should be a valid DID string", () => {
      expect(typeof DISCUSS_KIT_DID).toBe("string");
      expect(DISCUSS_KIT_DID).toMatch(/^z[a-zA-Z0-9]+$/);
    });

    test("MEDIA_KIT_DID should be a valid DID string", () => {
      expect(typeof MEDIA_KIT_DID).toBe("string");
      expect(MEDIA_KIT_DID).toMatch(/^z[a-zA-Z0-9]+$/);
    });

    test("PAYMENT_KIT_DID should be a valid DID string", () => {
      expect(typeof PAYMENT_KIT_DID).toBe("string");
      expect(PAYMENT_KIT_DID).toMatch(/^z[a-zA-Z0-9]+$/);
    });
  });

  describe("Service URL Constants", () => {
    test("CLOUD_SERVICE_URL_PROD should be a valid HTTPS URL", () => {
      expect(typeof CLOUD_SERVICE_URL_PROD).toBe("string");
      expect(CLOUD_SERVICE_URL_PROD).toMatch(/^https:\/\//);
    });

    test("CLOUD_SERVICE_URL_STAGING should be a valid HTTPS URL", () => {
      expect(typeof CLOUD_SERVICE_URL_STAGING).toBe("string");
      expect(CLOUD_SERVICE_URL_STAGING).toMatch(/^https:\/\//);
    });

    test("DISCUSS_KIT_STORE_URL should be a valid HTTPS URL", () => {
      expect(typeof DISCUSS_KIT_STORE_URL).toBe("string");
      expect(DISCUSS_KIT_STORE_URL).toMatch(/^https:\/\//);
    });

    test("BLOCKLET_ADD_COMPONENT_DOCS should be a valid HTTPS URL", () => {
      expect(typeof BLOCKLET_ADD_COMPONENT_DOCS).toBe("string");
      expect(BLOCKLET_ADD_COMPONENT_DOCS).toMatch(/^https:\/\//);
    });
  });

  describe("SUPPORTED_LANGUAGES", () => {
    test("should be an array", () => {
      expect(Array.isArray(SUPPORTED_LANGUAGES)).toBe(true);
    });

    test("should contain at least common languages", () => {
      const codes = SUPPORTED_LANGUAGES.map((lang) => lang.code);
      expect(codes).toContain("en");
      expect(codes).toContain("zh");
    });

    test("each language should have required properties", () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        expect(lang).toHaveProperty("code");
        expect(lang).toHaveProperty("label");
        expect(lang).toHaveProperty("sample");

        expect(typeof lang.code).toBe("string");
        expect(typeof lang.label).toBe("string");
        expect(typeof lang.sample).toBe("string");

        expect(lang.code.length).toBeGreaterThan(0);
        expect(lang.label.length).toBeGreaterThan(0);
        expect(lang.sample.length).toBeGreaterThan(0);
      }
    });

    test("each language code should be unique", () => {
      const codes = SUPPORTED_LANGUAGES.map((lang) => lang.code);
      const uniqueCodes = [...new Set(codes)];
      expect(codes.length).toBe(uniqueCodes.length);
    });

    test("each label should include the language code in parentheses", () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        expect(lang.label).toContain(`(${lang.code})`);
      }
    });
  });
});
