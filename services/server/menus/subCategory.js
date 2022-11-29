import { queryDocument, postDocument } from "../common";
import { errorHandler } from "../errorhandler";
import { userVarification } from "../user/user";

export async function postSubCategoryMenus(req, res) {
  try {
    if (!req.body.userId) throw { message: "user unathenticated!" };
    const varify = await userVarification(req.body.userId);
    if (!varify) throw { message: "user unathenticated!" };
    delete req.body.userId;

    const sql = `SELECT id FROM sub_category WHERE name = '${req.body.name}'`;
    const isExist = await queryDocument(sql);
    if (isExist.length) {
      res.send(409).send({ message: "Already added the sub category" });
      return;
    }
    const query = `INSERT INTO sub_category SET `;
    const result = await postDocument(query, req.body);
    if (result.insertId > 0) {
      res.send({
        message: "Sub Category menu added successfully",
      });
    } else {
      res.status(424).send({ message: "Unable to add, Try again." });
    }
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status });
  }
}

export async function deleteSubCategoryMenu(req, res) {
  try {
    if (!req.body.userId) throw { message: "user unathenticated!" };
    const varify = await userVarification(req.body.userId);
    if (!varify) throw { message: "user unathenticated!" };
    delete req.body.userId;

    const sql = `DELETE FROM sub_category WHERE ID = ${req.body.id}`;
    const result = await queryDocument(sql);
    if (result.affectedRows > 0) {
      res.send({
        message: "Sub Category menu deleted successfully",
      });
    } else {
      res.status(424).send({ message: "Unable to delete, Try again." });
    }
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status });
  }
}
