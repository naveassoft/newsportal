import { errorHandler } from "../errorhandler";
import { multipleBodyParser } from "../multer";
import { userVarification } from "../user/user";
import { deleteImage, queryDocument, postDocument } from "../common";

export async function postNews(req, res) {
  try {
    const { error } = await multipleBodyParser(req, res, "assets", [
      { name: "image", maxCount: 1 },
    ]);
    if (error) throw { message: "Error occured when file uploading" };

    //user varify;
    if (!req.body.user_id) throw { message: "user unathenticated!" };
    const varify = await userVarification(req.body.user_id);
    if (!varify) throw { message: "user unathenticated!" };

    req.body.image = req.files.image[0].filename;
    req.body.created_at = new Date();

    const sql = "INSERT INTO news SET ";

    const result = await postDocument(sql, req.body);
    if (result.insertId > 0) {
      res.send({ message: "News added successfully" });
    } else res.send({ message: "Unable to add, try again" });
  } catch (err) {
    deleteImage(req.files.image[0].filename);
    errorHandler(res, { msg: err.message, status: err.status });
  }
}

export async function getNews(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page || 0) * limit;
    let result;
    if (req.query.multiple) {
      //sent multiple new by id;
      const id = req.query.id.replaceAll("|", ",");
      const sql = `SELECT * FROM news WHERE id IN (${id})`;
      result = await queryDocument(sql);
    } else if (req.query.id) {
      //sent single news;
      const newssql = `SELECT news.*, c.name as category_name FROM news INNER JOIN category as c ON news.category_id = c.id  WHERE news.id = '${req.query.id}'`;
      const news = await queryDocument(newssql);
      if (news.length) {
        const commentsql = `SELECT * FROM comments WHERE news_id = ${news[0].id}`;
        const comments = await queryDocument(commentsql);
        result = { ...news[0], comments };
      }
    } else {
      //sent all news
      const sql = `SELECT news.*, c.name as category_name FROM news INNER JOIN category as c ON c.id = news.category_id ORDER BY created_at DESC LIMIT ${page}, ${limit}`;
      result = await queryDocument(sql);
    }
    res.send(result);
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status || 500 });
  }
}

export async function updateNews(req, res) {
  try {
    const { error } = await multipleBodyParser(req, res, "assets", [
      { name: "image", maxCount: 1 },
    ]);
    if (error) throw { message: error || "Error occured when file uploading" };
    //user varify;
    if (!req.body.user_id) throw { message: "user unathenticated!" };
    const varify = await userVarification(req.body.user_id);
    if (!varify) throw { message: "user unathenticated!" };

    if (req.files.image) {
      req.body.image = req.files.image[0].filename;
    }
    const existedImg = req.body.existedImg;
    delete req.body.existedImg;
    let data = "";
    Object.entries(req.body).map(([key, value]) => {
      if (data) {
        data += `, ${key} = "${value}"`;
      } else data += `${key} = "${value}"`;
    });

    const sql = `UPDATE news SET ${data} WHERE id = '${req.query.id}'`;
    const result = await queryDocument(sql);
    if (result.affectedRows > 0) {
      if (existedImg) deleteImage(existedImg);
      res.send({ message: "Updated successfully" });
    } else res.send({ message: "Unable to add, try again" });
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status });
  }
}

export async function deleteNews(req, res) {
  try {
    const { error } = await multipleBodyParser(req, res, "", []);
    if (error) throw { message: error || "Internal server error" };
    //user varify;
    if (!req.body.user_id) throw { message: "user unathenticated!" };
    const varify = await userVarification(req.body.user_id);
    if (!varify) throw { message: "user unathenticated!" };

    //delete data from db;
    const sql = `DELETE FROM news WHERE id = '${req.query.id}'`;
    const result = await queryDocument(sql);
    if (result.affectedRows > 0) {
      deleteImage(req.body.image);
      res.send({ message: "News successfully deleted" });
    } else throw { message: "Unable to delete, try again" };
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status });
  }
}
