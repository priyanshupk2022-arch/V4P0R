export type CategoryTaxonomy = 
    | 'productivity' | 'collaboration' | 'developer_tools' | 'design' | 'sales_crm' 
    | 'marketing' | 'finance' | 'hr' | 'security' | 'data' | 'support' | 'legal_compliance' 
    | 'compute' | 'storage' | 'database' | 'networking' | 'observability' | 'data_platform' 
    | 'model_api' | 'agent_platform' | 'model_hosting' | 'vector_database' | 'ai_developer_tooling' | 'ai_productivity' 
    | 'professional_services' | 'hardware_devices' | 'travel_expenses' | 'other' | 'unclassified'
    | string;

export interface HumanRule {
    keyword?: string;
    pattern?: RegExp | string;
    override_category?: CategoryTaxonomy;
    category?: CategoryTaxonomy;
}

export function classifySubscriptionCategory(
    input: { vendorName: string; aiSuggestion?: CategoryTaxonomy },
    humanRules: HumanRule[]
): CategoryTaxonomy {
    const lowerName = input.vendorName.toLowerCase();
    
    for (const rule of humanRules) {
        const targetCategory = rule.override_category || rule.category;
        if (!targetCategory) continue;

        if (rule.pattern instanceof RegExp) {
            if (rule.pattern.test(input.vendorName)) {
                return targetCategory;
            }
        } else if (typeof rule.pattern === 'string') {
            if (lowerName.includes(rule.pattern.toLowerCase())) {
                return targetCategory;
            }
        }
        
        if (rule.keyword && typeof rule.keyword === 'string') {
            if (lowerName.includes(rule.keyword.toLowerCase())) {
                return targetCategory;
            }
        }
    }
    
    return input.aiSuggestion || 'unclassified';
}
