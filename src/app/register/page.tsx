import { Suspense } from "react";
import RegisterForm from "./register-form";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mesh-bg flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted">Loading…</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
