# Assignment 3 - User Authentication

File này ghi lại toàn bộ phần đã làm cho Assignment 3: User Authentication,
Admin authorization, Author authorization, cách setup, cách chạy, cách test
bằng Postman và luồng hoạt động bên trong code.

## 1. Mục tiêu Assignment 3

Assignment 3 yêu cầu mở rộng REST API để có xác thực người dùng và phân quyền:

- User đăng nhập bằng token.
- User có field `admin`, mặc định là `false`.
- Question có field `author`, reference đến `User`.
- Ai cũng được thực hiện các request `GET`.
- Chỉ Admin được thực hiện `POST`, `PUT`, `DELETE` trên Quiz.
- Chỉ Admin được `GET /users` để xem danh sách user.
- Chỉ Author của question được update/delete question của chính họ.
- User khác và cả Admin cũng không được sửa/xóa question của người khác.

## 2. Các file đã thêm hoặc sửa

Các file chính của Assignment 3:

```text
Project/
|-- authenticate.js
|-- controllers/
|   |-- questionController.js
|   |-- quizController.js
|   `-- userController.js
|-- middleware/
|   `-- errorHandler.js
|-- models/
|   |-- Question.js
|   |-- Quiz.js
|   `-- User.js
|-- routes/
|   |-- questionRoutes.js
|   |-- quizRoutes.js
|   `-- userRoutes.js
|-- postman/
|   |-- SDN Assignment 3.postman_collection.json
|   `-- SDN Assignment 3.postman_environment.json
|-- app.js
|-- .env.example
`-- README3.md
```

Ý nghĩa từng file:

| File | Vai trò |
| --- | --- |
| `authenticate.js` | Tạo token, verify token, kiểm tra Admin, kiểm tra Author |
| `models/User.js` | Schema User, gồm `username`, password hash, `admin` |
| `models/Question.js` | Thêm field `author` reference đến `User` |
| `controllers/userController.js` | Signup, login, get all users |
| `controllers/questionController.js` | Tạo question với author, update/delete theo author |
| `controllers/quizController.js` | Giữ CRUD quiz, tạo question trong quiz kèm author |
| `routes/userRoutes.js` | Route `/users`, `/users/signup`, `/users/login` |
| `routes/quizRoutes.js` | Bảo vệ thao tác ghi quiz bằng Admin |
| `routes/questionRoutes.js` | Bảo vệ thao tác update/delete question bằng Author |
| `app.js` | Mount route API, UI, users và giữ tương thích route cũ |
| `postman/*` | Collection và environment để test Assignment 3 |

## 3. Setup project

Yêu cầu:

- Node.js
- MongoDB local đang chạy
- Project nằm tại `C:\Users\Hoang\Documents\SDN\Project`

Chạy project:

```powershell
cd C:\Users\Hoang\Documents\SDN\Project
Copy-Item .env.example .env
npm install
npm start
```

Mặc định server chạy tại:

```text
http://localhost:3000
```

MongoDB mặc định:

```text
mongodb://127.0.0.1:27017/SimpleQuiz
```

File `.env.example` có các biến:

```dotenv
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/SimpleQuiz
API_BASE_URL=http://127.0.0.1:3000/api
API_REJECT_UNAUTHORIZED=false
JWT_SECRET=assignment-3-user-authentication
```

Nếu PowerShell chặn `npm`, dùng:

```powershell
npm.cmd start
npm.cmd run check
npm.cmd test
```

## 4. User model

File: `models/User.js`

User gồm:

| Field | Type | Ý nghĩa |
| --- | --- | --- |
| `_id` | ObjectId | ID tự sinh bởi MongoDB |
| `username` | String | Tên đăng nhập, mặc định `""` |
| `passwordHash` | String | Mật khẩu đã hash bằng bcrypt |
| `admin` | Boolean | Quyền Admin, mặc định `false` |
| `createdAt` | Date | Ngày tạo |
| `updatedAt` | Date | Ngày cập nhật |

