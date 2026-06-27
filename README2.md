# Assignment 2 - Những thay đổi so với Assignment 1

File này ghi lại những phần đã bổ sung và chỉnh sửa để mở rộng REST API của
Assignment 1 thành ứng dụng Question Bank Management có giao diện.

## 1. Tổng quan

Assignment 1 chỉ cung cấp REST API cho `Question` và `Quiz`.

Assignment 2 bổ sung:

- Giao diện quản lý câu hỏi và quiz.
- EJS và Handlebars template engine.
- Bootstrap 5 và CSS tùy chỉnh.
- Axios để route giao diện gọi REST API.
- Body Parser và Method Override để xử lý form HTML.
- CRUD hoàn chỉnh trên trình duyệt.
- Thêm hoặc gỡ câu hỏi có sẵn khỏi quiz.
- Cấu hình HTTPS tùy chọn.
- Smoke test cho các trang và luồng CRUD.

## 2. Dependency mới

Các package sau đã được cài thêm trong `package.json`:

| Package | Mục đích |
| --- | --- |
| `axios` | Gọi Assignment 1 REST API từ các route giao diện |
| `ejs` | Render các trang CRUD Question và Quiz |
| `express-handlebars` | Cấu hình Handlebars làm view engine mặc định |
| `handlebars` | Template engine Handlebars |
| `body-parser` | Đọc dữ liệu JSON và dữ liệu form |
| `method-override` | Cho phép form HTML thực hiện PUT và DELETE |

Bootstrap 5 được tích hợp bằng CDN nên không cần cài package.

## 3. Thay đổi cấu trúc thư mục

Các thư mục và file mới:

