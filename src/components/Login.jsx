import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  // 🔑 If already logged in, redirect to /Upload
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/Upload", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-6">
      <div className="text-center max-w-md">
        <h1 className="font-serif font-bold text-black text-shadow-blue-600 text-3xl mb-4">
          Sof-event-extractor&reg;
        </h1>

        {/* Cute note for users */}
        <p className="text-gray-600 mb-8 font-medium">
          Hey there 👋 I’m a student and this app costs money to run.
          Please don’t use it heavily, or it’ll exhaust my credits .
        </p>

        {/* Google login button */}
        <a
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-200 to-blue-700 text-white font-semibold shadow hover:bg-blue-500 transition"
          href="https://mastering-auth-production-c0d1.up.railway.app/api/v1/user/auth/google"
        >
          Login with Google
        </a>
      </div>
    </div>
  );
};

export default Login;
