import DesktopHero from "./DesktopHero";
import MobileHero from "./MobileHero";

export default function Hero() {
  return (
    <>
      {/* PC */}
      <DesktopHero />

      {/* Mobile */}
      <MobileHero />
    </>
  );
}
