import moment from "moment";
import { Op } from "sequelize";
import User from "../Models/user.js";
import Absence from "../Models/absence.js";
import SchoolClass from "../Models/schoolclass.js";
import calculateAttendanceStatistics from "../Helper/attendanceStatistic.js";

const AbsenceHistoryService = {
  async getAllHistory() {
    const absences = await Absence.findAll({
      attributes: [
        "id",
        "day",
        "time_in",
        "time_out",
        "date",
        "info",
        "absence_status",
        "card_status",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "nis", "batch", "photo_filename"],
        },
        {
          model: SchoolClass,
          as: "schoolClass",
          attributes: ["id", "class_name"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["time_in", "DESC"],
      ],
    });
    return {
      status: 200,
      body: {
        success: true,
        message: "Berhasil mengambil semua histori absensi",
        data: absences,
      },
    };
  },

  async getHistoryByAbsenceId(id) {
    if (!id) {
      return {
        status: 400,
        body: { message: "Id Histori Absensi Harus Disertakan" },
      };
    }

    const absence = await Absence.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "nis"],
        },
      ],
    });

    if (!absence) {
      return {
        status: 404,
        body: { message: "Histori Absensi Tidak Ditemukan" },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: "Berhasil Melihat Histori Absensi!.",
        data: absence,
      },
    };
  },

  async getHistoryByStudentId(studentId) {
    const student = User.findByPk(studentId, {
      attributes: ["id", "name", "nis", "batch", "photo_filename"],
      include: [
        {
          model: Absence,
          as: "absences",
          attributes: [
            "day",
            "time_in",
            "time_out",
            "date",
            "absence_status",
            "info",
          ],
          include: [
            {
              model: SchoolClass,
              as: "schoolClass",
              attributes: ["class_name"],
            },
          ],
        },
      ],
      order: [[{ model: Absence, as: "absences" }, "date", "DESC"]],
    });

    if (!student) {
      return {
        status: 404,
        body: { message: "Data kehadiran tidak ditemukan" },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: "Sukses melihat histori kehadiran",
        data: student,
      },
    };
  },

  async getHistoryByClassId(userId, query) {
    const {
      startDate,
      endDate,
      studentId,
      status,
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = query;

    const homeRoomTeacher = await User.findOne({
      where: { id: userId, role_id: 5 },
      include: [
        {
          model: SchoolClass,
          as: "schoolClass",
          attributes: ["id", "class_name", "class_code"],
        },
      ],
    });

    if (!homeRoomTeacher || !homeRoomTeacher.schoolclass_id) return null;

    const students = await User.findAll({
      where: {
        schoolclass_id: homeRoomTeacher.schoolclass_id,
        role_id: { [Op.in]: [1, 2] },
      },
      attributes: ["id", "name", "nis"],
    });

    const studentIds = students.map((s) => s.id);
    if (studentIds.length === 0)
      return {
        rows: [],
        count: 0,
        statistics: {},
        class: homeRoomTeacher.schoolClass,
      };

    const whereConditions = { user_id: { [Op.in]: studentIds } };
    if (startDate || endDate) {
      whereConditions.date = {};
      if (startDate)
        whereConditions.date[Op.gte] = moment(startDate)
          .startOf("day")
          .toDate();
      if (endDate)
        whereConditions.date[Op.lte] = moment(endDate).endOf("day").toDate();
    }
    if (studentId) whereConditions.user_id = studentId;
    if (status) whereConditions.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const attendanceData = await Absence.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "nis"],
          where: { schoolclass_id: homeRoomTeacher.schoolclass_id },
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    const statistics = await calculateAttendanceStatistics(
      studentIds,
      startDate,
      endDate
    );
    const totalPages = Math.ceil(attendanceData.count / parseInt(limit));

    return {
      status: 200,
      body: {
        success: true,
        message: "Data histori absen berhasil diambil.",
        data: {
          class: {
            id: homeRoomTeacher.schoolclass_id,
            class_name: homeRoomTeacher.schoolClass?.class_name,
            class_code: homeRoomTeacher.schoolClass?.class_code,
          },
          attendances: attendanceData.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: attendanceData.count,
            itemsPerPage: parseInt(limit),
            hasNextPage: parseInt(page) < totalPages,
            hasPreviousPage: parseInt(page) > 1,
          },
          statistics,
          filters: { startDate, endDate, studentId, status },
        },
      },
    };
  },

  async getTodayAbsencesByClass(userId) {
    const homeroomTeacher = await User.findOne({
      where: { id: userId, role_id: 5 },
    });
    if (!homeroomTeacher || !homeroomTeacher.schoolclass_id) return null;

    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    const absencesToday = await Absence.findAll({
      where: { time_in: { [Op.between]: [todayStart, todayEnd] } },
      include: [
        {
          model: User,
          as: "user",
          where: { schoolclass_id: homeroomTeacher.schoolclass_id },
          attributes: ["id", "name", "nis", "photo_filename"],
        },
      ],
      order: [["time_in", "ASC"]],
    });
    return {
      status: 200,
      body: {
        success: true,
        message: "Data absensi hari ini berhasil diambil.",
        data: absencesToday.map((absence) => ({
          absence_id: absence.id,
          student_id: absence.user.id,
          name: absence.user.name,
          nis: absence.user.nis,
          photo: absence.user.photo_filename,
          time_in: absence.time_in,
          time_out: absence.time_out,
          status: absence.absence_status,
          info: absence.info,
          editable: true,
        })),
      },
    };
  },

  async editTodayStatus(userId, id, status, info) {
    const teacher = await User.findByPk(userId);
    if (!teacher || teacher.role_id !== 5 || !teacher.schoolclass_id) {
      return {
        status: 403,
        body: { success: false, message: "Anda tidak memiliki akses." },
      };
    }

    const absence = await Absence.findByPk(absenceId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "nis", "schoolclass_id"],
        },
      ],
    });

    if (!absence)
      return {
        status: 404,
        body: { success: false, message: "Absensi tidak ditemukan" },
      };

    if (absence.user.schoolclass_id !== teacher.schoolclass_id) {
      return {
        status: 403,
        body: {
          success: false,
          message: "Data ini bukan dari siswa kelas Anda.",
        },
      };
    }

    const isToday = moment(absence.time_in).isSame(moment(), "day");
    if (!isToday) {
      return {
        status: 403,
        body: {
          success: false,
          message: "Anda hanya bisa mengedit absensi pada hari yang sama.",
        },
      };
    }

    absence.absence_status = status;
    absence.info = info;
    await absence.save();

    return {
      status: 200,
      body: {
        success: true,
        message: "Status absensi berhasil diubah.",
        data: {
          id: absence.id,
          status: absence.absence_status,
          info: absence.info,
        },
      },
    };
  },

  async studentTodayAttendance(studentId) {
    const student = await User.findOne({
      where: { id: studentId },
      attributes: ["id", "name", "nis", "schoolclass_id"],
    });
    if (!student)
      return {
        status: 404,
        body: {
          success: false,
          message: "Siswa tidak ditemukan",
        },
      };

    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    const attendance = await Absence.findOne({
      where: {
        user_id: student.id,
        time_in: { [Op.between]: [todayStart, todayEnd] },
      },
      attributes: ["id", "time_in", "time_out", "absence_status", "info"],
    });

    return {
      status: 200,
      body: {
        success: true,
        data: {
          student: {
            name: student.name,
            nis: student.nis,
            classId: student.schoolclass_id,
          },
          attendance: attendance
            ? {
                timeIn: attendance.time_in,
                timeOut: attendance.time_out,
                date: attendance.date,
                status: attendance.absence_status,
                info: attendance.info,
              }
            : null,
        },
      },
    };
  },
};

export default AbsenceHistoryService;
