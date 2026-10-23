import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, repaymentAmountINR, faceValueINR, collateralDepositedINR } = body;

    const isDefault = repaymentAmountINR < faceValueINR;
    let remaining = repaymentAmountINR;

    // Fixed reverse waterfall calculations
    const tier3Owed = 51125;
    const tier2Owed = 154125;
    const tier1Owed = 155250;
    const tier0Owed = 104500;

    const tier3Paid = Math.min(remaining, tier3Owed);
    remaining -= tier3Paid;

    const tier2Paid = Math.min(remaining, tier2Owed);
    remaining -= tier2Paid;

    const tier1Paid = Math.min(remaining, tier1Owed);
    remaining -= tier1Paid;

    const tier0Paid = Math.min(remaining, tier0Owed);
    remaining -= tier0Paid;

    let liquidatedCollateral = 0;
    let collateralReturned = collateralDepositedINR;

    if (isDefault) {
      liquidatedCollateral = collateralDepositedINR;
      collateralReturned = 0;
    }

    return NextResponse.json({
      success: true,
      invoiceId,
      buyerPaidINR: repaymentAmountINR,
      tier3Paid,
      tier2Paid,
      tier1Paid,
      tier0Paid,
      reservePaid: isDefault ? 0 : 50000,
      collateralReturned,
      liquidatedCollateral,
      isDefault,
      newReputationLevel: isDefault ? 1 : 2,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Waterfall execution failed" }, { status: 500 });
  }
}
