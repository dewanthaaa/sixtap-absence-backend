const ExcelResponse = {
  error(res, message, error) {
    console.error(message, error);
    res.status(500).json({ success: false, message, error: error.message });
  },
  forbidden(res, message) {
    res.status(403).json({ success: false, message });
  },
  badRequest(res, message) {
    res.status(400).json({ success: false, message });
  },
  notFound(res, message) {
    res.status(404).json({ success: false, message });
  },
};

export default ExcelResponse;
