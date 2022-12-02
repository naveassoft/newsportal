import { postDocument, queryDocument } from "../../../services/server/common";
import { errorHandler } from "../../../services/server/errorhandler";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      handleDashboard(res);
      break;

    case "POST":
      postCommentOnNews(req, res);
      break;

    case "PUT":
      updateNewsViews(req, res);
      break;

    case "DELETE":
      deleteComment(req, res);
      break;

    default:
      res.status(404).send({ message: "not found" });
      break;
  }
}

function getAllDates() {
  const date = new Date();
  const today = date.toISOString().slice(0, 10);
  const yesterday = new Date(date.valueOf() - 1000 * 60 * 60 * 24)
    .toISOString()
    .slice(0, 10);
  const beforeYesterday = new Date(date.valueOf() - 1000 * 60 * 60 * 48)
    .toISOString()
    .slice(0, 10);
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const previousMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1)
    .toISOString()
    .slice(0, 10);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    .toISOString()
    .slice(0, 10);
  const previousYear = new Date(date.getFullYear() - 1, 0, 1)
    .toISOString()
    .slice(0, 10);

  return {
    today,
    yesterday,
    beforeYesterday,
    firstDayOfMonth,
    previousMonth,
    firstDayOfYear,
    previousYear,
  };
}

async function getPostReport() {
  const {
    today,
    yesterday,
    beforeYesterday,
    firstDayOfMonth,
    previousMonth,
    firstDayOfYear,
    previousYear,
  } = getAllDates();
  const todaysql = `SELECT id, created_at FROM news WHERE created_at >= '${yesterday}' AND created_at <= '${today}'`;
  const todaysNews = await queryDocument(todaysql);

  const yestersql = `SELECT id FROM news WHERE created_at >= '${beforeYesterday}' AND created_at <= '${yesterday}'`;
  const yesterNews = await queryDocument(yestersql);

  const thismonthsql = `SELECT id FROM news WHERE created_at >= '${firstDayOfMonth}' AND created_at <= '${today}'`;
  const thisMonthNews = await queryDocument(thismonthsql);

  const previousmonthsql = `SELECT id FROM news WHERE created_at >= '${previousMonth}' AND created_at <= '${firstDayOfMonth}'`;
  const previousMonthNews = await queryDocument(previousmonthsql);

  const thisYearsql = `SELECT id FROM news WHERE created_at >= '${firstDayOfYear}' AND created_at <= '${today}'`;
  const thisYearNews = await queryDocument(thisYearsql);

  const previousYearsql = `SELECT id FROM news WHERE created_at >= '${previousYear}' AND created_at <= '${firstDayOfYear}'`;
  const previousYearNews = await queryDocument(previousYearsql);

  return [
    {
      name: "Today's Post",
      count: todaysNews.length,
      grouth:
        todaysNews.length - yesterNews.length ||
        1 / yesterNews.length ||
        0 * 100,
    },
    {
      name: "This Month's Post",
      count: thisMonthNews.length,
      grouth:
        thisMonthNews.length - previousMonthNews.length ||
        1 / previousMonthNews.length ||
        0 * 100,
    },
    {
      name: "This year's Post",
      count: thisYearNews.length,
      grouth:
        thisYearNews.length - previousYearNews.length ||
        1 / previousYearNews.length ||
        0 * 100,
    },
  ];
}

