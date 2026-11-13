import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createContact,
  type CreateContactRequest,
  getAllContacts,
} from "../api/contact";
import { toast } from "sonner";
import { toastApiError } from "@/lib/toast-api";

export function useCreateContact() {
  return useMutation({
    mutationKey: ["contact"],
    mutationFn: async (data: CreateContactRequest) => {
      const response = await createContact(data);
      return response;
    },
    onSuccess: () => {
      toast.success("კონტაქტი წარმატებით გაიგზავნა");
    },
    onError: (error) => {
      toastApiError(error, "კონტაქტი ვერ გაიგზავნა.");
    },
  });
}


export function useGetAllContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const response = await getAllContacts();
      return response;
    },
  });
}