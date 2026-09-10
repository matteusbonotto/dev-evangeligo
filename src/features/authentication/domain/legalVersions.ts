/**
 * Versão vigente dos documentos legais, usada para registrar consentimento
 * auditável (RF-06 / `IA/docs/security.md`: "timestamp + versão dos termos").
 *
 * Mantida em sincronia manual com a data exibida em `LegalPage.tsx`. Quando
 * os Termos/Privacidade forem atualizados de forma material, atualizar esta
 * constante para que novos cadastros/consentimentos referenciem a versão
 * correta — consentimentos já registrados no banco preservam a versão que
 * era vigente no momento (não são reescritos retroativamente).
 */
export const TERMS_VERSION = "2026-08-21";
export const PRIVACY_VERSION = "2026-08-21";
