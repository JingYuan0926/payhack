import PaymentChannelUsage from '../components/PaymentChannelUsage';
import profileData from '../data/profile.json';

export default function YourPage() {
  return (
    <div className="p-4">
      <PaymentChannelUsage 
        transactions={profileData.transactions} 
        paymentChannels={profileData.paymentChannels}
      />
    </div>
  );
} 