Đúng theo đề:

```js
admin: {
  type: Boolean,
  default: false
}
```

Password không lưu plain text. Khi signup, password được hash bằng bcrypt với
`saltRounds = 10`. Bcrypt hash tự chứa salt, nên model không cần field `salt`
riêng.

## 5. Question model

File: `models/Question.js`

Question gồm:

| Field | Type | Ý nghĩa |
| --- | --- | --- |
| `_id` | ObjectId | ID tự sinh bởi MongoDB |
| `text` | String | Nội dung câu hỏi |
| `options` | String[] | Các lựa chọn trả lời |
| `keywords` | String[] | Từ khóa |
| `author` | ObjectId | User tạo question |
| `correctAnswerIndex` | Number | Index của đáp án đúng |

Field `author`:

```js
author: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
```

Khi user tạo question, controller tự gán:

```js
author: req.user._id
```

Client không cần tự gửi `author`.

## 6. authenticate.js hoạt động như thế nào

File: `authenticate.js`

File này export:

```js
getToken
verifyUser
verifyAdmin
verifyAuthor
```

### 6.1. getToken(user)

Tạo token cho user sau khi signup/login.

Payload trong token gồm:

```js
{
  _id: user._id.toString(),
  username: user.username,
  admin: user.admin,
  exp: ...
}
```

Token được gửi về client. Postman lưu token này vào environment.

### 6.2. verifyUser(req, res, next)

Middleware này kiểm tra request có token hợp lệ không.

Token có thể gửi bằng header:

```text
Authorization: Bearer <token>
```

Khi token hợp lệ:

```js
req.user = user;
next();
```

Điểm này đúng yêu cầu đề: sau `verifyUser()`, request có `req.user`.

### 6.3. verifyAdmin(req, res, next)

Middleware này phải chạy sau `verifyUser`.

Logic:

```js
if (req.user && req.user.admin) {
  return next();
}
```

Nếu không phải Admin, trả lỗi:

```text
Status: 403
Message: You are not authorized to perform this operation!
```

Đây là message đúng theo đề.

### 6.4. verifyAuthor(req, res, next)

Middleware này cũng chạy sau `verifyUser`.

Nó lấy question theo `req.params.questionId`, sau đó so sánh:

```js
question.author.toString() === req.user._id.toString()
```

Nếu đúng author:

```js
req.question = question;
next();
```

Nếu không đúng author:

```text
Status: 403
Message: You are not the author of this question
```

Admin không có ngoại lệ ở đây. Nếu Admin không phải author thì cũng bị chặn,
đúng yêu cầu đề.

## 7. Luồng đăng ký và đăng nhập

### 7.1. Signup Admin

```http
POST /users/signup
Content-Type: application/json
```

Body:

```json
{
  "username": "admin",
  "password": "secret",
  "admin": true
}
```

Response:

```json
{
  "user": {
    "_id": "...",
    "username": "admin",
    "admin": true
  },
  "token": "..."
}
```

### 7.2. Signup Author

```http
POST /users/signup
Content-Type: application/json
```

Body:

```json
{
  "username": "author",
  "password": "secret"
}
```

Vì không gửi `admin: true`, user này có:

```json
{
  "admin": false
}
```

### 7.3. Login

```http
POST /users/login
Content-Type: application/json
```

Body:

```json
{
  "username": "admin",
  "password": "secret"
}
```

Response cũng trả về `token`.

## 8. Phân quyền endpoint

### 8.1. User endpoints

| Method | Endpoint | Quyền | Ghi chú |
| --- | --- | --- | --- |
| POST | `/users/signup` | Public | Tạo user |
| POST | `/users/login` | Public | Login lấy token |
| GET | `/users` | Admin only | Lấy tất cả users |
| GET | `/api/users` | Admin only | Alias API |

### 8.2. Quiz endpoints

