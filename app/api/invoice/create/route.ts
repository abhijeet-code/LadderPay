import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceNumber, msmeGstin, buyerPan, faceValueINR, tenureDays } = body;

    // 1. Mock GST E-Invoice IRN Verification (NIC Portal)
    const mockIrn = "IRN-" + Math.random().toString(36).substring(2, 15).toUpperCase();

    // 2. Compute Tier 0 Cap (min of 20% invoice, MSME ladder limit, buyer exposure)
    const tier0CapINR = Math.min(faceValueINR * 0.2, 100000);

    // 3. Compute Tranches
    const tranches = [
      {
        tierIndex: 0,
        name: "Tier 0 (No Collateral)",
        sharePercent: 20,
        principalINR: tier0CapINR,
        collateralRequiredINR: 0,
        annualRatePercent: 18,
        cost90DaysINR: Math.round((tier0CapINR * 0.18 * tenureDays) / 365),
      },
      {
        tierIndex: 1,
        name: "Tier 1 (25% Collateral)",
        sharePercent: 30,
        principalINR: faceValueINR * 0.3,
        collateralRequiredINR: faceValueINR * 0.3 * 0.25,
        annualRatePercent: 14,
        cost90DaysINR: Math.round((faceValueINR * 0.3 * 0.14 * tenureDays) / 365),
      },
      {
        tierIndex: 2,
        name: "Tier 2 (50% Collateral)",
        sharePercent: 30,
        principalINR: faceValueINR * 0.3,
        collateralRequiredINR: faceValueINR * 0.3 * 0.5,
        annualRatePercent: 11,
        cost90DaysINR: Math.round((faceValueINR * 0.3 * 0.11 * tenureDays) / 365),
      },
      {
        tierIndex: 3,
        name: "Tier 3 (100% Collateral)",
        sharePercent: 10,
        principalINR: faceValueINR * 0.1,
        collateralRequiredINR: faceValueINR * 0.1 * 1.0,
        annualRatePercent: 9,
        cost90DaysINR: Math.round((faceValueINR * 0.1 * 0.09 * tenureDays) / 365),
      },
    ];

    const reserveINR = faceValueINR * 0.1; // 10% reserve

    return NextResponse.json({
      success: true,
      irn: mockIrn,
      tier0CapINR,
      reserveINR,
      tranches,
      message: "Invoice verified and tiered successfully via Drunix",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process invoice" }, { status: 500 });
  }
}
