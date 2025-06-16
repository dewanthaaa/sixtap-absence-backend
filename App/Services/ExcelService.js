import ExcelJS from "exceljs";

const generateExcel = async ({ data, columns, sheetName, fileName, res }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName || "Sheet 1");

  worksheet.columns = columns;

  data.forEach((item) => worksheet.addRow(item));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${fileName || "export.xlsx"}`
  );

  await workbook.xlsx.write(res);
  res.end();
};

export default generateExcel;
