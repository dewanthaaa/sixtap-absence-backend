import generateExcel from "../Services/ExcelService.js";

const ExcelExporter = {
  async exportToExcel(res, { data, columns, sheetName, fileName }) {
    await generateExcel({ data, columns, sheetName, fileName, res });
  },
};

export default ExcelExporter;
