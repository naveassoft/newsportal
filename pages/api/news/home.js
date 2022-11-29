import { queryDocument } from "../../../services/server/common";
import { errorHandler } from "../../../services/server/errorhandler";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      if (req.query.otherNews) {
        getOtherNews(res);
      } else if (req.query.category) {
        getCategoryNews(req, res);
      } else if (req.query.types) {
        getTypesNews(req, res);
      } else if (req.query.mostreaded) {
        getMostReadedNews(req, res);
      } else if (req.query.search) {
        getSearchedNews(req, res);
      } else {
        getBasicData(res);
      }
      break;
    default:
      res.status(404).send({ message: "not found" });
      break;
  }
}

async function getBasicData(res) {
  try {
    const hotNews = await queryDocument(
      "SELECT * FROM news WHERE type = 'hot news' ORDER BY created_at LIMIT 4"
    );

    const topNews = await queryDocument(
      "SELECT * FROM news WHERE type = 'top news' ORDER BY created_at LIMIT 3"
    );

    const countryNews = await queryDocument(
      "SELECT news.*, category.name as category_name FROM news INNER JOIN category ON news.category_id = category.id WHERE category.name = 'Bangladesh' ORDER BY created_at LIMIT 5"
    );

    const politicsNews = await queryDocument(
      "SELECT news.*, category.name as category_name FROM news INNER JOIN category ON news.category_id = category.id WHERE category.name = 'Politics' ORDER BY created_at LIMIT 5"
    );

    const businessNews = await queryDocument(
      "SELECT news.*, category.name as category_name FROM news INNER JOIN category ON news.category_id = category.id WHERE category.name = 'Business' ORDER BY created_at LIMIT 5"
    );

    const latestNews = await queryDocument(
      "SELECT * FROM news ORDER BY created_at LIMIT 22"
    );

    res.send({
      hotNews,
      topNews,
      countryNews,
      politicsNews,
      businessNews,
      latestNews,
    });
  } catch (error) {
    errorHandler(res, { msg: error.message, status: error.status || 500 });
  }
}

async function getOtherNews(res) {
  try {
    const otherNews = await queryDocument(
      "SELECT * FROM news WHERE type = 'genaral news' ORDER BY created_at LIMIT 10"
    );

    const homeNews = await queryDocument(
      "SELECT news.*, category.name as category_name FROM news INNER JOIN category ON news.category_id = category.id WHERE category.name = 'Bangladesh' ORDER BY created_at LIMIT 5, 20"
    );
    const featuresNews = await queryDocument(
      "SELECT * FROM news WHERE type = 'features' ORDER BY created_at LIMIT 5"
    );
    res.send({ otherNews, homeNews, featuresNews });
  } catch (error) {
    errorHandler(res, { msg: error.message, status: error.status || 500 });
  }
}

async function getCategoryNews(req, res) {
  try {
    if (req.query.sub) {
      const limit = parseInt(req.query.limit) || 20;
      const page = parseInt(req.query.page || 0) * limit;
      const sql = `SELECT news.*, category.name as category_name, s.name as sub_category_name FROM news INNER JOIN category ON news.category_id = category.id INNER JOIN sub_category as s ON category.id = s.category_id WHERE category.name = '${req.query.category}' AND s.name = '${req.query.sub}' ORDER BY created_at LIMIT ${page}, ${limit}`;
      const result = await queryDocument(sql);
      res.send(result);
    } else {
      const limit = parseInt(req.query.limit) || 20;
      const page = parseInt(req.query.page || 0) * limit;
      const sql = `SELECT news.*, category.name as category_name FROM news INNER JOIN category ON news.category_id = category.id  WHERE category.name = '${req.query.category}' ORDER BY created_at LIMIT ${page}, ${limit}`;
      const result = await queryDocument(sql);
      res.send(result);
    }
  } catch (error) {
    errorHandler(res, { msg: error.message, status: error.status });
  }
}

async function getTypesNews(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page || 0) * limit;
    const sql = `SELECT * FROM news WHERE type = '${req.query.types}' ORDER BY created_at LIMIT ${page}, ${limit}`;
    const result = await queryDocument(sql);
    res.send(result);
  } catch (error) {
    errorHandler(res, { msg: error.message, status: error.status });
  }
}

async function getMostReadedNews(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page || 0) * limit;
    const sql = `SELECT DISTINCT news.* FROM news_viewers as v INNER JOIN news ON v.news_id = news.id ORDER BY news.created_at LIMIT ${page}, ${limit}`;
    const result = await queryDocument(sql);
    res.send(result);
  } catch (error) {
    errorHandler(res, { msg: error.message, status: error.status });
  }
}

async function getSearchedNews(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page || 0) * limit;
    const sql = `SELECT * FROM news WHERE type LIKE '%${req.query.search}%' OR tags LIKE '%${req.query.search}%' ORDER BY created_at LIMIT ${page}, ${limit}`;
    const result = await queryDocument(sql);
    res.send(result);
  } catch (error) {
    errorHandler(res, { msg: error.message, status: error.status });
  }
}
