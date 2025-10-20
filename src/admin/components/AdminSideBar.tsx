import { CustomSideBar } from '@/shared/components/custom/CustomSideBar';
import { getGroupedNavigationItems } from '@/shared/config/navigation';

interface AdminSideBarProps {
  userType: 'gerente' | 'vendedor';
}

export const AdminSideBar = ({ userType }: AdminSideBarProps) => {
  const { navigationItems, catalogItems, systemItems } =
    getGroupedNavigationItems(userType);

  return (
    <CustomSideBar
      navigationItems={navigationItems}
      catalogItems={catalogItems}
      systemItems={systemItems}
    />
  );
};
