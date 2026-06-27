import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../api.js";

export const fetchQuizzes = createAsyncThunk("quizzes/fetchAll", (_arg, { getState }) =>
  apiRequest("/quizzes", {
    token: getState().auth.token,
  })
);

export const fetchQuiz = createAsyncThunk("quizzes/fetchOne", (quizId, { getState }) =>
  apiRequest(`/quizzes/${quizId}`, {
    token: getState().auth.token,
  })
);

export const submitQuiz = createAsyncThunk(
  "quizzes/submit",
  ({ quizId, answers }, { getState }) =>
    apiRequest(`/quizzes/${quizId}/submit`, {
      method: "POST",
      body: { answers },
      token: getState().auth.token,
    })
);

const quizSlice = createSlice({
  name: "quizzes",
  initialState: {
    items: [],
    selected: null,
    result: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearQuizResult(state) {
      state.result = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchQuiz.pending, (state) => {
        state.status = "loading";
        state.selected = null;
        state.result = null;
        state.error = null;
      })
      .addCase(fetchQuiz.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchQuiz.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(submitQuiz.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.result = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearQuizResult } = quizSlice.actions;
export default quizSlice.reducer;
