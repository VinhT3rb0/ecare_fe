import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";

export const apiInvoice = createApi({
    reducerPath: "invoiceApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-invoice/v1`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
            return headers;
        },
    }),
    tagTypes: ["Invoice"],
    endpoints: (builder) => ({
        getInvoices: builder.query<any, { page?: number; limit?: number; status?: string; patient_id?: number } | void>({
            query: (params) => {
                if (!params) {
                    return { url: `/` };
                }
                return { url: `/`, params };
            },
            providesTags: ["Invoice"],
        }),
        getInvoiceById: builder.query<any, number | string>({
            query: (id) => `/${id}`,
            providesTags: ["Invoice"],
        }),
        getInvoiceByAppointment: builder.query<any, number | string>({
            query: (appointment_id) => `/appointment/${appointment_id}`,
            providesTags: ["Invoice"],
        }),
        getInvoicesByPatient: builder.query<any, { patient_id: number | string; page?: number; limit?: number; status?: string }>({
            query: ({ patient_id, ...params }) => ({ url: `/patient/${patient_id}`, params }),
            providesTags: ["Invoice"],
        }),
        createInvoice: builder.mutation<any, { appointment_id: number; patient_id: number; payment_method?: string }>({
            query: (body) => ({ url: `/`, method: "POST", body }),
            invalidatesTags: ["Invoice"],
        }),
        addPackageToInvoice: builder.mutation<any, { invoice_id: number; package_id: number; quantity?: number }>({
            query: ({ invoice_id, ...body }) => ({ url: `/packages/${invoice_id}`, method: "POST", body }),
            invalidatesTags: ["Invoice"],
        }),
        getInvoicePackages: builder.query<any, number>({
            query: (invoice_id) => `/${invoice_id}/packages`,
            providesTags: ["Invoice"],
        }),
        updateInvoice: builder.mutation<any, { id: number; has_insurance?: boolean; status?: string; payment_method?: string }>({
            query: ({ id, ...body }) => ({
                url: `/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Invoice"],
        }),
        updatePackageQuantity: builder.mutation<any, { invoice_id: number; package_id: number; quantity: number }>({
            query: ({ invoice_id, package_id, quantity }) => ({ url: `/${invoice_id}/packages/${package_id}/quantity`, method: "PUT", body: { quantity } }),
            invalidatesTags: ["Invoice"],
        }),
        removePackageFromInvoice: builder.mutation<any, { invoice_id: number; package_id: number }>({
            query: ({ invoice_id, package_id }) => ({ url: `/${invoice_id}/packages/${package_id}`, method: "DELETE" }),
            invalidatesTags: ["Invoice"],
        }),
        // Medicines on invoice
        addMedicinesFromMedicalRecord: builder.mutation<any, number>({
            query: (invoice_id) => ({ url: `/${invoice_id}/medicines/from-medical-record`, method: "POST" }),
            invalidatesTags: ["Invoice"],
        }),
        getInvoiceMedicines: builder.query<any, number>({
            query: (invoice_id) => `/${invoice_id}/medicines`,
            providesTags: ["Invoice"],
        }),
        updateInvoiceMedicineQuantity: builder.mutation<any, { invoice_id: number; medicine_id: number; quantity: number }>({
            query: ({ invoice_id, medicine_id, quantity }) => ({ url: `/${invoice_id}/medicines/${medicine_id}/quantity`, method: "PUT", body: { quantity } }),
            invalidatesTags: ["Invoice"],
        }),
        removeMedicineFromInvoice: builder.mutation<any, { invoice_id: number; medicine_id: number }>({
            query: ({ invoice_id, medicine_id }) => ({ url: `/${invoice_id}/medicines/${medicine_id}`, method: "DELETE" }),
            invalidatesTags: ["Invoice"],
        }),
        updateInvoiceStatus: builder.mutation<any, { id: number; status: string; payment_method?: string }>({
            query: ({ id, ...body }) => ({ url: `/${id}/status`, method: "PUT", body }),
            invalidatesTags: ["Invoice"],
        }),
        deleteInvoice: builder.mutation<any, number>({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: ["Invoice"],
        }),
    }),
});

export const {
    useGetInvoicesQuery,
    useGetInvoiceByIdQuery,
    useGetInvoiceByAppointmentQuery,
    useGetInvoicesByPatientQuery,
    useCreateInvoiceMutation,
    useAddPackageToInvoiceMutation,
    useGetInvoicePackagesQuery,
    useUpdateInvoiceMutation,
    useUpdatePackageQuantityMutation,
    useRemovePackageFromInvoiceMutation,
    useAddMedicinesFromMedicalRecordMutation,
    useGetInvoiceMedicinesQuery,
    useUpdateInvoiceMedicineQuantityMutation,
    useRemoveMedicineFromInvoiceMutation,
    useUpdateInvoiceStatusMutation,
    useDeleteInvoiceMutation,
} = apiInvoice;


