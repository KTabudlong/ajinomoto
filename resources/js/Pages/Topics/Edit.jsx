import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/Button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/Card/Card';
import { TextInput } from '@/Components/Form/TextInput';
import { TextareaInput } from '@/Components/Form/TextareaInput';
import { CheckboxInput } from '@/Components/Form/CheckboxInput';
import { FieldGroup } from '@/Components/Form/FieldGroup';
import { Breadcrumbs } from '@/Components/Breadcrumbs/Breadcrumbs';
import { FlashMessage } from '@/Components/Messages/FlashMessage';

export default function Edit({ auth, topic, errors }) {
    const [data, setData] = useState({
        name: topic?.name || '',
        description: topic?.description || '',
        is_active: topic?.is_active ?? true,
        sort_order: topic?.sort_order || 0,
    });

    useEffect(() => {
        if (topic) {
            setData({
                name: topic.name || '',
                description: topic.description || '',
                is_active: topic.is_active ?? true,
                sort_order: topic.sort_order || 0,
            });
        }
    }, [topic]);

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put(route('admin.topics.update', topic.id), data);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Topic
                    </h2>
                    <Link href={route('admin.topics')}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Topics
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Edit Topic" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <FlashMessage />

                    <Breadcrumbs
                        items={[
                            { 
                                label: "Admin", 
                                href: route("admin.dashboard") 
                            },
                            { 
                                label: "Topics", 
                                href: route("admin.topics") 
                            },
                            { 
                                label: topic?.name || "Edit", 
                                href: route("admin.topics.edit", topic?.id) 
                            },
                        ]}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Topic: {topic?.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <FieldGroup label="Topic Name" name="name" error={errors.name}>
                                    <TextInput
                                        name="name"
                                        error={errors.name}
                                        value={data.name}
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                        placeholder="Enter topic name"
                                        required
                                    />
                                </FieldGroup>

                                <FieldGroup label="Description" name="description" error={errors.description}>
                                    <TextareaInput
                                        name="description"
                                        error={errors.description}
                                        value={data.description}
                                        onChange={(e) => setData({ ...data, description: e.target.value })}
                                        placeholder="Enter topic description"
                                        rows={4}
                                    />
                                </FieldGroup>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FieldGroup label="Sort Order" name="sort_order" error={errors.sort_order}>
                                        <TextInput
                                            name="sort_order"
                                            type="number"
                                            error={errors.sort_order}
                                            value={data.sort_order}
                                            onChange={(e) => setData({ ...data, sort_order: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                        />
                                    </FieldGroup>

                                    <FieldGroup label="Status" name="is_active" error={errors.is_active}>
                                        <CheckboxInput
                                            name="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData({ ...data, is_active: e.target.checked })}
                                            label="Active"
                                        />
                                    </FieldGroup>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Link href={route('admin.topics')}>
                                        <Button variant="outline" type="button">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit">
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Topic
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
