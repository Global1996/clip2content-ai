/**
 * Shown after signup when we ask the user to check email — delivery is configured in Supabase.
 */
export function EmailConfirmationTroubleshoot() {
  return (
    <aside className="mt-6 rounded-xl border border-border-subtle bg-background/50 px-4 py-3.5 text-left text-[13px] leading-relaxed text-muted">
      <p className="font-semibold text-foreground/95">
        Nu primești emailul de confirmare?
      </p>
      <ul className="mt-2 list-disc space-y-1.5 pl-4">
        <li>Verifică folderul Spam / Promotions (în special Gmail).</li>
        <li>
          În Supabase:{" "}
          <span className="text-foreground/90">
            Authentication → Providers → Email
          </span>{" "}
          — trebuie activată confirmarea pe email („Confirm email” / „Enable email
          confirmations”).
        </li>
        <li>
          Pentru livrare sigură, configurează{" "}
          <span className="text-foreground/90">SMTP personalizat</span> (ex. Resend):{" "}
          Project Settings → Authentication → SMTP.
        </li>
        <li>
          La{" "}
          <span className="text-foreground/90">Authentication → URL Configuration</span>,
          adaugă redirect-ul exact al aplicației, inclusiv{" "}
          <code className="rounded bg-border-subtle px-1 py-0.5 text-[11px] text-foreground/90">
            …/auth/callback
          </code>{" "}
          (și variana cu www dacă o folosești).
        </li>
        <li>
          Variabile .env:{" "}
          <code className="rounded bg-border-subtle px-1 py-0.5 text-[11px]">
            NEXT_PUBLIC_APP_URL
          </code>{" "}
          = același site ca în Supabase (fără slash la final).
        </li>
      </ul>
      <p className="mt-3 text-[12px] text-muted">
        Link oficial SMTP Resend + Supabase:{" "}
        <a
          href="https://resend.com/docs/send-with-supabase-smtp"
          className="font-medium text-primary underline-offset-2 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          resend.com/docs/send-with-supabase-smtp
        </a>
      </p>
    </aside>
  );
}
