import { useState, useEffect ,useRef } from 'react';
import { 
    Box, Typography, Drawer, List, ListItem, ListItemButton, 
    ListItemIcon, ListItemText, AppBar, Toolbar, Avatar, 
    Paper, Grid, CircularProgress, IconButton, GlobalStyles,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button
} from '@mui/material';

// Icons
import SmartToy from '@mui/icons-material/SmartToy';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Logout from '@mui/icons-material/Logout';
import Add from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
// GOOD: Put this on its own line
import AttachFileIcon from '@mui/icons-material/AttachFile';

import axios from 'axios';

const drawerWidth = 260;

const Dashboard = ({ token, setToken }) => {
    // --- STATE MANAGEMENT ---
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [activeAgent, setActiveAgent] = useState(null); // Tracks if we are chatting
    
    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [newAgentData, setNewAgentData] = useState({ name: '', system_prompt: '' });

    const activeToken = token || localStorage.getItem('token');

    // --- API: FETCH AGENTS ---
    useEffect(() => {
        const fetchAgents = async () => {
            if (!activeToken) return;
            try {
                const response = await axios.get("http://127.0.0.1:8000/agents/", {
                    headers: { Authorization: `Bearer ${activeToken}` }
                });
                setAgents(response.data);
                setError(null); 
                setLoading(false);
            } catch (err) {
                console.error("Fetch Agents Error:", err);
                setError("Failed to load agents. Make sure your backend is running.");
                setLoading(false);
            }
        };
        fetchAgents();
    }, [activeToken]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    const handleCreateAgent = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:8000/agents", newAgentData, {
                headers: { Authorization: `Bearer ${activeToken}` }
            });
            setOpenDialog(false);
            setAgents([...agents, response.data]);
            setNewAgentData({ name: '', system_prompt: '' });
        } catch (err) {
            console.error("Create Agent Error:", err);
            setError("Could not create the agent. Please try again.");        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a' }}>
            <GlobalStyles styles={{ body: { margin: 0, padding: 0, backgroundColor: '#0f172a' } }} />

            {/* --- TOP APP BAR --- */}
            <AppBar position="fixed" sx={{ 
                width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`,
                bgcolor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)',
                boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" noWrap sx={{ fontWeight: 600, color: 'white' }}>
                        {activeAgent ? `Chatting with ${activeAgent.name}` : "Workspace Overview"}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>Welcome</Typography>
                        <Avatar sx={{ bgcolor: '#38bdf8', width: 32, height: 32 }}>U</Avatar>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* --- SIDEBAR DRAWER --- */}
            <Drawer sx={{
                width: drawerWidth, flexShrink: 0,
                '& .MuiDrawer-paper': { 
                    width: drawerWidth, boxSizing: 'border-box', 
                    bgcolor: '#1e293b', color: 'white', 
                    borderRight: '1px solid rgba(255,255,255,0.05)' 
                },
            }} variant="permanent" anchor="left">
                <Toolbar>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', letterSpacing: -1 }}>
                        NEXUS <span style={{ color: '#38bdf8' }}>AI</span>
                    </Typography>
                </Toolbar>
                <List sx={{ px: 2, pt: 2 }}>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton 
                            onClick={() => setActiveAgent(null)}
                            sx={{ borderRadius: 2, bgcolor: !activeAgent ? 'rgba(56, 189, 248, 0.1)' : 'transparent' }}
                        >
                            <ListItemIcon><DashboardIcon sx={{ color: '#38bdf8' }} /></ListItemIcon>
                            <ListItemText primary="Dashboard" sx={{ '& .MuiListItemText-primary': { fontWeight: 600 } }} />
                        </ListItemButton>
                    </ListItem>
                </List>
                <Box sx={{ mt: 'auto', p: 2 }}>
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                            <ListItemIcon><Logout sx={{ color: '#ef4444' }} /></ListItemIcon>
                            <ListItemText primary="Log Out" sx={{ color: '#ef4444' }} />
                        </ListItemButton>
                    </ListItem>
                </Box>
            </Drawer>

            {/* --- MAIN CONTENT AREA --- */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                {activeAgent ? (
                    // --- RENDER CHAT INTERFACE ---
                    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                        <Button 
                            startIcon={<ArrowBackIcon />} 
                            onClick={() => setActiveAgent(null)} 
                            sx={{ color: '#38bdf8', mb: 2 }}
                        >
                            Back to Dashboard
                        </Button>
                        <ChatWindow activeAgent={activeAgent} activeToken={activeToken} />
                    </Box>
                ) : (
                    // --- RENDER AGENT GRID ---
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>Active Agents</Typography>
                            <IconButton 
                                onClick={() => setOpenDialog(true)}
                                sx={{ bgcolor: '#38bdf8', color: '#0f172a', '&:hover': { bgcolor: '#7dd3fc' } }}
                            >
                                <Add /> 
                            </IconButton>
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                                <CircularProgress sx={{ color: '#38bdf8' }} />
                            </Box>
                        ) : error ? (
                            <Typography color="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', p: 2, borderRadius: 2 }}>{error}</Typography>
                        ) : agents.length === 0 ? (
                            <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#1e293b', borderRadius: 4, border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <SmartToy sx={{ fontSize: 64, color: '#64748b', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>No Agents Found</Typography>
                                <Typography sx={{ color: '#94a3b8' }}>Click + to create your first AI Agent.</Typography>
                            </Paper>
                        ) : (
                            <Grid container spacing={3}>
                                {agents.map((agent) => (
                                    <Grid sm={6} md={4} key={agent.id}>
                                        <Paper 
                                            onClick={() => setActiveAgent(agent)}
                                            sx={{ 
                                                p: 3, bgcolor: '#1e293b', borderRadius: 3, 
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: '#24334d', transform: 'translateY(-4px)', transition: '0.3s' }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Avatar sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}><SmartToy /></Avatar>
                                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>{agent.name}</Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                                {agent.system_prompt || "No instructions set."}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </>
                )}
            </Box>

            {/* --- DIALOG REMAINS THE SAME --- */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                sx={{ '& .MuiDialog-paper': { backgroundColor: '#1e293b', color: 'white', borderRadius: 3, minWidth: 400, backgroundImage: 'none' } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Create New Agent</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus margin="dense" label="Agent Name" fullWidth variant="outlined"
                        value={newAgentData.name}
                        onChange={(e) => setNewAgentData({ ...newAgentData, name: e.target.value })}
                        sx={{ mb: 2, '& .MuiInputBase-input': { color: 'white' }, '& .MuiOutlinedInput-root': { backgroundColor: '#0f172a' } }}
                    />
                    <TextField
                        margin="dense" label="System Prompt" fullWidth multiline rows={3} variant="outlined"
                        value={newAgentData.system_prompt}
                        onChange={(e) => setNewAgentData({ ...newAgentData, system_prompt: e.target.value })}
                        sx={{ '& .MuiInputBase-input': { color: 'white' }, '& .MuiOutlinedInput-root': { backgroundColor: '#0f172a' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
                    <Button onClick={handleCreateAgent} variant="contained" sx={{ bgcolor: '#38bdf8', color: '#0f172a' }}>Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// --- CHAT WINDOW COMPONENT ---
// --- CHAT WINDOW COMPONENT ---
const ChatWindow = ({ activeAgent, activeToken }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    
    // NEW: State to show when a file is uploading
    const [isUploading, setIsUploading] = useState(false);
    
    const messagesEndRef = useRef(null);
    
    // NEW: Reference to our hidden file input
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/agents/${activeAgent.id}/history`, {
                    headers: { Authorization: `Bearer ${activeToken}` }
                });
                const formattedMessages = res.data.map(msg => ({
                    text: msg.content,
                    sender: msg.role === 'user' ? 'user' : 'bot'
                }));
                setMessages(formattedMessages);
            } catch (err) {
                console.error("Failed to load chat history", err);
            }
        };

        if (activeAgent) {
            fetchHistory();
        }
    }, [activeAgent, activeToken]);


    // NEW: The File Upload Handler
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Ensure it's a text-based file for our current backend logic
        if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
            alert("For now, please upload only .txt or .md files!");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            // Tell the user what is happening
            setMessages(prev => [...prev, { text: `Uploading ${file.name}...`, sender: "user" }]);
            
            // Post to your new FastAPI upload route
            await axios.post(`http://127.0.0.1:8000/agents/${activeAgent.id}/upload`, formData, {
                headers: { 
                    Authorization: `Bearer ${activeToken}`,
                    "Content-Type": "multipart/form-data" 
                }
            });

            setMessages(prev => [...prev, { text: `System: Successfully learned the contents of ${file.name}! You can now ask me about it.`, sender: "bot" }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { text: `System Error: Failed to upload ${file.name}.`, sender: "bot" }]);
        } finally {
            setIsUploading(false);
            // Reset the input so you can upload the same file again if needed
            event.target.value = null; 
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        
        const userMessage = { text: input, sender: "user" };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);
        
        try {
            const response = await axios.post(`http://127.0.0.1:8000/agents/${activeAgent.id}/chat`, 
                { message: input },
                { headers: { Authorization: `Bearer ${activeToken}` } }
            );
            
            setMessages(prev => [...prev, { text: response.data.reply, sender: "bot" }]);
        } catch (err) {
            if (err.response?.status === 429) {
                setMessages(prev => [...prev, { text: "System: AI is resting. Rate limit exceeded.", sender: "bot" }]);
            } else {
                setMessages(prev => [...prev, { text: "Error: AI failed to respond.", sender: "bot" }]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <Paper sx={{ 
            p: 3, height: '75vh', display: 'flex', flexDirection: 'column', 
            bgcolor: '#1e293b', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' 
        }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pr: 1 }}>
                {messages.length === 0 && !isTyping && (
                    <Typography sx={{ color: '#64748b', textAlign: 'center', mt: 10 }}>
                        Start a conversation with {activeAgent.name}
                    </Typography>
                )}
                {messages.map((msg, i) => (
                    <Box key={i} sx={{ 
                        display: 'flex',
                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2 
                    }}>
                        <Typography sx={{ 
                            p: 2, borderRadius: 3, maxWidth: '70%',
                            bgcolor: msg.sender === 'user' ? '#38bdf8' : '#0f172a',
                            color: msg.sender === 'user' ? '#0f172a' : 'white',
                            fontWeight: msg.sender === 'user' ? 600 : 400,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            {msg.text}
                        </Typography>
                    </Box>
                ))}
                {isUploading && <Typography sx={{ color: '#38bdf8', fontSize: '0.8rem', ml: 1 }}>Reading document...</Typography>}
                {isTyping && <Typography sx={{ color: '#38bdf8', fontSize: '0.8rem', ml: 1 }}>Agent is thinking...</Typography>}
                
                <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, bgcolor: '#0f172a', p: 1, borderRadius: 3, alignItems: 'center' }}>
                
                {/* NEW: Hidden file input and the attachment button */}
                <input 
                    type="file" 
                    accept=".txt,.md" 
                    style={{ display: 'none' }} 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />
                <IconButton 
                    onClick={() => fileInputRef.current.click()} 
                    disabled={isUploading}
                    sx={{ color: '#94a3b8', '&:hover': { color: '#38bdf8' } }}
                >
                    <AttachFileIcon />
                </IconButton>

                <TextField 
                    fullWidth 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message or attach a file..."
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{ input: { color: 'white', px: 1 } }}
                    disabled={isUploading}
                />
                <IconButton onClick={sendMessage} disabled={isUploading || !input.trim()} sx={{ color: '#38bdf8' }}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Paper>
    );
};
export default Dashboard;