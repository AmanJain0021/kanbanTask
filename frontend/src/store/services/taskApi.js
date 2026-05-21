import { api } from './api';

export const taskApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBoardTasks: builder.query({
      query: (boardId) => `/api/tasks/board/${boardId}`,
      providesTags: (result, error, boardId) => [{ type: 'Task', id: boardId }],
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: '/api/tasks',
        method: 'POST',
        body: taskData,
      }),
    }),
    updateTask: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/api/tasks/${id}`,
        method: 'PUT',
        body: updates,
      }),
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/api/tasks/${id}`,
        method: 'DELETE',
      }),
    }),
    addComment: builder.mutation({
      query: ({ taskId, text }) => ({
        url: `/api/tasks/${taskId}/comments`,
        method: 'POST',
        body: { text },
      }),
    }),
    addAttachment: builder.mutation({
      query: ({ taskId, formData }) => ({
        url: `/api/tasks/${taskId}/attachments`,
        method: 'POST',
        body: formData,
      }),
    }),
    deleteAttachment: builder.mutation({
      query: ({ taskId, attachmentId }) => ({
        url: `/api/tasks/${taskId}/attachments/${attachmentId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetBoardTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddCommentMutation,
  useAddAttachmentMutation,
  useDeleteAttachmentMutation,
} = taskApi;
