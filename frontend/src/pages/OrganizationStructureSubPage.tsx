import { useState } from "react";
import { OrganizationEditor } from "@/components/custom/OrganizationEditor";
import { OrganizationGraph } from "@/components/custom/OrganizationGraph";
import { Button } from "@/components/ui/button";
import { mockOrganizationsWithChildren } from "@/mocks/organizations";

const OrganizationStructurePage = () => {
    const [organizationData, setOrganizationData] = useState<Organization[]>(
        mockOrganizationsWithChildren
    );
    const handleUpload = () => {
        console.log("Uploading organization structure...", organizationData);
        // Handle the upload logic here
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4">
            <div className="space-y-4 min-w-[40rem]">
                <OrganizationEditor
                    data={organizationData}
                    onChange={setOrganizationData}
                />
                <Button
                    className="cursor-pointer bg-accent hover:bg-accent/70 text-primary-foreground px-6 py-3 rounded-lg shadow-md flex items-center space-x-2 transition-all duration-300"
                    onClick={handleUpload}
                >
                    上傳組織架構
                </Button>
            </div>
            <div>
                <OrganizationGraph data={organizationData} />
            </div>
        </div>
    );
};

export default OrganizationStructurePage;
