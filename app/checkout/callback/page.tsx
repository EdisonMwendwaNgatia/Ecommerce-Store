import { Suspense } from "react";
import CallbackPage from "./CallbackPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackPage />
    </Suspense>
  );
}
