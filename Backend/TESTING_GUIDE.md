# Backend Testing Guide With Postman

This guide shows how to test your backend using Postman.

Your backend URL will be:

```text
http://localhost:5000
```

Your main API groups are:

- Auth routes: `/api/auth`
- Report routes: `/api/reports`

## 1. Start The Backend Server

Open PowerShell in your backend folder:

```powershell
cd "C:\Users\Sai Charan\OneDrive\Desktop\P\rai\Backend"
```

Install packages if needed:

```powershell
npm.cmd install
```

Start the backend:

```powershell
npm.cmd run dev
```

Expected backend terminal output:

```text
MongoDB connected successfully
Server running at http://localhost:5000
```

Keep this terminal open while testing in Postman.

## 2. Create A Postman Collection

Open Postman.

Create a new collection named:

```text
Interview Prep Backend
```

Inside this collection, you will create requests one by one.

## 3. Create Postman Variables

In your collection, go to the `Variables` tab.

Add these variables:

| Variable | Initial value | Current value |
| --- | --- | --- |
| `baseUrl` | `http://localhost:5000` | `http://localhost:5000` |
| `token` | empty | empty |
| `reportId` | empty | empty |

Click `Save`.

Now you can use:

```text
{{baseUrl}}
{{token}}
{{reportId}}
```

inside Postman requests.

## 4. Test Register

Create a new request:

```text
Name: Register User
Method: POST
URL: {{baseUrl}}/api/auth/register
```

Go to `Body`.

Select:

```text
raw
JSON
```

Paste:

```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "password123"
}
```

Click `Send`.

Expected response:

```json
{
  "success": true,
  "token": "...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "testuser@example.com"
  }
}
```

Expected status:

```text
201 Created
```

If you send the same request again, expected status:

```text
409 Conflict
```

That means duplicate email checking is working.

## 5. Test Login

Create a new request:

```text
Name: Login User
Method: POST
URL: {{baseUrl}}/api/auth/login
```

Go to `Body`.

Select:

```text
raw
JSON
```

Paste:

