export const dynamic = "force-dynamic";

import { Suspense } from "react";
import OrderStatusPage from "./OrderStatusPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderStatusPage />
    </Suspense>
  );
}
