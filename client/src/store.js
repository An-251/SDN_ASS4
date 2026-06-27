import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./store/authSlice.js";
import quizReducer from "./store/quizSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quizzes: quizReducer,
  },
});
