import * as dotenv from "dotenv";
dotenv.config();

import { getNotchPayPublicKey, translateNotchPayError } from "../lib/notchpay";

const NOTCHPAY_BASE_URL = process.env.NOTCHPAY_BASE_URL || "https://api.notchpay.co";

async function testNotchPay() {
  let publicKey: string;
  try {
    publicKey = getNotchPayPublicKey();
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
  console.log("Using PK:", publicKey.substring(0, 12) + "...");

  const phone = "+237691234567";
  const channel = "cm.orange";

  console.log("1. Init payment...");
  const initRes = await fetch(`${NOTCHPAY_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: publicKey!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 500,
      reference: `test-${Date.now()}`,
      currency: "XAF",
      description: "Test",
      customer: {
        email: "test@example.com",
        phone,
      },
    }),
  });

  const initText = await initRes.text();
  console.log("Init response:", initText);

  if (!initRes.ok) {
    try {
      const err = JSON.parse(initText) as { message?: string };
      if (err.message) console.error(translateNotchPayError(err.message));
    } catch {
      /* ignore */
    }
    return;
  }

  const initData = JSON.parse(initText);
  const trxRef = initData?.transaction?.reference || initData?.reference || initData?.data?.reference;
  console.log("Extracted trxRef:", trxRef);

  if (!trxRef) return;

  console.log("2. Complete payment (PUT)...");
  const completeRes = await fetch(`${NOTCHPAY_BASE_URL}/payments/${trxRef}`, {
    method: "PUT",
    headers: {
      Authorization: publicKey!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel,
      data: { phone },
    }),
  });

  console.log("Complete response:", await completeRes.text());
}

testNotchPay();
