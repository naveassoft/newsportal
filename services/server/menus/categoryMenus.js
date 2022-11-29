import { errorHandler } from "../errorhandler";
import { userVarification } from "../user/user";
import { queryDocument, postDocument } from "../common";

export async function getCategoryMenus(req, res) {
  try {
    const result = await queryDocument("SELECT * FROM category");
    result.forEach(async (category, i, arr) => {
      const subs = await queryDocument(
        `SELECT * FROM sub_category WHERE category_id = ${category.id}`
      );
      result[i].subs = subs;
      if (arr.length - 1 === i) {
        res.send(result);
      }
    });
  } catch (error) {
    errorHandler(res, error);
  }
}

export async function postCategoryMenus(req, res) {
  try {
    if (!req.body.userId) throw { message: "user unathenticated!" };
    const varify = await userVarification(req.body.userId);
    if (!varify) throw { message: "user unathenticated!" };

    // const isExist = await categoryMenus.findOne({ name: req.body.name });
    const sql = `SELECT id FROM category WHERE name = '${req.body.name}'`;
    const isExist = await queryDocument(sql);
    if (isExist.length) {
      res.status(409).send({ message: "Already added the category" });
      return;
    }
    delete req.body.userId;

    const query = "INSERT INTO category SET ";
    const result = await postDocument(query, req.body);
    if (result.insertId > 0) {
      res.send({
        message: "Menu added successfully",
      });
    } else {
      res.status(424).send({ message: "Unable to add, Try again." });
    }
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status });
  }
}

export async function updateCategoryMenus(req, res) {
  try {
    if (!req.body.userId) throw { message: "user unathenticated!" };
    const varify = await userVarification(req.body.userId);
    if (!varify) throw { message: "user unathenticated!" };
    delete req.body.userId;

    const sql = `UPDATE category SET name ='${req.body.name}'  WHERE id = '${req.body.id}'`;
    const result = await queryDocument(sql);
    if (result.affectedRows > 0) {
      res.send({
        message: "Category menu updated successfully",
      });
    } else {
      res.status(424).send({ message: "Unable to update, Try again." });
    }
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status || 500 });
  }
}

export async function deleteCategoryMenu(req, res) {
  try {
    if (!req.body.userId) throw { message: "user unathenticated!" };
    const varify = await userVarification(req.body.userId);
    if (!varify) throw { message: "user unathenticated!" };
    delete req.body.userId;

    const sql = `DELETE FROM category WHERE id = '${req.body.id}'`;
    const result = await queryDocument(sql);
    if (result.affectedRows > 0) {
      res.send({
        message: "Category menu delete successfully",
      });
    } else {
      res.status(424).send({ message: "Unable to delete, Try again." });
    }
  } catch (error) {
    errorHandler(res, { msg: error.message, status: error.status });
  }
}
