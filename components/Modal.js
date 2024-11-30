import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react"
import { useRouter } from 'next/router'

export default function OnboardingModal({ isOpen, onOpenChange }) {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const handleNext = () => {
    setStep(prev => prev + 1)
  }

  const handleClose = () => {
    setStep(1)
    onOpenChange(false)
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
                  <p>FinPet uses Open Finance API to securely link your accounts</p>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-5 h-5 text-green-500">🔒</div>
                        <p className="font-semibold">Secured and safe</p>
                        <p className="text-sm text-gray-500">Open Finance API is authorised to collect your info securely</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-5 h-5 text-green-500">✓</div>
                        <p className="font-semibold">Your data belongs to you</p>
                        <p className="text-sm text-gray-500">Open Finance API doesn&apos;t sell personal info, and will only use it with your permission</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-5 h-5 text-green-500">🔗</div>
                        <p className="font-semibold">Link accounts effortlessly</p>
                        <p className="text-sm text-gray-500">Open Finance API will help to link your financial accounts in seconds</p>
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
                    Let Open Finance API help me link my account
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
                  <p>Open Finance API will help you link accounts</p>
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
                    I&apos;m ready to link
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
                  <p>Select account(s) to share information with FinPet</p>
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
                    onPress={() => {
                      handleClose()
                      router.push('/map')
                    }}
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
    <Modal 
      isOpen={isOpen} 
      onOpenChange={handleClose}
      size="lg"
      scrollBehavior="inside"
    >
      {renderModalContent()}
    </Modal>
  )
}