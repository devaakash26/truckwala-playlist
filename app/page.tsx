import { IstClock } from "@/components/IstClock";
import { Listeners } from "@/components/Listeners";
import { StationBadge } from "@/components/StationBadge";
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
        <IstClock />
        <StationBadge />
        <Listeners />
        <main className="stage">
          <RadioConsole />
        </main>
        <IntroSequence />
      </IntroProvider>
    </RadioProvider>
  );
}
