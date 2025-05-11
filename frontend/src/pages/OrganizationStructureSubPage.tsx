import { useState, useEffect } from "react";
import { OrganizationEditor } from "@/components/custom/OrganizationEditor";
import { OrganizationGraph } from "@/components/custom/OrganizationGraph";
import { Button } from "@/components/ui/button";
import { useOrganizationTree } from "@/hooks/queries/useOrganization";
import { Organization } from "@/types";
import { Loader2 } from "lucide-react";

const OrganizationStructurePage = () => {
    // 使用 React Query hook 獲取組織結構
    const { data: initialData, isLoading, error } = useOrganizationTree();
    
    const [organizationData, setOrganizationData] = useState<Organization[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    // 當資料載入完成時，設定初始資料
    useEffect(() => {
        if (initialData) {
            setOrganizationData(initialData);
        }
    }, [initialData]);

    const handleDataChange = (newData: Organization[]) => {
        setOrganizationData(newData);
        setHasChanges(true);
    };

    const handleUpload = () => {
        console.log("Uploading organization structure...", organizationData);
        // TODO: 實作上傳組織結構的 API
        // 這裡可能需要新的 API endpoint 來更新整個組織結構
        setHasChanges(false);
    };

    // 載入狀態處理
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" size={32} />
                <span className="ml-2">載入組織結構中...</span>
            </div>
        );
    }

    // 錯誤處理
    if (error) {
        return (
            <div className="text-center text-red-500">
                載入組織結構失敗: {error.message}
            </div>
        );
    }

    return (
        <div className="flex gap-4 p-4 flex-wrap">
            <div className="space-y-4 min-w-[40rem]">
                <OrganizationEditor
                    data={organizationData}
                    onChange={handleDataChange}
                />
                <Button
                    className="cursor-pointer bg-accent hover:bg-accent/70 text-primary-foreground px-6 py-3 rounded-lg shadow-md flex items-center space-x-2 transition-all duration-300"
                    onClick={handleUpload}
                    disabled={!hasChanges}
                >
                    {hasChanges ? 'Upload Changes' : 'No Changes'}
                </Button>
            </div>
            <div className="flex-1 min-w-80">
                <OrganizationGraph data={organizationData} />
            </div>
        </div>
    );
};

export default OrganizationStructurePage;
