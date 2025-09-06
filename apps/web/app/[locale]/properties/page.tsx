import { MainLayout, ContentLayout } from '@repo/design-system';
import { PropertiesPage } from '@repo/design-system/components/properties/properties-page';

export default function PropertiesPageRoute() {
  return (
    <MainLayout>
      <ContentLayout>
        <PropertiesPage />
      </ContentLayout>
    </MainLayout>
  );
}
