import React from 'react';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { FamilyCard } from '@/components/VisitQueue/FamilyCard';
import type { ScoredFamily } from '@/domain/models';
import messages from '@/lib/i18n/messages/pt-BR.json';

const makeScoredFamily = (lastVisitDate: string | null): ScoredFamily => ({
  family: {
    id: 'FAM-TEST',
    name: 'Família Teste',
    microAreaId: 'MA-001',
    address: 'Rua Teste, 1',
    coordinates: { lat: -23.55, lng: -46.62 },
    residents: [],
  },
  activeVisits: [],
  score: {
    total: 0.5,
    factors: [
      { key: 'time_since_visit', value: 0.5, weight: 0.4, contribution: 0.2, labelKey: 'riskFactor.timeSinceVisit' },
      { key: 'chronic_conditions', value: 0, weight: 0.25, contribution: 0, labelKey: 'riskFactor.chronicConditions' },
      { key: 'vulnerable_groups', value: 0, weight: 0.25, contribution: 0, labelKey: 'riskFactor.vulnerableGroups' },
      { key: 'follow_up', value: 0, weight: 0.1, contribution: 0, labelKey: 'riskFactor.followUp' },
    ],
  },
  daysSinceLastVisit: lastVisitDate ? 30 : Infinity,
  lastVisitDate,
  followUpRequired: false,
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="pt-BR" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

describe('FamilyCard — never-visited edge case', () => {
  it('displays "nunca visitada" label when lastVisitDate is null', () => {
    const sf = makeScoredFamily(null);
    render(
      <Wrapper>
        <FamilyCard scoredFamily={sf} isSelected={false} onSelect={() => {}} />
      </Wrapper>,
    );
    expect(screen.getByTestId('never-visited')).toBeInTheDocument();
    expect(screen.getByTestId('never-visited')).toHaveTextContent(/nunca visitada/i);
  });

  it('does not display "nunca visitada" label when lastVisitDate is not null', () => {
    const sf = makeScoredFamily('2026-04-22');
    render(
      <Wrapper>
        <FamilyCard scoredFamily={sf} isSelected={false} onSelect={() => {}} />
      </Wrapper>,
    );
    expect(screen.queryByTestId('never-visited')).not.toBeInTheDocument();
  });
});
