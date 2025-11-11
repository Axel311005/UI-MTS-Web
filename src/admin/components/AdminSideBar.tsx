import { CustomSideBar } from '@/shared/components/custom/CustomSideBar';
import { getGroupedNavigationItems } from '@/shared/config/navigation';

interface AdminSideBarProps {
  userType: 'gerente' | 'vendedor';
}

export const AdminSideBar = ({ userType }: AdminSideBarProps) => {
  const { navigationItems, catalogItems, segurosItems, systemItems } =
    getGroupedNavigationItems(userType);

  return (
    <CustomSideBar
      navigationItems={navigationItems}
      catalogItems={catalogItems}
      segurosItems={segurosItems}
      systemItems={systemItems}
    />
  );
};