| Method | Endpoint | Quyền |
| --- | --- | --- |
| GET | `/quizzes` | Public |
| GET | `/quizzes/:quizId` | Public |
| POST | `/quizzes` | Admin only |
| PUT | `/quizzes/:quizId` | Admin only |
| DELETE | `/quizzes/:quizId` | Admin only |
| POST | `/quizzes/:quizId/question` | Admin only |
| POST | `/quizzes/:quizId/questions` | Admin only |
| POST | `/quizzes/:quizId/questions/:questionId` | Admin only |
| DELETE | `/quizzes/:quizId/questions/:questionId` | Admin only |

Các endpoint `/api/quizzes` cũng hoạt động tương tự.

### 8.3. Question endpoints

| Method | Endpoint | Quyền |
| --- | --- | --- |
| GET | `/questions` | Public |
| GET | `/questions/:questionId` | Public |
| POST | `/questions` | Logged-in user |
| PUT | `/questions/:questionId` | Author only |
| DELETE | `/questions/:questionId` | Author only |

Các endpoint `/api/questions` và `/question` cũng hoạt động tương tự.

## 9. Vì sao Admin không sửa/xóa question của người khác

Đề yêu cầu:

```text
No user or even the Admin can edit or delete the questions submitted by other users.
```

Vì vậy route question dùng:

```js
.put(verifyUser, verifyAuthor, updateQuestion)
.delete(verifyUser, verifyAuthor, deleteQuestion)
```

Không dùng `verifyAdmin` cho update/delete question.

Kết quả:

- Author sửa/xóa question của chính mình: được.
- User khác sửa/xóa: bị `403`.
- Admin sửa/xóa question không phải của mình: bị `403`.

## 10. Route API và route giao diện

Project Assignment 2 có giao diện HTML ở:

```text
/quizzes
/questions
```

Assignment 1 dùng REST API ở:

```text
/quizzes
/questions
/question
```

Để vừa giữ giao diện vừa giữ API cũ cho Postman, `app.js` có hàm:

```js
useApiUnlessBrowserRequest(apiRoutes, uiRoutes)
```

Cách hoạt động:

- Nếu request có header `Accept: text/html`, server trả giao diện HTML.
- Nếu request là Postman/API client, server trả JSON REST API.

Vì vậy trong Postman dùng được:

```text
GET {{baseUrl}}/quizzes
GET {{baseUrl}}/questions
```

Và vẫn dùng được API rõ ràng:

```text
GET {{baseUrl}}/api/quizzes
GET {{baseUrl}}/api/questions
```

## 11. Postman setup

Đã có sẵn 2 file:

```text
Project/postman/SDN Assignment 3.postman_collection.json
Project/postman/SDN Assignment 3.postman_environment.json
```

Import vào Postman:

1. Mở Postman.
2. Chọn Import.
3. Import cả 2 file trên.
4. Chọn environment `SDN Assignment 3 Local`.

Environment có các biến:

| Variable | Ý nghĩa |
| --- | --- |
| `baseUrl` | `http://localhost:3000` |
| `baseURL` | `http://localhost:3000`, thêm để tương thích nếu quen dùng `baseURL` |
| `token` | Token mặc định |
| `adminToken` | Token của Admin |
| `authorToken` | Token của Author |
| `quizId` | ID quiz mới tạo |
| `questionId` | ID question mới tạo |

Lưu ý: Postman phân biệt chữ hoa và chữ thường.

```text
{{baseUrl}} khác {{baseURL}}
```

Trong collection này các request chủ yếu dùng:

```text
{{baseUrl}}
```

## 12. Postman tự lưu token như thế nào

Trong request `Signup Admin` hoặc `Login Admin`, tab Tests có script:

```js
const json = pm.response.json();
if (json.token) {
  pm.environment.set("adminToken", json.token);
  pm.environment.set("token", json.token);
}
```

Sau khi gửi request, Postman tự lưu token vào environment.

Trong request `Signup Author` hoặc `Login Author`, script lưu:

