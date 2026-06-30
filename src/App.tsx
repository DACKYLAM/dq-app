import DataQualityApp from "@/DataQualityApp";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <>
      <DataQualityApp />
      <Toaster
        // Aggiungo la X
        closeButton
        // Scomparsa dopo 2000ms (default = 4000)
        duration={2000}
      />
    </>
  );
}