export const dynamic = "force-dynamic";

import { Suspense } from "react";
import CheckoutSuccess from "./CheckoutSuccess";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}
