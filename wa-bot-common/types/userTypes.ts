// Tipos relacionados con usuarios

export interface User {
    id: string;
    name: string;
    phoneNumber: string;
    isActive: boolean;
}

export interface UserCreate {
    phoneNumber: string;
    name?: string;
    role?: UserRole;
}

export interface UserQuery {
    limit?: number;
    isActive?: boolean;
}

// Importar el tipo UserRole del archivo roles.ts
import { UserRole } from './roles';
