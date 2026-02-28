import "@testing-library/jest-dom";
import i18n from "@/i18n";

// Force French in test environment (matches original hardcoded strings in tests)
i18n.changeLanguage("fr");

// Mock window.scrollTo for jsdom
window.scrollTo = () => {};

// Mock Element.prototype.scrollIntoView for jsdom
Element.prototype.scrollIntoView = () => {};
