require("dotenv").config();

const mongoose = require("mongoose");

const connectDatabase = require("../config/database");
const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const User = require("../models/User");

const demoQuestions = [
  {
    text: "What is the capital of Vietnam?",
    options: ["Hanoi", "Da Nang", "Ho Chi Minh City", "Hue"],
    keywords: ["assignment4", "capital", "vietnam"],
    correctAnswerIndex: 0,
  },
  {
    text: "Which frontend library is required in Assignment 4?",
    options: ["React", "Angular", "Vue", "Svelte"],
    keywords: ["assignment4", "react"],
    correctAnswerIndex: 0,
  },
  {
    text: "Which database is used by the backend?",
    options: ["MongoDB", "PostgreSQL", "MySQL", "SQLite"],
    keywords: ["assignment4", "mongodb"],
    correctAnswerIndex: 0,
  },
  {
    text: "Which library manages frontend state in this app?",
    options: ["Redux", "Mongoose", "Express", "Handlebars"],
    keywords: ["assignment4", "redux"],
    correctAnswerIndex: 0,
  },
];

async function upsertUser({ username, password, admin }) {
  await User.deleteOne({ username });
  return User.register({ username, password, admin });
}

async function main() {
  await connectDatabase();

  const [normalUser, adminUser] = await Promise.all([
    upsertUser({ username: "user4", password: "123456", admin: false }),
    upsertUser({ username: "admin4", password: "123456", admin: true }),
  ]);

  await Promise.all([
    Quiz.deleteMany({ title: "Assignment 4 Demo Quiz" }),
    Question.deleteMany({ keywords: "assignment4" }),
  ]);

  const questions = await Question.insertMany(
    demoQuestions.map((question) => ({
      ...question,
      author: adminUser._id,
    }))
  );

  await Quiz.create({
    title: "Assignment 4 Demo Quiz",
    description: "Demo quiz for the React + Redux full-stack assignment.",
    questions: questions.map((question) => question._id),
  });

  console.log("Assignment 4 seed completed.");
  console.log(`User: ${normalUser.username} / 123456`);
  console.log(`Admin: ${adminUser.username} / 123456`);
}

main()
  .catch((error) => {
    console.error("Assignment 4 seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
