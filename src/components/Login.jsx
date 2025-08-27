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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-200 px-6">
      <div className="text-center max-w-md  border-dotted rounded-4xl border-black p-14 border-r-orange-600 border-l-blue-800 border-2">
        <h1 className="font-sans font-bold text-black text-shadow-blue-600 text-3xl mb-4">
          Sof-event-extractor&reg;
        </h1>

        {/* Cute note for users */}
        <p className="text-gray-600 mb-8 font-medium">
          Hey there 👋 I’m a student and this app costs money to run.
          Please don’t use it heavily, or it’ll exhaust my credits .
        </p>

        {/* Google login button */}
        <a
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-400 to-blue-900 text-white text-shadow-amber-800 font-semibold shadow hover:bg-amber-600 transition"
          href="https://mastering-auth-production-c0d1.up.railway.app/api/v1/user/auth/google"
        >
          Login with Google
        </a>
      </div>
      <footer className="m-10 text-gray-500">
        <h1 className=" text-sm md:text-xl"> ⚠️This is testing user interface !</h1>
      </footer>
    </div>
  );
};

export default Login;
