import { useState, useEffect } from "react";
import { OrganizationEditor } from "@/components/custom/OrganizationEditor";
import { OrganizationGraph } from "@/components/custom/OrganizationGraph";
import { Button } from "@/components/ui/button";
import { useOrganizationTree } from "@/hooks/queries/useOrganization";
import { Organization } from "@/types";
import {
    Loader2,
    Building2,
    Network,
    Upload,
    Settings,
    AlertCircle,
    RefreshCw
} from "lucide-react";
import { mockOrganizationsWithChildren } from "@/mocks/organizations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const OrganizationStructurePage = () => {
    // 使用 React Query hook 獲取組織結構
    const { data: initialData, isLoading, error, refetch } = useOrganizationTree();

    // Debug logging
    console.log('Organization Tree Page Debug:', {
        initialData,
        isLoading,
        error,
        dataType: typeof initialData,
        dataLength: Array.isArray(initialData) ? initialData.length : 'not array',
    });

    const [organizationData, setOrganizationData] = useState<Organization[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeView, setActiveView] = useState<'editor' | 'graph'>('graph');
    const [editorError, setEditorError] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);


    // 當資料載入完成時，設定初始資料
    useEffect(() => {
        console.log('useEffect triggered with:', {
            initialData,
            isLoading,
            hasData: !!initialData,
            dataLength: Array.isArray(initialData) ? initialData.length : 'not array',
        });



        if (initialData && Array.isArray(initialData) && initialData.length > 0) {
            console.log('Setting organization data from API');
            setOrganizationData(initialData);
        } else if (!isLoading) {
            // 如果沒有資料或資料為空，使用 mock 資料
            console.log('Using mock data for organization structure');
            setOrganizationData(mockOrganizationsWithChildren);
        }
    }, [initialData, isLoading]);

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleUpload = () => {
        console.log("Uploading organization structure...", organizationData);
        // TODO: 實作上傳組織結構的 API
        // 這裡可能需要新的 API endpoint 來更新整個組織結構
        setHasChanges(false);
    };

    // 載入狀態處理
    if (isLoading || isRefreshing) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Loading organization structure...</p>
                </div>
            </div>
        );
    }

    // 錯誤處理
    if (error) {
        return (
            <div className="p-4">
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load organization structure: {error.message}
                    </AlertDescription>
                </Alert>
                <Button
                    onClick={() => refetch()}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Organization Structure</h1>
                            <p className="text-muted-foreground">Manage and visualize your company hierarchy</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={handleRefresh}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>

                        <Button
                            className="flex items-center gap-2"
                            onClick={handleUpload}
                            disabled={!hasChanges}
                            variant={hasChanges ? "destructive" : "secondary"}
                        >
                            <Upload className="h-4 w-4" />
                            {hasChanges ? 'Save Changes' : 'No Changes'}
                        </Button>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-secondary/20 p-1 rounded-lg w-fit">
                    <Button
                        variant={activeView === 'graph' ? 'default' : 'ghost'}
                        className="flex items-center gap-2"
                        onClick={() => setActiveView('graph')}
                    >
                        <Network className="h-4 w-4" />
                        Visualization
                    </Button>
                    <Button
                        variant={activeView === 'editor' ? 'default' : 'ghost'}
                        className="flex items-center gap-2"
                        onClick={() => setActiveView('editor')}
                    >
                        <Settings className="h-4 w-4" />
                        Editor
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* Left Panel - Editor */}
                <div className={`xl:col-span-2 ${activeView === 'editor' ? 'block' : 'hidden xl:block'}`}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Structure Editor
                            </CardTitle>
                            <CardDescription>
                                Add, edit, or remove departments and manage reporting relationships
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {editorError && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{editorError}</AlertDescription>
                                </Alert>
                            )}
                            <OrganizationEditor
                                data={organizationData}
                                onChange={(updated) => {
                                    console.log("父層接收到更新資料：", updated);
                                    setOrganizationData(updated);
                                    setHasChanges(true);
                                }}
                                onError={setEditorError}
                            />
                        </CardContent>

                    </Card>
                </div>

                {/* Right Panel - Visualization */}
                <div className={`xl:col-span-3 ${activeView === 'graph' ? 'block' : 'hidden xl:block'}`}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="h-5 w-5" />
                                Organization Chart
                            </CardTitle>
                            <CardDescription>
                                Interactive visualization of your organization structure
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-secondary/5 rounded-lg border border-border/50 min-h-[600px] relative">
                                <OrganizationGraph data={organizationData} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Last synced: {new Date().toLocaleString()}</span>
                </div>
                <div>
                    Total departments: {organizationData.length}
                </div>
            </div>
        </div>
    );
};

export default OrganizationStructurePage;
