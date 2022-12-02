import { faClose, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";
import useStore from "../context/useStore";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
const SocialLogin = dynamic(() => import("../SocialLogin"), { ssr: false });

const LoginRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState(true);
  const [error, setError] = useState("");
  const store = useStore();
  const router = useRouter();
  const emailRef = useRef(null);
  const [payload, setPayload] = useState(() => {
    return {
      name: "",
      email: "",
      password: "",
      rePassword: "",
    };
  });

  function handleChange(e) {
    const name = e.target.name;
    setPayload((prev) => {
      return { ...prev, [name]: e.target.value };
    });
  }

  async function SingUp() {
    try {
      if (payload.password !== payload.rePassword) {
        setError("Please check your password carefully");
        return;
      } else delete payload.rePassword;
      const res = await fetch("/api/login", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        store.setAlert({ msg: result.message, type: "success" });
      } else throw result;
    } catch (error) {
      setError(error.message);
    }
  }
  async function Login() {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        store.setUser(result.user);
        store.setShowLoginRegister(false);
        localStorage.setItem("token", result.token);
        router.push(store?.redirect);
      } else throw result;
    } catch (error) {
      setError(error.message);
    }
  }

  async function ForgotPassword() {
    const email = emailRef.current?.value;
    if (!email) return emailRef.current?.focus();
    setLoading(true);
    try {
      const res = await fetch(`/api/login?forgotPassword=${email}`);
      const result = await res.json();
      if (res.ok) {
        store.setAlert({
          msg: result.message,
          type: "success",
        });
      } else throw result;
    } catch (error) {
      store.setAlert({
        msg: error.message,
        type: "error",
      });
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (login) {
      await Login();
    } else {
      await SingUp();
    }
    setLoading(false);
  }

  return (
    <div
      onClick={() => store?.setShowLoginRegister(false)}
      className="login-register-container"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => handleSubmit(e)}
        className="login-registation"
      >
        <div
          onClick={() => store?.setShowLoginRegister(false)}
          className="close-btn"
        >
          <FontAwesomeIcon icon={faClose} />
        </div>
        <h3 className="mb-5">Please {login ? "Login" : "Register"}</h3>

        {!login && (
          <input
            required
            name="name"
            type="text"
            onChange={(e) => handleChange(e)}
            placeholder="Enter your full name"
          />
        )}
        <input
          required
          name="email"
          type="email"
          ref={emailRef}
          onChange={(e) => handleChange(e)}
          placeholder="Enter your email"
        />
        <div className="relative w-full">
          <input
            name="password"
            required
            onChange={(e) => handleChange(e)}
            type={showPassword ? "text" : "password"}
            placeholder={`Enter ${login ? "your" : "a"} password`}
          />
          <div
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-2/4 right-5 -translate-y-2/4 cursor-pointer"
          >
            {showPassword ? (
              <FontAwesomeIcon icon={faEye} />
            ) : (
              <FontAwesomeIcon icon={faEyeSlash} />
            )}
          </div>
        </div>

        {!login && (
          <input
            name="rePassword"
            required
            onChange={(e) => handleChange(e)}
            type="password"
            placeholder="Confirm password"
          />
        )}

        {/* showing forget password */}
        <p
          onClick={ForgotPassword}
          className="cursor-pointer text-purple-500 text-left w-full"
        >
          Forgot password?
        </p>
        {/* showing error */}
        <p className="text-red-400">{error}</p>

        <button disabled={loading} className="custom-btn" type="submit">
          {login ? "Login" : "Register"}
        </button>

        <p>----------Or---------</p>
        <SocialLogin setError={setError} />
        <p>
          {login ? "New here?" : "Already have account"}{" "}
          <span
            onClick={() => setLogin((prev) => !prev)}
            className="underline text-blue-400 cursor-pointer"
          >
            {login ? "Create an account" : "Login here"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginRegister;
