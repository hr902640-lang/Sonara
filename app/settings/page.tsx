import Link from "next/link";
import { dataMode, refreshMinutes } from "@/lib/config";
import { providers } from "@/lib/providers";

export const metadata = { title: "Settings | SONORA" };
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <main className="simplePage settingsPage">
      <p className="kicker">CONFIGURATION</p>
      <h1>Data <em>settings</em></h1>
      <p>
        The application is running in <strong>{dataMode.toUpperCase()}</strong> mode.
        {dataMode === "demo"
          ? " Demo rankings are sample data, not current platform charts."
          : " Live rankings require a working database and a successful provider sync."}
      </p>
      <h2>Provider configuration</h2>
      <ul className="providerSettings">
        {providers.map(provider => {
          const report = provider.status();
          return (
            <li key={provider.name}>
              <strong>{provider.name}</strong>
              <span>{report.status === "configured" ? "Credentials configured" : "Not configured"}</span>
              <small>{report.message ?? provider.capabilities.join(", ")}</small>
            </li>
          );
        })}
      </ul>
      <p>
        A configured credential does not guarantee a successful provider request.
        {dataMode === "live" ? ` Scheduled sync cadence: ${refreshMinutes} minutes.` : ""}
      </p>
      <p>
        To switch modes, set <code>SONORA_DATA_MODE</code> in <code>.env</code>.
        Live setup also requires <code>DATABASE_URL</code> and a supported provider key.
        Keep credentials server-side and never commit them.
      </p>
      <Link href="/" className="primary">Back to dashboard →</Link>
    </main>
  );
}
