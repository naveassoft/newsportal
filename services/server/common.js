import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { mySql } from "./mysql";

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "navieausa@gmail.com",
    pass: process.env.NODEMAILER_SECRET,
  },
});

export function deleteImage(image) {
  try {
    fs.unlinkSync(path.join(process.cwd(), "public", "assets", image));
  } catch (error) {
    console.log(error);
  }
}

export const queryDocument = async (query) => {
  const connection = await mySql();
  const result = await connection.execute(query);
  await connection.end();
  return result[0];
};

export const postDocument = async (query, doc) => {
  const connection = await mySql();
  let data = "";
  Object.entries(doc).forEach(([key, value]) => {
    if (data) {
      data += `, ${key} = "${value}"`;
    } else data += `${key} = "${value}"`;
  });
  const result = await connection.execute(query + data);
  await connection.end();
  return result[0];
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
