import { GoogleSpreadsheet } from "google-spreadsheet";
import {JWT} from 'google-auth-library';

const serviceAccountAuth = new JWT({
    email: process.env.GOGOLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});