```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

Click `Send`.

Expected status:

```text
200 OK
```

Expected response:

```json
{
  "success": true,
  "token": "...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "testuser@example.com"
  }
}
```

Copy the `token` value.

Go to your collection `Variables` tab.

Paste it into the current value for:

```text
token
```

Click `Save`.

## 6. Test Login With Wrong Password

Create a new request:

```text
Name: Login Wrong Password
Method: POST
URL: {{baseUrl}}/api/auth/login
```

Body:

```json
{
  "email": "testuser@example.com",
  "password": "wrongpassword"
}
```

Expected status:

```text
401 Unauthorized
```

Expected response:

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

This is a good failed test. It means invalid login is rejected.

## 7. Test Reports Without Token

Create a new request:

```text
Name: Get Reports Without Token
Method: GET
URL: {{baseUrl}}/api/reports
```

Do not add an Authorization header.

Click `Send`.

Expected status:

```text
401 Unauthorized
```

Expected response:

```json
{
  "success": false,
  "message": "No token provided"
}
```

This confirms report routes are protected.

## 8. Add Authorization To Protected Requests

For every `/api/reports` request, add this header:

| Key | Value |
| --- | --- |
| `Authorization` | `Bearer {{token}}` |

In Postman:

1. Open the request.
2. Go to `Headers`.
3. Add `Authorization`.
4. Set the value to `Bearer {{token}}`.

## 9. Create Report With Manual Resume Text

Create a new request:

```text
Name: Create Report With Resume Text
Method: POST
URL: {{baseUrl}}/api/reports
```

Headers:

| Key | Value |
| --- | --- |
| `Authorization` | `Bearer {{token}}` |
| `Content-Type` | `application/json` |

Body:

Select:

```text
raw
JSON
```

Paste:

```json
{
  "jobTitle": "Junior Node.js Developer",
  "jobDescription": "We need a developer with JavaScript, Node.js, Express, MongoDB, REST API, and authentication experience.",
  "resumeText": "Sai Charan is a web developer skilled in JavaScript, React, Node.js, Express, MongoDB, REST APIs, authentication, and frontend development."
}
```

Click `Send`.

Expected status:

```text
201 Created
```

Expected response:

```json
{
  "success": true,
  "report": {
    "_id": "...",
    "jobTitle": "Junior Node.js Developer",
    "jobDescription": "...",
    "resumeText": "...",
    "skillGaps": [],
    "technicalQuestions": [],
    "behavioralQuestions": [],
    "optimizedResume": "...",
    "atsScore": 0,
    "matchScore": 0,
    "roadmap": []
  }
}
```

Your actual AI-generated values will be different.

Copy the report `_id`.

Go to collection `Variables`.

Paste it into the current value for:

```text
reportId
```

Click `Save`.

Important:

- This request uses Gemini AI.
- It may take longer than other requests.
- If it fails, check your backend terminal and `GEMINI_API_KEY`.
- The backend uses `gemini-2.5-flash` by default.
- You can override the model by adding `GEMINI_MODEL=gemini-2.5-flash` to `Backend/.env`.

If you get this error:

```text
API key not valid. Please pass a valid API key.
```

It means Postman and your route are working, but Gemini rejected your API key.

Fix it like this:

1. Open `Backend/.env`.
2. Replace `GEMINI_API_KEY` with a valid Gemini API key.
3. Make sure the variable name is exactly:

```env
GEMINI_API_KEY=your_real_valid_key_here
```

4. Do not use `GOOGLE_GENAI_API_KEY`; your code does not read that name.
5. Stop the backend server.
6. Start it again:

```powershell
npm.cmd run dev
```

7. Send the Postman request again.

Important:

- Restarting the server is required after changing `.env`.
- A `500 Internal Server Error` with this Gemini message is not a Postman body problem.
- If your key was shared or committed anywhere, create a new key and delete the old one.

If you get this error:

```text
models/gemini-1.5-flash is not found
```

It means the backend is using an unavailable Gemini model.

Fix it like this:

1. Make sure `Backend/src/services/aiService.js` uses `gemini-2.5-flash`.
2. Or add this to `Backend/.env`:

```env
GEMINI_MODEL=gemini-2.5-flash
```

3. Stop the backend server.
4. Start it again:

```powershell
npm.cmd run dev
```

5. Send the Postman request again.

## 10. Get All Reports

Create a new request:

```text
Name: Get All Reports
Method: GET
URL: {{baseUrl}}/api/reports
```

Headers:

| Key | Value |
| --- | --- |
| `Authorization` | `Bearer {{token}}` |

Click `Send`.

Expected status:

```text
200 OK
```

Expected response:

```json
{
  "success": true,
  "reports": [
    {
      "_id": "...",
      "jobTitle": "...",
      "atsScore": 80,
      "matchScore": 75,
      "skillGaps": [],
      "createdAt": "..."
    }
  ]
}
```

## 11. Get One Report By ID

Create a new request:

```text
Name: Get Report By ID
Method: GET
URL: {{baseUrl}}/api/reports/{{reportId}}
```

Headers:

| Key | Value |
| --- | --- |
| `Authorization` | `Bearer {{token}}` |

Click `Send`.

Expected status:

```text
200 OK
```

Expected response:

```json
{
  "success": true,
  "report": {
    "_id": "...",
    "jobTitle": "...",
    "resumeText": "...",
    "technicalQuestions": [],
    "behavioralQuestions": []
  }
}
```

## 12. Download Report PDF

Create a new request:

```text
Name: Download Report PDF
Method: GET
URL: {{baseUrl}}/api/reports/{{reportId}}/pdf
```

Headers:

| Key | Value |
| --- | --- |
| `Authorization` | `Bearer {{token}}` |

Click `Send`.

Expected status:

```text
200 OK
```

Expected response type:

```text
PDF file
```

In Postman, click:

```text
Save Response
```

Save it as:

```text
test-report.pdf
```

Open the PDF and check that report content is visible.

If this fails:

- Check the backend terminal error.
- Puppeteer may be failing.
- Run `npm.cmd install` again if needed.

## 13. Delete Report

Create a new request:

```text
Name: Delete Report
Method: DELETE
URL: {{baseUrl}}/api/reports/{{reportId}}
```

Headers:

| Key | Value |
| --- | --- |
| `Authorization` | `Bearer {{token}}` |

Click `Send`.

Expected status:

```text
200 OK
```

Expected response:

```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

Now send `Get Report By ID` again.

Expected status:

```text
404 Not Found
```

Expected response:

```json
{
  "success": false,
  "message": "Report not found"
}
```

## 14. Test Logout

Create a new request:

```text
Name: Logout User
Method: POST
URL: {{baseUrl}}/api/auth/logout
```

Headers:

| Key | Value |
| --- | --- |
| `Authorization` | `Bearer {{token}}` |

Click `Send`.

Expected status:

```text
200 OK
```

Expected response:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

Now send `Get All Reports` again with the same token.

Expected status:

