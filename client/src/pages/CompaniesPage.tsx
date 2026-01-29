import { useState, useEffect } from 'react';
import { companiesService, Company } from '../services/companies';
import { ListHeader } from '../components/ListHeader';
import { EditableCell } from '../components/EditableCell';
import { CompanyDrawer } from '../components/CompanyDrawer';
import { Building2 } from 'lucide-react';

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

    // UI State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [activeFilters, setActiveFilters] = useState<any>({});

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [companies, activeFilters]);

    const fetchCompanies = async () => {
        try {
            const data = await companiesService.getAll();
            setCompanies(data);
        } catch (error) {
            console.error('Failed to fetch companies', error);
        }
    };

    const handleOpenCreate = () => {
        setSelectedCompany(null);
        setIsDrawerOpen(true);
    };

    const handleOpenEdit = (company: Company) => {
        setSelectedCompany(company);
        setIsDrawerOpen(true);
    };

    const handleSave = () => {
        fetchCompanies(); // Refresh list after save
    };

    const handleFilterChange = (newFilters: any) => {
        setActiveFilters(newFilters);
    };

    const applyFilters = () => {
        let result = [...companies];

        if (activeFilters.name) {
            result = result.filter(c => c.name.toLowerCase().includes(activeFilters.name.toLowerCase()));
        }
        if (activeFilters.phone) {
            result = result.filter(c => c.phone?.toLowerCase().includes(activeFilters.phone.toLowerCase()));
        }
        if (activeFilters.email) {
            result = result.filter(c => c.email?.toLowerCase().includes(activeFilters.email.toLowerCase()));
        }
        // Add more filters as needed

        setFilteredCompanies(result);
    };

    return (
        <div className="bg-gray-50 h-screen flex flex-col overflow-hidden">
            <ListHeader
                title="EMPRESAS"
                onFilter={handleFilterChange}
                count={filteredCompanies.length}
                unitLabel="compañía"
                onAdd={handleOpenCreate}
                addButtonLabel="AGREGAR UNA COMPAÑÍA"
                viewName="Lista completa"
                activeFilters={activeFilters}
                onRemoveFilter={(key) => {
                    const newFilters = { ...activeFilters };
                    delete newFilters[key];
                    setActiveFilters(newFilters);
                }}
            />

            <div className="flex-1 overflow-hidden relative">
                <div className="h-full overflow-y-auto px-4 pb-4">
                    <div className="bg-white rounded border border-gray-200 min-h-[400px]">
                        {/* Table Header */}
                        <div className="flex border-b border-gray-200 bg-white text-xs text-gray-400 font-bold uppercase sticky top-0 z-10">
                            <div className="p-3 w-10 border-r border-gray-100"><input type="checkbox" disabled /></div>
                            <div className="p-3 flex-1 border-r border-gray-100">NOMBRE</div>
                            <div className="p-3 w-1/4 border-r border-gray-100">COMPAÑÍA</div>
                            <div className="p-3 w-48 border-r border-gray-100">TELÉFONO</div>
                            <div className="p-3 w-48">CORREO</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {filteredCompanies.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    No hay compañías que coincidan con la búsqueda.
                                </div>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <div
                                        key={company.id}
                                        className="flex hover:bg-gray-50 transition-colors text-sm items-center cursor-pointer group"
                                    >
                                        <div className="p-3 w-10 border-r border-gray-100 flex justify-center" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" className="rounded border-gray-300" />
                                        </div>
                                        <div className="p-3 flex-1 border-r border-gray-100 font-medium text-blue-600 group-hover:underline flex items-center gap-2">
                                            <Building2 size={16} className="text-gray-400" />
                                            <div className="flex-1">
                                                <EditableCell
                                                    value={company.name}
                                                    onSave={async (val) => {
                                                        await companiesService.update(company.id, { name: val });
                                                        fetchCompanies();
                                                    }}
                                                    onClickText={() => handleOpenEdit(company)}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-3 w-1/4 border-r border-gray-100 text-gray-500">
                                            <EditableCell
                                                value={company.industry || ''}
                                                onSave={async (val) => {
                                                    await companiesService.update(company.id, { industry: val });
                                                    fetchCompanies();
                                                }}
                                                onClickText={() => handleOpenEdit(company)}
                                                placeholder='-'
                                            />
                                        </div>
                                        <div className="p-3 w-48 border-r border-gray-100 text-blue-600 hover:underline">
                                            <EditableCell
                                                value={company.phone || ''}
                                                onSave={async (val) => {
                                                    await companiesService.update(company.id, { phone: val });
                                                    fetchCompanies();
                                                }}
                                                onClickText={() => handleOpenEdit(company)}
                                                placeholder='-'
                                                type='tel'
                                            />
                                        </div>
                                        <div className="p-3 w-48 text-gray-500 truncate">
                                            <EditableCell
                                                value={company.email || ''}
                                                onSave={async (val) => {
                                                    await companiesService.update(company.id, { email: val });
                                                    fetchCompanies();
                                                }}
                                                onClickText={() => handleOpenEdit(company)}
                                                placeholder='-'
                                                type='email'
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CompanyDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onSave={handleSave}
                company={selectedCompany}
            />
        </div>
    );
}
