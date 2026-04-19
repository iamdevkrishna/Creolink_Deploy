import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [projectError, setProjectError] = useState("");

  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [clientError, setClientError] = useState("");

  const fileInputRef = useRef(null);

  // NEW: Ref and State for Freelancer Avatar
  const freelancerAvatarRef = useRef(null);
  const [freelancerAvatar, setFreelancerAvatar] = useState(null);
  const [activeUsername, setActiveUsername] = useState(localStorage.getItem('username') || 'Editor');

  const [uploading, setUploading] = useState(false);
  const [showAssets, setShowAssets] = useState(false);

  // Copy States
  const [copied, setCopied] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState(null);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const getProfileImage = (imagePath) => {
    if (!imagePath) return 'none';
    return imagePath.startsWith('http') ? `url(${imagePath})` : `url(${import.meta.env.VITE_API_BASE_URL}${imagePath})`;
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access');
    return {
      'Authorization': `Bearer ${token}` // Removed Content-Type here so FormData (images) works automatically
    };
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // 1. Initial Load & Security Check
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch Clients
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/`, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } })
      .then(res => {
        if (res.status === 401) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        setClients(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        handleLogout();
      });

    // NEW: Fetch Freelancer Profile Info
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/me/`, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setActiveUsername(data.username);
          setFreelancerAvatar(data.profile_image);
        }
      });
  }, [navigate]);

  // 2. Fetch Projects
  useEffect(() => {
    if (activeClient) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/?client_id=${activeClient.id}`, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } })
        .then(res => res.json())
        .then(data => {
          setProjects(data);
          setActiveProject(null);
        });
    }
  }, [activeClient]);

  // 3. WhatsApp Background Polling
  useEffect(() => {
    if (!activeClient) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/?client_id=${activeClient.id}`, {
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
        });

        if (response.ok) {
          const updatedProjects = await response.json();
          setProjects(updatedProjects);

          if (activeProject) {
            const updatedActive = updatedProjects.find(p => p.id === activeProject.id);
            if (updatedActive) {
              if (updatedActive.messages.length !== activeProject.messages.length ||
                 (updatedActive.files && updatedActive.files.length !== (activeProject.files?.length || 0))) {
                setActiveProject(updatedActive);
              }
            }
          }
        }
      } catch (error) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [activeClient, activeProject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeProject?.messages, activeProject?.files]);


  // --- BULLETPROOF COPY LINK FUNCTION ---
  const copyToClipboard = (text, callback) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(callback).catch(() => fallbackCopy(text, callback));
    } else {
      fallbackCopy(text, callback);
    }
  };

  const fallbackCopy = (text, callback) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      callback();
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopyHubLink = (e, client) => {
    e.stopPropagation();
    if (!client?.magic_link_id) {
        alert("Magic link not found. Is it added to serializers.py?");
        return;
    }
    const url = `${import.meta.env.VITE_FRONTEND_URL}/portal/${client.magic_link_id}`;

    copyToClipboard(url, () => {
      setCopiedClientId(client.id);
      setTimeout(() => setCopiedClientId(null), 2000);
    });
  };

  const handleCopyProjectLink = () => {
    if (!activeClient?.magic_link_id) {
        alert("Magic link not found. Is it added to serializers.py?");
        return;
    }
    const url = `${import.meta.env.VITE_FRONTEND_URL}/portal/${activeClient.magic_link_id}`;

    copyToClipboard(url, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // --- NEW: UPLOAD FREELANCER AVATAR ---
  const handleFreelancerAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_image', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/upload_photo/`, {
        method: 'POST',
        headers: getAuthHeaders(), // Does not need Content-Type, browser handles FormData
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFreelancerAvatar(data.profile_image);
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      e.target.value = null; // Clear input
    }
  };

  // --- CLIENT ACTIONS ---
  const handleCreateClient = async (e) => {
    e.preventDefault();
    const trimmedName = newClientName.trim();
    if (!trimmedName) return;

    if (clients.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      setClientError(`A client named "${trimmedName}" already exists.`);
      return;
    }
    setClientError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ name: trimmedName })
      });
      if (response.ok) {
        const newClient = await response.json();
        setClients([...clients, newClient]);
        setShowClientModal(false);
        setNewClientName("");
      } else {
        setClientError("Failed to create client.");
      }
    } catch (error) {
      setClientError("Network error. Please try again.");
    }
  };

  const closeClientModal = () => {
    setShowClientModal(false);
    setNewClientName("");
    setClientError("");
  };

  const handleRenameClient = async (e, client) => {
    e.stopPropagation();
    const newName = window.prompt("Rename Client:", client.name);
    if (!newName || newName === client.name) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/${client.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ name: newName })
      });
      if (response.ok) {
        const updated = await response.json();
        setClients(clients.map(c => c.id === client.id ? updated : c));
        if (activeClient?.id === client.id) setActiveClient(updated);
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteClient = async (e, clientId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this client permanently? All their projects, files, and messages will be lost!")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clients/${clientId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok || response.status === 204) {
        setClients(clients.filter(c => c.id !== clientId));
        if (activeClient?.id === clientId) {
           setActiveClient(null);
           setActiveProject(null);
        }
      }
    } catch (error) { console.error(error); }
  };

  // --- PROJECT ACTIONS ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const trimmedTitle = newProjectTitle.trim();
    if (!trimmedTitle || !activeClient) return;

    if (projects.some(p => p.title.toLowerCase() === trimmedTitle.toLowerCase())) {
      setProjectError(`A project named "${trimmedTitle}" already exists.`);
      return;
    }
    setProjectError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ title: trimmedTitle, client: activeClient.id, status: "In Progress" })
      });
      if (response.ok) {
        const newProject = await response.json();
        setProjects([newProject, ...projects]);
        setShowProjectModal(false);
        setNewProjectTitle("");
      } else {
        setProjectError("Failed to create project.");
      }
    } catch (error) {
      setProjectError("Network error.");
    }
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setNewProjectTitle("");
    setProjectError("");
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project permanently?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${projectId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok || response.status === 204) {
        setProjects(projects.filter(p => p.id !== projectId));
        if (activeProject?.id === projectId) setActiveProject(null);
      }
    } catch (error) { console.error(error); }
  };

  const handleRenameProject = async (e, project) => {
    e.stopPropagation();
    const newTitle = window.prompt("Rename Project:", project.title);
    if (!newTitle || newTitle === project.title) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${project.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ title: newTitle })
      });
      if (response.ok) {
        const updated = await response.json();
        setProjects(projects.map(p => p.id === project.id ? updated : p));
        if (activeProject?.id === project.id) setActiveProject(updated);
      }
    } catch (error) { console.error(error); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeProject) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ project: activeProject.id, sender: activeUsername, content: newMessage, is_client: false })
      });
      if (response.ok) {
        const savedMsg = await response.json();
        const updated = { ...activeProject, messages: [...activeProject.messages, savedMsg] };
        setActiveProject(updated);
        setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
        setNewMessage("");
      }
    } catch (error) { console.error(error); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeProject) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('project', activeProject.id);
    formData.append('file', file);
    formData.append('uploaded_by', activeUsername);
    formData.append('is_client', 'false');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/files/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      if (response.ok) {
        const newFile = await response.json();
        const updated = { ...activeProject, files: [...(activeProject.files || []), newFile] };
        setActiveProject(updated);
        setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
      }
    } catch (error) { console.error(error); }
    finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/files/${fileId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok || response.status === 204) {
        const updatedFiles = activeProject.files.filter(f => f.id !== fileId);
        const updatedProject = { ...activeProject, files: updatedFiles };
        setActiveProject(updatedProject);
        setProjects(projects.map(p => p.id === activeProject.id ? updatedProject : p));
      }
    } catch (error) { console.error(error); }
  };

  const handleUpdateProjectStatus = async (newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${activeProject.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updated = await response.json();
        setActiveProject(updated);
        setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
      }
    } catch (error) { console.error(error); }
  };

  let chatTimeline = [];
  if (activeProject) {
    const textMsgs = activeProject.messages.map(m => ({ ...m, type: 'text', sortDate: new Date(m.timestamp) }));
    const fileMsgs = (activeProject.files || []).map(f => ({
      id: `file-${f.id}`, type: 'file', sender: f.uploaded_by || 'Unknown', is_client: f.is_client,
      file_name: f.file_name, file_url: f.file, timestamp: f.uploaded_at, sortDate: new Date(f.uploaded_at)
    }));
    chatTimeline = [...textMsgs, ...fileMsgs].sort((a, b) => a.sortDate - b.sortDate);
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#070b14] text-indigo-400">Authenticating Workspace...</div>;

  return (
    <div className="bg-[#070b14] font-display text-slate-200 h-screen overflow-hidden flex selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* HIDDEN INPUT FOR FREELANCER AVATAR */}
      <input type="file" ref={freelancerAvatarRef} onChange={handleFreelancerAvatarUpload} className="hidden" accept="image/*" />

      {/* LEFT SIDEBAR */}
      {activeClient && (
        <aside className="w-[280px] h-full flex flex-col bg-white/[0.02] border-r border-white/5 flex-shrink-0 z-20 backdrop-blur-2xl">
          <div className="p-6 pb-4">
            <div
              onClick={() => { setActiveClient(null); setActiveProject(null); }}
              className="flex items-center gap-3 mb-6 cursor-pointer group"
              title="Return to Client Hub"
            >
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 size-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-white text-2xl">grid_view</span>
              </div>
              <div>
                <h1 className="text-white text-lg font-bold tracking-tight truncate w-36 group-hover:text-indigo-300 transition-colors">Scenoxis</h1>
                <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-[12px]">arrow_back</span> Switch Client
                </p>
              </div>
            </div>

            <button onClick={() => setShowProjectModal(true)} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 px-4 rounded-xl font-medium transition-all group cursor-pointer">
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300 text-indigo-400">add</span>
              <span className="text-sm">New Project</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
            <div>
              <h3 className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{activeClient.name}'s Projects</h3>
              <div className="space-y-2">
                {projects.map((proj) => (
                  <button key={proj.id} onClick={() => setActiveProject(proj)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer group ${activeProject?.id === proj.id ? 'bg-indigo-500/20 border border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                    <span className={`material-symbols-outlined text-[20px] ${activeProject?.id === proj.id ? 'text-indigo-400' : ''}`} style={activeProject?.id === proj.id ? { fontVariationSettings: "'FILL' 1" } : {}}>videocam</span>
                    <span className="text-sm font-medium truncate text-left flex-1">{proj.title}</span>
                    {proj.status === "Completed" && <span className="material-symbols-outlined text-emerald-500 text-[16px]">check_circle</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/[0.05] space-y-3 flex flex-col">
            <button onClick={() => { setActiveClient(null); setActiveProject(null); }} className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-all cursor-pointer text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              Switch Client
            </button>

            {/* UPDATED FREELANCER PROFILE WITH PHOTO UPLOAD */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 relative group">
              <div
                onClick={() => freelancerAvatarRef.current.click()}
                className="size-9 rounded-full bg-blue-500/20 bg-cover bg-center border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0 cursor-pointer overflow-hidden relative"
                style={{ backgroundImage: getProfileImage(freelancerAvatar) }}
                title="Update Profile Picture"
              >
                 {!freelancerAvatar && activeUsername.charAt(0).toUpperCase()}
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="material-symbols-outlined text-[14px] text-white">camera_alt</span>
                 </div>
              </div>
              <div className="flex flex-col overflow-hidden flex-1">
                <span className="text-sm font-semibold text-white truncate">{activeUsername}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Lead Editor</span>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1 cursor-pointer" title="Sign Out">
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#070b14] to-[#04060a]">

        {/* VIEW 0: CLIENT HUB */}
        {!activeClient && (
          <div className="flex-1 flex flex-col items-center justify-center h-full relative z-10 px-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-2xl">Welcome to Scenoxis</h1>
            <p className="text-indigo-300/60 mb-16 text-lg font-medium">Select a client workspace to begin</p>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 max-w-5xl">

              {/* Client Cards */}
              {clients.map(client => (
                <div key={client.id} className="group flex flex-col items-center relative">
                  <div onClick={() => setActiveClient(client)} className="size-32 md:size-40 rounded-full bg-[#0d1323] bg-cover bg-center border-2 border-white/5 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:border-indigo-500/80 group-hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] flex items-center justify-center relative overflow-hidden cursor-pointer" style={{ backgroundImage: getProfileImage(client.profile_image) }}>
                     {!client.profile_image && <span className="text-5xl font-bold text-slate-600 group-hover:text-indigo-400 transition-colors">{client.name.charAt(0)}</span>}
                  </div>

                  <div className="flex items-center gap-2 mt-6">
                    <span onClick={() => setActiveClient(client)} className="text-lg font-semibold text-slate-400 group-hover:text-white transition-colors tracking-wide cursor-pointer">{client.name}</span>
                    <button onClick={(e) => handleRenameClient(e, client)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-indigo-400 p-1 cursor-pointer" title="Rename Client"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                    {/* TRASH ICON */}
                    <button onClick={(e) => handleDeleteClient(e, client.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-400 p-1 cursor-pointer" title="Delete Client"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                  </div>

                  {/* COPY PORTAL LINK (HOVER) */}
                  <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => handleCopyHubLink(e, client)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-lg ${copiedClientId === client.id ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:border-indigo-500/50 hover:text-indigo-300'}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{copiedClientId === client.id ? 'check' : 'link'}</span>
                      {copiedClientId === client.id ? 'Copied!' : 'Copy Portal Link'}
                    </button>
                  </div>
                </div>
              ))}

              <div onClick={() => setShowClientModal(true)} className="group flex flex-col items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                <div className="size-32 md:size-40 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:border-indigo-400 group-hover:bg-indigo-500/5">
                  <span className="material-symbols-outlined text-4xl text-slate-500 group-hover:text-indigo-400">add</span>
                </div>
                <span className="mt-6 text-lg font-semibold text-slate-500 group-hover:text-indigo-300 transition-colors">New Client</span>
              </div>
            </div>

            <div className="absolute top-8 right-8 flex items-center gap-4">
                {/* BIG HUB FREELANCER AVATAR */}
                <div
                    onClick={() => freelancerAvatarRef.current.click()}
                    className="size-10 rounded-full bg-blue-500/20 bg-cover bg-center border border-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-300 cursor-pointer overflow-hidden relative group shadow-lg"
                    style={{ backgroundImage: getProfileImage(freelancerAvatar) }}
                    title="Update Profile Picture"
                >
                    {!freelancerAvatar && activeUsername.charAt(0).toUpperCase()}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="material-symbols-outlined text-[16px] text-white">camera_alt</span>
                    </div>
                </div>

                <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-rose-400 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-semibold border border-white/5 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">logout</span> Sign Out
                </button>
            </div>
          </div>
        )}

        {/* VIEW 1: PROJECT GRID */}
        {activeClient && !activeProject && (
          <div className="flex-1 overflow-y-auto p-10 z-10">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-white/10 pb-6 gap-6">
                <div className="flex items-center gap-5 group">
                  <div className="size-20 rounded-2xl bg-[#0d1323] bg-cover bg-center border border-white/10 shadow-xl flex items-center justify-center text-3xl font-bold text-slate-500" style={{ backgroundImage: getProfileImage(activeClient.profile_image) }}>
                     {!activeClient.profile_image && activeClient.name.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                      {activeClient.name}'s Projects
                      <button onClick={(e) => handleRenameClient(e, activeClient)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-indigo-400 transition-opacity cursor-pointer"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyProjectLink}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${copied ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{copied ? 'check_circle' : 'link'}</span>
                    {copied ? 'Link Copied!' : 'Copy Portal Link'}
                  </button>
                  <button onClick={() => setShowProjectModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)] cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">add</span> New Project
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(proj => (
                  <div key={proj.id} onClick={() => setActiveProject(proj)} className="group bg-[#0d1323]/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-[#121b30] hover:border-indigo-500/50 transition-all duration-300 cursor-pointer shadow-lg relative min-h-[160px] flex flex-col justify-between">
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0d1323]/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10 shadow-lg z-10">
                       <button onClick={(e) => handleRenameProject(e, proj)} className="p-1 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                       <div className="w-px h-4 bg-white/10 mx-1"></div>
                       <button onClick={(e) => handleDeleteProject(e, proj.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border mb-3 inline-block ${proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{proj.status}</span>
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors pr-12">{proj.title}</h3>
                      <p className="text-xs text-slate-500">Created {new Date(proj.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium"><span className="material-symbols-outlined text-[16px]">forum</span> {proj.messages.length} </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium"><span className="material-symbols-outlined text-[16px]">folder_zip</span> {proj.files?.length || 0} </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ACTIVE PROJECT WORKSPACE */}
        {activeProject && (
          <div className="flex flex-col h-full w-full z-10 relative">
            <header className="h-16 border-b border-white/[0.05] flex items-center justify-between px-6 bg-white/[0.02] backdrop-blur-xl shrink-0 shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveProject(null)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer mr-2"><span className="material-symbols-outlined">arrow_back</span></button>
                <div className="group flex items-center gap-3">
                  <h2 className="text-white text-lg font-bold flex items-center gap-3">
                    {activeProject.title}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${activeProject.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{activeProject.status}</span>
                  </h2>
                  <button onClick={(e) => handleRenameProject(e, activeProject)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-indigo-400 transition-opacity cursor-pointer"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setShowAssets(!showAssets)} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 border cursor-pointer ${showAssets ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-[#0d1323] text-slate-300 hover:text-white hover:bg-[#121b30] border-white/10'}`}>
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span><span>Assets</span>
                </button>
                {activeProject.status !== "Completed" ? (
                  <button onClick={() => handleUpdateProjectStatus("Completed")} className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer"><span className="material-symbols-outlined text-[18px]">check_circle</span> Complete</button>
                ) : (
                  <button onClick={() => handleUpdateProjectStatus("In Progress")} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer"><span className="material-symbols-outlined text-[18px]">history</span> Resume</button>
                )}
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
              <section className="flex-1 flex flex-col min-w-0 relative">

                <div className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col scroll-smooth pb-32 custom-scrollbar">
                  {chatTimeline.map((item) => (
                    <div key={item.id} className={`flex items-end gap-3 group ${item.is_client ? '' : 'justify-end'}`}>

                      {item.is_client && (
                        <div className="size-8 rounded-full bg-[#0d1323] bg-cover bg-center shrink-0 flex items-center justify-center text-xs font-bold border border-white/10 shadow-lg" style={{ backgroundImage: getProfileImage(activeClient?.profile_image) }}>
                           {!activeClient?.profile_image && item.sender.charAt(0)}
                        </div>
                      )}

                      <div className={`flex flex-col gap-1.5 max-w-[75%] ${item.is_client ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <span className={`text-[10px] font-medium tracking-wide ${item.is_client ? 'text-slate-400' : 'text-blue-400'}`}>{item.is_client ? item.sender : 'You'}</span>
                           <span className="text-[10px] text-slate-600">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>

                        {item.type === 'text' && (
                          <div className={`px-5 py-3.5 shadow-xl backdrop-blur-md ${item.is_client ? 'bg-[#121b30]/80 border border-white/5 text-slate-200 rounded-2xl rounded-bl-sm' : 'bg-gradient-to-br from-blue-600 to-indigo-600 border border-indigo-500/30 text-white rounded-2xl rounded-br-sm'}`}>
                            <p className="text-[15px] leading-relaxed">{item.content}</p>
                          </div>
                        )}

                        {item.type === 'file' && (
                          <div className={`p-1.5 shadow-xl backdrop-blur-md rounded-2xl flex items-center gap-3 ${item.is_client ? 'bg-[#121b30]/80 border border-white/5 rounded-bl-sm' : 'bg-white/10 border border-white/10 rounded-br-sm'}`}>
                             <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                               <span className="material-symbols-outlined text-blue-400">insert_drive_file</span>
                             </div>
                             <div className="flex flex-col pr-4 overflow-hidden">
                               <span className="text-sm font-semibold text-white truncate max-w-[200px]">{item.file_name}</span>
                               <span className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Document</span>
                             </div>
                             <a href={`${import.meta.env.VITE_API_BASE_URL}${item.file_url}`} target="_blank" rel="noopener noreferrer" className="mr-2 p-2 rounded-full bg-black/20 hover:bg-blue-500 hover:text-white text-slate-300 transition-colors cursor-pointer">
                               <span className="material-symbols-outlined text-[18px]">download</span>
                             </a>
                          </div>
                        )}
                      </div>

                      {/* FREELANCER CHAT AVATAR */}
                      {!item.is_client && (
                        <div className="size-8 rounded-full bg-blue-500/20 bg-cover bg-center shrink-0 flex items-center justify-center text-xs font-bold border border-blue-500/30 shadow-lg text-blue-300" style={{ backgroundImage: getProfileImage(freelancerAvatar) }}>
                           {!freelancerAvatar && item.sender.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl">
                  <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 bg-[#0a0f1c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
                    <button type="button" onClick={() => fileInputRef.current.click()} disabled={activeProject.status === "Completed" || uploading} className={`p-2 rounded-xl flex items-center justify-center transition-colors ${activeProject.status === "Completed" ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5 cursor-pointer'}`} title="Attach File">
                      <span className={`material-symbols-outlined text-[22px] ${uploading ? 'animate-pulse text-indigo-400' : ''}`}>{uploading ? 'cloud_sync' : 'attach_file'}</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <input className="bg-transparent border-none text-white text-[15px] w-full focus:ring-0 outline-none px-2 disabled:opacity-50" placeholder={activeProject.status === "Completed" ? "Project completed. Resume to send messages." : "Type a message or attach a file..."} type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={activeProject.status === "Completed"} />
                    <button type="submit" disabled={activeProject.status === "Completed" || !newMessage.trim()} className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${activeProject.status === "Completed" || !newMessage.trim() ? 'bg-transparent text-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer hover:scale-105'}`}>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                  </form>
                </div>
              </section>

              <aside className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col bg-white/[0.01] border-l border-white/[0.05] h-full backdrop-blur-3xl ${showAssets ? 'w-[360px] translate-x-0 opacity-100' : 'w-0 translate-x-full opacity-0 border-none'}`}>
                <div className="flex flex-col h-full min-w-[360px]">
                  <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2"><span className="material-symbols-outlined text-blue-400">folder_zip</span> Assets</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
                    <button
                      onClick={() => fileInputRef.current.click()}
                      disabled={activeProject.status === "Completed" || uploading}
                      className={`w-full py-8 border border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${activeProject.status === "Completed" ? 'border-white/10 opacity-50 cursor-not-allowed' : 'border-white/20 hover:border-blue-500 hover:bg-blue-500/5 cursor-pointer group bg-[#0d1323]'}`}
                    >
                      <span className={`material-symbols-outlined text-3xl mb-2 transition-colors ${uploading ? 'text-blue-400 animate-pulse' : 'text-slate-500 group-hover:text-blue-400'}`}>
                        {uploading ? 'cloud_sync' : 'cloud_upload'}
                      </span>
                      <span className="text-sm font-medium text-slate-300">{uploading ? 'Uploading...' : 'Upload Media'}</span>
                    </button>

                    <div className="space-y-3">
                      {activeProject.files && activeProject.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-[#0d1323] border border-white/5 rounded-xl group hover:bg-[#121b30] transition-all duration-300 shadow-lg">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-blue-400 text-[18px]">description</span>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-medium text-slate-200 truncate" title={file.file_name}>{file.file_name}</span>
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Sent by {file.uploaded_by || 'Unknown'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0">
                            <a href={`${import.meta.env.VITE_API_BASE_URL}${file.file}`} target="_blank" rel="noopener noreferrer" className="size-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Download"><span className="material-symbols-outlined text-[16px]">download</span></a>
                            <button onClick={() => handleDeleteFile(file.id)} disabled={activeProject.status === "Completed"} className={`size-7 flex items-center justify-center rounded-lg transition-colors ${activeProject.status === "Completed" ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer'}`} title="Delete"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(!activeProject.files || activeProject.files.length === 0) && !uploading && (
                       <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm mt-4">
                         <span className="material-symbols-outlined text-4xl mb-3 opacity-20">inventory</span>
                         No assets attached.
                       </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity">
          <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <h2 className="text-2xl font-bold text-white mb-6">New {activeClient?.name} Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-2">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">Project Title</label>
                <input autoFocus required value={newProjectTitle} onChange={(e) => { setNewProjectTitle(e.target.value); if (projectError) setProjectError(""); }} type="text" className={`w-full bg-[#04060a] border ${projectError ? 'border-rose-500/50 focus:ring-rose-500/50' : 'border-white/10 focus:ring-blue-500/50'} rounded-xl px-4 py-3 text-white focus:ring-2 outline-none transition-all placeholder-slate-700`} placeholder="e.g. Scenoxis Showreel" />
              </div>
              <div className="h-5">
                {projectError && <p className="text-rose-400 text-xs font-medium flex items-center gap-1 animate-pulse"><span className="material-symbols-outlined text-[14px]">error</span>{projectError}</p>}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button type="button" onClick={closeProjectModal} className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all cursor-pointer">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity">
          <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
            <h2 className="text-2xl font-bold text-white mb-6">Add New Client</h2>
            <form onSubmit={handleCreateClient} className="space-y-2">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">Client Name</label>
                <input autoFocus required value={newClientName} onChange={(e) => { setNewClientName(e.target.value); if (clientError) setClientError(""); }} type="text" className={`w-full bg-[#04060a] border ${clientError ? 'border-rose-500/50 focus:ring-rose-500/50' : 'border-white/10 focus:ring-emerald-500/50'} rounded-xl px-4 py-3 text-white focus:ring-2 outline-none transition-all placeholder-slate-700`} placeholder="e.g. TechCorp Inc." />
              </div>
              <div className="h-5">
                {clientError && <p className="text-rose-400 text-xs font-medium flex items-center gap-1 animate-pulse"><span className="material-symbols-outlined text-[14px]">error</span>{clientError}</p>}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button type="button" onClick={closeClientModal} className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all cursor-pointer">Add Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;