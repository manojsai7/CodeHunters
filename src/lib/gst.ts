// Digital services in India → SAC code 998431 → GST 18%
// If buyer state === seller state → CGST 9% + SGST 9%
// If buyer state !== seller state → IGST 18%
// GST is INCLUSIVE in the displayed price (not added on top)

export const SELLER_STATE = "Andhra Pradesh";
export const GST_RATE = 0.18;
export const SAC_CODE = "998431";

export function calculateGST(totalPaid: number, buyerState: string) {
  const taxableAmount =
    Math.round((totalPaid / (1 + GST_RATE)) * 100) / 100;
  const gstAmount = Math.round((totalPaid - taxableAmount) * 100) / 100;
  const isSameState = buyerState === SELLER_STATE;
  return {
    taxableAmount,
    cgst: isSameState ? Math.round((gstAmount / 2) * 100) / 100 : 0,
    sgst: isSameState ? Math.round((gstAmount / 2) * 100) / 100 : 0,
    igst: !isSameState ? gstAmount : 0,
    totalAmount: totalPaid,
  };
}
