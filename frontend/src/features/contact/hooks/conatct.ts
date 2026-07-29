import { useMutation, useQuery } from "@tanstack/react-query";
import { createContact, CreateContact, getAllContacts } from "../api/contact";
import { toast } from "sonner";

export function useCreateContact() {
  return useMutation({
    mutationKey: ["contact"],
    mutationFn: async (data: CreateContact) => {
      const response = await createContact(data);
      return response;
    },
    onSuccess: () => {
      toast.success("კონტაქტი წარმატებით გაიგზავნა");
    },
    onError: () => {
      toast.error("კონტაქტი ვერ გაიგზავნა");
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