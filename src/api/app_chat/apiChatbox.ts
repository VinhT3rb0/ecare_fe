import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiChat = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-chat/v1/`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
            }
            return headers;
        }
    }),
    reducerPath: "chatApi",
    tagTypes: ["Chat"],
    endpoints: (builder) => ({
        // Lấy toàn bộ đoạn hội thoại giữa 2 người
        getConversation: builder.query<any, { userId1: string; userId2: string }>({
            query: ({ userId1, userId2 }) => `conversation/${userId1}/${userId2}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }: any) => ({ type: "Chat" as const, id })),
                        { type: "Chat", id: "LIST" },
                    ]
                    : [{ type: "Chat", id: "LIST" }],
        }),
        getAllConversations: builder.query<any, void>({
            query: () => `/conversations`,
            providesTags: ["Chat"],
        }),

        // Gửi tin nhắn (text/file)
        sendMessage: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: "/",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "Chat", id: "LIST" }],
        }),

        // Update tin nhắn
        updateMessage: builder.mutation<any, { id: string; data: FormData }>({
            query: ({ id, data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Chat", id }],
        }),

        // Xóa tin nhắn
        deleteMessage: builder.mutation<any, string>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [{ type: "Chat", id }],
        }),
    }),
});

export const {
    useGetConversationQuery,
    useGetAllConversationsQuery,
    useSendMessageMutation,
    useUpdateMessageMutation,
    useDeleteMessageMutation,
} = apiChat;
