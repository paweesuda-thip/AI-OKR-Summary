"use client";

import { useState } from 'react';
import apiService from '@/lib/services/api-service';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Send, ChevronDown, ChevronRight, CheckCircle2, XCircle, FlaskConical, Upload, Info } from "lucide-react";

interface TestResult {
    success: boolean;
    data?: unknown;
    requestParams?: Record<string, number>;
    error?: {
        message: string;
        details: string;
    };
}

export default function APITestTool() {
    // ── Form State ────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        assessmentSetId: '23980',
        organizationId: '14904',
    });

    // ── Result State ──────────────────────────────────────────────────────
    const [result, setResult] = useState<TestResult | null>(null);
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
        } catch (err: unknown) {
            console.error('API Test Error:', err);
            const errorObj = err as { response?: { data?: { message?: string } }, message?: string };
            const errorMsg = errorObj?.response?.data?.message || errorObj?.message || 'API call failed';
            setError(errorMsg);
            setResult({
                success: false,
                error: {
                    message: errorMsg,
                    details: String(err),
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
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="pb-4 border-b border-border">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                        <FlaskConical className="w-8 h-8 text-primary" />
                    </div>
                    API Test Tool
                </h1>
                <p className="text-muted-foreground text-lg mt-2">
                    Test the new endpoint with custom parameters
                </p>
            </div>

            {/* Main Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* ─── Left: Input Form ───────────────────────────────────────*/}
                <Card className="lg:col-span-5 shadow-sm sticky top-8 border-border">
                    <CardHeader className="border-b border-border/50 bg-muted/20 pb-5">
                        <CardTitle className="text-xl text-primary">Request Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Assessment Set ID */}
                        <div className="space-y-2.5">
                            <Label htmlFor="assessmentSetId" className="text-foreground font-semibold">
                                Assessment Set ID
                            </Label>
                            <Input
                                id="assessmentSetId"
                                type="number"
                                name="assessmentSetId"
                                value={formData.assessmentSetId}
                                onChange={handleInputChange}
                                className="font-mono bg-background"
                            />
                            <p className="text-xs text-muted-foreground">
                                Required ID for the assessment set
                            </p>
                        </div>

                        {/* Organization ID */}
                        <div className="space-y-2.5">
                            <Label htmlFor="organizationId" className="text-foreground font-semibold">
                                Organization ID
                            </Label>
                            <Input
                                id="organizationId"
                                type="number"
                                name="organizationId"
                                placeholder="e.g., 14904"
                                value={formData.organizationId}
                                onChange={handleInputChange}
                                className="font-mono bg-background"
                            />
                            <p className="text-xs text-muted-foreground">
                                Organization ID to fetch OKR data (required)
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2 pb-6 px-6 gap-3">
                        <Button
                            onClick={handleTestAPI}
                            disabled={loading}
                            className="flex-1 shadow-sm"
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
                            className="shadow-sm"
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
                        <Card className="border-destructive/50 bg-destructive/5 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                            <CardHeader className="pb-3 pt-5">
                                <CardTitle className="text-destructive flex items-center gap-2 text-lg">
                                    <XCircle className="w-5 h-5" /> Error
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-destructive/90 font-medium">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Request Details */}
                    {result?.requestParams && (
                        <Card className="shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 border-border">
                            <button
                                onClick={() => setShowRequest(!showRequest)}
                                className="w-full text-left font-semibold text-foreground hover:bg-muted/50 transition-colors flex items-center justify-between px-6 py-4"
                            >
                                <span className="flex items-center gap-2">
                                    <Upload className="w-4 h-4 text-muted-foreground" /> Request Sent
                                </span>
                                {showRequest ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                            </button>
                            {showRequest && (
                                <div className="px-6 pb-6 border-t border-border pt-4 bg-muted/10">
                                    <pre className="bg-background p-4 rounded-xl text-xs text-foreground overflow-x-auto border border-border font-mono leading-relaxed shadow-inner">
                                        {JSON.stringify(result.requestParams, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Success Response */}
                    {result?.success && result?.data && (
                        <Card className="shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 border-border">
                            <CardHeader className="border-b border-border/50 bg-muted/10 pb-5">
                                <CardTitle className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> Response
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {/* Response Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-background border border-border p-4 rounded-xl flex flex-col justify-center items-center shadow-sm">
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Objectives</p>
                                        <p className="text-3xl font-bold text-primary">
                                            {result.data.objectives?.length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-background border border-border p-4 rounded-xl flex flex-col justify-center items-center shadow-sm">
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Contributors</p>
                                        <p className="text-3xl font-bold text-primary">
                                            {result.data.contributors?.length || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Full Response Toggle */}
                                <div className="border border-border rounded-xl overflow-hidden bg-muted/10">
                                    <button 
                                        onClick={() => setShowFullResponse(!showFullResponse)}
                                        className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
                                    >
                                        View Full Response
                                        {showFullResponse ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                    
                                    {showFullResponse && (
                                        <div className="p-4 border-t border-border bg-background">
                                            <pre className="text-xs text-foreground overflow-x-auto max-h-[500px] font-mono leading-relaxed custom-scrollbar p-2">
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
                        <div className="border border-border border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center bg-muted/5">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border/50">
                                <Send className="w-6 h-6 text-muted-foreground ml-1" />
                            </div>
                            <p className="text-foreground text-lg font-semibold">Ready to test</p>
                            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                                Configure parameters on the left and click &quot;Send Request&quot;
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Info */}
            <Card className="mt-12 shadow-sm border-border/60 bg-muted/5">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" /> API Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold text-muted-foreground">Endpoint:</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary font-mono text-xs font-bold rounded border border-primary/20">POST</span>
                        <code className="bg-background border border-border px-3 py-1.5 rounded-md text-sm text-foreground font-mono shadow-sm">
                            /api/okr/objectives
                        </code>
                    </div>
                    
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Required Parameters:</p>
                        <div className="flex flex-wrap gap-2">
                            <code className="bg-background border border-border px-2.5 py-1 rounded text-sm text-foreground font-mono shadow-sm">assessmentSetId</code>
                            <code className="bg-background border border-border px-2.5 py-1 rounded text-sm text-foreground font-mono shadow-sm">organizationId</code>
                        </div>
                    </div>
                    
                    <div className="bg-background rounded-lg p-4 text-sm text-muted-foreground flex items-start gap-3 border border-border shadow-sm">
                        <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            <strong className="text-foreground font-semibold">Note:</strong> Response is an array with a <code className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">status</code> wrapper. No date parameters needed.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
