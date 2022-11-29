import mysql from "mysql";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "navieausa@gmail.com",
    pass: process.env.NODEMAILER_SECRET,
  },
});

export function varifyOwner(res, user_id, callback, img) {
  const sql = `SELECT id, user_role FROM user WHERE id = '${user_id}'`;
  mySql.query(sql, (err, result) => {
    if (err) {
      if (img) deleteImage(img);
      return errorHandler(res, { message: err.sqlMessage });
    }
    if (!result.length || result[0].user_role !== "owner") {
      if (img) deleteImage(img);
      return errorHandler(res, { message: "Forbidden" });
    }
    callback();
  });
}

export function varifyUser(res, user_id, user_type, callback) {
  let sql = "";
  if (user_type === "vendor") {
    sql = `SELECT id, user_role FROM vandor WHERE id = '${user_id}'`;
  } else {
    sql = `SELECT id, user_role FROM user WHERE id = '${user_id}'`;
  }
  mySql.query(sql, (err, result) => {
    if (err) return errorHandler(res, { message: err.sqlMessage });
    if (!result.length || !/owner|uploader|vendor/.test(result[0].user_role)) {
      return errorHandler(res, { message: "Forbidden" });
    }
    callback();
  });
}

export function deleteImage(image) {
  try {
    fs.unlinkSync(path.join(process.cwd(), "public", "assets", image));
  } catch (error) {
    console.log(error);
  }
}

const mySql = mysql.createPool({
  host: "localhost",
  user: "mtvnews24_news",
  password: "aI(Fm]cc8Ty6",
  database: "mtvnews24_news",
  connectionLimit: 190,
});

export const queryDocument = (query) => {
  return new Promise((resolve, reject) => {
    mySql.getConnection((err, res) => {
      if (err) {
        res?.release();
        reject({ message: err.sqlMessage });
      } else {
        res.query(query, (err, result) => {
          res.release();
          if (err) reject({ message: err.sqlMessage });
          else resolve(result);
        });
      }
    });
  });
};

export const postDocument = (query, doc) => {
  return new Promise((resolve, reject) => {
    mySql.query(query, doc, (err, result) => {
      if (err) return reject({ message: err.sqlMessage });
      resolve(result);
    });
  });
};

export function forgotMailOpt(email, token) {
  return {
    from: "navieausa@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Reset your password", // Subject line
    html: html(`<div class="contentArea">
    <div class="section2">
      <h1>Forgot password ?</h1>
      <p class="mb-50">You/someone try to reset your account password. Here is the link to reset password.</p>
      <center><a href="http://mtvnews24.com/forgotpassword?token=${token}" class="confirmBtn">Reset Now</a></center>
      <p>If you have any question , just reply to this email, we're always happy to help out</p>
      <p class="mt-50">Cheers<br>The Team</p>
    </div>
  </div>`),
  };
}
export function varifyEmailOpt(email, token) {
  return {
    from: "navieausa@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Varify your Account", // Subject line
    html: html(`<div class="contentArea">
    <div class="section2">
      <h1>Verify your account !</h1>
      <p class="mb-50">
        Thank you for signig up with Us! We hope you enjoy your time with us.
        Check your account and update your profile.
      </p>
      <center><a href="http://mtvnews24.com/varifyemail?token=${token}" class="confirmBtn">Verify Now</a></center>
      <p class="mt-50">
        if you have any question just reply to this email, We're always happy
        to help out.
      </p>
      <p class="mt-50">Cheers<br />The Team</p>
    </div>
  </div>`),
  };
}

function html(body) {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <style>
          body {
            padding: 0;
            margin: 0;
            background: #f7f8f8;
          }
          
          .contentArea {
            margin: 0 auto;
            display: block;
            width: 800px;
          }
          .section2 {
            background: #fff;
            margin-top: 50px;
            padding: 50px;
            font-family: Roboto, sans-serif;
          }
          .section2 h1 {
            font-size: 55px;
            text-align: center;
            letter-spacing: 5px;
            font-weight: 500;
          }
          .section2 p {
            font-size: 20px;
            color: #7aa182;
          }
          .mb-50 {
            margin-bottom: 50px;
          }
          .mt-50 {
            margin-top: 50px;
          }
          .confirmBtn {
            background: #16c1f3;
            color: #fff;
            padding: 10px 20px;
            border: none;
            font-size: 20px;
            text-decoration: none;
            border-radius: 5px;
          }
          .section2 .linkTag {
            color: #faa635;
            font-size: 20px;
          }
          @media only screen and (max-width: 800px) {
            .contentArea {
              width: 100%;
            }
          }
          @media only screen and (max-width: 550px) {
            .section2 h1 {
              font-size: 45px;
            }
            .section2 p {
              font-size: 18px;
            }
            .confirmBtn {
              font-size: 16px;
            }
            .section2 .linkTag {
              font-size: 18px;
            }
          }
        </style>
      </head>
      <body>   
        ${body}
      </body>
    </html>`;
}
