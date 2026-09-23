import { createBarongMenModel } from './BarongMenModel';

/**
 * Legacy compatibility export — redirects all barong requests to the authentic
 * Barong Tagalog Men Masterwork model to ensure high-couture visual fidelity.
 */
export function createBarongBomberModel(
  fabricHex = '#FAF7EE',
  trimHex = '#E6CE98',
  goldHex = '#FFFDF5'
) {
  return createBarongMenModel(fabricHex, trimHex, goldHex);
}
