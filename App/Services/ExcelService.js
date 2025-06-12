// Versi Lama
// import ExcelJS from "exceljs";

// export const generateExcel = async (data, fileName, columnMap = null) => {
//   try {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Sheet 1");

//     if (!data || data.length === 0) {
//       throw new Error("No data provided");
//     }

//     let headers = columnMap ? Object.values(columnMap) : Object.keys(data[0]);

//     worksheet.addRow(headers);

//     data.forEach((item) => {
//       const rowData = columnMap
//         ? Object.keys(columnMap).map((key) => item[key] ?? "")
//         : Object.values(item);
//       worksheet.addRow(rowData);
//     });

//     worksheet.getRow(1).font = { bold: true };
//     worksheet.getRow(1).fill = {
//       type: "pattern",
//       pattern: "solid",
//       fgColor: { argb: "FFE0E0E0" },
//     };

//     worksheet.columns.forEach((column) => {
//       let maxLength = 0;
//       column.eachCell({ includeEmpty: true }, (cell) => {
//         const columnLength = cell.value ? cell.value.toString().length : 10;
//         if (columnLength > maxLength) {
//           maxLength = columnLength;
//         }
//       });
//       column.width = Math.min(maxLength + 2, 30);
//     });

//     const buffer = await workbook.xlsx.writeBuffer();
//     return { buffer, fileName };
//   } catch (error) {
//     console.error("Error generating Excel:", error);
//     throw error;
//   }
// };

// Versi Baru
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
