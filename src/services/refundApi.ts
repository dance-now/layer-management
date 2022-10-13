import { httpsCallable } from "firebase/functions";
import { funcions } from "../lib/firebase";

export async function refundApi(
  stripe_payment_intent_id: string
): Promise<any> {
  const json = {
    stripe_payment_intent_id,
  };
  const refundApi = httpsCallable(funcions, "api/refund");
  const res = await refundApi(json);
  return {
    res,
  };
}
