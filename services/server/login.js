import {
  forgotMailOpt,
  mailer,
  postDocument,
  queryDocument,
  varifyEmailOpt,
} from "./common";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function getUser(req, res) {
  try {
    //send email for forget password;
    if (req.query.forgotPassword) {
      sendForgotPasswordLink(req, res);
    } else if (req.query.varifypasswordToken) {
      varifypasswordToken(req, res);
    }
    //varify email;
    else if (req.query.varifyEmail) {
      varifyEmail(req, res);
    }
    //check token in every request;
    else {
      if (!req.query.token) {
        return errorHandler(res, {
          message: "Unauthenticated",
          status: 401,
        });
      }
      const varify = jwt.verify(req.query.token, process.env.JWT_SECRET);
      if (varify) {
        const sql = `SELECT * FROM user WHERE id = '${varify.id}' AND email = '${varify.email}'`;
        const user = await queryDocument(sql);
        delete user[0].password;
        const token = jwt.sign({ ...user[0] }, process.env.JWT_SECRET, {
          expiresIn: `${varify.user_role !== "user" ? "3d" : "5h"}`,
        });
        res.send({ user: user[0], token });
      } else throw { message: "Unauthenticated", status: 401 };
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

export async function loginUser(req, res) {
  try {
    //social media login;
    if (req.query.socialLogin) {
      const sql = `SELECT * FROM user WHERE email = '${req.body.email}'`;
      const result = await queryDocument(sql);
      if (!result.length) {
        if (process.env.NEXT_PUBLIC_APP_PASSWORD !== req.body.password) {
          throw { message: "Forbiden", status: 403 };
        }
        const hashed = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashed;
        const sql = "INSERT INTO user ";
        const result = await postDocument(sql, req.body);
        delete req.body.password;
        req.body.user_role = "user";
        const token = jwt.sign(req.body, process.env.JWT_SECRET, {
          expiresIn: "3d",
        });
        res.send({ user: req.body, token });
      } else {
        const sql = `SELECT * FROM user WHERE email = '${req.body.email}'`;
        const result = await queryDocument(sql);
        delete result[0].password;
        const token = jwt.sign({ ...result[0] }, process.env.JWT_SECRET, {
          expiresIn: `${result[0].user_role !== "user" ? "3d" : "5h"}`,
        });
        res.send({ user: result[0], token });
      }
    }
    // normal email login
    else {
      const sql = `SELECT * FROM user WHERE email = '${req.body.email}'`;
      const result = await queryDocument(sql);
      if (!result.length) throw { message: "No user found", status: 404 };
      else {
        sendUserInfo(req, res, result);
      }
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

export async function signUpUser(req, res) {
  try {
    //update user password;
    if (req.query.updateuser) {
      const sql = `SELECT * FROM user WHERE id = '${req.body.id}' AND email = '${req.body.email}'`;
      const result = await queryDocument(sql);
      if (!result.length) throw { message: "There was an error" };

      const hashed = await bcrypt.hash(req.body.password, 10);
      const query = `UPDATE user SET password='${hashed}' WHERE id=${req.body.id}`;
      const user = await queryDocument(query);
      if (user.changedRows > 0) {
        const sql = `SELECT * FROM user WHERE id = '${req.body.id}'`;
        const result = await queryDocument(sql);
        const token = jwt.sign({ ...result[0] }, process.env.JWT_SECRET, {
          expiresIn: `${result[0].user_role !== "user" ? "3d" : "5h"}`,
        });
        res.send({
          message: "Your password updated successfully",
          token,
        });
      } else res.status(500).send({ message: "There was an error" });
    }
    //send email for varify eamil;
    else {
      const sql = `SELECT * FROM user WHERE email = '${req.body.email}'`;
      const result = await queryDocument(sql);
      if (result.length) {
        return res.status(409).send({ message: "User already exist" });
      } else {
        const token = jwt.sign(req.body, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        const options = varifyEmailOpt(req.body.email, token);
        const email = await mailer.sendMail(options);
        if (email.messageId) {
          res.send({ message: "An email sent to your email, please check" });
        } else throw { message: "There was an error" };
      }
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function sendForgotPasswordLink(req, res) {
  try {
    const sql = `SELECT * FROM user WHERE email = '${req.query.forgotPassword}'`;
    const result = await queryDocument(sql);
    if (!result.length) {
      res.status(404).send({ message: "No user found" });
      return;
    }
    delete result[0].password;
    const token = jwt.sign({ ...result[0] }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const options = forgotMailOpt(req.query.forgotPassword, token);
    const email = await mailer.sendMail(options);
    if (email.messageId) {
      res.send({ message: "An email sent to your email, please check" });
    } else throw { message: "There was an error" };
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function varifyEmail(req, res) {
  try {
    jwt.verify(
      req.query.varifyEmail,
      process.env.JWT_SECRET,
      async (err, result) => {
        if (err) {
          res.status(401).send({ message: "Varification faild" });
        } else {
          delete result.iat;
          delete result.exp;
          const hashedPassword = await bcrypt.hash(result.password, 10);
          result.password = hashedPassword;
          const sql = "INSERT INTO user SET ";
          const user = await postDocument(sql, result);
          if (user.insertId > 0) {
            const sql = `SELECT * FROM user WHERE id = '${user.insertId}'`;
            const result = await queryDocument(sql);
            delete result[0].password;
            const token = jwt.sign({ ...result[0] }, process.env.JWT_SECRET, {
              expiresIn: "3d",
            });
            res.send({ user: result[0], token });
          } else res.status(500).send({ message: "Unable to Added" });
        }
      }
    );
  } catch (error) {
    res.status(500).send({ message: "There was an error" });
  }
}

function varifypasswordToken(req, res) {
  jwt.verify(
    req.query.varifypasswordToken,
    process.env.JWT_SECRET,
    (err, result) => {
      if (err) {
        res.status(401).send({ message: "Token expired" });
      } else {
        delete result.exp;
        delete result.iat;
        res.send(result);
      }
    }
  );
}

async function sendUserInfo(req, res, result) {
  const isRightPassword = await bcrypt.compare(
    req.body.password,
    result[0].password
  );
  if (!isRightPassword) {
    res.status(401).send({ message: "Username or password incorrect" });
  } else {
    delete result[0].password;
    const token = jwt.sign({ ...result[0] }, process.env.JWT_SECRET, {
      expiresIn: `${result[0].user_role !== "user" ? "3d" : "5h"}`,
    });
    res.send({ user: result[0], token });
  }
}
