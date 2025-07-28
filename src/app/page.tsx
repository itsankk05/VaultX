import { getBanks } from '@/lib/actions';
import HomePage from '@/components/HomePage';

export default async function Page() {
  const banks = await getBanks();

  return (
    <div className="min-h-screen bg-background">
      <HomePage initialBanks={banks} />
    </div>
  );
}
