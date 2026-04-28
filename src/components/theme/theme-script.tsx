/** Runs before paint to avoid theme flash — kept minimal for CSP-free inline execution. */
export function ThemeScript() {
  const code = `
(function(){
  try {
    var k='clip2theme';
    var t=localStorage.getItem(k);
    var dark;
    if(t==='light') dark=false;
    else if(t==='dark') dark=true;
    else dark=window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch(e) {}
})();`;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: code }}
      suppressHydrationWarning
    />
  );
}
