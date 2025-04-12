import { useState, useRef, useEffect } from "react";
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
  Divider,
  Grow,
  Fade
} from "@mui/material";
import { supabase } from "../utils/supabaseClient";

// Import these icons from the Lucide React library
import { Eye, EyeOff, Mail, Lock, LogIn, User } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ left: 0, top: 0 });
  const [buttonRunning, setButtonRunning] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Validate email with regex
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  // Check if password is valid (not empty)
  useEffect(() => {
    setPasswordValid(password.length >= 6);
  }, [password]);

  const handleLogin = async () => {
    if (!email || !password) {
      if (buttonRef.current && containerRef.current && !passwordValid) {
        // Make button run away
        runAwayButton();
        setError("Please enter a valid password (minimum 6 characters)");
        return;
      }
      setError("Please enter both email and password");
      return;
    }

    if (!emailValid) {
      setError("Please enter a valid email address");
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

  // Make button run away when clicked without valid credentials
  const runAwayButton = () => {
    if (buttonRunning) return;
    
    setButtonRunning(true);
    
    const moveButton = () => {
      if (containerRef.current && buttonRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonRect = buttonRef.current.getBoundingClientRect();
        
        // Calculate available space
        const maxX = containerRect.width - buttonRect.width - 40;
        const maxY = 100; // Limit vertical movement
        
        // Generate random position within container bounds
        const newX = Math.floor(Math.random() * maxX);
        const newY = Math.floor(Math.random() * maxY) - 50;
        
        setButtonPosition({ left: newX, top: newY });
      }
    };
    
    // Move button 3 times
    moveButton();
    
    setTimeout(() => {
      moveButton();
      setTimeout(() => {
        moveButton();
        setTimeout(() => {
          // Reset position after animation
          setButtonPosition({ left: 0, top: 0 });
          setButtonRunning(false);
        }, 500);
      }, 300);
    }, 300);
  };

  const handleButtonClick = () => {
    if (!emailValid || !passwordValid) {
      runAwayButton();
      setError("Please enter valid email and password");
    } else {
      handleLogin();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && emailValid && passwordValid) {
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
        padding: { xs: 2, sm: 3 },
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Animated background elements */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: Math.random() * 150 + 50,
            height: Math.random() * 150 + 50,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
            filter: "blur(5px)",
            animation: `float${i} ${Math.random() * 15 + 20}s infinite linear`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.5,
            "@keyframes float0": {
              "0%": { transform: "translate(0, 0) rotate(0deg)" },
              "100%": { transform: "translate(300px, -300px) rotate(360deg)" }
            },
            "@keyframes float1": {
              "0%": { transform: "translate(0, 0) rotate(0deg)" },
              "100%": { transform: "translate(-200px, 250px) rotate(-360deg)" }
            },
            "@keyframes float2": {
              "0%": { transform: "translate(0, 0) rotate(0deg)" },
              "100%": { transform: "translate(250px, 200px) rotate(360deg)" }
            },
            "@keyframes float3": {
              "0%": { transform: "translate(0, 0) rotate(0deg)" },
              "100%": { transform: "translate(-300px, -200px) rotate(-360deg)" }
            },
            "@keyframes float4": {
              "0%": { transform: "translate(0, 0) rotate(0deg)" },
              "100%": { transform: "translate(200px, 300px) rotate(360deg)" }
            },
          }}
        />
      ))}

      <Container maxWidth="sm" ref={containerRef}>
        <Paper
          elevation={24}
          sx={{
            padding: { xs: 3, md: 5 },
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            position: "relative",
            overflow: "hidden",
            zIndex: 10,
            transition: "all 0.3s ease"
          }}
        >
          {/* Decoration element */}
          <Box
            sx={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(107, 115, 255, 0.5) 0%, rgba(0, 13, 255, 0.5) 100%)",
              filter: "blur(25px)",
              zIndex: -1
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(107, 115, 255, 0.3) 0%, rgba(0, 13, 255, 0.3) 100%)",
              filter: "blur(20px)",
              zIndex: -1
            }}
          />

          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              mb: 4 
            }}
          >
            {/* Logo/Avatar placeholder */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                boxShadow: "0 4px 20px rgba(0, 13, 255, 0.3)",
                border: "4px solid rgba(255, 255, 255, 0.8)"
              }}
            >
              <User size={40} color="#ffffff" />
            </Box>

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
              sx={{ 
                mb: 3, 
                borderRadius: "8px",
                animation: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
                "@keyframes shake": {
                  "0%, 100%": { transform: "translateX(0)" },
                  "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
                  "20%, 40%, 60%, 80%": { transform: "translateX(5px)" }
                }
              }}
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
              error={email !== "" && !emailValid}
              helperText={email !== "" && !emailValid ? "Please enter a valid email" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail 
                      size={20} 
                      color={emailValid ? "#6B73FF" : email ? "#ff6b6b" : "#6B73FF"} 
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "&:hover fieldset": { borderColor: emailValid ? "#6B73FF" : email ? "#ff6b6b" : "#6B73FF" },
                  "&.Mui-focused fieldset": { borderColor: emailValid ? "#6B73FF" : email ? "#ff6b6b" : "#6B73FF" }
                },
                transition: "all 0.3s ease"
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
              error={password !== "" && !passwordValid}
              helperText={password !== "" && !passwordValid ? "Minimum 6 characters required" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock 
                      size={20} 
                      color={passwordValid ? "#6B73FF" : password ? "#ff6b6b" : "#6B73FF"} 
                    />
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
                  "&:hover fieldset": { borderColor: passwordValid ? "#6B73FF" : password ? "#ff6b6b" : "#6B73FF" },
                  "&.Mui-focused fieldset": { borderColor: passwordValid ? "#6B73FF" : password ? "#ff6b6b" : "#6B73FF" }
                },
                transition: "all 0.3s ease"
              }}
            />

            <Box sx={{ height: 56, position: "relative", mt: 1 }}>
              <Grow in={passwordValid}>
                <Box
                  sx={{
                    position: "relative",
                    transform: buttonRunning ? `translate(${buttonPosition.left}px, ${buttonPosition.top}px)` : "none",
                    transition: buttonRunning ? "none" : "transform 0.3s ease-out",
                  }}
                  ref={buttonRef}
                >
                  <Button
                    variant="contained"
                    onClick={handleButtonClick}
                    disabled={loading}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: "10px",
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      background: "linear-gradient(90deg, #6B73FF 0%, #000DFF 100%)",
                      boxShadow: "0 4px 15px rgba(0, 13, 255, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(90deg, #5C64FF 0%, #0009E0 100%)",
                        boxShadow: "0 6px 20px rgba(0, 13, 255, 0.4)",
                        transform: "translateY(-2px)"
                      },
                      transition: "all 0.3s ease"
                    }}
                    startIcon={loading ? null : <LogIn size={20} />}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                  </Button>
                </Box>
              </Grow>
            </Box>

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
                      background: "rgba(107, 115, 255, 0.04)",
                      transform: "translateY(-2px)"
                    },
                    transition: "all 0.3s ease"
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