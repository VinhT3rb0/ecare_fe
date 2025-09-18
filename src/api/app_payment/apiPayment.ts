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
    }),
});

export const { useCreateMomoPaymentMutation, useMomoReturnQuery } = apiPayment;


