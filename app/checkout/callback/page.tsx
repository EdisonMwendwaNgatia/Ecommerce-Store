import { Suspense } from "react";
import CallbackPage from "./CallbackPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackPage />
    </Suspense>
  );
}
