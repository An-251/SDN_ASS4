const path = require("path");

const bodyParser = require("body-parser");
const express = require("express");
const { engine } = require("express-handlebars");
const methodOverride = require("method-override");

const createEjsViewEngine = require("./config/ejsViewEngine");
const { handleError, handleNotFound } = require("./middleware/errorHandler");
const indexRoutes = require("./routes/index");
const appQuestionRoutes = require("./routes/appQuestionRoutes");
const appQuizRoutes = require("./routes/appQuizRoutes");
const questionApiRoutes = require("./routes/questionRoutes");
const questionUiRoutes = require("./routes/question");
const quizApiRoutes = require("./routes/quizRoutes");
const quizUiRoutes = require("./routes/quiz");
const userRoutes = require("./routes/userRoutes");

const app = express();
const viewsDirectory = path.join(__dirname, "views");
const clientBuildDirectory = path.join(__dirname, "public", "app");
const clientIndexFile = path.join(clientBuildDirectory, "index.html");

function useApiUnlessBrowserRequest(apiRoutes, uiRoutes) {
  return (req, res, next) => {
    const acceptHeader = req.get("accept") || "";

    if (acceptHeader.includes("text/html")) {
      return uiRoutes(req, res, next);
    }

    return apiRoutes(req, res, next);
  };
}

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(viewsDirectory, "layouts"),
    partialsDir: path.join(viewsDirectory, "partials"),
  })
);

// EJS renders page content; Handlebars provides the shared layout.
app.engine("ejs", createEjsViewEngine(viewsDirectory));
app.set("view engine", "hbs");
app.set("views", viewsDirectory);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRoutes);

// Assignment 01 REST APIs remain available under /api.
app.use("/api/quizzes", quizApiRoutes);
app.use("/api/questions", questionApiRoutes);
app.use("/api/question", questionApiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/app/users", userRoutes);
app.use("/api/app/quizzes", appQuizRoutes);
app.use("/api/app/questions", appQuestionRoutes);

// Assignment 3 requires this REST endpoint exactly.
app.use("/users", userRoutes);

// Keep Assignment 01 REST paths working for API clients, while browsers get UI.
app.use("/quizzes", useApiUnlessBrowserRequest(quizApiRoutes, quizUiRoutes));
app.use(
  "/questions",
  useApiUnlessBrowserRequest(questionApiRoutes, questionUiRoutes)
);
app.use("/question", questionApiRoutes);

app.get(["/app", "/app/*"], (req, res, next) => {
  res.sendFile(clientIndexFile, (error) => {
    if (error) {
      next(error);
    }
  });
});

app.use(handleNotFound);
app.use(handleError);

module.exports = app;
