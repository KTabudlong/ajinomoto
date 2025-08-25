import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Filter, Trash2, Edit, Eye } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/Button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/Card/Card';
import { Badge } from '@/Components/Badge/Badge';
import { SearchBar } from '@/Components/SearchBar/SearchBar';
import { Pagination } from '@/Components/Pagination/Pagination';
import { ConfirmationModal } from '@/Components/Modal/ConfirmationModal';
import { FlashMessage } from '@/Components/Messages/FlashMessage';

export default function Index({ auth, activities, filters }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState(null);

    const handleDelete = (activity) => {
        setActivityToDelete(activity);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (activityToDelete) {
            router.delete(route('admin.activities.destroy', activityToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setActivityToDelete(null);
                },
            });
        }
    };

    const handleSearch = (searchTerm) => {
        router.get(route('admin.activities'), { search: searchTerm }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilter = (filters) => {
        router.get(route('admin.activities'), filters, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'active': 'success',
            'paused': 'warning',
            'completed': 'info',
            'cancelled': 'destructive',
        };

        return (
            <Badge variant={statusColors[status.slug] || 'secondary'}>
                {status.name}
            </Badge>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Activities
                    </h2>
                    <Link href={route('admin.activities.create')}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Activity
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Activities" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <FlashMessage />

                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Activities</CardTitle>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <SearchBar
                                    placeholder="Search activities..."
                                    onSearch={handleSearch}
                                    defaultValue={filters.search}
                                />
                                <Button variant="outline" onClick={() => handleFilter({})}>
                                    <Filter className="w-4 h-4 mr-2" />
                                    Clear Filters
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {activities.data.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No activities found.</p>
                                    <Link href={route('admin.activities.create')}>
                                        <Button className="mt-4">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Your First Activity
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Site
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Topic
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Dates
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {activities.data.map((activity) => (
                                                <tr key={activity.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {activity.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {activity.description?.substring(0, 50)}
                                                            {activity.description?.length > 50 && '...'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge variant="secondary">
                                                            {activity.activity_type?.name}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {activity.site?.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {activity.topic?.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(activity.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <div>
                                                            <div>Start: {new Date(activity.start_date).toLocaleDateString()}</div>
                                                            <div>End: {new Date(activity.end_date).toLocaleDateString()}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link href={route('admin.activities.show', activity.id)}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={route('admin.activities.edit', activity.id)}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(activity)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {activities.links && (
                                    <div className="mt-6">
                                        <Pagination links={activities.links} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Card>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Activity"
                message={`Are you sure you want to delete "${activityToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="destructive"
            />
        </AuthenticatedLayout>
    );
}
