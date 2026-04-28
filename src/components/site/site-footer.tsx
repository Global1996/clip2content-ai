import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:gap-14 sm:px-6 sm:py-16 md:gap-16 md:px-8 md:py-20 lg:max-w-7xl lg:gap-16 lg:py-24">
        <div className="max-w-md">
          <p className="text-xl font-semibold tracking-tight text-foreground">
            Virlo
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Structured viral output — hooks, scripts, captions, and posts — from a single topic.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-14 gap-y-10 text-sm">
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Product
            </span>
            <Link
              href="/#features"
              className="text-muted transition-colors duration-200 hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="text-muted transition-colors duration-200 hover:text-foreground"
            >
              Pricing
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Account
            </span>
            <Link
              href="/login"
              className="text-muted transition-colors duration-200 hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-muted transition-colors duration-200 hover:text-foreground"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border-subtle px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-xs text-muted sm:py-10 md:px-8">
        © {new Date().getFullYear()} Virlo
      </div>
    </footer>
  );
}
