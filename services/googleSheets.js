const { google } = require('googleapis');
const classesConfig = require('../config/classes.json');
require('dotenv').config();

const dataKey = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/telegram-bot-sheets%40telegram-bot-sheets-385108.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

class GoogleSheetsService {
    constructor() {
      this.auth = new google.auth.GoogleAuth({
        credentials: dataKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.spreadsheetId = process.env.SPREADSHEET_ID;
      this.classMap = this.createClassMap();
    }
  
    createClassMap() {
      const classMap = {};
      classesConfig.classes.forEach((cls, index) => {
        classMap[cls] = index + 2;
      });
      return classMap;
    }
  
    formatDateToDDMMYYYY(date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }
  
    normalizeDate(dateStr) {
      if (!dateStr) return null;
      console.log('Original date string:', dateStr);
      const cleanDateStr = dateStr.trim().replace(/^'/, '');

      let date;
      if (cleanDateStr.includes('.')) {
        // Handle "DD.MM.YYYY" format
        const [day, month, year] = cleanDateStr.split('.');
        date = new Date(year, month - 1, day); 
      } else {
        date = new Date(cleanDateStr); 
      }

      if (isNaN(date.getTime())) {
        console.error('Invalid date format');
        return null;
      }

      console.log('Parsed date:', date);
      return this.formatDateToDDMMYYYY(date);
    }
  
    async updateSheet(className, date, value, isGroup) {
      const formattedDate = this.normalizeDate(date);
      if (!formattedDate) throw new Error('Invalid date format');
    
      const cleanDate = formattedDate.trim();
    
      const academicYear = this.getAcademicYear(date);
      const sheetName = `${academicYear.startYear}/${academicYear.endYear}`;
    
      await this.ensureSheetExists(sheetName);
      const colIndex = await this.ensureDateColumn(sheetName, cleanDate);
      const rowIndex = this.getRowIndex(className);
    
      if (!rowIndex || !colIndex) throw new Error('Invalid class or date');
    
      const range = `${sheetName}!${colIndex}${rowIndex}`;
      console.log('Updating range:', range);
      let currentValue = 0;
    
      if (isGroup) {
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.spreadsheetId,
          range: range,
        });
        currentValue = parseInt(response.data.values?.[0]?.[0] || 0);
      }
    
      const newValue = isGroup ? currentValue + value : value;
    
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: { values: [[newValue]] },
      });
    }
  
    async ensureSheetExists(sheetName) {
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
  
      const sheetExists = spreadsheet.data.sheets.some(
        (sheet) => sheet.properties.title === sheetName
      );
  
      if (!sheetExists) {
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          resource: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
        });
        await this.initializeSheet(sheetName);
      }
    }
  
    async ensureDateColumn(sheetName, date) {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!1:1`,
      });
      const dates = response.data.values ? response.data.values[0] : [];
      console.log('Dates in sheet:', dates);

      const normalizedTargetDate = this.normalizeDate(date);
      console.log('Normalized target date:', normalizedTargetDate);

      let colIndex = -1;
      for (let i = 0; i < dates.length; i++) {
        const normalizedDate = this.normalizeDate(dates[i]);
        console.log(`Comparing ${normalizedDate} with ${normalizedTargetDate}`);
        if (normalizedDate === normalizedTargetDate) {
          colIndex = i;
          break;
        }
      }
  
      if (colIndex === -1) {
        colIndex = dates.length;
        const colLetter = this.numberToColumn(colIndex + 1);
        console.log(`Adding new date ${date} to column ${colLetter}`);
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!${colLetter}1`,
          valueInputOption: 'RAW',
          resource: { values: [[date]] },
        });
      }
  
      const finalCol = this.numberToColumn(colIndex + 1);
      console.log('Selected column:', finalCol);
      return finalCol;
    }
  
    async initializeSheet(sheetName) {
      const values = classesConfig.classes.map((cls) => [cls]);
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A2:A${values.length + 1}`,
        valueInputOption: 'RAW',
        resource: { values },
      });
    }
  
    getAcademicYear(date) {
      const currentDate = new Date(date);
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
      const endYear = startYear + 1;
      return { startYear, endYear };
    }
  
    numberToColumn(num) {
      let column = '';
      while (num > 0) {
        const remainder = (num - 1) % 26;
        column = String.fromCharCode(65 + remainder) + column;
        num = Math.floor((num - 1) / 26);
      }
      return column;
    }
  
    getRowIndex(className) {
      return this.classMap[className];
    }
}
  
module.exports = GoogleSheetsService;