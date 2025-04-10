import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Box, 
  Paper, 
  InputAdornment, 
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Divider
} from "@mui/material";
import { supabase } from "../utils/supabaseClient";

// Import these icons from the Lucide React library
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        throw loginError;
      }

      navigate("/chat");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
        padding: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            padding: { xs: 3, md: 5 },
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            border: "1px solid rgba(255, 255, 255, 0.18)"
          }}
        >
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              mb: 3 
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700, 
                color: "#2A2C5E",
                textShadow: "0px 2px 2px rgba(0, 0, 0, 0.1)",
                letterSpacing: "0.5px"
              }}
            >
              Welcome Back
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Sign in to DisChat-Sync+ 
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: "8px" }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: 3 
            }}
          >
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} color="#6B73FF" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "&:hover fieldset": { borderColor: "#6B73FF" },
                  "&.Mui-focused fieldset": { borderColor: "#6B73FF" }
                }
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} color="#6B73FF" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "&:hover fieldset": { borderColor: "#6B73FF" },
                  "&.Mui-focused fieldset": { borderColor: "#6B73FF" }
                }
              }}
            />

            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
              sx={{
                py: 1.5,
                mt: 1,
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                background: "linear-gradient(90deg, #6B73FF 0%, #000DFF 100%)",
                boxShadow: "0 4px 15px rgba(0, 13, 255, 0.3)",
                "&:hover": {
                  background: "linear-gradient(90deg, #5C64FF 0%, #0009E0 100%)",
                  boxShadow: "0 6px 20px rgba(0, 13, 255, 0.4)",
                },
                transition: "all 0.3s ease"
              }}
              startIcon={loading ? null : <LogIn size={20} />}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>

            <Box sx={{ position: "relative", my: 2 }}>
              <Divider>
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{ 
                    px: 1, 
                    color: "text.secondary", 
                    fontWeight: 500 
                  }}
                >
                  OR
                </Typography>
              </Divider>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Don't have an account?
              </Typography>
              <Link 
                to="/register" 
                style={{ 
                  textDecoration: "none"
                }}
              >
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    py: 1.2,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderColor: "#6B73FF",
                    color: "#6B73FF",
                    "&:hover": {
                      borderColor: "#000DFF",
                      background: "rgba(107, 115, 255, 0.04)"
                    }
                  }}
                >
                  Create Account
                </Button>
              </Link>
            </Box>

            <Typography 
              variant="caption" 
              color="text.secondary" 
              align="center" 
              sx={{ mt: 2 }}
            >
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}