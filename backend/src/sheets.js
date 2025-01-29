const { google } = require('googleapis');

// Usar as credenciais da variável de ambiente
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const SPREADSHEET_ID = '1sZumguCoCt_OnlqvqaWMPe-qzezbv3fy_YCFCLg3WZ8';

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

async function appendRow(store, transcription) {
  const date = new Date().toLocaleString('pt-BR');
  const values = [[date, store, transcription]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:C',
    valueInputOption: 'USER_ENTERED',
    resource: { values }
  });
}

module.exports = { appendRow };