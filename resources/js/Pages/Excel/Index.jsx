import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import Card from '@/Components/Card/Card';
import Button from '@/Components/Button/Button';
import Alert from '@/Components/Alert/Alert';
import { router } from '@inertiajs/react';
import { getCsrfToken } from '@/utils/csrf';

const Index = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setError(null);
        setResult(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setError('Please select a file');
            return;
        }

        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append('excel_file', file);

        try {
            const response = await fetch('/admin/excel/process', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.message || 'An error occurred while processing the file');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePreview = () => {
        if (!file) return;
        
        const formData = new FormData();
        formData.append('excel_file', file);
        
        router.post('/admin/excel/preview', formData);
    };

    const handleDownload = () => {
        if (!file) return;
        
        setIsProcessing(true);
        
        const formData = new FormData();
        formData.append('excel_file', file);
        
        fetch('/admin/excel/download', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
            },
        })
        .then(response => {
            if (response.ok) {
                return response.blob();
            }
            throw new Error('Download failed');
        })
        .then(blob => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compliance_data.json';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Download error:', error);
            setError('Download failed: ' + error.message);
        })
        .finally(() => {
            setIsProcessing(false);
        });
    };

    const handleExportMasterExcel = () => {
        if (!file) return;
        
        setIsProcessing(true);
        setError('');
        
        const formData = new FormData();
        formData.append('excel_file', file);
        
        const csrfToken = getCsrfToken();
        console.log('CSRF Token:', csrfToken);
        console.log('File being sent:', file);
        
        fetch('/admin/excel/export-master-excel', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (response.ok) {
                return response.blob();
            }
            
            // Get error details from response
            return response.text().then(text => {
                console.log('Error response body:', text);
                throw new Error(`Export failed: ${response.status} - ${text}`);
            });
        })
        .then(blob => {
            console.log('Received blob:', blob);
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'master_calendar_export.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Export error:', error);
            setError('Export failed: ' + error.message);
        })
        .finally(() => {
            setIsProcessing(false);
        });
    };

    const handleExportMasterCsv = () => {
        if (!file) return;
        
        setIsProcessing(true);
        
        const formData = new FormData();
        formData.append('excel_file', file);
        
        fetch('/admin/excel/export-master-csv', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
            },
        })
        .then(response => {
            if (response.ok) {
                return response.blob();
            }
            throw new Error('Export failed');
        })
        .then(blob => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'master_calendar_export.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Export error:', error);
            setError('Export failed: ' + error.message);
        })
        .finally(() => {
            setIsProcessing(false);
        });
    };

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <h1 className="text-2xl font-semibold mb-6">Excel Compliance Calendar Processor</h1>
                        
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-medium mb-4">Upload Excel File</h2>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="excel_file" className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Excel File (.xlsx, .xls)
                                        </label>
                                        <input
                                            type="file"
                                            id="excel_file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            Maximum file size: 10MB. Supported formats: .xlsx, .xls
                                        </p>
                                    </div>

                                    <div className="flex space-x-3">
                                        <Button
                                            type="submit"
                                            disabled={!file || isProcessing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isProcessing ? 'Processing...' : 'Process File'}
                                        </Button>
                                        
                                        {file && (
                                            <>
                                                <Button
                                                    type="button"
                                                    onClick={handlePreview}
                                                    variant="secondary"
                                                >
                                                    Preview
                                                </Button>
                                                
                                                <Button
                                                    type="button"
                                                    onClick={handleDownload}
                                                    variant="secondary"
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? 'Downloading...' : 'Download JSON'}
                                                </Button>
                                                
                                                <Button
                                                    type="button"
                                                    onClick={handleExportMasterExcel}
                                                    variant="secondary"
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? 'Exporting...' : 'Export Master Excel'}
                                                </Button>
                                                
                                                <Button
                                                    type="button"
                                                    onClick={handleExportMasterCsv}
                                                    variant="secondary"
                                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? 'Exporting...' : 'Export Master CSV'}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </Card>

                        {error && (
                            <Alert variant="error" className="mt-4">
                                {error}
                            </Alert>
                        )}

                        {result && (
                            <Card className="mt-6">
                                <div className="p-6">
                                    <h2 className="text-lg font-medium mb-4">Processing Results</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h3 className="font-medium text-blue-900">Total Tasks</h3>
                                            <p className="text-2xl font-bold text-blue-600">{result.summary.total_tasks}</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h3 className="font-medium text-green-900">Total Events</h3>
                                            <p className="text-2xl font-bold text-green-600">{result.summary.total_events}</p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <h3 className="font-medium text-purple-900">File</h3>
                                            <p className="text-sm text-purple-600 truncate">{result.summary.filename}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-medium mb-2">Compliance Tasks</h3>
                                            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                                                <pre className="text-sm text-gray-700">
                                                    {JSON.stringify(result.compliance_tasks, null, 2)}
                                                </pre>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-medium mb-2">Calendar Events</h3>
                                            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                                                <pre className="text-sm text-gray-700">
                                                    {JSON.stringify(result.calendar_events, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

Index.layout = (page) => <MainLayout title="Excel Processor">{page}</MainLayout>;

export default Index;
