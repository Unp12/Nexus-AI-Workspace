import { useState } from 'react';
import { 
    Box, TextField, Button, Typography, Paper, 
    InputAdornment, IconButton, Fade, Stack, Grid, GlobalStyles
} from '@mui/material';
import { 
    AccountTree, Visibility, VisibilityOff, CheckCircle 
} from '@mui/icons-material';
import axios from 'axios';

const Login = ({ setToken }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const baseUrl = "http://127.0.0.1:8000";
        
        try {
            if (isRegister) {
                // FIX for 422: Ensure keys 'email', 'password', 'name' match your UserCreate schema exactly
                const registerPayload = {
                    email: formData.email,
                    password: formData.password,
                    name: formData.name 
                };
                await axios.post(`${baseUrl}/users/register`, registerPayload);
                alert("Registration successful! Switching to Sign In.");
                setIsRegister(false);
            }  else {
                // 1. The Bulletproof Raw String formatting
                // We map formData.email to 'username' because FastAPI demands it
                const payload = `username=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}`;
                
                // 2. Send the raw string with the strict header
                const res = await axios.post(`${baseUrl}/users/login`, payload, {
                    headers: { 
                        "Content-Type": "application/x-www-form-urlencoded" 
                    }
                });

                // 3. Save token to local storage for persistent sessions
                localStorage.setItem("token", res.data.access_token);
                setToken(res.data.access_token);
            }
        } catch (err) {
            // Logs the specific field FastAPI is rejecting (e.g., 'name' or 'username')
            console.error("Server Error Detail:", err.response?.data?.detail);
            const errorDetail = err.response?.data?.detail;
            const message = Array.isArray(errorDetail) ? errorDetail[0]?.msg : errorDetail;
            alert(message || "Authentication failed. Please check your credentials.");
        }
    };

    return (
        <>
            {/* Fixes the white space on the left side seen in Screenshot (134).png */}
            <GlobalStyles styles={{ 
                body: { margin: 0, padding: 0, backgroundColor: '#0f172a', overflowX: 'hidden' },
                html: { margin: 0, padding: 0 }
            }} />

            <Grid container sx={{ minHeight: '100vh', width: '100vw', m: 0, p: 0 }}>
                
                {/* LEFT SIDE: BRANDING & FEATURES */}
                <Grid item="true" xs={12} md={6} sx={{ 
                    display: { xs: 'none', md: 'flex' }, 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    p: 8,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                }}>
                    <Fade in timeout={1000}>
                        <Box>
                            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                                <AccountTree sx={{ fontSize: 48, color: '#38bdf8' }} />
                                <Typography variant="h2" sx={{ fontWeight: 900, color: 'white', letterSpacing: -2 }}>
                                    NEXUS <span style={{ color: '#38bdf8' }}>AI</span>
                                </Typography>
                            </Stack>
                            
                            <Typography variant="h5" sx={{ color: '#94a3b8', mb: 6, maxWidth: 500, lineHeight: 1.5 }}>
                                The next-generation workspace for <b>Agentic AI</b> and <b>RAG-driven</b> collaboration.
                            </Typography>

                            <Stack spacing={3}>
                                {[
                                    "Custom Knowledge Base (RAG) Integration",
                                    "Multi-Agent Workflow Orchestration",
                                    "Secure JWT-based Authentication",
                                    "Advanced Document Intelligence"
                                ].map((text, i) => (
                                    <Stack key={i} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                                        <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                                        <Typography sx={{ color: '#cbd5e1', fontWeight: 500 }}>{text}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    </Fade>
                </Grid>

                {/* RIGHT SIDE: AUTHENTICATION FORM */}
                <Grid item="true" xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: '#0f172a' }}>
                    <Fade in timeout={1500}>
                        <Paper elevation={0} sx={{ 
                            p: { xs: 4, md: 6 }, width: '100%', maxWidth: 450, 
                            bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: 8,
                            backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                                {isRegister ? 'Get Started' : 'Sign In'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
                                {isRegister ? 'Create your NEXUS account' : 'Enter your details to access your workspace'}
                            </Typography>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    {isRegister && (
                                        <TextField 
                                            fullWidth label="Full Name" variant="filled" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            sx={inputStyles}
                                            slotProps={{ input: { disableUnderline: true, sx: { borderRadius: 3, color: 'white' } } }}
                                        />
                                    )}
                                    <TextField 
                                        fullWidth label="Email" variant="filled"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        sx={inputStyles}
                                        slotProps={{ input: { disableUnderline: true, sx: { borderRadius: 3, color: 'white' } } }}
                                    />
                                    <TextField 
                                        fullWidth label="Password" type={showPassword ? 'text' : 'password'} variant="filled"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        sx={inputStyles}
                                        slotProps={{ 
                                            input: { 
                                                disableUnderline: true, 
                                                sx: { borderRadius: 3, color: 'white' },
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: '#64748b' }}>
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            } 
                                        }}
                                    />
                                    <Button type="submit" fullWidth variant="contained" 
                                        sx={{ 
                                            py: 2, mt: 2, borderRadius: 3, bgcolor: '#38bdf8', 
                                            color: '#0f172a', fontWeight: 700, 
                                            '&:hover': { bgcolor: '#7dd3fc' }, textTransform: 'none' 
                                        }}>
                                        {isRegister ? 'Create Account' : 'Sign In'}
                                    </Button>
                                </Stack>
                            </form>

                            <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: '#94a3b8' }}>
                                {isRegister ? 'Already have an account?' : 'New here?'}
                                <Box component="span" onClick={() => setIsRegister(!isRegister)}
                                    sx={{ color: '#38bdf8', ml: 1, cursor: 'pointer', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}>
                                    {isRegister ? 'Sign In' : 'Create an Account'}
                                </Box>
                            </Typography>
                        </Paper>
                    </Fade>
                </Grid>
            </Grid>
        </>
    );
};

const inputStyles = {
    '& .MuiFilledInput-root': { bgcolor: '#1e293b', '&:hover': { bgcolor: '#334155' }, '&.Mui-focused': { bgcolor: '#1e293b' } },
    '& .MuiInputLabel-root': { color: '#64748b' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' }
};

export default Login;