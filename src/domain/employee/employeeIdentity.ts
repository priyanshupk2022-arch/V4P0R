export type EmploymentStatus = 'invited' | 'active' | 'leave' | 'offboarding_scheduled' | 'offboarded' | 'archived';

export interface EmployeeIdentity {
    readonly employee_uid: string;
    name: string;
    email: string;
    role: string;
    department: string;
    manager_employee_uid: string | null;
    cost_center_id: string;
    status: EmploymentStatus;
}

export function generateEmployeeUid(): string {
    return `emp_${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
}

export function validateEmployeeData(data: Partial<EmployeeIdentity>): boolean {
    if (!data.employee_uid || !data.employee_uid.startsWith('emp_')) return false;
    if (!data.email || !data.email.includes('@')) return false;
    if (!data.name) return false;
    return true;
}

export function transitionEmploymentStatus(
    current: EmployeeIdentity, 
    newStatus: EmploymentStatus
): EmployeeIdentity {
    const validTransitions: Record<EmploymentStatus, EmploymentStatus[]> = {
        'invited': ['active', 'archived'],
        'active': ['leave', 'offboarding_scheduled', 'offboarded'],
        'leave': ['active', 'offboarding_scheduled'],
        'offboarding_scheduled': ['offboarded', 'active'],
        'offboarded': ['archived'],
        'archived': []
    };

    if (!validTransitions[current.status].includes(newStatus)) {
        throw new Error(`Invalid transition from ${current.status} to ${newStatus}`);
    }

    return {
        ...current,
        status: newStatus
    };
}