```js
pm.environment.set("authorToken", json.token);
pm.environment.set("token", json.token);
```

Các request cần quyền dùng Bearer Token:

```text
{{adminToken}}
```

hoặc:

```text
{{authorToken}}
```

Postman sẽ gửi header thật:

```text
Authorization: Bearer <token>
```

## 13. Luồng test đề xuất trong Postman

### Bước 1: Tạo Admin

Chạy:

```text
Auth / Signup Admin
```

Nếu user đã tồn tại, chạy:

```text
Auth / Login Admin
```

Kết quả: `adminToken` được lưu.

### Bước 2: Tạo Author

Chạy:

```text
Auth / Signup Author
```

Nếu user đã tồn tại, chạy:

```text
Auth / Login Author
```

Kết quả: `authorToken` được lưu.

### Bước 3: Test Quiz

Chạy:

```text
Quizzes / Get Quizzes - Public
Quizzes / Create Quiz - Admin
Quizzes / Get Quiz By Id - Public
Quizzes / Update Quiz - Admin
```

Kết quả:

- GET không cần token.
- POST/PUT cần `adminToken`.
- Sau khi tạo quiz, `quizId` được lưu tự động.

### Bước 4: Test Question

Chạy:

```text
Questions / Get Questions - Public
Questions / Create Question - Author
Questions / Get Question By Id - Public
Questions / Update Own Question - Author
```

Kết quả:

- GET không cần token.
- POST cần user đã login.
- PUT/DELETE chỉ author được phép.
- Sau khi tạo question, `questionId` được lưu tự động.

### Bước 5: Test Users

Chạy:

```text
Users / Get Users - Admin Only
```

Kết quả:

- Dùng `adminToken`: trả danh sách users.
- Dùng token user thường: `403`.
- Không token: `401`.

## 14. Ví dụ request thủ công

### Tạo question bằng Author

```http
POST /questions
Authorization: Bearer <authorToken>
Content-Type: application/json
```

Body:

```json
{
  "text": "What is the capital of Vietnam?",
  "options": ["Hanoi", "Hue", "Da Nang", "Ho Chi Minh City"],
  "keywords": ["capital", "Vietnam"],
  "correctAnswerIndex": 0
}
```

### Update question bằng Author

```http
PUT /questions/:questionId
Authorization: Bearer <authorToken>
Content-Type: application/json
```

Body:

```json
{
  "text": "What is the capital city of Vietnam?",
  "options": ["Hanoi", "Hue", "Da Nang", "Ho Chi Minh City"],
  "keywords": ["capital", "Vietnam"],
  "correctAnswerIndex": 0
}
```

### Tạo quiz bằng Admin

```http
POST /quizzes
Authorization: Bearer <adminToken>
Content-Type: application/json
```

Body:

```json
{
  "title": "Assignment 3 Quiz",
  "description": "Admin creates this quiz",
  "questions": []
}
```

### Lấy users bằng Admin

```http
GET /users
Authorization: Bearer <adminToken>
```

## 15. Các status code quan trọng

| Status | Khi nào xảy ra |
| --- | --- |
| `200` | GET/PUT/DELETE thành công |
| `201` | POST tạo mới thành công |
| `400` | Body sai hoặc validation lỗi |
| `401` | Không có token hoặc token sai |
| `403` | Có token nhưng không đủ quyền |
| `404` | Không tìm thấy route hoặc resource |
| `500` | Lỗi server |

Message đúng theo đề:

```text
You are not authorized to perform this operation!
```

```text
You are not the author of this question
```

## 16. Kiểm thử bằng terminal

Chạy syntax check:

```powershell
npm.cmd run check
```

Kết quả hiện tại:

```text
Syntax check passed for 22 JavaScript files.
```

Chạy smoke test:

```powershell
npm.cmd test
```

Kết quả hiện tại:

```text
Smoke test passed: pages, CRUD, Axios integration, add/remove question.
```

