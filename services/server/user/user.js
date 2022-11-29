import { errorHandler } from "../errorhandler";
import { multipleBodyParser } from "../multer";
import { postDocument, queryDocument } from "../common";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

export async function addUser(req, res) {
  try {
    const { error } = await multipleBodyParser(req, res, "", []);
    if (error) throw { message: "Error occured when file uploading" };

    //user varify;
    if (!req.body.user_id) throw { message: "user unathenticated!" };
    const varify = await userVarification(req.body.user_id);
    if (!varify) throw { message: "user unathenticated!" };
    delete req.body.user_id; //till;

    const existsql = `SELECT id FROM user WHERE email = '${req.body.email}'`;
    const isExist = await queryDocument(existsql);
    if (isExist.length) throw { message: "Already exist", status: 409 };

    const hashed = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashed;
    const sql = "INSERT INTO user SET ";
    const result = await postDocument(sql, req.body);
    if (result.insertId > 0) {
      res.send({ message: "Addedd successfully" });
    } else throw { message: "Unable to add" };
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status });
  }
}

export async function getUser(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page || 0) * limit;
    let sql = "";
    if (req.query.filter) {
      sql = `SELECT * FROM user WHERE user_role = '${req.query.filter}' LIMIT ${page}, ${limit}`;
    } else {
      sql = `SELECT * FROM user LIMIT ${page}, ${limit}`;
    }
    const result = await queryDocument(sql);
    res.send(result);
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status });
  }
}

export async function updateUser(req, res) {
  try {
    const { error } = await multipleBodyParser(req, res, "", [
      { name: "profile", maxCount: 1 },
    ]);
    if (error) throw { message: "Error occured when file uploading" };

    if (req.query.profile) {
      let sql = "";
      if (req.files.profile) {
        sql = `UPDATE user SET profile = '${req.files.profile[0].filename}' WHERE id = '${req.body.id}'`;
      } else {
        sql = `UPDATE user SET name = '${req.body.name}' WHERE id = '${req.body.id}'`;
      }
      await queryDocument(sql);
      if (req.body.exist) {
        fs.unlinkSync(path.join(process.cwd(), "public", req.body.exist));
      }
      res.send({ message: "Updated successfully" });
    } else {
      //user varify;
      if (!req.body.user_id) throw { message: "user unathenticated!" };
      const varify = await userVarification(req.body.user_id);
      if (!varify) throw { message: "user unathenticated!" };
      delete req.body.user_id; //till;

      const sql = `UPDATE user SET user_role = '${req.body.user_role}' WHERE id = '${req.body.id}'`;
      await queryDocument(sql);
      res.send({ message: "Updated successfully" });
    }
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status });
  }
}

export async function deleteuser(req, res) {
  try {
    const { error } = await multipleBodyParser(req, res, "", []);
    if (error) throw { message: "Error occured when file uploading" };

    // user varify;
    if (!req.body.user_id) throw { message: "user unathenticated!" };
    const varify = await userVarification(req.body.user_id);
    if (!varify) throw { message: "user unathenticated!" };
    //till;

    const sql = `DELETE FROM user WHERE id = ${req.query.id}`;
    const result = await queryDocument(sql);
    if (result.affectedRows > 0) res.send({ message: "Deleted successfull" });
    else throw { message: "unable to delete" };
  } catch (err) {
    errorHandler(res, { msg: err.message, status: err.status });
  }
}

export async function userVarification(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT id, user_role FROM user WHERE id = '${id}'`;
      const user = await queryDocument(sql);
      if (!user.length || user[0].user_role !== "admin") {
        throw { message: "Forbidden", status: 409 };
      }
      resolve(user[0]);
    } catch (error) {
      reject(error);
    }
  });
}
