import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  RotateCcw,
} from 'lucide-react';
import MainLayout from '@/Layouts/MainLayout';
import Button from '@/Components/Button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/Card';
import { Badge } from '@/Components/Badge/Badge';

import Pagination from '@/Components/Pagination/Pagination';
import ConfirmationModal from '@/Components/Modal/ConfirmationModal';
import { FlashMessage } from '@/Components/Messages';
import Breadcrumbs from '@/Components/Breadcrumbs/Breadcrumbs';

export default function Index({ auth, topics, filters = {} }) {
  // Debug logging
  console.log('Topics data received:', topics);
  console.log('Topics type:', typeof topics);
  console.log('Topics.data type:', typeof topics?.data);
  console.log('Topics.data:', topics?.data);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [topicToRestore, setTopicToRestore] = useState(null);

  const handleDelete = topic => {
    setTopicToDelete(topic);
    setShowDeleteModal(true);
  };

  const handleRestore = topic => {
    setTopicToRestore(topic);
    setShowRestoreModal(true);
  };

  const confirmDelete = () => {
    if (topicToDelete) {
      router.delete(route('admin.topics.destroy', topicToDelete.id), {
        onSuccess: () => {
          setShowDeleteModal(false);
          setTopicToDelete(null);
        },
      });
    }
  };

  const confirmRestore = () => {
    if (topicToRestore) {
      router.put(
        route('admin.topics.restore', topicToRestore.id),
        {},
        {
          onSuccess: () => {
            setShowRestoreModal(false);
            setTopicToRestore(null);
          },
        }
      );
    }
  };

  const handleSearch = searchTerm => {
    router.get(
      route('admin.topics'),
      { search: searchTerm },
      {
        preserveState: true,
        replace: true,
      }
    );
  };

  const handleFilter = filters => {
    router.get(route('admin.topics'), filters, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusBadge = topic => {
    if (topic.deleted_at) {
      return <Badge variant="destructive">Deleted</Badge>;
    }
    return topic.is_active ? (
      <Badge variant="default">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Topics
        </h2>
        <Link href={route('admin.topics.create')}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Topic
          </Button>
        </Link>
      </div>


      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <FlashMessage />

          <Breadcrumbs
            items={[
              {
                label: 'Admin',
                href: route('admin.dashboard'),
              },
              {
                label: 'Topics',
                href: route('admin.topics'),
              },
            ]}
          />

          <Card>
            <CardHeader>
              <CardTitle>Manage Topics</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative flex bg-white rounded shadow">
                  <input
                    type="text"
                    name="search"
                    placeholder="Search topics..."
                    autoComplete="off"
                    defaultValue={filters?.search || ''}
                    onChange={e => handleSearch(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <Button variant="outline" onClick={() => handleFilter({})}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!topics?.data || !Array.isArray(topics.data) ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Invalid data structure received from server.</p>
                  <p className="text-sm text-gray-400 mt-2">Please check the console for details.</p>
                  <Link href={route('admin.topics.create')}>
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Topic
                    </Button>
                  </Link>
                </div>
              ) : topics.data.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No topics found.</p>
                  <Link href={route('admin.topics.create')}>
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Topic
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sort Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(topics?.data) && topics.data.map(topic => (
                        <tr key={topic.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {topic.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className="text-sm text-gray-500 max-w-[200px] truncate"
                              title={topic.description}
                            >
                              {topic.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(topic)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {topic.sort_order || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(topic.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link href={route('admin.topics.edit', topic.id)}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              {topic.deleted_at ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRestore(topic)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(topic)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {topics?.links && Array.isArray(topics?.data) && (
                <div className="mt-6">
                  <Pagination links={topics.links} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Topic"
        message={`Are you sure you want to delete "${topicToDelete?.name || 'this topic'}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
      />

      <ConfirmationModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={confirmRestore}
        title="Restore Topic"
        message={`Are you sure you want to restore "${topicToRestore?.name || 'this topic'}"?`}
        confirmText="Restore"
        confirmVariant="default"
      />
    </>
  );
}

Index.layout = (page) => <MainLayout title="Topics">{page}</MainLayout>;
