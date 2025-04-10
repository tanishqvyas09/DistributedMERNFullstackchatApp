import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  Box,
  Grid,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Button,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LogoutIcon from "@mui/icons-material/Logout";
import { deepPurple, lightGreen } from "@mui/material/colors";

const formatIST = (dateString) =>
  new Date(dateString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export default function Chat() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  /* ─────────────────────────── AUTH + INITIAL LOAD ────────────────────────── */
  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) return console.error(error.message);

      setUser(user);
      if (user) {
        loadUsers();
        subscribeToMessages(user.id);
      }
    })();
  }, []);

  /* ─────────────────────────────── HELPERS ──────────────────────────────── */
  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email");
    if (!error) setAllUsers(data.filter((u) => u.id !== user?.id));
  };

  const loadMessages = async (receiverId) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
      )
      .order("sent_time", { ascending: true });

    if (!error) {
      setMessages(data);
      markMessagesAsReceived();
      markMessagesAsRead();
    }
  };

  const subscribeToMessages = (uid) => {
    const channel = supabase
      .channel("messages-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new;
          if (
            (m.sender_id === uid && m.receiver_id === selectedUser?.id) ||
            (m.sender_id === selectedUser?.id && m.receiver_id === uid)
          ) {
            setMessages((prev) => [...prev, m]);
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  };

  const markMessagesAsReceived = async () => {
    await supabase
      .from("messages")
      .update({ received_time: new Date().toISOString() })
      .eq("receiver_id", user.id)
      .is("received_time", null);
  };
  const markMessagesAsRead = async () => {
    await supabase
      .from("messages")
      .update({ read_time: new Date().toISOString() })
      .eq("receiver_id", user.id)
      .is("read_time", null);
  };

  /* ───────────────────────────── SEND MESSAGE ───────────────────────────── */
  const handleSend = async () => {
    if (!message.trim() || !selectedUser) return;

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: user.id,
        receiver_id: selectedUser.id,
        content: message,
        lamport_clock: Math.floor(Date.now() / 1000),
      },
    ]);

    if (!error) {
      setMessage("");
      markMessagesAsReceived();
      markMessagesAsRead();
    }
  };

  /* ──────────────────────────────── UI ──────────────────────────────────── */
  return (
    <Grid
      container
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg,#4f46e5 0%,#3b82f6 100%)",
      }}
    >
      {/* ─────────── Sidebar ─────────── */}
      <Grid
        item
        xs={12}
        md={3}
        sx={{
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255,255,255,0.15)",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color="#fff"
          sx={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
        >
          🚀 DisChat‑Sync+
        </Typography>

        {user && (
          <Typography variant="body2" color="#e0e0e0">
            Logged in as&nbsp;
            <strong style={{ color: "#fff" }}>{user.email}</strong>
          </Typography>
        )}

        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          color="error"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
          sx={{ alignSelf: "flex-start" }}
        >
          Logout
        </Button>

        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.3)" }} />

        <Typography variant="subtitle2" color="#fff">
          Select user to chat
        </Typography>

        <Box sx={{ overflowY: "auto", pr: 1, flex: 1 }}>
          {allUsers.map((u) => (
            <Paper
              key={u.id}
              onClick={() => {
                setSelectedUser(u);
                loadMessages(u.id);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                mb: 1,
                cursor: "pointer",
                borderRadius: 3,
                backgroundColor:
                  selectedUser?.id === u.id ? "rgba(255,255,255,0.3)" : "#ffffff",
                transition: "0.25s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
              elevation={0}
            >
              <Avatar sx={{ bgcolor: deepPurple[500] }}>{u.full_name[0]}</Avatar>
              <Typography fontWeight={500}>{u.full_name}</Typography>
            </Paper>
          ))}
        </Box>
      </Grid>

      {/* ─────────── Chat Area ─────────── */}
      <Grid
        item
        xs={12}
        md={9}
        sx={{
          p: { xs: 1, md: 4 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Messages Scroll Box */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: isMine ? "flex-end" : "flex-start",
                  maxWidth: "70%",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    backgroundColor: isMine ? lightGreen[200] : "#fff",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography>{msg.content}</Typography>

                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 1, opacity: 0.7 }}
                  >
                    🕒 Sent: {formatIST(msg.sent_time)}
                    {msg.received_time && (
                      <>
                        <br />✔ Delivered: {formatIST(msg.received_time)}
                      </>
                    )}
                    {msg.read_time && (
                      <>
                        <br />👁 Read: {formatIST(msg.read_time)}
                      </>
                    )}
                  </Typography>
                </Paper>
              </Box>
            );
          })}
        </Box>

        {/* Input Bar */}
        {selectedUser && (
          <Paper
            elevation={6}
            sx={{
              p: 1,
              borderRadius: 5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              backdropFilter: "blur(8px)",
              background:
                "linear-gradient(135deg,rgba(255,255,255,0.6),rgba(255,255,255,0.4))",
            }}
          >
            <TextField
              fullWidth
              placeholder={`Message ${selectedUser.full_name}`}
              variant="standard"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              InputProps={{ disableUnderline: true }}
            />
            <IconButton
              onClick={handleSend}
              sx={{
                bgcolor: "#3b82f6",
                color: "#fff",
                "&:hover": { bgcolor: "#2563eb" },
              }}
            >
              <SendIcon />
            </IconButton>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
}