```text
401 Unauthorized
```

Expected response:

```json
{
  "success": false,
  "message": "Token has been invalidated"
}
```

Important:

- Logout uses an in-memory token blacklist.
- If you restart the server, the old blacklist is cleared.
- For local testing, that is okay.

## 15. Test Validation: Register Missing Password

Create a new request:

```text
Name: Register Missing Password
Method: POST
URL: {{baseUrl}}/api/auth/register
```

Body:

```json
{
  "name": "Bad User",
  "email": "baduser@example.com"
}
```

Expected status:

```text
400 Bad Request
```

Expected response should contain validation errors.

## 16. Test Validation: Create Report Without Resume

Create a new request:

```text
Name: Create Report Without Resume
Method: POST
URL: {{baseUrl}}/api/reports
```

Headers:

| Key | Value |
| --- | --- |
| `Authorization` | `Bearer {{token}}` |
| `Content-Type` | `application/json` |

Body:

```json
{
  "jobTitle": "Node.js Developer",
  "jobDescription": "Build APIs with Express and MongoDB."
}
```

Expected status:

```text
400 Bad Request
```

Expected response:

```json
{
  "success": false,
  "message": "Please upload a resume file or enter resume text manually"
}
```

## 17. Test File Upload With PDF Or DOCX

Create a new request:

```text
Name: Create Report With Resume File
Method: POST
URL: {{baseUrl}}/api/reports
```

Headers:

| Key | Value |
| --- | --- |
| `Authorization` | `Bearer {{token}}` |

Important:

- Do not manually set `Content-Type`.
- Postman will set `multipart/form-data` automatically.

Go to `Body`.

Select:

```text
form-data
```

Add these fields:

| Key | Type | Value |
| --- | --- | --- |
| `jobTitle` | Text | `Node.js Developer` |
| `jobDescription` | Text | `We need Express, MongoDB, REST API, and authentication experience.` |
| `resume` | File | Choose your `.pdf` or `.docx` resume |

Click `Send`.

Expected status:

```text
201 Created
```

Expected result:

- Report is created
- Uploaded file appears in `Backend/uploads`
- Response includes AI-generated report data

## 18. Test File Upload With Wrong File Type

Create a new request:

```text
Name: Create Report With Wrong File Type
Method: POST
URL: {{baseUrl}}/api/reports
```

Headers:

| Key | Value |
| --- | --- |
| `Authorization` | `Bearer {{token}}` |

Body:

Select:

```text
form-data
```

Add:

| Key | Type | Value |
| --- | --- | --- |
| `jobTitle` | Text | `Node.js Developer` |
| `jobDescription` | Text | `Build APIs with Express.` |
| `resume` | File | Choose a `.txt`, `.png`, or `.jpg` file |

Expected status:

```text
500 Internal Server Error
```

Expected message:

```json
{
  "success": false,
  "message": "Only PDF and DOCX files are allowed"
}
```

Note:

- The backend currently returns this as `500` because multer throws a normal error.
- Later, you can improve this to return `400 Bad Request`.

## 19. Recommended Testing Order

Use this order when testing:

1. Register User
2. Login User
3. Save `token`
4. Get Reports Without Token
5. Create Report With Resume Text
6. Save `reportId`
7. Get All Reports
8. Get Report By ID
9. Download Report PDF
10. Delete Report
11. Login User again
12. Logout User
13. Try protected route with logged-out token

## 20. Common Problems

Problem: `Could not get any response`.

Check:

- Backend server is running
- URL starts with `http://localhost:5000`
- You did not use `https`

Problem: MongoDB error in backend terminal.

Check:

- `MONGODB_URI` in `.env`
- MongoDB Atlas username and password
- MongoDB Atlas network access allows your IP

Problem: `No token provided`.

Check:

- You added `Authorization` header
- Value is exactly `Bearer {{token}}`
- Your `token` collection variable has a current value

Problem: `Invalid or expired token`.

Fix:

- Send the login request again
- Copy the new token
- Update the `token` variable

Problem: Report creation fails.

Check:

- `GEMINI_API_KEY` is valid
- Internet connection works
- Backend terminal error message

Problem: PDF download fails.

Check:

- Puppeteer installed successfully
- `node_modules` exists
- Backend terminal error message

## 21. What Success Looks Like

Your backend is working if:

- Register creates a user
- Login returns a token
- Reports reject requests without a token
- Report creation works with manual resume text
- Reports can be listed
- A single report can be opened
- PDF can be downloaded
- Report can be deleted
- Logout blocks the old token
