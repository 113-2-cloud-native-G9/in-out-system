import { useState, useEffect } from "react";
import { OrganizationEditor } from "@/components/custom/OrganizationEditor";
import { OrganizationGraph } from "@/components/custom/OrganizationGraph";
import { Button } from "@/components/ui/button";
import { useOrganizationTree, useUpdateOrganizationTree } from "@/hooks/queries/useOrganization";
import { useEmployeeList } from "@/hooks/queries/useEmployee";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const OrganizationStructurePage = () => {
    // 使用 React Query hook 獲取組織結構
    const { data: initialData, isLoading, error, refetch } = useOrganizationTree();
    const { data: employeeList, isLoading: isLoadingEmployees } = useEmployeeList();

    // Debug logging
    console.log('Organization Tree Page Debug:', {
        initialData,
        isLoading,
        error,
        dataType: typeof initialData,
        dataLength: Array.isArray(initialData) ? initialData.length : 'not array',
    });

    const [organizationData, setOrganizationData] = useState<Organization[]>([]);
    const [employeeData, setEmployeeData] = useState<any[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeView, setActiveView] = useState<'editor' | 'graph'>('graph');
    const [editorError, setEditorError] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");


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

    useEffect(() => {
        console.log(employeeList);
        if (employeeList && Array.isArray(employeeList)) {
            
            try {
                const formattedList = employeeList.map(emp => ({
                    employee_id: emp.employee_id || '',
                    first_name: emp.employee_first_name || '',
                    last_name: emp.employee_last_name || ''
                }));

                setEmployeeData(formattedList);
            } catch (error) {
                console.error('Error formatting employee list:', error);
            }
        }
    }, [employeeList, isLoadingEmployees]);



    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    };

    // 引入 useUpdateOrganizationTree hook
    const updateOrganizationTreeMutation = useUpdateOrganizationTree();

    const handleUpload = async () => {
        try {
            // 清除任何之前的預釋或成功訊息
            setEditorError("");
            setSuccessMessage("");

            console.log("Uploading organization structure...", organizationData);

            // 使用 mutateAsync 呼叫 API
            await updateOrganizationTreeMutation.mutateAsync(organizationData);

            console.log("Organization structure updated successfully");
            setSuccessMessage("Organization structure updated successfully!");
            setHasChanges(false);

            // 5秒後隐藏成功訊息
            setTimeout(() => {
                setSuccessMessage("");
            }, 5000);
        } catch (error) {
            console.error("Failed to upload organization structure:", error);
            setEditorError(error instanceof Error ? error.message : "Unknown error occurred while saving.");
        }
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
                            disabled={!hasChanges || updateOrganizationTreeMutation.isPending}
                            variant={hasChanges ? "destructive" : "secondary"}
                        >
                            {updateOrganizationTreeMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    {hasChanges ? 'Save Changes' : 'No Changes'}
                                </>
                            )}
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

                            {successMessage && (
                                <Alert variant="default" className="mb-4 bg-green-50 border-green-500 text-green-800">
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        <AlertTitle className="text-green-800 font-medium">Success</AlertTitle>
                                    </div>
                                    <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                                </Alert>
                            )}
                            <OrganizationEditor
                                orgData={organizationData}
                                employeeData={employeeData}
                                onChange={(updated) => {
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
