import { api } from './api';

export const boardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query({
      query: () => '/api/boards',
      providesTags: ['Board'],
    }),
    getBoardById: builder.query({
      query: (id) => `/api/boards/${id}`,
      providesTags: (result, error, id) => [{ type: 'Board', id }],
    }),
    createBoard: builder.mutation({
      query: (boardData) => ({
        url: '/api/boards',
        method: 'POST',
        body: boardData,
      }),
      invalidatesTags: ['Board'],
    }),
    inviteMember: builder.mutation({
      query: ({ boardId, email }) => ({
        url: `/api/boards/${boardId}/invite`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: (result, error, { boardId }) => [{ type: 'Board', id: boardId }],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useGetBoardByIdQuery,
  useCreateBoardMutation,
  useInviteMemberMutation,
} = boardApi;
