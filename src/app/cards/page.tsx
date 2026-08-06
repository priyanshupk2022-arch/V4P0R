import { getCardsAdapter } from '@/adapters/cards';
import CardsClient from './CardsClient';

export const metadata = {
  title: 'Virtual Cards | Prava Control Center',
};

export default async function CardsPage() {
  const cards = await getCardsAdapter();
  
  return <CardsClient initialCards={cards} />;
}
