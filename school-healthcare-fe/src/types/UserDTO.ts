// src/types/UserDTO.ts

export interface CreateUserDTO {
    username: string;
    password?: string;         // Có thể bỏ qua để backend tự dùng "123456"
    role: string;
    name: string;
    email: string;
    createdBy: number;
  
    // Student
    gender?: string;
    dateOfBirth?: string;      // ISO format string (e.g., "2010-05-12")
    class?: string;
    parentId?: number;
  
    // Parent
    phone?: string;
  
    // Nurse
    specialization?: string;
  
    // Manager
    department?: string;
    position?: string;
  }
  
  
  export interface UpdateUserDTO {
    userId: number;
    username: string;
    role: string;
    isActive: boolean;
  }
  
  export interface User {
    userId: number;
    username: string;
    role: string;
    isActive: boolean;
  }
  