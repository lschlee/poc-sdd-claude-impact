import { roster } from '@/data/roster';
import { FamilyDetailClient } from './FamilyDetailClient';

export function generateStaticParams() {
  return roster.families.map(f => ({ id: f.id }));
}

export default function FamilyDetailPage({ params }: { params: { id: string } }) {
  return <FamilyDetailClient familyId={params.id} />;
}
