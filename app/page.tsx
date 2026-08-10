import { StartGate } from "@/components/StartGate";
import { RadioConsole } from "@/components/radio/RadioConsole";
import { RadioProvider } from "@/components/radio/RadioProvider";
import { Backdrop } from "@/components/scene/Backdrop";

export default function Home() {
  return (
    <RadioProvider>
      <Backdrop />
      <main className="stage">
        <RadioConsole />
      </main>
      <StartGate />
    </RadioProvider>
  );
}
