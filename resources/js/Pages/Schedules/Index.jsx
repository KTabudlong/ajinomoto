import { usePage } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import ScheduleIndexLayout from "./components/ScheduleIndexLayout";
import { router } from "@inertiajs/react";

const Index = () => {
  const { schedules, filters, settings } = usePage().props;

  const handleEdit = (schedule) => {
    router.visit(route("admin.schedules.edit", schedule.id));
  };

  const handleDelete = (schedule) => {
    router.delete(route("admin.schedules.destroy", schedule.id), {
      onSuccess: () => {
        // The page will refresh automatically
      },
    });
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <ScheduleIndexLayout
          schedules={schedules}
          filters={filters}
          loading={false}
          settings={settings}
          onEdit={handleEdit}
          onDelete={handleDelete}
          auth={usePage().props.auth}
        />
      </div>
    </MainLayout>
  );
};

export default Index;
