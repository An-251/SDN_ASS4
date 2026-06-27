const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");

const apiPort = 43101;
const appPort = 43102;

process.env.API_BASE_URL = `http://127.0.0.1:${apiPort}/api`;
process.env.PORT = String(appPort);

const app = require("../app");

let nextQuestionId = 2;
let nextQuizId = 2;
let questions = [
  {
    _id: "q1",
    text: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    keywords: ["capital", "France"],
    correctAnswerIndex: 0,
  },
];
let quizzes = [
  {
    _id: "z1",
    title: "Geography Quiz",
    description: "Test your geography knowledge.",
    questions: ["q1"],
  },
];

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
}

function populatedQuiz(quiz) {
  return {
    ...quiz,
    questions: quiz.questions
      .map((id) => questions.find((question) => question._id === id))
      .filter(Boolean),
  };
}

const apiServer = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${apiPort}`);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts[0] !== "api") {
    return sendJson(res, 404, { message: "Not found" });
  }

  if (parts[1] === "questions") {
    const questionId = parts[2];

    if (req.method === "GET" && !questionId) {
      return sendJson(res, 200, questions);
    }

    if (req.method === "POST" && !questionId) {
      const body = await readJson(req);
      const question = { _id: `q${nextQuestionId++}`, ...body };
      questions.push(question);
      return sendJson(res, 201, question);
    }

    const question = questions.find((item) => item._id === questionId);
    if (!question) {
      return sendJson(res, 404, { message: "Question not found" });
    }

    if (req.method === "GET") {
      return sendJson(res, 200, question);
    }

    if (req.method === "PUT") {
      Object.assign(question, await readJson(req));
      return sendJson(res, 200, question);
    }

    if (req.method === "DELETE") {
      questions = questions.filter((item) => item._id !== questionId);
      quizzes.forEach((quiz) => {
        quiz.questions = quiz.questions.filter((id) => id !== questionId);
      });
      return sendJson(res, 200, { message: "Question deleted successfully" });
    }
  }

  if (parts[1] === "quizzes") {
    const quizId = parts[2];
    const questionId = parts[4];

    if (req.method === "GET" && !quizId) {
      return sendJson(res, 200, quizzes.map(populatedQuiz));
    }

    if (req.method === "POST" && !quizId) {
      const body = await readJson(req);
      const quiz = { _id: `z${nextQuizId++}`, ...body };
      quizzes.push(quiz);
      return sendJson(res, 201, quiz);
    }

    const quiz = quizzes.find((item) => item._id === quizId);
    if (!quiz) {
      return sendJson(res, 404, { message: "Quiz not found" });
    }

    if (parts[3] === "questions" && questionId) {
      if (req.method === "POST" && !quiz.questions.includes(questionId)) {
        quiz.questions.push(questionId);
      }
      if (req.method === "DELETE") {
        quiz.questions = quiz.questions.filter((id) => id !== questionId);
      }
      return sendJson(res, 200, populatedQuiz(quiz));
    }

    if (req.method === "GET") {
      return sendJson(res, 200, populatedQuiz(quiz));
    }

    if (req.method === "PUT") {
      Object.assign(quiz, await readJson(req));
      return sendJson(res, 200, populatedQuiz(quiz));
    }

    if (req.method === "DELETE") {
      quizzes = quizzes.filter((item) => item._id !== quizId);
      return sendJson(res, 200, { message: "Quiz deleted successfully" });
    }
  }

  return sendJson(res, 404, { message: "Not found" });
});

function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

async function request(pathname, options = {}) {
  return fetch(`http://127.0.0.1:${appPort}${pathname}`, {
    redirect: "manual",
    ...options,
  });
}

