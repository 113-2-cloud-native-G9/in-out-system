import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Import Tabs component from ShadCN
import { User, Layers } from 'lucide-react'; // Import icons
import EmployeeListPage from "@/pages/EmployeeListSubPage";
import OrganizationStructurePage from "@/pages/OrganizationStructureSubPage";

const OrganizationManagementPage = () => {
    const [activeTab, setActiveTab] = useState('employee');

    return (
        <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="mb-4">
                    <TabsList className="fixed flex space-x-2">
                        <TabsTrigger
                            value="employee"
                            className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none ${activeTab === 'employee' ? 'bg-accent text-primary-foreground font-bold border-b-2 border-primary' : 'bg-background text-foreground'}`}
                        >
                            <User size={20} className="mr-2" /> Employees
                        </TabsTrigger>
                        <TabsTrigger
                            value="organization"
                            className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none ${activeTab === 'organization' ? 'bg-accent text-primary-foreground font-bold border-b-2 border-primary' : 'bg-background text-foreground'}`}
                        >
                            <Layers size={20} className="mr-2" /> Organization
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent
                    value="employee"
                    className={` ${activeTab === 'employee' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                >
                    <EmployeeListPage />
                </TabsContent>
                <TabsContent
                    value="organization"
                    className={`${activeTab === 'organization' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                >
                    <OrganizationStructurePage />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default OrganizationManagementPage;
