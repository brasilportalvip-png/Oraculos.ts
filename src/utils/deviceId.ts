/**
 * Identificador persistente e anônimo do aparelho, usado só para impedir
 * reaproveitamento de cupons e bônus com contas duplicadas.
 */
const CHAVE = 'oraculos_device_id';

export function obterDeviceId(): string {
  try {
    const existente = window.localStorage.getItem(CHAVE);
    if (existente && /^[A-Za-z0-9_-]{16,128}$/.test(existente)) return existente;
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    const novo = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    window.localStorage.setItem(CHAVE, novo);
    return novo;
  } catch {
    return '';
  }
}