```text
Project/
|-- config/
|   |-- apiClient.js
|   `-- ejsViewEngine.js
|-- middleware/
|   `-- uiErrorHandler.js
|-- public/
|   `-- css/
|       `-- style.css
|-- routes/
|   |-- index.js
|   |-- question.js
|   `-- quiz.js
|-- scripts/
|   `-- check.js
|-- tests/
|   `-- smoke.js
|-- views/
|   |-- layouts/
|   |   `-- main.hbs
|   |-- partials/
|   |   |-- header.hbs
|   |   |-- footer.hbs
|   |   `-- index.ejs
|   |-- questions/
|   |   |-- list.ejs
|   |   |-- details.ejs
|   |   |-- create.ejs
|   |   `-- edit.ejs
|   |-- quiz/
|   |   |-- list.ejs
|   |   |-- details.ejs
|   |   |-- create.ejs
|   |   `-- edit.ejs
|   `-- error.ejs
`-- README2.md
```

## 4. Các file Assignment 1 đã chỉnh sửa

### `app.js`

- Cấu hình Handlebars làm view engine mặc định.
- Đăng ký EJS để render các trang cụ thể.
- Cấu hình Body Parser.
- Cấu hình Method Override bằng query `_method`.
- Cấu hình thư mục static `public`.
- Thêm route trang chủ trong `routes/index.js` và render
  `views/partials/index.ejs`.
- Chuyển các REST API cũ sang prefix `/api`.
- Đăng ký route giao diện `/questions` và `/quizzes`.

### `server.js`

- Chuyển sang tạo HTTP server rõ ràng.
- Hỗ trợ HTTPS khi có `SSL_KEY_PATH` và `SSL_CERT_PATH`.
- In đúng protocol và port khi server khởi động.

### `config/database.js`

- Hỗ trợ cả biến `MONGODB_URI` và `MONGO_URI`.
- Giữ giá trị mặc định:

```text
mongodb://127.0.0.1:27017/SimpleQuiz
```

### `controllers/quizController.js`

Thêm hai chức năng:

- `attachQuestionToQuiz`: gắn một question có sẵn vào quiz.
- `detachQuestionFromQuiz`: gỡ question khỏi quiz nhưng không xóa question.

Controller cũng kiểm tra:

- Quiz có tồn tại hay không.
- Question có tồn tại hay không.
- Không thêm trùng question vào cùng một quiz.

### `routes/quizRoutes.js`

Thêm REST API:

```text
POST   /api/quizzes/:quizId/questions/:questionId
DELETE /api/quizzes/:quizId/questions/:questionId
```

### `package.json`

- Đổi tên project thành `question-bank-management`.
- Nâng version lên `2.0.0`.
- Thêm dependency Assignment 2.
- Thêm script kiểm tra:

```powershell
npm run check
npm test
```

### `.env.example`

Thêm cấu hình:

```dotenv
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/SimpleQuiz
API_BASE_URL=http://127.0.0.1:3000/api
API_REJECT_UNAUTHORIZED=false
```

Đồng thời có ví dụ cấu hình HTTPS.

## 5. Thay đổi REST API

API Assignment 1 trước đây nằm trực tiếp tại:

```text
/questions
/question
/quizzes
```

Trong Assignment 2, `/questions` và `/quizzes` được dùng cho giao diện HTML.
Vì vậy REST API được chuyển sang:

```text
/api/questions
/api/question
/api/quizzes
```

Các model và nghiệp vụ Assignment 1 vẫn được giữ lại.

## 6. Route giao diện Question

| Method | Route | Chức năng |
| --- | --- | --- |
| GET | `/questions` | Hiển thị danh sách question |
| GET | `/questions/new` | Hiển thị form tạo question |
| POST | `/questions` | Gửi dữ liệu tạo question |
| GET | `/questions/:questionId` | Hiển thị chi tiết question |
| GET | `/questions/:questionId/edit` | Hiển thị form chỉnh sửa |
| PUT | `/questions/:questionId` | Cập nhật question |
| DELETE | `/questions/:questionId` | Xóa question |

Khi xóa một question, API Assignment 1 vẫn tự động gỡ ID của question đó khỏi
tất cả quiz liên quan.

## 7. Route giao diện Quiz

| Method | Route | Chức năng |
| --- | --- | --- |
| GET | `/quizzes` | Hiển thị danh sách quiz |
| GET | `/quizzes/new` | Hiển thị form tạo quiz |
| POST | `/quizzes` | Gửi dữ liệu tạo quiz |
| GET | `/quizzes/:quizId` | Hiển thị quiz và các question |
| GET | `/quizzes/:quizId/edit` | Hiển thị form chỉnh sửa |
| PUT | `/quizzes/:quizId` | Cập nhật quiz |
| DELETE | `/quizzes/:quizId` | Xóa quiz |
| POST | `/quizzes/:quizId/questions/:questionId` | Thêm question vào quiz |
| DELETE | `/quizzes/:quizId/questions/:questionId` | Gỡ question khỏi quiz |

## 8. Axios API Client

File `config/apiClient.js` tạo một Axios instance dùng chung.

Chức năng:

- Đọc API URL từ `API_BASE_URL`.
- Mặc định gọi `http://127.0.0.1:3000/api`.
- Có timeout 10 giây.
- Hỗ trợ HTTPS.
- Có thể chấp nhận certificate tự ký trong môi trường phát triển khi
  `API_REJECT_UNAUTHORIZED=false`.

Các route giao diện không truy cập MongoDB trực tiếp. Chúng dùng Axios gọi REST
API, đúng yêu cầu tích hợp API từ Assignment 1.

## 9. EJS và Handlebars

### Handlebars

Handlebars là view engine mặc định.

Được dùng cho:

- Trang chủ `views/partials/index.ejs`.
- Layout `views/layouts/main.hbs`.
- Header và footer Handlebars.

### EJS

EJS được dùng cho:

- Danh sách Question.
- Chi tiết Question.
- Tạo và sửa Question.
- Danh sách Quiz.
- Chi tiết Quiz.
- Tạo và sửa Quiz.
- Trang báo lỗi giao diện.

