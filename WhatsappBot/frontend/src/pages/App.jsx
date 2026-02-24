import { GeneralSettings } from "../components/GeneralSettings";
import { PersonalityProfile } from "../components/PersonalityProfile";
import { PromptPreview } from "../components/PromptPreview";
import { SystemStatus } from "../components/SystemStatus";
import { WritingSamples } from "../components/WritingSamples";

export function App() {
  return (
    <div className="container">
      <h1>WhatsApp Bot Admin Panel</h1>
      <div className="banner">Revisa la tarjeta de System Status para validar seguridad activa.</div>
      <div className="grid">
        <GeneralSettings />
        <PersonalityProfile />
        <WritingSamples />
        <PromptPreview />
        <SystemStatus />
      </div>
    </div>
  );
}
