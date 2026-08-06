import { describe, it, expect } from 'vitest';
import { 
    classifySubscriptionCategory, 
    CategoryTaxonomy, 
    HumanRule 
} from '../../src/domain/category/categoryTaxonomy';

describe('Category Taxonomy & Human Override Engine', () => {
    it('returns AI suggested category when no human rules match', () => {
        const result = classifySubscriptionCategory(
            { vendorName: 'Acme Cloud', aiSuggestion: 'compute' },
            []
        );
        expect(result).toBe('compute');
    });

    it('returns unclassified when no AI suggestion or human rules exist', () => {
        const result = classifySubscriptionCategory(
            { vendorName: 'Unknown Tool' },
            []
        );
        expect(result).toBe('unclassified');
    });

    it('human rule strictly outranks AI suggestion', () => {
        const rules: HumanRule[] = [
            { keyword: 'figma', override_category: 'design' }
        ];

        const result = classifySubscriptionCategory(
            { vendorName: 'Figma Enterprise', aiSuggestion: 'productivity' },
            rules
        );

        expect(result).toBe('design');
    });

    it('supports regex pattern matching in human rules', () => {
        const rules: HumanRule[] = [
            { pattern: /aws|amazon/i, category: 'compute' }
        ];

        const result = classifySubscriptionCategory(
            { vendorName: 'AWS CloudFormation', aiSuggestion: 'developer_tools' },
            rules
        );

        expect(result).toBe('compute');
    });

    it('case-insensitively matches keyword human rules', () => {
        const rules: HumanRule[] = [
            { keyword: 'GITHUB', override_category: 'developer_tools' }
        ];

        const result = classifySubscriptionCategory(
            { vendorName: 'github enterprise', aiSuggestion: 'collaboration' },
            rules
        );

        expect(result).toBe('developer_tools');
    });
});
