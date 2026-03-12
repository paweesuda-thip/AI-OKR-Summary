"use client";

import { useState } from 'react';
import apiService from '@/lib/services/api-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Send, ChevronDown, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

export default function APITestTool() {
    // ── Form State ────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        assessmentSetId: '23980',
        organizationId: '14904',
    });

    // ── Result State ──────────────────────────────────────────────────────
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showRequest, setShowRequest] = useState(false);
    const [showFullResponse, setShowFullResponse] = useState(false);

    // ── Input Handlers ────────────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            // Prepare request params
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
        } catch (err: any) {
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
        setShowFullResponse(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 pt-24 md:pt-32">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-slate-100 flex items-center gap-3">
                        <span className="text-4xl">🧪</span> API Test Tool
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Test the new endpoint with custom parameters
                    </p>
                </div>

                {/* Main Container */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* ─── Left: Input Form ───────────────────────────────────────*/}
                    <Card className="lg:col-span-5 bg-slate-900 border-slate-800 shadow-xl overflow-hidden sticky top-8">
                        <CardHeader className="border-b border-slate-800 bg-slate-900/50 pb-5">
                            <CardTitle className="text-xl text-blue-400">Request Parameters</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* Assessment Set ID */}
                            <div className="space-y-2.5">
                                <Label htmlFor="assessmentSetId" className="text-slate-300 font-medium">
                                    Assessment Set ID
                                </Label>
                                <Input
                                    id="assessmentSetId"
                                    type="number"
                                    name="assessmentSetId"
                                    value={formData.assessmentSetId}
                                    onChange={handleInputChange}
                                    className="bg-slate-950 border-slate-700 text-slate-100 focus-visible:ring-blue-500 font-mono"
                                />
                                <p className="text-xs text-slate-500">
                                    Required ID for the assessment set
                                </p>
                            </div>

                            {/* Organization ID */}
                            <div className="space-y-2.5">
                                <Label htmlFor="organizationId" className="text-slate-300 font-medium">
                                    Organization ID
                                </Label>
                                <Input
                                    id="organizationId"
                                    type="number"
                                    name="organizationId"
                                    placeholder="e.g., 14904"
                                    value={formData.organizationId}
                                    onChange={handleInputChange}
                                    className="bg-slate-950 border-slate-700 text-slate-100 focus-visible:ring-blue-500 font-mono"
                                />
                                <p className="text-xs text-slate-500">
                                    Organization ID to fetch OKR data (required)
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 pb-6 px-6 gap-3">
                            <Button
                                onClick={handleTestAPI}
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing...</>
                                ) : (
                                    <><Send className="w-4 h-4 mr-2" /> Send Request</>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleClear}
                                className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* ─── Right: Response Display ────────────────────────────────*/}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Error Display */}
                        {error && (
                            <Card className="bg-rose-950/20 border-rose-900/50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                <CardHeader className="pb-3 pt-5">
                                    <CardTitle className="text-rose-400 flex items-center gap-2 text-lg">
                                        <XCircle className="w-5 h-5" /> Error
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-rose-300 font-medium">{error}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Request Details */}
                        {result?.requestParams && (
                            <Card className="bg-slate-900 border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                <button
                                    onClick={() => setShowRequest(!showRequest)}
                                    className="w-full text-left font-semibold text-slate-300 hover:bg-slate-800/50 transition-colors flex items-center justify-between px-6 py-4"
                                >
                                    <span className="flex items-center gap-2">
                                        📤 Request Sent
                                    </span>
                                    {showRequest ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                                </button>
                                {showRequest && (
                                    <div className="px-6 pb-6 border-t border-slate-800 pt-4">
                                        <pre className="bg-slate-950 p-4 rounded-xl text-xs text-slate-300 overflow-x-auto border border-slate-800 font-mono leading-relaxed">
                                            {JSON.stringify(result.requestParams, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Success Response */}
                        {result?.success && result?.data && (
                            <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                <CardHeader className="border-b border-slate-800 bg-slate-900/50 pb-5">
                                    <CardTitle className="text-emerald-400 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" /> Response
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {/* Response Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-center items-center">
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Objectives</p>
                                            <p className="text-3xl font-bold text-blue-400">
                                                {result.data.objectives?.length || 0}
                                            </p>
                                        </div>
                                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-center items-center">
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Contributors</p>
                                            <p className="text-3xl font-bold text-blue-400">
                                                {result.data.contributors?.length || 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Full Response Toggle */}
                                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                                        <button 
                                            onClick={() => setShowFullResponse(!showFullResponse)}
                                            className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                                        >
                                            View Full Response
                                            {showFullResponse ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                        
                                        {showFullResponse && (
                                            <div className="p-4 border-t border-slate-800 bg-slate-950">
                                                <pre className="text-xs text-slate-300 overflow-x-auto max-h-[500px] font-mono leading-relaxed custom-scrollbar">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* No Result Yet */}
                        {!result && !error && (
                            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center opacity-70">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Send className="w-6 h-6 text-slate-500 ml-1" />
                                </div>
                                <p className="text-slate-400 text-lg font-medium">Ready to test</p>
                                <p className="text-slate-500 text-sm mt-1 max-w-xs">
                                    Configure parameters on the left and click "Send Request"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <Card className="bg-slate-900 border-slate-800 mt-12">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-slate-300 flex items-center gap-2">
                            📌 API Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium text-slate-400">Endpoint:</span>
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold rounded border border-emerald-500/20">POST</span>
                            <code className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-md text-sm text-blue-300 font-mono">
                                /api/okr/objectives
                            </code>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-2">Required Parameters:</p>
                            <div className="flex flex-wrap gap-2">
                                <code className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-sm text-slate-300 font-mono">assessmentSetId</code>
                                <code className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-sm text-slate-300 font-mono">organizationId</code>
                            </div>
                        </div>
                        
                        <div className="bg-slate-800/40 rounded-lg p-3 text-sm text-slate-400 flex items-start gap-2 border border-slate-700/50">
                            <span>ℹ️</span>
                            <p>
                                <strong className="text-slate-300 font-medium">Note:</strong> Response is an array with a <code className="bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-xs">status</code> wrapper. No date parameters needed.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
