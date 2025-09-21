import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";

export const apiPayment = createApi({
    reducerPath: "paymentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-payment/v1/`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        createMomoPayment: builder.mutation<{ payUrl?: string; deeplink?: string; qrCodeUrl?: string }, { invoice_id: number, amount: number }>(
            {
                query: (body) => ({ url: "/momo/create", method: "POST", body }),
            }
        ),
        momoReturn: builder.query<any, Record<string, string>>({
            query: (params) => ({ url: "/momo/return", method: 'GET', params }),
        }),
        createCashPayment: builder.mutation<{ message: string; data: { invoice_id: number } }, { invoice_id: number }>({
            query: (body) => ({ url: "/cash/create", method: "POST", body }),
        }),
    }),
});

export const { useCreateMomoPaymentMutation, useMomoReturnQuery, useCreateCashPaymentMutation } = apiPayment;


