const { useNavigate } = require("react-router-dom");
const { loginUser } = require("../src/services/auth");
const { useState } = require("react");

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();

    const data = await loginUser({ email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Login Successful");
      navigate("/search");
    } else {
      alert(data.message);
    }
  };

  return {handleLogin}

};
