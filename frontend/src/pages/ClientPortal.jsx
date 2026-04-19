import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const ClientPortal = () => {
  const { magicLinkId } = useParams();

  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAssets, setShowAssets] = useState(false);

  // Chat & Upload States
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Ref for client uploading their own avatar
  const clientAvatarUploadRef = useRef(null);

const getProfileImage = (imagePath) => {
    if (!imagePath) return 'none';
    return imagePath.startsWith('http') ? `url('${imagePath}')` : `url(${import.meta.env.VITE_API_BASE_URL}${imagePath})`;
  };

  // 1. Initial Load
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/portal/${magicLinkId}/`)
      .then(async (res) => {
        if (!res.ok) throw new Error("This magic link is invalid or has expired.");
        return res.json();
      })
      .then(data => {
        setClient(data.client);
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [magicLinkId]);

  // 2. THE WHATSAPP FIX: Silent Background Polling using 3 second polling, no web socket for now
  useEffect(() => {
    if (!activeProject) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/portal/${magicLinkId}/`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);

          const updatedActive = data.projects.find(p => p.id === activeProject.id);
          if (updatedActive) {
            if (updatedActive.messages.length !== activeProject.messages.length ||
                (updatedActive.files && updatedActive.files.length !== (activeProject.files?.length || 0)) ||
                updatedActive.status !== activeProject.status) {
              setActiveProject(updatedActive);
            }
          }
        }
      } catch (err) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [activeProject, magicLinkId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeProject?.messages, activeProject?.files]);

  // --- CLIENT AVATAR UPLOAD ---
  const handleClientAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_image', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/portal/${magicLinkId}/upload_photo/`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const updatedClient = await response.json();
        setClient(updatedClient);
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      e.target.value = null;
    }
  };

  // 3. Handle Text Messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeProject || activeProject.status === "Completed") return;

    setSending(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/portal/${magicLinkId}/projects/${activeProject.id}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setActiveProject(prev => ({ ...prev, messages: [...prev.messages, sentMessage] }));
        setNewMessage("");
      }
    } catch (error) { console.error("Failed to send message:", error); }
    finally { setSending(false); }
  };

  // 4. Handle Request to Reopen
  const handleRequestReopen = async () => {
    if (!activeProject) return;

    setSending(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/portal/${magicLinkId}/projects/${activeProject.id}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: "⚠️ I would like to request a revision and reopen this project." })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setActiveProject(prev => ({ ...prev, messages: [...prev.messages, sentMessage] }));
      }
    } catch (error) { console.error("Failed to request reopen:", error); }
    finally { setSending(false); }
  };

  // 5. Handle Raw File Uploads
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeProject || activeProject.status === "Completed") return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/portal/${magicLinkId}/projects/${activeProject.id}/files/`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const newFile = await response.json();
        setActiveProject(prev => ({ ...prev, files: [...(prev.files || []), newFile] }));
      }
    } catch (error) { console.error("Failed to upload file:", error); }
    finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  // Timeline Builder
  let chatTimeline = [];
  if (activeProject) {
    const textMsgs = (activeProject.messages || []).map(m => ({ ...m, type: 'text', sortDate: new Date(m.timestamp) }));
    const fileMsgs = (activeProject.files || []).map(f => ({
      id: `file-${f.id}`, type: 'file', sender: f.uploaded_by || 'Unknown', is_client: f.is_client,
      file_name: f.file_name, file_url: f.file, timestamp: f.uploaded_at, sortDate: new Date(f.uploaded_at)
    }));
    chatTimeline = [...textMsgs, ...fileMsgs].sort((a, b) => a.sortDate - b.sortDate);
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#070b14] text-indigo-400">Loading Secure Portal...</div>;
  if (error || !client) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#070b14] text-slate-200">
      <span className="material-symbols-outlined text-6xl text-rose-500 mb-4">gpp_maybe</span>
      <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
      <p className="text-slate-400">{error || "Could not load workspace."}</p>
    </div>
  );

  return (
    <div className="bg-[#070b14] font-display text-slate-200 h-screen overflow-hidden flex selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* HIDDEN INPUT FOR CLIENT AVATAR UPLOAD */}
      <input type="file" ref={clientAvatarUploadRef} onChange={handleClientAvatarUpload} className="hidden" accept="image/*" />

      {/* SIDEBAR */}
      <aside className="w-[280px] h-full flex flex-col bg-white/[0.02] border-r border-white/5 flex-shrink-0 z-20 backdrop-blur-2xl">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-6" onClick={() => setActiveProject(null)} style={{cursor: 'pointer'}}>
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 size-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <span className="material-symbols-outlined text-white text-2xl">movie_edit</span>
            </div>
            <div>
              <h1 className="text-white text-lg font-bold tracking-tight truncate w-36">Scenoxis</h1>
              <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest opacity-80">Client Portal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
          <div>
            <h3 className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Your Projects</h3>
            <div className="space-y-2">
              {projects.map((proj) => (
                <button key={proj.id} onClick={() => setActiveProject(proj)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer group ${activeProject?.id === proj.id ? 'bg-indigo-500/20 border border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  <span className={`material-symbols-outlined text-[20px] ${activeProject?.id === proj.id ? 'text-indigo-400' : ''}`}>videocam</span>
                  <span className="text-sm font-medium truncate text-left flex-1">{proj.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CLICKABLE CLIENT PROFILE CARD */}
        <div className="p-4 border-t border-white/[0.05]">
          <div onClick={() => clientAvatarUploadRef.current.click()} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors cursor-pointer" title="Update Profile Picture">
             <div className="size-9 rounded-full bg-[#0d1323] bg-cover bg-center shrink-0 flex items-center justify-center text-xs font-bold border border-white/10 relative overflow-hidden" style={{ backgroundImage: getProfileImage(client.profile_image) }}>
                 {!client.profile_image && client.name.charAt(0)}
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="material-symbols-outlined text-[16px] text-white">camera_alt</span>
                 </div>
             </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">{client.name}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Guest Access</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#070b14] to-[#04060a]">

        {!activeProject && (
          <div className="flex-1 overflow-y-auto p-10 z-10 flex flex-col items-center">
            {/* CLICKABLE LARGE AVATAR */}
            <div className="mt-16 mb-6">
              <div onClick={() => clientAvatarUploadRef.current.click()} className="size-24 md:size-32 rounded-full bg-[#0d1323] bg-cover bg-center border border-white/10 shadow-2xl relative group cursor-pointer overflow-hidden flex items-center justify-center" style={{ backgroundImage: getProfileImage(client.profile_image) }} title="Update Profile Picture">
                  {!client.profile_image && <span className="text-4xl font-bold text-slate-500">{client.name.charAt(0)}</span>}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <span className="material-symbols-outlined text-3xl text-white">camera_alt</span>
                  </div>
              </div>
            </div>

            <div className="text-center max-w-5xl mx-auto w-full">
              <div className="mb-10 pb-6 border-b border-white/10">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome, {client.name.split(' ')[0]}</h1>
                <p className="text-indigo-400 text-sm font-medium">Select a project from the sidebar to review deliverables.</p>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-sm mx-auto max-w-2xl">
                  <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">movie</span>
                  <p className="text-slate-400 font-medium">Your agency hasn't uploaded any projects yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                  {projects.map(proj => (
                    <div key={proj.id} onClick={() => setActiveProject(proj)} className="group bg-[#0d1323]/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-[#121b30] hover:border-indigo-500/50 transition-all duration-300 cursor-pointer shadow-lg relative min-h-[160px] flex flex-col justify-between">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border mb-3 inline-block ${proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{proj.status}</span>
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors pr-12">{proj.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeProject && (
          <div className="flex flex-col h-full w-full z-10 relative">
            <header className="h-16 border-b border-white/[0.05] flex items-center justify-between px-6 bg-white/[0.02] backdrop-blur-xl shrink-0 shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveProject(null)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer mr-2"><span className="material-symbols-outlined">arrow_back</span></button>
                <h2 className="text-white text-lg font-bold flex items-center gap-3">
                  {activeProject.title}
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${activeProject.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{activeProject.status}</span>
                </h2>
              </div>
              <button onClick={() => setShowAssets(!showAssets)} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 border cursor-pointer ${showAssets ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-[#0d1323] text-slate-300 hover:text-white hover:bg-[#121b30] border-white/10'}`}>
                <span className="material-symbols-outlined text-[18px]">inventory_2</span><span>Assets</span>
              </button>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
              <section className="flex-1 flex flex-col min-w-0 relative">
                <div className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col scroll-smooth pb-32 custom-scrollbar">
                  {chatTimeline.map((item) => (
                    <div key={item.id} className={`flex items-end gap-3 group ${item.is_client ? 'justify-end' : ''}`}>

                      {/* FREELANCER (AGENCY) AVATAR */}
                      {!item.is_client && (
                        <div
                          className="size-8 rounded-full bg-[#0d1323] bg-cover bg-center shrink-0 flex items-center justify-center text-xs font-bold border border-white/10 shadow-lg text-indigo-300 overflow-hidden"
                          style={{ backgroundImage: activeProject?.agency_image ? getProfileImage(activeProject.agency_image) : 'none' }}
                        >
                          {!activeProject?.agency_image && (item.sender ? item.sender.charAt(0).toUpperCase() : 'A')}
                        </div>
                      )}

                      {/* MESSAGE BUBBLE */}
                      <div className={`flex flex-col gap-1.5 max-w-[75%] ${item.is_client ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <span className={`text-[10px] font-medium tracking-wide ${item.is_client ? 'text-blue-400' : 'text-slate-400'}`}>{item.is_client ? 'You' : item.sender}</span>
                           <span className="text-[10px] text-slate-600">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>

                        {item.type === 'text' && (
                          <div className={`px-5 py-3.5 shadow-xl backdrop-blur-md ${!item.is_client ? 'bg-[#121b30]/80 border border-white/5 text-slate-200 rounded-2xl rounded-bl-sm' : 'bg-gradient-to-br from-blue-600 to-indigo-600 border border-indigo-500/30 text-white rounded-2xl rounded-br-sm'}`}>
                            <p className="text-[15px] leading-relaxed">{item.content}</p>
                          </div>
                        )}
                        {item.type === 'file' && (
                          <div className={`p-1.5 shadow-xl backdrop-blur-md rounded-2xl flex items-center gap-3 ${!item.is_client ? 'bg-[#121b30]/80 border border-white/5 rounded-bl-sm' : 'bg-white/10 border border-white/10 rounded-br-sm'}`}>
                             <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                               <span className="material-symbols-outlined text-blue-400">insert_drive_file</span>
                             </div>
                             <div className="flex flex-col pr-4 overflow-hidden">
                               <span className="text-sm font-semibold text-white truncate max-w-[200px]">{item.file_name}</span>
                             </div>
                             <a href={`${import.meta.env.VITE_API_BASE_URL}${item.file_url}`} target="_blank" rel="noopener noreferrer" className="mr-2 p-2 rounded-full bg-black/20 hover:bg-blue-500 hover:text-white text-slate-300 transition-colors cursor-pointer"><span className="material-symbols-outlined text-[18px]">download</span></a>
                          </div>
                        )}
                      </div>

                      {/* CLIENT AVATAR */}
                      {item.is_client && (
                        <div
                          className="size-8 rounded-full bg-[#0d1323] bg-cover bg-center shrink-0 flex items-center justify-center text-xs font-bold border border-white/10 shadow-lg text-slate-300 overflow-hidden"
                          style={{ backgroundImage: getProfileImage(client.profile_image) }}
                        >
                          {!client.profile_image && client.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* DYNAMIC CHAT INPUT / REOPEN REQUEST BLOCK */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl">
                  {activeProject.status === "Completed" ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0a0f1c]/90 backdrop-blur-2xl border border-rose-500/20 rounded-2xl p-4 shadow-2xl">
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <div className="size-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-rose-400">lock</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Project Locked</p>
                          <p className="text-slate-400 text-xs">This workspace is completed. Need changes?</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRequestReopen}
                        disabled={sending}
                        className="w-full sm:w-auto px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">lock_open</span>
                        {sending ? 'Sending Request...' : 'Request Revision'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 bg-[#0a0f1c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-blue-500/50">

                      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="size-10 shrink-0 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl flex items-center justify-center transition-all cursor-pointer mb-0.5 ml-0.5 disabled:opacity-50"
                        title="Attach File"
                      >
                        <span className={`material-symbols-outlined ${uploading ? 'animate-spin' : ''}`}>{uploading ? 'sync' : 'attach_file'}</span>
                      </button>

                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Type a message or attach raw files..."
                        className="w-full bg-transparent text-slate-200 placeholder-slate-500 text-sm px-2 py-3 outline-none resize-none max-h-32 min-h-[44px] custom-scrollbar"
                        rows="1"
                      />

                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="size-10 shrink-0 rounded-xl flex items-center justify-center transition-all mb-0.5 mr-0.5 shadow-[0_0_15px_rgba(37,99,235,0.4)] bg-blue-600 hover:bg-blue-500 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[20px] ml-1">{sending ? 'hourglass_empty' : 'send'}</span>
                      </button>
                    </form>
                  )}
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
                      className={`w-full py-8 border border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${activeProject.status === "Completed" ? 'border-white/5 bg-[#0a0f1c] opacity-50 cursor-not-allowed' : 'border-white/20 hover:border-blue-500 hover:bg-blue-500/5 cursor-pointer group bg-[#0d1323]'}`}
                    >
                      <span className={`material-symbols-outlined text-3xl mb-2 transition-colors ${uploading ? 'text-blue-400 animate-pulse' : 'text-slate-500 group-hover:text-blue-400'}`}>
                        {uploading ? 'cloud_sync' : activeProject.status === 'Completed' ? 'lock' : 'cloud_upload'}
                      </span>
                      <span className="text-sm font-medium text-slate-300">{uploading ? 'Uploading...' : activeProject.status === 'Completed' ? 'Project Locked' : 'Upload Media'}</span>
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
                            </div>
                          </div>
                          <a href={`${import.meta.env.VITE_API_BASE_URL}${file.file}`} target="_blank" rel="noopener noreferrer" className="size-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"><span className="material-symbols-outlined text-[16px]">download</span></a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientPortal;