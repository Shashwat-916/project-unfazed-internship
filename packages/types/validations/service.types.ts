import { z } from "zod";

export const CreateServiceValidation = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be non-negative"),
    serviceImage :z.string().optional()
});

export const UpdateServiceValidation = z.object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be non-negative").optional(),
    serviceImage :z.string().optional()
});

export type CreateServiceInput = z.infer<typeof CreateServiceValidation> & { therapistId: string };

export type UpdateServiceInput = z.infer<typeof UpdateServiceValidation>;