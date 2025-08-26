import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import Card from '@/Components/Card/Card';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { router } from '@inertiajs/react';

const Preview = ({ complianceData, calendarEvents, filename }) => {
  const handleBack = () => {
    router.get('/admin/excel');
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  const getFrequencyColor = frequency => {
    const freq = frequency?.toLowerCase() || '';

    if (freq.includes('annual') || freq.includes('yearly')) return 'blue';
    if (freq.includes('monthly')) return 'green';
    if (freq.includes('quarterly')) return 'purple';
    if (freq.includes('weekly')) return 'orange';
    if (freq.includes('daily')) return 'red';
    if (freq.includes('every')) return 'indigo';

    return 'gray';
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 text-gray-900">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Excel Data Preview</h1>
              <Button onClick={handleBack} variant="secondary">
                ← Back to Upload
              </Button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                <strong>File:</strong> {filename}
              </p>
              <p className="text-gray-600">
                <strong>Total Tasks:</strong> {complianceData?.length || 0} |
                <strong>Total Events:</strong> {calendarEvents?.length || 0}
              </p>
            </div>

            {/* Compliance Tasks */}
            <Card className="mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Compliance Tasks</h2>

                {complianceData && complianceData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Topic
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Site
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Frequency
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {complianceData.map((task, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task.topic || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task.site || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task.activity || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant={getFrequencyColor(task.frequency)}
                              >
                                {task.frequency || 'N/A'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(task.due_date)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No compliance tasks found
                  </p>
                )}
              </div>
            </Card>

            {/* Calendar Events */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">
                  Generated Calendar Events (2025)
                </h2>

                {calendarEvents && calendarEvents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Topic
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Site
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Frequency
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {calendarEvents.map((event, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(event.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {event.topic || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {event.site || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {event.activity || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant={getFrequencyColor(event.frequency)}
                              >
                                {event.frequency || 'N/A'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No calendar events generated
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

Preview.layout = page => <MainLayout title="Excel Preview">{page}</MainLayout>;

export default Preview;
