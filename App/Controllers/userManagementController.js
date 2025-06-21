import UserManagementService from "../Services/userManagementService.js";

class UserManagementController {
  async index(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await UserManagementService.getUsersWithPagination(
        page,
        limit
      );
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async userDetail(req, res) {
    try {
      const { id } = req.params;
      const result = await UserManagementService.getUserDetail(id);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async create(req, res) {
    try {
      const result = await UserManagementService.createUser(req.body);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await UserManagementService.updateUser(id, req.body);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await UserManagementService.deleteUser(id);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const result = await UserManagementService.resetUserPassword(id);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async userProfile(req, res) {
    try {
      const userId = req.user.id;
      const result = await UserManagementService.getUserProfile(userId, req);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async updateUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const roleName = req.user.role_name?.toLowerCase();
      const result = await UserManagementService.updateUserProfile(
        userId,
        roleName,
        req.body,
        req.file
      );
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async uploadUserPhotoProfile(req, res) {
    try {
      const userId = req.user.id;
      const result = await UserManagementService.uploadPhoto(userId, req.file);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async updateUserPhotoProfile(req, res) {
    try {
      const userId = req.user.id;
      const result = await UserManagementService.updatePhoto(
        userId,
        req.file,
        req
      );
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
}

export default new UserManagementController();
