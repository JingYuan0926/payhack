import { motion } from "framer-motion";
import { FiBatteryCharging, FiWifi } from "react-icons/fi";
import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react"
import { useRouter } from 'next/router'

const Example = () => {
    return (
      <section
        className="grid place-content-center p-12"
        style={{
          backgroundImage: 'url("/landingBackground.gif")', // Background GIF in public directory
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "100vh", // Full viewport height
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
        initial={{ y: "10px" }}
        animate={{ y: ["10px", "20px", "10px"] }} // Floating effect
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
        }}
        className="flex flex-col items-center"
      >
        {/* Laptop Screen */}
        <div
          style={{
            width: "600px", // Wider screen to resemble a laptop
            height: "400px", // Less tall for a laptop look
          }}
          className="relative rounded-[24px] bg-gray-900 border-4 border-gray-700 overflow-hidden"
        >
          <HeaderBar />
          <Screen />
        </div>
  
        {/* Laptop Keyboard Base (replaced with GIF) */}
        <img
          src="/keyboard.gif" // Path to the GIF in the public folder
          alt="Keyboard"
          style={{
            width: "600px", // Match screen width
            height: "150px", // Match original keyboard height
            transform: "perspective(800px) rotateX(25deg)", // Keep slant effect
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
    const [step, setStep] = useState(1)
    const router = useRouter()

    const handleNext = () => {
      setStep(prev => prev + 1)
    }

    const handleClose = () => {
      if (step === 3) {
        router.push('/map')
      } else {
        setStep(1)
        onOpenChange(false)
      }
    }

    const renderModalContent = () => {
      switch(step) {
        case 1:
          return (
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col items-center gap-1 text-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <span>×</span>
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </div>
                    <p>RinggitSen uses OpenFin to securely link your accounts</p>
                  </ModalHeader>
                  <ModalBody>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-5 h-5 text-green-500">🔒</div>
                          <p className="font-semibold">Secured and safe</p>
                          <p className="text-sm text-gray-500">OpenFin is authorised to collect your info securely</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-5 h-5 text-green-500">✓</div>
                          <p className="font-semibold">Your data belongs to you</p>
                          <p className="text-sm text-gray-500">OpenFin doesn't sell personal info, and will only use it with your permission</p>
                        </div>
                      </div>
  
                      <div className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-5 h-5 text-green-500">🔗</div>
                          <p className="font-semibold">Link accounts effortlessly</p>
                          <p className="text-sm text-gray-500">OpenFin will help to link your financial accounts in seconds</p>
                        </div>
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button 
                      className="w-full"
                      color="primary"
                      onPress={handleNext}
                    >
                      Let OpenFin help me link my account
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          )
        case 2:
          return (
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <span>×</span>
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </div>
                    <p>OpenFin will help you link accounts</p>
                  </ModalHeader>
                  <ModalBody>
                    <div className="space-y-4">
                      <div className="border-b pb-2">
                        <p className="font-semibold">Your Account Details</p>
                        <p className="text-sm text-gray-500">Your Personal Information</p>
                      </div>
                      <div className="border-b pb-2">
                        <p className="font-semibold">Your Balance and Transaction History</p>
                        <p className="text-sm text-gray-500">The last 120 days of transactions</p>
                      </div>
                      <div className="border-b pb-2">
                        <p className="font-semibold">Consent Purpose</p>
                        <p className="text-sm text-gray-500">Personal Finance</p>
                      </div>
                      <div className="border-b pb-2">
                        <p className="font-semibold">Consent Validity Period</p>
                        <p className="text-sm text-gray-500">Sharing data for a duration of 180 days</p>
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button 
                      className="w-full"
                      color="primary"
                      onPress={handleNext}
                    >
                      I'm ready to link
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          )
        case 3:
          return (
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    <p>Select account(s) to share information with RinggitSen</p>
                  </ModalHeader>
                  <ModalBody>
                    <div className="space-y-2">
                      {[
                        { name: "PayBank Savings", number: "1234" },
                        { name: "PayBank Current", number: "2345" },
                        { name: "PayBank Hire Purchase", number: "3456" },
                        { name: "PayBank Islamic Credit Card", number: "3456" }
                      ].map((account) => (
                        <div key={account.number} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p>{account.name}</p>
                            <p className="text-sm text-gray-500">****** {account.number}</p>
                          </div>
                          <input type="checkbox" className="h-5 w-5" defaultChecked />
                        </div>
                      ))}
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button 
                      className="w-full"
                      color="primary"
                      onPress={handleClose}
                    >
                      All set
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          )
      }
    }

    return (
      <div className="relative z-0 grid h-full w-full place-content-center overflow-hidden bg-gray-300">
        {/* Title and Cat Container */}
        <div className="flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Title above the cat */}
          <h1 className="text-center text-xl font-bold text-gray-800 mb-2">put title here</h1>
  
          {/* Centered Cat */}
          <img
            src="/screenCat.gif" // Path to the GIF
            alt="Screen Cat"
            className="w-48 h-48"
          />
        </div>
  
        {/* Get Started Button */}
        <button 
          onClick={onOpen}
          className="absolute bottom-4 left-4 right-4 z-10 rounded-lg border-[1px] bg-white py-2 text-xs sm:text-sm font-medium text-gray-700 backdrop-blur"
        >
          Get Started
        </button>

        {/* Add the Modal */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={handleClose}
          size="lg"
          scrollBehavior="inside"
        >
          {renderModalContent()}
        </Modal>
      </div>
    );
  };
  
  export default Example;
  
  
  
