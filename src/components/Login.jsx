import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/upload", { replace: true });
    }
  }, [navigate]);

  const HandleClick = () => {
    navigate("/Home"); 
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="w-full max-w-sm bg-white rounded-xl p-6">
        <div className="font-serif font-bold text-green-700 text-2xl ml-0">
          Sof-event-extractor&reg;
        </div>

        <div className="font-bold font-serif mt-2 mb-2 text-xl text-green-700">
          Log in to your account
        </div>

        <div className="text-center flex">
          <p className="font-semibold">Don't have an account?</p>
          <a className="text-blue-600 mb-2 ml-2 font-semibold" href="">
            Sign up
          </a>
        </div>



        <div className="mb-4">
          <label>Password</label>
          <input className="input" type="password" />
        </div>

        <div className="flex justify-center">
          <button
            onClick={HandleClick}
            className="px-16 py-5 border rounded-full text-center hover:bg-black hover:text-white"
          >
            Login
          </button>
        </div>

        <div className="text-center my-4">
          <h1>OR</h1>
        </div>

        <div className="my-6">
          <a
            className="border border-black px-10 py-2"
            href="https://your-backend.com/api/v1/user/auth/google"
          >
            Login with Google
          </a>
        </div>

        <div className="my-6">
          <a className="border border-black px-10 py-2" href="http://www.github.com">
            Login with Github
          </a>
        </div>

        <div className="mb-2 text-center">
          <a className="underline text-blue-600 font-normal" href="">
            forgot password
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