EJS chỉ render nội dung trang. `config/ejsViewEngine.js` bọc nội dung bằng `main.hbs`, `header.hbs` và `footer.hbs`. Project không sử dụng `header.ejs` hoặc `footer.ejs`.

## 10. Giao diện

Giao diện đã được bổ sung:

- Bootstrap 5 responsive.
- Navbar dùng chung.
- Footer dùng chung.
- Trang chủ giới thiệu chức năng.
- Card và list cho Question và Quiz.
- Empty state khi chưa có dữ liệu.
- Hiển thị đáp án đúng bằng badge.
- Hiển thị keyword của question.
- Form chọn nhiều question khi tạo hoặc sửa quiz.
- Thông báo validation từ API.
- Giữ dữ liệu form khi API trả lỗi.
- Hộp xác nhận trước khi xóa.
- CSS responsive cho màn hình nhỏ.

## 11. Xử lý form HTML

Form HTML chỉ hỗ trợ GET và POST. Vì vậy Method Override được dùng như sau:

```text
?_method=PUT
?_method=DELETE
```

Ví dụ:

```text
POST /questions/:questionId?_method=PUT
POST /quizzes/:quizId?_method=DELETE
```

Express sẽ chuyển các request này thành PUT hoặc DELETE.

## 12. Xử lý lỗi

File `middleware/uiErrorHandler.js`:

- Đọc message lỗi do API trả về.
- Báo rõ khi không kết nối được Assignment 1 API.
- Render trang lỗi thân thiện thay vì chỉ hiển thị JSON.

Middleware lỗi API cũ vẫn được giữ để xử lý:

- Mongoose validation error.
- ObjectId không hợp lệ.
- Route API không tồn tại.
- Lỗi server.

## 13. HTTPS

Ứng dụng vẫn chạy HTTP mặc định để phát triển.

Khi có certificate, có thể bật HTTPS bằng:

```dotenv
PORT=3443
SSL_KEY_PATH=certificates/localhost-key.pem
SSL_CERT_PATH=certificates/localhost-cert.pem
API_BASE_URL=https://127.0.0.1:3443/api
API_REJECT_UNAUTHORIZED=false
```

Trong production nên dùng certificate hợp lệ và đặt:

```dotenv
API_REJECT_UNAUTHORIZED=true
```

## 14. Kiểm thử đã bổ sung

### Syntax check

File `scripts/check.js` tự động tìm và kiểm tra cú pháp tất cả file `.js`:

```powershell
npm run check
```

Kết quả:

```text
Syntax check passed for 16 JavaScript files.
```

### Smoke test

File `tests/smoke.js` kiểm tra:

- Render trang chủ Handlebars.
- Render tất cả trang EJS.
- Danh sách, chi tiết, tạo và sửa Question.
- Danh sách, chi tiết, tạo và sửa Quiz.
- Xóa Question và Quiz.
- Thêm và gỡ Question khỏi Quiz.
- Route giao diện gọi API qua Axios.
- Header/layout dùng chung xuất hiện trên các trang.

Chạy bằng:

```powershell
npm test
```

Kết quả:

```text
Smoke test passed: pages, CRUD, Axios integration, add/remove question.
```

### Kiểm tra với MongoDB thật

Ứng dụng đã được chạy với MongoDB local và kiểm tra các URL:

```text
/
/questions
/questions/new
/quizzes
/quizzes/new
/css/style.css
/api/questions
/api/quizzes
```

Tất cả đều trả HTTP status `200`.

### Kiểm tra dependency

Đã chạy:

```powershell
npm audit --omit=dev
```

Kết quả:

```text
found 0 vulnerabilities
```

## 15. Cách chạy Assignment 2

```powershell
cd C:\Users\Hoang\Documents\SDN\Project
Copy-Item .env.example .env
npm install
npm start
```

Truy cập:

```text
http://localhost:3000
```