async function getVisitorReport() {
  const {
    today,
    yesterday,
    beforeYesterday,
    firstDayOfMonth,
    previousMonth,
    firstDayOfYear,
    previousYear,
  } = getAllDates();
  const todaysql = `SELECT id FROM visitors WHERE date >= '${yesterday}' AND date <= '${today}'`;
  const todaysViews = await queryDocument(todaysql);

  const yestersql = `SELECT id FROM visitors WHERE date >= '${beforeYesterday}' AND date <= '${yesterday}'`;
  const yesterViews = await queryDocument(yestersql);

  const thismonthsql = `SELECT id FROM visitors WHERE date >= '${firstDayOfMonth}' AND date <= '${today}'`;
  const thisMonthViews = await queryDocument(thismonthsql);

  const previousmonthsql = `SELECT id FROM visitors WHERE date >= '${previousMonth}' AND date <= '${firstDayOfMonth}'`;
  const previousMonthViews = await queryDocument(previousmonthsql);

  const thisYearsql = `SELECT id FROM visitors WHERE date >= '${firstDayOfYear}' AND date <= '${today}'`;
  const thisYearViews = await queryDocument(thisYearsql);

  const previousYearsql = `SELECT id FROM visitors WHERE date >= '${previousYear}' AND date <= '${firstDayOfYear}'`;
  const previousYearViews = await queryDocument(previousYearsql);

  return [
    {
      name: "Today's Views",
      count: todaysViews.length,
      grouth:
        todaysViews.length - yesterViews.length ||
        1 / yesterViews.length ||
        0 * 100,
    },
    {
      name: "This Month's Views",
      count: thisMonthViews.length,
      grouth:
        thisMonthViews.length - previousMonthViews.length ||
        1 / previousMonthViews.length ||
        0 * 100,
    },
    {
      name: "This year's Post",
      count: thisYearViews.length,
      grouth:
        thisYearViews.length - previousYearViews.length ||
        1 / previousYearViews.length ||
        0 * 100,
    },
  ];
}

async function handleDashboard(res) {
  try {
    const sql =
      "SELECT news.headline, news.date, news.editor_name, category.name as category_name, s.name as sub_category_name FROM news INNER JOIN category ON news.category_id = category.id INNER JOIN sub_category as s ON news.sub_category_id = s.id ORDER BY created_at LIMIT 10";
    const someNews = await queryDocument(sql);
    const postReport = await getPostReport();
    const viewerReport = await getVisitorReport();

    res.send({
      someNews,
      postReport,
      viewerReport,
    });
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status });
  }
}

async function updateNewsViews(req, res) {
  try {
    //update news views;
    if (req.query.news) {
      req.body.date = new Date().toISOString().slice(0, 10);
      const isExistsql = `SELECT id FROM news_viewers WHERE news_id = '${req.body.news_id}' AND ipAdress = '${req.body.ipAdress}' AND date = '${req.body.date}'`;
      const isExist = await queryDocument(isExistsql);
      if (isExist.length) throw { message: "already added", status: 200 };

      const result = await postDocument(
        "INSERT INTO news_viewers SET ",
        req.body
      );
      if (result.insertId > 0) {
        res.send({ message: "Added" });
      } else {
        res.send({ message: "Unable to add" });
      }
    } //till;

    //update visitor views;
    else {
      req.body.date = new Date().toISOString().slice(0, 10);
      const existsql = `SELECT id FROM visitors WHERE ipAdress = '${req.body.ipAdress}' AND date = '${req.body.date}'`;
      const existed = await queryDocument(existsql);
      if (existed.length) throw { message: "already added", status: 200 };

      const result = await postDocument("INSERT INTO visitors SET ", req.body);
      if (result.insertId > 0) {
        res.send({ message: "Added" });
      } else {
        throw { message: "Unable to Added" };
      }
    }
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status });
  }
}

async function postCommentOnNews(req, res) {
  try {
    const sql = "INSERT INTO comments SET ";
    const result = await postDocument(sql, req.body);
    if (result.insertId > 0) {
      res.send({ message: "Thank you for staying us." });
    } else throw { message: "unable to post comment, please try again" };
  } catch (error) {
    errorHandler(res, { msg: error?.message, status: error?.status });
  }
}

async function deleteComment(req, res) {
  try {
    const query = `SELECT id FROM comments WHERE id = ${req.body.id} AND user_id = ${req.body.user_id}`;
    const isUser = await queryDocument(query);
    if (!isUser.length) throw { message: "Forbidden", status: 401 };
    const sql = `DELETE FROM comments WHERE id = ${req.body.id}`;
    const result = await queryDocument(sql);
    if (result.affectedRows > 0) {
      res.send({ message: "Deleted successfully" });
    } else throw { message: "unable to delete" };
  } catch (error) {
    errorHandler(res, error);
  }
}
