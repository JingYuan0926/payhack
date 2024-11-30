import { motion } from "framer-motion";
import { FiBatteryCharging, FiWifi } from "react-icons/fi";
import OnboardingModal from '../components/Modal'
import { useDisclosure } from "@nextui-org/react";

const Example = () => {
  return (
    <section
      className="grid place-content-center p-4 sm:p-12"
      style={{
        backgroundImage: 'url("/landingBackground.gif")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <Laptop />
    </section>
  );
};

// Laptop container with keyboard
const Laptop = () => {
  return (
    <motion.div
      initial={{ y: "100vh", opacity: 0 }} // Start below the screen
      animate={{ y: "0", opacity: 1 }} // End at the center
      transition={{
        duration: 1.5, // Animation duration
        ease: "easeOut", // Smooth easing
      }}
      className="flex flex-col items-center w-full max-w-[600px]"
    >
      {/* Laptop Screen */}
      <div
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "3/2",
        }}
        className="relative rounded-[24px] bg-gray-900 border-4 border-gray-700 overflow-hidden"
      >
        <HeaderBar />
        <Screen />
      </div>

      {/* Laptop Keyboard Base */}
      <img
        src="/keyboard.gif"
        alt="Keyboard"
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "4/1",
          transform: "perspective(800px) rotateX(25deg)",
        }}
        className="rounded-b-[24px] border-2 border-black -mt-2"
      />
    </motion.div>
  );
};

const HeaderBar = () => {
  return (
    <>
      <div className="absolute left-[50%] top-2.5 z-10 h-2 w-16 -translate-x-[50%] rounded-md bg-neutral-900"></div>
      <div className="absolute right-3 top-2 z-10 flex gap-2">
        <FiWifi className="text-neutral-600" />
        <FiBatteryCharging className="text-neutral-600" />
      </div>
    </>
  );
};
const Screen = () => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure()

  return (
    <div
      className="relative z-0 grid h-full w-full place-content-center overflow-hidden"
      style={{ backgroundColor: "#dec3ab" }}
    >
      {/* Title and Cat Container */}
      <div className="flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
        <h1 className="text-center text-3xl sm:text-5xl font-bold text-gray-800 mb-2">
          FinPet
        </h1>
        <img
          src="/screenCat.gif"
          alt="Screen Cat"
          className="w-32 h-32 sm:w-48 sm:h-48"
        />
      </div>
      <button 
        onClick={onOpen}
        className="absolute bottom-4 left-4 right-4 z-10 rounded-lg border-[1px] bg-white py-2 text-lg sm:text-xl font-medium text-gray-700 backdrop-blur"
      >
        Get Started
      </button>

      <OnboardingModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  );
};

export default Example;