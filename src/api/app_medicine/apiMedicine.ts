import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";

export const apiMedicine = createApi({
    reducerPath: "medicineApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-medicine/v1`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
            return headers;
        },
    }),
    tagTypes: ["Medicine"],
    endpoints: (builder) => ({
        getMedicines: builder.query<
            any,
            { page?: number; limit?: number; search?: string } | void
        >({
            query: (params) => {
                if (!params) return { url: "/" };
                return { url: "/", params };
            },
            providesTags: ["Medicine"],
        }),
        createMedicine: builder.mutation<any, any>({
            query: (body) => ({ url: "/", method: "POST", body }),
            invalidatesTags: ["Medicine"],
        }),
        updateMedicine: builder.mutation<any, { id: number } & any>({
            query: ({ id, ...body }) => ({
                url: `/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Medicine"],
        }),
        deleteMedicine: builder.mutation<any, number>({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: ["Medicine"],
        }),
        getMedicineById: builder.query<any, number>({
            query: (id) => `/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Medicine", id }],
        }),
        updateMedicineStock: builder.mutation<
            any,
            { medications: { medicine_id: number; quantity: number; action: "import" | "export" }[] }
        >({
            query: (body) => ({
                url: `/update-stock`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Medicine"],
        }),
    }),
});

export const {
    useGetMedicinesQuery,
    useCreateMedicineMutation,
    useUpdateMedicineMutation,
    useDeleteMedicineMutation,
    useGetMedicineByIdQuery,
    useUpdateMedicineStockMutation,
} = apiMedicine;
