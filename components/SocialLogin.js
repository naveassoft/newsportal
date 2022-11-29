/* eslint-disable @next/next/no-img-element */
import GoogleLogin from "react-google-login";
import React, { useEffect } from "react";
import { gapi } from "gapi-script";
import { useRouter } from "next/router";
import useStore from "./context/useStore";

const SocialLogin = ({ setError }) => {
  const router = useRouter();
  const store = useStore();

  useEffect(() => {
    const initClient = () => {
      gapi.auth2.init({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_SECRET,
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.metadata.readonly",
      });
    };
    gapi.load("client:auth2", initClient);
  });

  async function googleLogin(response) {
    try {
      const data = {};
      data.email = response.profileObj.email;
      data.profile = response.profileObj.imageUrl;
      data.name = response.profileObj.name;
      data.password = process.env.NEXT_PUBLIC_APP_PASSWORD;
      const res = await fetch("/api/login?socialLogin=true", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        store.setUser(result.user);
        localStorage.setItem("token", result.token);
        router.push(store?.redirect || "/");
      } else throw result;
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <GoogleLogin
        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        render={(renderProps) => (
          <button
            onClick={renderProps.onClick}
            disabled={renderProps.disabled}
            type='button'
            className='btn btn-primary'
          >
            <span>Google</span>
          </button>
        )}
        onSuccess={(response) => googleLogin(response)}
        onFailure={(response) => setError(response.error)}
        cookiePolicy={"single_host_origin"}
      />
    </div>
  );
};

export default SocialLogin;