async function expectPage(pathname, text) {
  const response = await request(pathname, {
    headers: { accept: "text/html" },
  });
  const html = await response.text();
  assert.strictEqual(response.status, 200, `${pathname} returned ${response.status}`);
  assert.match(html, new RegExp(text, "i"), `${pathname} did not contain ${text}`);
  assert.match(html, /Question Bank/, `${pathname} did not render the shared layout`);
  assert.strictEqual(
    (html.match(/<!doctype html>/gi) || []).length,
    1,
    `${pathname} rendered more than one document layout`
  );
  assert.match(
    html,
    /Assignment 2 - Question Bank Management Application/,
    `${pathname} did not render footer.hbs`
  );
}

async function expectRedirect(pathname, location) {
  const response = await request(pathname, {
    headers: { accept: "text/html" },
  });

  assert.strictEqual(response.status, 302, `${pathname} did not redirect`);
  assert.strictEqual(response.headers.get("location"), location);
}

async function submit(pathname, fields) {
  const response = await request(pathname, {
    method: "POST",
    headers: {
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(fields),
  });
  assert.strictEqual(response.status, 302, `${pathname} did not redirect`);
  return response.headers.get("location");
}

async function run() {
  const appServer = http.createServer(app);
  const partialsDirectory = path.join(__dirname, "..", "views", "partials");
  const ejsPartials = fs
    .readdirSync(partialsDirectory)
    .filter((fileName) => fileName.endsWith(".ejs"));

  assert.deepStrictEqual(
    ejsPartials,
    ["index.ejs"],
    "views/partials must contain only header.hbs, footer.hbs and index.ejs"
  );

  await listen(apiServer, apiPort);
  await listen(appServer, appPort);

  try {
    await expectRedirect("/", "/app/login");
    await expectPage("/legacy", "Question Bank Management");
    await expectPage("/questions", "capital of France");
    await expectPage("/questions/new", "Create New Question");
    await expectPage("/questions/q1", "Answer options");
    await expectPage("/questions/q1/edit", "Edit Question");
    await expectPage("/quizzes", "Geography Quiz");
    await expectPage("/quizzes/new", "Create New Quiz");
    await expectPage("/quizzes/z1", "Add a Question");
    await expectPage("/quizzes/z1/edit", "Edit Quiz");

    const createdQuestionLocation = await submit("/questions", {
      text: "What is 2 + 2?",
      options: "3, 4, 5",
      keywords: "math, arithmetic",
      correctAnswerIndex: "1",
    });
    assert.strictEqual(createdQuestionLocation, "/questions/q2");

    await submit("/questions/q2?_method=PUT", {
      text: "What is 3 + 3?",
      options: "5, 6, 7",
      keywords: "math",
      correctAnswerIndex: "1",
    });
    assert.strictEqual(questions.find((item) => item._id === "q2").text, "What is 3 + 3?");

    const createdQuizLocation = await submit("/quizzes", {
      title: "Math Quiz",
      description: "Basic arithmetic",
      questions: "q2",
    });
    assert.strictEqual(createdQuizLocation, "/quizzes/z2");

    await submit("/quizzes/z2?_method=PUT", {
      title: "Updated Math Quiz",
      description: "Updated description",
      questions: "q2",
    });
    assert.strictEqual(quizzes.find((item) => item._id === "z2").title, "Updated Math Quiz");

    await submit("/quizzes/z1/questions/q2", {});
    assert.ok(quizzes.find((item) => item._id === "z1").questions.includes("q2"));

    await submit("/quizzes/z1/questions/q2?_method=DELETE", {});
    assert.ok(!quizzes.find((item) => item._id === "z1").questions.includes("q2"));

    await submit("/quizzes/z2?_method=DELETE", {});
    assert.ok(!quizzes.some((item) => item._id === "z2"));

    await submit("/questions/q2?_method=DELETE", {});
    assert.ok(!questions.some((item) => item._id === "q2"));

    console.log("Smoke test passed: pages, CRUD, Axios integration, add/remove question.");
  } finally {
    await close(appServer);
    await close(apiServer);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
