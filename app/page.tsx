import { StartGate } from "@/components/StartGate";
import { IntroProvider } from "@/components/intro/IntroProvider";
import { IntroSequence } from "@/components/intro/IntroSequence";
import { RadioConsole } from "@/components/radio/RadioConsole";
import { RadioProvider } from "@/components/radio/RadioProvider";
import { Backdrop } from "@/components/scene/Backdrop";

export default function Home() {
  return (
    <RadioProvider>
      <IntroProvider>
        <Backdrop />
        <main className="stage">
          <RadioConsole />
        </main>
        <StartGate />
        <IntroSequence />
      </IntroProvider>
    </RadioProvider>
  );
}
