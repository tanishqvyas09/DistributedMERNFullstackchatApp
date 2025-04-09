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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
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

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      setUser(user);
      if (user) {
        loadUsers();
        subscribeToMessages(user.id);
      }
    };

    getUser();
  }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase.from("users").select("id, full_name, email");
    if (error) console.error("Failed to load users:", error.message);
    else setAllUsers(data.filter((u) => u.id !== user?.id));
  };

  const loadMessages = async (receiverId) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
      )
      .order("sent_time", { ascending: true });

    if (error) {
      console.error("Failed to fetch messages:", error.message);
    } else {
      setMessages(data);
      markMessagesAsReceived();
      markMessagesAsRead();
    }
  };

  const subscribeToMessages = (userId) => {
    const channel = supabase
      .channel("messages-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new;
        if (
          (newMsg.sender_id === userId && newMsg.receiver_id === selectedUser?.id) ||
          (newMsg.sender_id === selectedUser?.id && newMsg.receiver_id === userId)
        ) {
          setMessages((prev) => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsReceived = async () => {
    const { error } = await supabase
      .from("messages")
      .update({ received_time: new Date().toISOString() })
      .eq("receiver_id", user.id)
      .is("received_time", null);

    if (error) console.error("Error marking as received:", error.message);
  };

  const markMessagesAsRead = async () => {
    const { error } = await supabase
      .from("messages")
      .update({ read_time: new Date().toISOString() })
      .eq("receiver_id", user.id)
      .is("read_time", null);

    if (error) console.error("Error marking as read:", error.message);
  };

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

    if (error) {
      alert("Failed to send message: " + error.message);
    } else {
      setMessage("");
      markMessagesAsReceived();
      markMessagesAsRead();
    }
  };

  return (
    <Grid container sx={{ height: "100vh", background: "linear-gradient(to bottom right, #f5f7fa, #c3cfe2)" }}>
      {/* Sidebar */}
      <Grid
        item
        xs={3}
        sx={{
          backgroundColor: "#ffffff88",
          backdropFilter: "blur(10px)",
          padding: 2,
          borderRight: "2px solid #e0e0e0",
        }}
      >
        <Typography variant="h5" fontWeight="bold" color={deepPurple[600]} gutterBottom>
          🚀 DisChat-Sync+
        </Typography>

        {user && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
            Logged in as: <strong>{user.email}</strong>
          </Typography>
        )}
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          Logout
        </Button>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          🔽 Select user to chat:
        </Typography>

        <Box mt={1}>
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
                padding: 1,
                mb: 1,
                cursor: "pointer",
                backgroundColor: selectedUser?.id === u.id ? deepPurple[100] : "#fff",
                transition: "0.3s",
                "&:hover": {
                  backgroundColor: deepPurple[50],
                  transform: "scale(1.02)",
                },
              }}
              elevation={2}
            >
              <Avatar sx={{ mr: 1, bgcolor: deepPurple[400] }}>{u.full_name[0]}</Avatar>
              <Typography>{u.full_name}</Typography>
            </Paper>
          ))}
        </Box>
      </Grid>

      {/* Chat Area */}
      <Grid item xs={9} sx={{ display: "flex", flexDirection: "column", padding: 2 }}>
        {/* Chat Messages */}
        <Box sx={{ flex: 1, overflowY: "auto", paddingRight: 1 }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              display="flex"
              justifyContent={msg.sender_id === user?.id ? "flex-end" : "flex-start"}
              mb={1}
            >
              <Paper
                sx={{
                  padding: 1.5,
                  backgroundColor: msg.sender_id === user?.id ? lightGreen[200] : "#ffffff",
                  borderRadius: "15px",
                  maxWidth: "60%",
                  boxShadow: "0px 3px 6px rgba(0,0,0,0.1)",
                }}
              >
                <Typography>{msg.content}</Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "block", textAlign: "right", mt: 0.5 }}
                >
                  🕒 Sent: {formatIST(msg.sent_time)}<br />
                  {msg.received_time && `✔ Delivered: ${formatIST(msg.received_time)}`}<br />
                  {msg.read_time && `👁 Read: ${formatIST(msg.read_time)}`}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Message Input */}
        {selectedUser && (
          <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              placeholder={`Message ${selectedUser.full_name}`}
              variant="outlined"
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ backgroundColor: "#fff", borderRadius: 2, boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" }}
            />
            <IconButton
              onClick={handleSend}
              color="primary"
              sx={{ ml: 1, backgroundColor: deepPurple[400], color: "#fff", "&:hover": { backgroundColor: deepPurple[600] } }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

