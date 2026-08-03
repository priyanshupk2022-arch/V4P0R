export type CategoryTaxonomy = 
    | 'productivity' | 'collaboration' | 'developer_tools' | 'design' | 'sales_crm' 
    | 'marketing' | 'finance' | 'hr' | 'security' | 'data' | 'support' | 'legal_compliance' 
    | 'compute' | 'storage' | 'database' | 'networking' | 'observability' | 'data_platform' 
    | 'model_api' | 'agent_platform' | 'model_hosting' | 'vector_database' | 'ai_developer_tooling' | 'ai_productivity' 
    | 'professional_services' | 'hardware_devices' | 'travel_expenses' | 'other' | 'unclassified';

export interface HumanRule {
    keyword: string;
    override_category: CategoryTaxonomy;
}

export function classifySubscriptionCategory(
    input: { vendorName: string; aiSuggestion?: CategoryTaxonomy },
    humanRules: HumanRule[]
): CategoryTaxonomy {
    const lowerName = input.vendorName.toLowerCase();
    
    for (const rule of humanRules) {
        if (lowerName.includes(rule.keyword.toLowerCase())) {
            return rule.override_category;
        }
    }
    
    return input.aiSuggestion || 'unclassified';
}