Đã chạy thêm live integration check với MongoDB local và database test riêng:

```text
SimpleQuiz_assignment3_check
```

Kết quả:

```text
Assignment 3 live integration check passed.
```

Database test đã được drop sau khi kiểm tra.

## 17. Checklist đối chiếu với đề

| Yêu cầu đề | Trạng thái |
| --- | --- |
| Thêm `admin` trong User, mặc định `false` | Hoàn thành |
| Thêm `author` trong Question, reference `User` | Hoàn thành |
| Có `verifyAdmin()` trong `authenticate.js` | Hoàn thành |
| `verifyAdmin()` kiểm tra `req.user.admin` | Hoàn thành |
| User thường bị chặn với status `403` và đúng message | Hoàn thành |
| Có `verifyAuthor()` trong `authenticate.js` | Hoàn thành |
| Chỉ Admin được `POST/PUT/DELETE` Quiz | Hoàn thành |
| Ai cũng được `GET` Quiz | Hoàn thành |
| Admin `GET /users` lấy toàn bộ users | Hoàn thành |
| User thường không được `GET /users` | Hoàn thành |
| Author tạo question và sửa/xóa question của mình | Hoàn thành |
| User khác không sửa/xóa question của author | Hoàn thành |
| Admin không sửa/xóa question của user khác | Hoàn thành |

## 18. Lỗi thường gặp

### 18.1. Postman trả HTML thay vì JSON

Nguyên nhân: request bị xử lý như browser request.

Cách xử lý:

- Dùng endpoint `/api/quizzes` hoặc `/api/questions`.
- Hoặc dùng `/quizzes`, `/questions` nhưng đảm bảo Postman không gửi
  `Accept: text/html`.

Code hiện tại đã xử lý để Postman/API client ưu tiên JSON.

### 18.2. `401 No token provided`

Nguyên nhân:

- Chưa login/signup.
- Chưa chọn environment.
- Request chưa có Bearer Token.

Cách xử lý:

- Chọn environment `SDN Assignment 3 Local`.
- Chạy `Login Admin` hoặc `Login Author`.
- Kiểm tra tab Authorization có Bearer Token `{{adminToken}}` hoặc
  `{{authorToken}}`.

### 18.3. `403 You are not authorized to perform this operation!`

Nguyên nhân:

- Đang dùng token user thường để gọi API cần Admin.

Cách xử lý:

- Dùng `adminToken`.
- Login bằng user có `admin: true`.

### 18.4. `403 You are not the author of this question`

Nguyên nhân:

- Token hiện tại không phải author của question.
- Admin cũng bị chặn nếu không phải author, đúng yêu cầu đề.

Cách xử lý:

- Dùng token của user đã tạo question đó.
- Tạo question mới bằng `authorToken`, sau đó update/delete bằng chính
  `authorToken`.

### 18.5. `404 Quiz not found` hoặc `Question not found`

Nguyên nhân:

- ID không tồn tại trong MongoDB.
- Dữ liệu đã bị xóa.
- Đang dùng nhầm `quizId` hoặc `questionId`.

Cách xử lý:

- Chạy GET list trước.
- Copy đúng `_id`.
- Hoặc dùng collection Postman để tự lưu `quizId`, `questionId`.

### 18.6. MongoDB connection refused

Lỗi:

```text
connect ECONNREFUSED 127.0.0.1:27017
```

Nguyên nhân:

- MongoDB chưa chạy.

Cách xử lý:

- Bật MongoDB local.
- Kiểm tra lại `MONGODB_URI` trong `.env`.

## 19. Kết luận

Assignment 3 đã hoàn thành theo yêu cầu:

- Có xác thực bằng token.
- Có phân quyền Admin.
- Có phân quyền Author cho Question.
- Giữ được REST API cũ cho Postman.
- Giữ được giao diện Assignment 2.
- Có Postman collection và environment để test nhanh.
- Đã qua syntax check, smoke test và live integration check.
