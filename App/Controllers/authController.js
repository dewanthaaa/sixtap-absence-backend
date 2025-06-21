import AuthService from "../Services/authService.js";

class AuthController {
  async login(req, res) {
    try {
      const { identifier, password } = req.body;
      const result = await AuthService.login(identifier, password, req, res);
      return res.status(result.status).json(result.body);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        message: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }

  logout(req, res) {
    try {
      const result = AuthService.logout(res);
      return res.status(result.status).json(result.body);
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        message: "Terjadi kesalahan saat logout",
        error: error.message,
      });
    }
  }
}

export default new AuthController();
