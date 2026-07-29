import { apiRequest } from "@/lib/api";
import { RegisterSchema } from "../schema/register.schema";

export type RegisterResponse = {
    user: {
      userId: string;
      email: string;
      fullName: string;
      role: "ADMIN" | "INSTRUCTOR";
    };
  };

export async function register(data: RegisterSchema): Promise<RegisterResponse> {
    try {
        const responce = await apiRequest<RegisterResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return responce;
    } catch (error) {
        console.log(error);
        throw new Error("მოხდა შეცდომა");
    }
}