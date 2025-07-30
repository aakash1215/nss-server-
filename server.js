require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors'); // For handling Cross-Origin Resource Sharing

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json()); // To parse JSON request bodies
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080' // IMPORTANT: Replace with your frontend domain in production
}));

// Google Sheets API configuration
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newline characters
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME;

// Route to handle form submissions
app.post('/register', async (req, res) => {
    try {
        const formData = req.body;

        // Basic validation (more robust validation should be done here)
        if (!formData.Name || !formData.Email || !formData['Mobile Number']) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }

        // Prepare data for Google Sheet
        const values = [
            new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), // Timestamp in IST
            formData.Name,
            formData.Gender,
            formData["Father's Name"],
            formData["Date of Birth"],
            formData.Category,
            formData["Blood Group"],
            formData.Course,
            formData["Year of Admission"],
            formData.Department,
            formData.Semester,
            formData["Enrollment Number"],
            formData.Background,
            formData["Permanent Address"],
            formData["Correspondence Address"],
            formData.Email,
            formData["Mobile Number"],
            formData.Photo, // This will be the filename, not the actual file content
            formData.Sign   // This will be the filename, not the actual file content
        ];

        // Append data to the sheet
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_NAME,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [values],
            },
        });

        if (response.status === 200) {
            res.status(200).json({ success: true, message: 'Registration successful!' });
        } else {
            throw new Error(`Google Sheets API responded with status: ${response.status}`);
        }

    } catch (error) {
        console.error('Error submitting form:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access at http://localhost:${PORT}`);
});