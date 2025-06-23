'use client';

import { useState, useEffect } from 'react';
import { Card } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { testBackendConnection, apiClient } from '~/lib/api';

interface TestResult {
    name: string;
    status: '✅ Success' | '❌ Failed';
    response: string;
}

export default function TestBackendPage() {
    const [backendStatus, setBackendStatus] = useState<string>('checking...');
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkBackend();
    }, []);

    const checkBackend = async () => {
        const result = await testBackendConnection();
        if (result.success) {
            setBackendStatus('✅ Connected');
        } else {
            setBackendStatus(`❌ Error: ${result.error}`);
        }
    };

    const runTests = async () => {
        setLoading(true);
        const tests = [
            { name: 'Root Endpoint', endpoint: '/' },
            { name: 'Health Check', endpoint: '/health' },
            { name: 'Test Endpoint', endpoint: '/test' },
        ];

        const results: TestResult[] = [];
        for (const test of tests) {
            try {
                const response = await apiClient.get(test.endpoint);
                results.push({
                    name: test.name,
                    status: '✅ Success',
                    response: JSON.stringify(response, null, 2)
                });
            } catch (error) {
                results.push({
                    name: test.name,
                    status: '❌ Failed',
                    response: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        }

        setTestResults(results);
        setLoading(false);
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Backend Connection Test</h1>

            <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Backend Status</h2>
                <p className="text-lg mb-4">Status: {backendStatus}</p>
                <div className="space-x-4">
                    <Button
                        onClick={checkBackend}
                        variant="outline"
                    >
                        Check Connection
                    </Button>
                    <Button
                        onClick={runTests}
                        disabled={loading}
                        variant="default"
                    >
                        {loading ? 'Running Tests...' : 'Run All Tests'}
                    </Button>
                </div>
            </Card>

            {testResults.length > 0 && (
                <div className="space-y-4">
                    {testResults.map((result, index) => (
                        <Card key={index} className="p-4">
                            <h3 className="font-semibold mb-2">{result.name}</h3>
                            <p className="mb-2">{result.status}</p>
                            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto">
                                {result.response}
                            </pre>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 