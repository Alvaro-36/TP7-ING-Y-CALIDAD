// Shim usado solo por Vitest (ver alias en vitest.config.js).
// Reexporta la API de Vitest con los nombres de '@jest/globals' para que los
// tests escritos para Jest corran sin cambios. Jest sigue usando el paquete real.
import { vi, describe, test, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest'

export const jest = vi
export { describe, test, it, expect, beforeAll, beforeEach, afterAll, afterEach }
