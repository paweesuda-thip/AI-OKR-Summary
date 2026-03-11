import { useState } from 'react';
import apiService from '../services/apiService';

const APITestTool = () => {
    // ── Form State ────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        assessmentSetId: 23980,
        organizationId: 14904,
    });

    // ── Result State ──────────────────────────────────────────────────────
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showRequest, setShowRequest] = useState(false);

    // ── Input Handlers ────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // ── API Call ──────────────────────────────────────────────────────────
    const handleTestAPI = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Prepare request params (simplified for new API)
            const params = {
                assessmentSetId: parseInt(formData.assessmentSetId) || 1,
                organizationId: parseInt(formData.organizationId) || 14904,
            };

            // Make API call
            const response = await apiService.getOKRTeamDashboard(params);

            setResult({
                success: true,
                data: response,
                requestParams: params,
            });
        } catch (err) {
            console.error('API Test Error:', err);
            const errorMsg = err?.response?.data?.message || err?.message || 'API call failed';
            setError(errorMsg);
            setResult({
                success: false,
                error: {
                    message: errorMsg,
                    details: err,
                },
            });
        } finally {
            setLoading(false);
        }
    };

    // ── Clear All ─────────────────────────────────────────────────────────
    const handleClear = () => {
        setResult(null);
        setError('');
        setShowRequest(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">🧪 API Test Tool</h1>
                    <p className="text-slate-400">
                        Test the new GetOKRTeamDashboardAsync endpoint with custom parameters
                    </p>
                </div>

                {/* Main Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ─── Left: Input Form ───────────────────────────────────────*/}
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6 text-blue-400">
                            Request Parameters
                        </h2>

                        {/* Assessment Set ID */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Assessment Set ID
                            </label>
                            <input
                                type="number"
                                name="assessmentSetId"
                                value={formData.assessmentSetId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Assessment Set ID (required)
                            </p>
                        </div>

                        {/* Organization ID */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Organization ID
                            </label>
                            <input
                                type="number"
                                name="organizationId"
                                placeholder="e.g., 14904"
                                value={formData.organizationId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Organization ID to fetch OKR data (required)
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleTestAPI}
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 px-4 py-2 rounded font-medium transition-colors"
                            >
                                {loading ? '⏳ Testing...' : '🚀 Send Request'}
                            </button>
                            <button
                                onClick={handleClear}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-medium transition-colors"
                            >
                                🗑️ Clear
                            </button>
                        </div>
                    </div>

                    {/* ─── Right: Response Display ────────────────────────────────*/}
                    <div className="space-y-6">
                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                                <h3 className="font-semibold text-red-400 mb-2">❌ Error</h3>
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Request Details */}
                        {result?.requestParams && (
                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                                <button
                                    onClick={() => setShowRequest(!showRequest)}
                                    className="w-full text-left font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-between"
                                >
                                    📤 Request Sent
                                    <span className="text-xs text-slate-500">
                                        {showRequest ? '▼' : '▶'}
                                    </span>
                                </button>
                                {showRequest && (
                                    <pre className="mt-3 bg-slate-800 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                                        {JSON.stringify(result.requestParams, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Success Response */}
                        {result?.success && result?.data && (
                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                                <h3 className="font-semibold text-green-400 mb-4">✅ Response</h3>
                                
                                {/* Response Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-slate-800 p-3 rounded">
                                        <p className="text-xs text-slate-400">Objectives</p>
                                        <p className="text-lg font-bold text-blue-400">
                                            {result.data.objectives?.length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded">
                                        <p className="text-xs text-slate-400">Contributors</p>
                                        <p className="text-lg font-bold text-blue-400">
                                            {result.data.contributors?.length || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Full Response */}
                                <details>
                                    <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 font-medium">
                                        View Full Response
                                    </summary>
                                    <pre className="mt-3 bg-slate-800 p-3 rounded text-xs text-slate-300 overflow-x-auto max-h-96">
                                        {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        )}

                        {/* No Result Yet */}
                        {!result && !error && (
                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 text-center">
                                <p className="text-slate-400">
                                    Configure parameters and click "Send Request" to test the API
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-300 mb-2">📌 API Information</h3>
                    <p className="text-sm text-slate-400 mb-2">
                        <strong>Endpoint:</strong> POST <code className="bg-slate-800 px-2 py-1 rounded">/api/okr/objectives</code>
                    </p>
                    <p className="text-sm text-slate-400 mb-2">
                        <strong>Required Parameters:</strong>
                    </p>
                    <ul className="text-sm text-slate-400 space-y-1 ml-4 list-disc">
                        <li><code className="bg-slate-800 px-2 py-1 rounded">assessmentSetId</code></li>
                        <li><code className="bg-slate-800 px-2 py-1 rounded">organizationId</code></li>
                    </ul>
                    <p className="text-sm text-slate-400 mt-3">
                        <strong>Note:</strong> Response is an array with <code className="bg-slate-800 px-2 py-1 rounded">status</code> wrapper. No date parameters needed.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default APITestTool;
