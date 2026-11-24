import { SectionTabs } from '@/components/section-tabs';

const TABS = [
  { key: 'caixa', label: 'Caixa', href: '/financial' },
  { key: 'mensalidades', label: 'Mensalidades', href: '/financial/monthly' },
  { key: 'cartoes', label: 'Cartões', href: '/financial/cards' },
] as const;

export type FinancialTab = (typeof TABS)[number]['key'];

/** Navegação entre as áreas do Financeiro. */
export function FinancialTabs({ active }: { active: FinancialTab }) {
  return <SectionTabs label='Financeiro' tabs={TABS} active={active} />;
}
