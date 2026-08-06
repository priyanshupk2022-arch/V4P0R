import { describe, it, expect } from 'vitest';
import { 
    generateEmployeeUid, 
    validateEmployeeData, 
    transitionEmploymentStatus,
    EmployeeIdentity 
} from '../../src/domain/employee/employeeIdentity';

describe('Employee Identity Engine', () => {
    it('generates immutable employee_uid with emp_ prefix', () => {
        const uid = generateEmployeeUid();
        expect(uid.startsWith('emp_')).toBe(true);
        expect(uid.length).toBeGreaterThan(6);
    });

    it('validates employee data correctly', () => {
        const valid: EmployeeIdentity = {
            employee_uid: 'emp_123',
            name: 'Alex Vance',
            email: 'alex@company.com',
            role: 'Engineer',
            department: 'Engineering',
            manager_employee_uid: null,
            cost_center_id: 'CC-101',
            status: 'active'
        };
        expect(validateEmployeeData(valid)).toBe(true);
    });

    it('rejects employee data without emp_ prefix', () => {
        const invalid = {
            employee_uid: 'usr_123',
            name: 'Alex Vance',
            email: 'alex@company.com'
        };
        expect(validateEmployeeData(invalid)).toBe(false);
    });

    it('handles valid state machine transitions', () => {
        const emp: EmployeeIdentity = {
            employee_uid: 'emp_123',
            name: 'Alex Vance',
            email: 'alex@company.com',
            role: 'Engineer',
            department: 'Engineering',
            manager_employee_uid: null,
            cost_center_id: 'CC-101',
            status: 'invited'
        };

        const active = transitionEmploymentStatus(emp, 'active');
        expect(active.status).toBe('active');

        const offboarding = transitionEmploymentStatus(active, 'offboarding_scheduled');
        expect(offboarding.status).toBe('offboarding_scheduled');

        const offboarded = transitionEmploymentStatus(offboarding, 'offboarded');
        expect(offboarded.status).toBe('offboarded');
    });

    it('throws error on invalid status transitions', () => {
        const emp: EmployeeIdentity = {
            employee_uid: 'emp_123',
            name: 'Alex Vance',
            email: 'alex@company.com',
            role: 'Engineer',
            department: 'Engineering',
            manager_employee_uid: null,
            cost_center_id: 'CC-101',
            status: 'archived'
        };

        expect(() => transitionEmploymentStatus(emp, 'active')).toThrow('Invalid transition from archived to active');
    });

    it('prevents using email as primary key', () => {
        const emailAsKey = {
            employee_uid: 'alex@company.com',
            name: 'Alex Vance',
            email: 'alex@company.com'
        };
        expect(validateEmployeeData(emailAsKey)).toBe(false);
    });
});
