import { Role } from "./auth.type";
export type RegisterType = {
    email: string;
    password: string;
    fullName: string;
    role: Role;
};
