import { SectionTabs } from '@/components/section-tabs';

const TABS = [
  { key: 'associacao', label: 'Associação', href: '/settings' },
  { key: 'usuarios', label: 'Usuários', href: '/settings/users' },
  { key: 'cpfs', label: 'CPFs liberados', href: '/settings/allowed' },
] as const;

export type SettingsTab = (typeof TABS)[number]['key'];

/** Navegação entre as páginas de Configurações. */
export function SettingsTabs({ active }: { active: SettingsTab }) {
  return <SectionTabs label='Configurações' tabs={TABS} active={active} />;
}
