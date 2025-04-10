import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const { user } = data;
    await supabase.from("users").insert([
      {
        id: user.id,
        full_name: fullName,
        email: email,
        skills: ["chat", "frontend"],
      },
    ]);

    navigate("/chat");
  };

  return (
    <Box sx={{ background: "linear-gradient(to right, #4f46e5, #3b82f6)", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ padding: 4, borderRadius: 4 }}>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
            Create Your Account
          </Typography>
          <Typography variant="subtitle2" align="center" color="textSecondary" mb={2}>
            Sign up for DisChat-Sync+
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 1, py: 1.2, fontWeight: "bold" }}
              onClick={handleRegister}
            >
              🚀 Register
            </Button>

            <Divider sx={{ my: 1 }}>OR</Divider>

            <Typography variant="body2" align="center">
              Already have an account?{" "}
              <Link to="/" style={{ textDecoration: "none", color: "#3b82f6", fontWeight: "bold" }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
