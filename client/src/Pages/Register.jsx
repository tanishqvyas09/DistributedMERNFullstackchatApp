import { Button, TextField, Typography, Container, Box, Paper } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
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

    // Insert profile in users table
    const { user } = data;
    await supabase.from("users").insert([
      {
        id: user.id,
        full_name: fullName,
        email: email,
        skills: ["chat", "frontend"]  // optional attributes
      }
    ]);

    navigate("/chat");
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 10 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Register on DisChat-Sync+
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
          <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <Button variant="contained" onClick={handleRegister}>Register</Button>
          <Typography variant="body2" align="center">
            Already have an account? <Link to="/">Login</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
