'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Folder, FileCode, GitBranch, Terminal, Play, Search, Mic, 
  Share2, ShieldCheck, CheckCircle2, ChevronRight, ChevronDown, 
  Layers, UploadCloud, RefreshCw, Send, Sparkles, Volume2, ArrowRight,
  AlertCircle, FileText, Loader2, X, HardDrive, Cpu, Check,
  GitPullRequest, ExternalLink, Lock, Unlock, Star, LogOut, Network, MessageSquare
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

function GithubIcon({ size = 16, color = "currentColor", style = {} }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={style}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function DevStudioPage() {
  const { user, isLoaded } = useUser();
  const workspaceId = user?.id || 'ws_dev_primary';
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' (default) | 'code'
  const [mobilePanel, setMobilePanel] = useState('chat'); // 'explorer' | 'chat' | 'graph'
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryStep, setQueryStep] = useState('Inspecting codebase & structure...');
  const chatEndRef = useRef(null);
  const [highlightLines, setHighlightLines] = useState(null); // { start: number, end: number }
  const [astCallers, setAstCallers] = useState([]);
  const [activeFileSymbols, setActiveFileSymbols] = useState([]);
  const [activeGrounding, setActiveGrounding] = useState(null); // Grounding & AST evidence from active response

  // Upload Modal & Lifecycle State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('github'); // 'github' | 'local'
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  const [queuePosition, setQueuePosition] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // GitHub Auto-Fetch State
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [githubTokenInput, setGithubTokenInput] = useState('');
  const [connectingGithub, setConnectingGithub] = useState(false);
  const [githubConnectError, setGithubConnectError] = useState(null);

  // File tree & workspace stats
  const [treeData, setTreeData] = useState([]);
  const [treeStats, setTreeStats] = useState({
    has_uploaded: false,
    is_demo: false,
    total_files: 0,
    total_loc: 0,
    total_functions: 0,
    total_classes: 0,
    specs: []
  });

  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: 'Welcome to Developer Code Studio. Ask any question about your connected repository in English or Hinglish. I will provide deterministic AST citations, line numbers, and caller graphs.',
      citations: [],
      callers: []
    }
  ]);

  // Check GitHub Connection Status
  const checkGithubStatus = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/code/github/status?workspace_id=${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        setGithubConnected(data.connected);
        if (data.connected) {
          setGithubUser({
            username: data.username,
            name: data.name,
            avatar_url: data.avatar_url
          });
          setGithubRepos(data.repos || []);
          if (data.repos && data.repos.length > 0) {
            const activeRepo = selectedRepo || data.repos[0].full_name;
            const activeBranch = selectedBranch || data.repos[0].default_branch || 'main';
            setSelectedRepo(activeRepo);
            setSelectedBranch(activeBranch);
            loadTree(activeRepo, activeBranch);
          }
        }
      }
    } catch (err) {
      console.warn('Could not check GitHub status:', err);
    }
  };

  // Connect GitHub via Personal Access Token (PAT)
  const handleGithubConnectToken = async (e) => {
    e?.preventDefault();
    if (!githubTokenInput.trim() || connectingGithub) return;

    setConnectingGithub(true);
    setGithubConnectError(null);

    try {
      const res = await fetch(`${getApiUrl()}/api/v1/code/github/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          github_token: githubTokenInput.trim()
        })
      });

      if (res.ok) {
        setGithubTokenInput('');
        await checkGithubStatus();
      } else {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to connect GitHub token');
      }
    } catch (err) {
      setGithubConnectError(err.message || 'Verification failed. Please check token permissions.');
    } finally {
      setConnectingGithub(false);
    }
  };

  // Disconnect GitHub
  const handleGithubDisconnect = async () => {
    try {
      await fetch(`${getApiUrl()}/api/v1/code/github/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspaceId })
      });
      setGithubConnected(false);
      setGithubUser(null);
      setGithubRepos([]);
      setSelectedRepo('');
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  // Auto-Fetch & Ingest GitHub Repository
  const handleGithubAutoFetch = async (e) => {
    e?.preventDefault();
    if (!selectedRepo || uploading) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(10);
    setUploadStep(`Requesting ${selectedRepo} (${selectedBranch}) from GitHub...`);

    try {
      const res = await fetch(`${getApiUrl()}/api/v1/code/github/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          repo_full_name: selectedRepo,
          branch: selectedBranch || 'main',
          plan_tier: 'free'
        })
      });

      if (res.status === 202) {
        const data = await res.json();
        const jobId = data.job_id;
        setQueuePosition(data.queue_position || 1);
        setUploadStep('Job queued. Waiting in rate-limit buffer...');

        const pollInterval = setInterval(async () => {
          try {
            const jobRes = await fetch(`${getApiUrl()}/api/v1/code/jobs/${jobId}`);
            if (jobRes.ok) {
              const job = await jobRes.json();
              setUploadProgress(job.progress_pct || 20);
              setUploadStep(job.current_step || 'Processing...');
              setQueuePosition(job.queue_position || 0);

              if (job.status === 'completed') {
                clearInterval(pollInterval);
                setUploading(false);
                setUploadSuccess(true);
                setUploadProgress(100);
                setUploadStep('Completed! AST Indexed & Synced.');
                await loadTree();
                setTimeout(() => {
                  setUploadModalOpen(false);
                  setUploadSuccess(false);
                }, 1400);
              } else if (job.status === 'failed') {
                clearInterval(pollInterval);
                setUploading(false);
                setUploadError(job.error || 'GitHub auto-fetch failed.');
              }
            }
          } catch (pErr) {
            console.error('Polling error:', pErr);
          }
        }, 800);

      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Auto-fetch request rejected.');
      }
    } catch (err) {
      setUploading(false);
      setUploadError(err.message || 'Failed to auto-fetch repository.');
    }
  };

  // Load Tree Data from Backend
  const loadTree = async (targetRepo, targetBranch) => {
    try {
      const repoParam = targetRepo || selectedRepo;
      const branchParam = targetBranch || selectedBranch;
      const queryParams = new URLSearchParams({ workspace_id: workspaceId });
      if (repoParam) queryParams.append('repo', repoParam);
      if (branchParam) queryParams.append('branch', branchParam);

      const res = await fetch(`${getApiUrl()}/api/v1/code/tree?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTreeData(data.tree || []);
        setTreeStats({
          has_uploaded: data.has_uploaded || false,
          is_demo: data.is_demo === true,
          total_files: data.total_files || 0,
          total_loc: data.total_loc || 0,
          total_functions: data.total_functions || 0,
          total_classes: data.total_classes || 0,
          specs: data.specs || []
        });

        // Auto-select first real file if available
        if (data.first_file) {
          setSelectedFile(prev => {
            if (!prev || targetRepo) {
              loadFileContent(data.first_file, repoParam, branchParam);
              return data.first_file;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.warn('Could not fetch backend tree, using initial cache:', err);
    }
  };

  // Load File Content & Extract Symbols
  const loadFileContent = async (filePath, targetRepo, targetBranch, isExplicitUserClick = false) => {
    if (!filePath) return;
    try {
      const repoParam = targetRepo || selectedRepo;
      const branchParam = targetBranch || selectedBranch;
      const queryParams = new URLSearchParams({
        workspace_id: workspaceId,
        path: filePath
      });
      if (repoParam) queryParams.append('repo', repoParam);
      if (branchParam) queryParams.append('branch', branchParam);

      const res = await fetch(`${getApiUrl()}/api/v1/code/file?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFileContent(data.content || '');

        // Extract and map AST symbols
        const funcs = (data.functions || []).map(f => `${f}()`);
        const classes = data.classes || [];
        const symbols = [...classes, ...funcs];
        setActiveFileSymbols(symbols);

        // Populate AST call graph only if explicit user file exploration or no active query grounding
        if (isExplicitUserClick || !activeGrounding) {
          if (data.calls && data.calls.length > 0) {
            setAstCallers(data.calls.slice(0, 6).map((call, idx) => ({
              name: call,
              file: filePath,
              role: idx === 0 ? 'Direct Callee' : 'AST Dependency',
              line: 'Call Site',
              start_line: 1,
              end_line: data.loc || 50,
              type: 'function'
            })));
          } else if (symbols.length > 0) {
            setAstCallers(symbols.slice(0, 4).map((sym, idx) => ({
              name: sym,
              file: filePath,
              role: sym.endsWith('()') ? 'Extracted Function' : 'Defined Class',
              line: `L1-L${data.loc || 50}`,
              start_line: 1,
              end_line: data.loc || 50,
              type: sym.endsWith('()') ? 'function' : 'class'
            })));
          } else {
            setAstCallers([]);
          }
        }
      } else {
        throw new Error('Failed to load file');
      }
    } catch (err) {
      setFileContent(`# Source code for ${filePath}\n\n# AST symbols extracted and indexed into Neo4j Code Graph.`);
      setActiveFileSymbols([]);
      if (isExplicitUserClick) setAstCallers([]);
    }
  };

  useEffect(() => {
    checkGithubStatus();
    loadTree();

    // Auto-open modal if returning from GitHub OAuth
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('github') === 'connected' || params.get('status') === 'success') {
        setUploadModalOpen(true);
        setModalTab('github');
        checkGithubStatus();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [workspaceId, isLoaded]);

  useEffect(() => {
    if (selectedFile) {
      loadFileContent(selectedFile);
    }
  }, [selectedFile]);

  // Auto-scroll to bottom of chat on new message or thinking state
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isQuerying, activeTab]);

  // Handle Local Upload Submission
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || uploading) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(5);
    setUploadStep('Connecting to ingestion pipeline...');

    const formData = new FormData();
    formData.append('workspace_id', workspaceId);
    formData.append('plan_tier', 'free');
    formData.append('file', uploadFile);

    try {
      const res = await fetch(`${getApiUrl()}/api/v1/code/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.status === 202) {
        const data = await res.json();
        const jobId = data.job_id;
        setQueuePosition(data.queue_position || 1);
        setUploadStep('Job queued. Waiting in rate-limit buffer...');

        const pollInterval = setInterval(async () => {
          try {
            const jobRes = await fetch(`${getApiUrl()}/api/v1/code/jobs/${jobId}`);
            if (jobRes.ok) {
              const job = await jobRes.json();
              setUploadProgress(job.progress_pct || 15);
              setUploadStep(job.current_step || 'Processing...');
              setQueuePosition(job.queue_position || 0);

              if (job.status === 'completed') {
                clearInterval(pollInterval);
                setUploading(false);
                setUploadSuccess(true);
                setUploadProgress(100);
                setUploadStep('Completed! AST Indexed & Synced.');
                await loadTree();
                setTimeout(() => {
                  setUploadModalOpen(false);
                  setUploadFile(null);
                  setUploadSuccess(false);
                }, 1400);
              } else if (job.status === 'failed') {
                clearInterval(pollInterval);
                setUploading(false);
                setUploadError(job.error || 'Ingestion failed due to rate limits or quota overflow.');
              }
            }
          } catch (pErr) {
            console.error('Job polling error:', pErr);
          }
        }, 800);

      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Upload failed with status ${res.status}`);
      }
    } catch (err) {
      setUploading(false);
      setUploadError(err.message || 'Network error during upload.');
    }
  };

  // Real Live Sarvam Saaras STT Voice Capture via Browser MediaRecorder
  const handleVoiceToggle = async () => {
    if (isListening) {
      // Stop recording
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping MediaRecorder:', err);
      }
      setIsListening(false);
      return;
    }

    // Start audio recording
    try {
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        alert("Your browser does not support audio recording. Please use Chrome, Edge, or Brave.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        // Stop audio tracks to release microphone hardware indicator
        stream.getTracks().forEach(track => track.stop());

        if (audioBlob.size > 300) {
          await processVoiceAudio(audioBlob, mimeType);
        } else {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      setIsListening(false);
      alert("Microphone permission denied or not available. Please allow microphone access to speak queries via Sarvam AI.");
    }
  };

  const processVoiceAudio = async (audioBlob, mimeType) => {
    setIsTranscribing(true);
    try {
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const formData = new FormData();
      formData.append('file', audioBlob, `voice_query.${ext}`);

      const res = await fetch(`${getApiUrl()}/api/v1/voice/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transcript && data.transcript.trim()) {
          setQuery(data.transcript.trim());
        } else {
          alert("Sarvam AI processed the audio, but detected no intelligible speech. Please try speaking closer to your mic.");
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned status ${res.status}`);
      }
    } catch (err) {
      console.error("Sarvam Voice transcription error:", err);
      alert(`Voice transcription failed: ${err.message || 'Could not connect to Sarvam AI'}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Submit code query
  const handleQuerySubmit = async (e) => {
    e?.preventDefault();
    if (!query.trim() || isQuerying) return;

    const userQ = query;
    setQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userQ }]);
    setIsQuerying(true);
    setQueryStep('Inspecting repository AST symbols & structure...');
    setActiveTab('chat');

    const t1 = setTimeout(() => {
      setQueryStep('Traversing call graphs & architectural specs...');
    }, 1400);
    const t2 = setTimeout(() => {
      setQueryStep('Synthesizing verified response with Groq (gpt-oss-120b)...');
    }, 3200);

    try {
      const res = await fetch(`${getApiUrl()}/api/v1/code/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          query: userQ,
          repo: selectedRepo,
          branch: selectedBranch || 'main',
          voice_transcribed: isListening
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Parse callers dynamically preserving all genuine metadata
        const updatedCallers = (data.ast_callers || []).map((c, idx) => {
          if (typeof c === 'object' && c !== null) {
            return {
              name: c.name || 'Anonymous',
              file: c.file || '',
              role: c.role || (idx === 0 ? 'Entrypoint Caller' : 'Intermediate Callee'),
              line: c.line || (c.start_line ? `L${c.start_line}-L${c.end_line}` : 'Line Ref'),
              start_line: c.start_line,
              end_line: c.end_line,
              type: c.type || 'function'
            };
          }
          const matchingCitation = data.citations?.[idx] || data.citations?.[0];
          return {
            name: c,
            file: matchingCitation?.file || '',
            role: idx === 0 ? 'Entrypoint / Caller' : idx === data.ast_callers.length - 1 ? 'Target Callee' : 'Intermediate Caller',
            line: matchingCitation ? `L${matchingCitation.start_line}-L${matchingCitation.end_line}` : 'Line Ref',
            start_line: matchingCitation?.start_line,
            end_line: matchingCitation?.end_line,
            type: 'function'
          };
        });

        const newGrounding = {
          query: userQ,
          citations: data.citations || [],
          callers: updatedCallers
        };

        setActiveGrounding(newGrounding);
        setAstCallers(updatedCallers);

        setChatHistory(prev => [
          ...prev, 
          {
            role: 'assistant',
            text: data.answer,
            citations: data.citations || [],
            callers: updatedCallers,
            latency_ms: data.latency_ms
          }
        ]);

        if (data.citations && data.citations[0]) {
          const topCit = data.citations[0];
          setSelectedFile(topCit.file);
          loadFileContent(topCit.file, selectedRepo, selectedBranch, false);
          setHighlightLines({ start: topCit.start_line, end: topCit.end_line });
        }

      } else {
        throw new Error('API query failed');
      }
    } catch (err) {
      setChatHistory(prev => [
        ...prev, 
        {
          role: 'assistant',
          text: `⚠️ Query could not be processed: ${err.message || 'API connection failed'}. Please verify backend status and try again.`,
          citations: [],
          callers: [],
          latency_ms: 0
        }
      ]);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsQuerying(false);
    }
  };

  const handleCitationClick = (citation) => {
    if (!citation || !citation.file) return;
    setSelectedFile(citation.file);
    loadFileContent(citation.file, selectedRepo, selectedBranch, false);
    if (citation.start_line && citation.end_line) {
      setHighlightLines({ start: citation.start_line, end: citation.end_line });
    }
    setActiveTab('code');
    setMobilePanel('chat');
  };

  const renderTreeNode = (node, depth = 0) => {
    if (node.type === 'directory') {
      return (
        <div key={node.name} style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 600, padding: '4px 6px', paddingLeft: `${depth * 14 + 6}px`, cursor: 'pointer' }}>
            <Folder size={14} color="#38BDF8" /> {node.name}
          </div>
          {node.children && node.children.map(child => renderTreeNode(child, depth + 1))}
        </div>
      );
    }

    const isSelected = selectedFile === node.path;
    return (
      <div 
        key={node.path || node.name}
        onClick={() => { 
          setSelectedFile(node.path); 
          loadFileContent(node.path, selectedRepo, selectedBranch, true);
          setHighlightLines(null); 
          setActiveTab('code'); 
          setMobilePanel('chat');
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          paddingLeft: `${depth * 14 + 8}px`,
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          background: isSelected ? 'rgba(99, 91, 255, 0.15)' : 'transparent',
          color: isSelected ? '#FFFFFF' : '#94A3B8',
          fontWeight: isSelected ? 600 : 400
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileCode size={14} color={isSelected ? '#818CF8' : '#64748B'} />
          <span>{node.name}</span>
        </div>
        {node.loc && <span style={{ fontSize: '0.7rem', color: '#475569' }}>{node.loc}L</span>}
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      maxHeight: '100%',
      background: '#0B0F19', 
      color: '#E2E8F0',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      
      {/* Top Studio Action Bar */}
      <div style={{
        height: '46px',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99, 91, 255, 0.2)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCode size={16} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>Developer Code Studio</span>
          </div>

          <span style={{ color: '#475569' }}>|</span>

          {/* Connected GitHub / Branch Picker */}
          {githubConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', color: '#94A3B8', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <GithubIcon size={13} color="#FFFFFF" />
              {githubRepos && githubRepos.length > 0 ? (
                <select
                  value={selectedRepo}
                  onChange={(e) => {
                    const newRepo = e.target.value;
                    setSelectedRepo(newRepo);
                    const rObj = githubRepos.find(r => r.full_name === newRepo);
                    const newBranch = rObj ? (rObj.default_branch || 'main') : 'main';
                    setSelectedBranch(newBranch);
                    setSelectedFile('');
                    loadTree(newRepo, newBranch);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  title="Switch active repository"
                >
                  {githubRepos.map(r => (
                    <option key={r.id || r.full_name} value={r.full_name} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                      {r.full_name}
                    </option>
                  ))}
                </select>
              ) : (
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{selectedRepo ? selectedRepo.split('/')[1] || selectedRepo : githubUser?.username}</span>
              )}
              <span style={{ color: '#64748B' }}>:</span>
              <GitBranch size={12} color="#818CF8" />
              <span style={{ color: '#818CF8', fontWeight: 600 }}>{selectedBranch}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#94A3B8', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <GitBranch size={13} color="#818CF8" />
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>main</span>
            </div>
          )}

          {/* Dynamic Upload / Sync Status Pill */}
          {treeStats.total_files > 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.12)', color: '#4ADE80', fontWeight: 650, border: '1px solid rgba(34, 197, 94, 0.25)' }}>
              <CheckCircle2 size={13} /> Live: {treeStats.total_files} Files • {treeStats.total_loc.toLocaleString()} LOC • {treeStats.total_functions} Functions Mapped
            </span>
          ) : uploading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8', fontWeight: 650, border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <Loader2 size={13} className="animate-spin" /> Ingesting ({uploadProgress}%) • {uploadStep}
            </span>
          ) : (
            <span 
              onClick={() => setUploadModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '6px', background: 'rgba(234, 179, 8, 0.12)', color: '#FACC15', fontWeight: 650, border: '1px solid rgba(234, 179, 8, 0.25)', cursor: 'pointer' }}
              title="Click to connect GitHub or upload code"
            >
              <AlertCircle size={13} /> Connect Repository
            </span>
          )}

          {/* Rate Limit Protection Badge */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(99, 91, 255, 0.1)', color: '#A5B4FC', border: '1px solid rgba(99, 91, 255, 0.2)' }}>
            <ShieldCheck size={12} /> 6,000 TPM Budget
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => setUploadModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #635BFF 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 650,
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <GithubIcon size={14} color="#FFFFFF" /> Connect / Ingest Repo
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Panel Switcher Bar */}
      <div className="mobile-only" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#0B0F19',
        padding: '6px 12px',
        gap: '8px',
        overflowX: 'auto',
        flexShrink: 0
      }}>
        <button
          onClick={() => setMobilePanel('explorer')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 650,
            border: 'none',
            background: mobilePanel === 'explorer' ? 'rgba(99, 91, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
            color: mobilePanel === 'explorer' ? '#A5B4FC' : '#94A3B8',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Folder size={13} /> Files & Spec
        </button>
        <button
          onClick={() => setMobilePanel('chat')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 650,
            border: 'none',
            background: mobilePanel === 'chat' ? 'rgba(99, 91, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
            color: mobilePanel === 'chat' ? '#A5B4FC' : '#94A3B8',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <MessageSquare size={13} /> Chat & Editor
        </button>
        <button
          onClick={() => setMobilePanel('graph')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 650,
            border: 'none',
            background: mobilePanel === 'graph' ? 'rgba(99, 91, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
            color: mobilePanel === 'graph' ? '#A5B4FC' : '#94A3B8',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Network size={13} /> AST Graph
        </button>
      </div>

      {/* Main 3-Panel Grid */}
      <div className="dev-studio-grid">
        
        {/* PANEL 1: Repo Navigator & AST Symbol Tree */}
        <div className={`dev-studio-panel-explorer ${mobilePanel === 'explorer' ? 'active' : ''}`} style={{ 
          background: '#0B0F19', 
          borderRight: '1px solid rgba(255, 255, 255, 0.08)', 
          minHeight: 0,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '12px 16px', flexShrink: 0, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Repository Explorer</span>
            <button onClick={loadTree} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }} title="Refresh file tree">
              <RefreshCw size={12} />
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px' }}>
            {treeData.length > 0 ? (
              treeData.map(node => renderTreeNode(node))
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#64748B', padding: '10px' }}>
                No files found in workspace.
              </div>
            )}

            {/* Architectural Specs (PDF) Section */}
            {treeStats.specs && treeStats.specs.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#F59E0B', marginBottom: '8px' }}>
                  Architecture Specs (PDF)
                </div>
                {treeStats.specs.map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#CBD5E1', padding: '4px 6px' }}>
                    <FileText size={13} color="#F59E0B" />
                    <span>{s.filename}</span>
                    <span style={{ fontSize: '0.65rem', color: '#64748B', marginLeft: 'auto' }}>{s.pages}p</span>
                  </div>
                ))}
              </div>
            )}

            {/* AST Symbol Index */}
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Extracted AST Symbols</span>
                {activeFileSymbols.length > 0 && (
                  <span style={{ fontSize: '0.65rem', color: '#818CF8' }}>{activeFileSymbols.length}</span>
                )}
              </div>
              {activeFileSymbols.length > 0 ? (
                activeFileSymbols.map((sym, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#CBD5E1', padding: '4px 6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: sym.endsWith('()') ? '#38BDF8' : '#A78BFA' }} />
                    <code>{sym}</code>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.72rem', color: '#64748B', padding: '4px 6px' }}>
                  {selectedFile ? 'No functions or classes extracted in this file' : 'Select a file to inspect AST symbols'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: Code Viewer & AI Code Chatbot */}
        <div className={`dev-studio-panel-chat ${mobilePanel === 'chat' ? 'active' : ''}`} style={{ background: '#0F172A', borderRight: '1px solid rgba(255, 255, 255, 0.08)', minHeight: 0, overflow: 'hidden' }}>
          
          {/* Editor Header Tabs: Code Intelligence Chat FIRST, then selectedFile */}
          <div style={{ height: '38px', flexShrink: 0, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#0B0F19' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setActiveTab('chat')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 650,
                  border: 'none',
                  background: activeTab === 'chat' ? 'rgba(99, 91, 255, 0.2)' : 'transparent',
                  color: activeTab === 'chat' ? '#818CF8' : '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} /> Code Intelligence Chat
              </button>

              <button
                onClick={() => setActiveTab('code')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 650,
                  border: 'none',
                  background: activeTab === 'code' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: activeTab === 'code' ? '#FFFFFF' : '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title={selectedFile || 'Select a file'}
              >
                <FileCode size={14} /> {selectedFile ? selectedFile.split('/').pop() : 'Select File'}
              </button>
            </div>

            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>UTF-8 • AST Line Binding Active</span>
          </div>

          {/* Active View Body */}
          {activeTab === 'code' ? (
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '16px', fontFamily: 'Fira Code, monospace', fontSize: '0.85rem', lineHeight: '1.6', background: '#0B0F19', color: '#CBD5E1' }}>
              {highlightLines && (
                <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'rgba(99, 91, 255, 0.15)', border: '1px solid rgba(99, 91, 255, 0.3)', borderRadius: '6px', fontSize: '0.75rem', color: '#A5B4FC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Highlighting AST citation lines <strong>L{highlightLines.start} - L{highlightLines.end}</strong></span>
                  <button onClick={() => setHighlightLines(null)} style={{ background: 'transparent', border: 'none', color: '#A5B4FC', cursor: 'pointer' }}>Clear</button>
                </div>
              )}
              <pre style={{ margin: 0 }}>
                {fileContent.split('\n').map((line, i) => {
                  const lineNum = i + 1;
                  const isHighlighted = highlightLines && lineNum >= highlightLines.start && lineNum <= highlightLines.end;
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        display: 'flex', 
                        background: isHighlighted ? 'rgba(99, 91, 255, 0.2)' : 'transparent',
                        borderLeft: isHighlighted ? '3px solid #818CF8' : '3px solid transparent'
                      }}
                    >
                      <span style={{ width: '40px', color: isHighlighted ? '#A5B4FC' : '#475569', userSelect: 'none', textAlign: 'right', paddingRight: '16px' }}>{lineNum}</span>
                      <span style={{ color: line.startsWith('async def') || line.startsWith('class') ? '#818CF8' : line.startsWith('import') ? '#F472B6' : line.includes('"""') ? '#34D399' : '#F1F5F9' }}>
                        {line}
                      </span>
                    </div>
                  );
                })}
              </pre>
            </div>
          ) : (
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#0B0F19', overflow: 'hidden' }}>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.role === 'user' ? '#635BFF' : 'rgba(255, 255, 255, 0.05)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                    
                    {msg.citations && msg.citations.length > 0 && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Verified AST Citations (Click to jump to code):</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                          {msg.citations.map((c, idx) => (
                            <span 
                              key={idx} 
                              onClick={() => handleCitationClick(c)}
                              style={{ 
                                fontSize: '0.75rem', 
                                background: 'rgba(99, 91, 255, 0.25)', 
                                color: '#A5B4FC', 
                                padding: '3px 8px', 
                                borderRadius: '4px', 
                                cursor: 'pointer', 
                                fontFamily: 'monospace',
                                border: '1px solid rgba(99, 91, 255, 0.4)'
                              }}
                              title="Click to view file and highlight exact lines in editor"
                            >
                              📍 {c.citation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {Boolean(msg.latency_ms) && (
                      <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#64748B' }}>
                        Traversed in {msg.latency_ms}ms • Deterministic AST Proof
                      </div>
                    )}
                  </div>
                ))}

                {/* Real-time Thinking & Processing Status Card */}
                {isQuerying && (
                  <div style={{
                    alignSelf: 'flex-start',
                    maxWidth: '85%',
                    background: 'rgba(99, 91, 255, 0.08)',
                    border: '1px solid rgba(99, 91, 255, 0.35)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 4px 20px rgba(99, 91, 255, 0.12)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'rgba(99, 91, 255, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Loader2 size={15} className="animate-spin" color="#818CF8" />
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 650, color: '#A5B4FC' }}>
                        AI Code Intelligence Thinking...
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399' }} />
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                        {queryStep}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          {/* Unified Chat & Voice Bar */}
          <form onSubmit={handleQuerySubmit} style={{ flexShrink: 0, borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '10px 14px', background: '#0F172A', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleVoiceToggle}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: isListening ? '1px solid #EF4444' : isTranscribing ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                background: isListening ? 'rgba(239, 68, 68, 0.25)' : isTranscribing ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isListening ? '#EF4444' : isTranscribing ? '#F59E0B' : '#E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isTranscribing ? 'wait' : 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={
                isListening 
                  ? "Recording audio... Click to STOP and transcribe with Sarvam AI" 
                  : isTranscribing 
                  ? "Transcribing with Sarvam AI Saaras STT..." 
                  : "Click to speak via Sarvam AI Saaras (Hindi, Hinglish, Indic, English)"
              }
            >
              {isTranscribing ? (
                <Loader2 size={16} className="animate-spin" color="#F59E0B" />
              ) : (
                <Mic size={16} className={isListening ? 'animate-pulse' : ''} color={isListening ? '#EF4444' : '#E2E8F0'} />
              )}
            </button>

            <input
              type="text"
              placeholder={
                isListening 
                  ? "🔴 Recording audio via mic... Speak now in Hindi, Hinglish, or English (Click mic to stop)" 
                  : isTranscribing 
                  ? "⚡ Transcribing spoken audio with Sarvam Saaras AI..." 
                  : "Ask code question in English or Hinglish (e.g. 'JWT verify logic kahan hai?')..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isTranscribing}
              style={{
                flex: 1,
                background: isListening ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.04)',
                border: isListening ? '1px solid rgba(239, 68, 68, 0.5)' : isTranscribing ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border 0.2s ease, background 0.2s ease'
              }}
            />

            <button
              type="submit"
              disabled={isQuerying}
              style={{
                background: isQuerying ? 'rgba(99, 91, 255, 0.4)' : '#635BFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#FFFFFF',
                fontWeight: 650,
                fontSize: '0.8125rem',
                cursor: isQuerying ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isQuerying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isQuerying ? 'Thinking...' : 'Send'}
            </button>
          </form>
        </div>

        {/* PANEL 3: Interactive Neo4j AST Call-Graph & Grounding Visualizer */}
        <div className={`dev-studio-panel-graph ${mobilePanel === 'graph' ? 'active' : ''}`} style={{ background: '#0B0F19', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', flexShrink: 0, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E2E8F0' }}>
              <Network size={14} color="#818CF8" /> AST Call Graph & Grounding
            </span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(99, 91, 255, 0.2)', color: '#818CF8', padding: '2px 6px', borderRadius: '4px', fontWeight: 650 }}>Deterministic</span>
          </div>

          <div style={{ flex: 1, minHeight: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
            
            {/* Section 1: Response Grounding Sources (Where the response came from) */}
            {activeGrounding && activeGrounding.citations && activeGrounding.citations.length > 0 && (
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 91, 255, 0.25)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A5B4FC', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={13} color="#818CF8" /> Response Grounded In:
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Click to inspect</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeGrounding.citations.map((cit, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCitationClick(cit)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '8px 10px',
                        background: 'rgba(99, 91, 255, 0.12)',
                        border: '1px solid rgba(99, 91, 255, 0.25)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 91, 255, 0.22)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(99, 91, 255, 0.12)'}
                      title={`Open ${cit.file} and highlight lines L${cit.start_line}-L${cit.end_line}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                        {cit.file.endsWith('.pdf') ? <FileText size={14} color="#F59E0B" /> : <FileCode size={14} color="#38BDF8" />}
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 650, color: '#F8FAFC', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {cit.file.split('/').pop()}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                            {cit.symbol || 'Architecture Spec'}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#38BDF8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                        L{cit.start_line}-L{cit.end_line}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Visual Node Chain / AST Call Dependency Hierarchy */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>
                  {activeGrounding ? 'AST Call Dependency Hierarchy:' : 'Extracted AST Call Hierarchy:'}
                </span>
                {activeGrounding && (
                  <span style={{ fontSize: '0.65rem', color: '#4ADE80', background: 'rgba(74, 222, 128, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    Live Proof
                  </span>
                )}
              </div>

              {astCallers.length > 0 ? (
                astCallers.map((caller, cIdx) => (
                  <React.Fragment key={cIdx}>
                    <div 
                      onClick={() => {
                        if (caller.file) {
                          handleCitationClick({
                            file: caller.file,
                            start_line: caller.start_line || 1,
                            end_line: caller.end_line || 40
                          });
                        }
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '9px 12px', 
                        background: cIdx === astCallers.length - 1 ? 'rgba(99, 91, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)', 
                        borderRadius: '8px', 
                        borderLeft: `3px solid ${cIdx === 0 ? '#38BDF8' : cIdx === astCallers.length - 1 ? '#4ADE80' : '#818CF8'}`,
                        border: cIdx === astCallers.length - 1 ? '1px solid rgba(99, 91, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: caller.file ? 'pointer' : 'default',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => { if (caller.file) e.currentTarget.style.background = 'rgba(99, 91, 255, 0.2)'; }}
                      onMouseLeave={e => { if (caller.file) e.currentTarget.style.background = cIdx === astCallers.length - 1 ? 'rgba(99, 91, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)'; }}
                      title={caller.file ? `Click to inspect ${caller.file} (${caller.line})` : ''}
                    >
                      {cIdx === 0 ? <FileCode size={14} color="#38BDF8" /> : cIdx === astCallers.length - 1 ? <Sparkles size={14} color="#4ADE80" /> : <Layers size={14} color="#818CF8" />}
                      <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {caller.name}
                          </span>
                          {caller.line && (
                            <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#94A3B8', flexShrink: 0 }}>
                              {caller.line}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.68rem', color: cIdx === astCallers.length - 1 ? '#A7F3D0' : '#64748B' }}>
                            {caller.role}
                          </span>
                          {caller.file && (
                            <span style={{ fontSize: '0.65rem', color: '#818CF8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              • {caller.file.split('/').pop()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {cIdx < astCallers.length - 1 && (
                      <div style={{ height: '14px', width: '2px', background: '#475569', margin: '4px 0 4px 20px' }} />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#64748B', textAlign: 'center', padding: '16px 8px' }}>
                  {selectedFile ? 'No external call sites detected in this file.' : 'Select a file or ask a code question to visualize AST call chains.'}
                </div>
              )}
            </div>

            {/* Ingestion & Rate Limit Security Card */}
            <div style={{ marginTop: 'auto', background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#4ADE80', fontSize: '0.8125rem', fontWeight: 700 }}>
                <ShieldCheck size={16} /> Zero-429 Rate Protection
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
                Token-bucket limiter dynamically meters Groq to 6,000 TPM. Upload quota enforces 50 files and 50,000 LOC on free tier, with automatic .codeignore pruning.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Upload & GitHub Connect Modal */}
      {uploadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '580px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 91, 255, 0.2)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GithubIcon size={18} color="#818CF8" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>Repository Ingestion Engine</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>Direct GitHub Auto-Sync & Local Sandbox Ingestion</p>
                </div>
              </div>
              <button 
                onClick={() => !uploading && setUploadModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: uploading ? 'not-allowed' : 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs: GitHub Connect vs Local Upload */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
              <button
                onClick={() => setModalTab('github')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 650,
                  border: 'none',
                  background: modalTab === 'github' ? 'rgba(99, 91, 255, 0.2)' : 'transparent',
                  color: modalTab === 'github' ? '#818CF8' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                <GithubIcon size={14} color={modalTab === 'github' ? '#818CF8' : '#94A3B8'} /> GitHub Auto-Sync
              </button>

              <button
                onClick={() => setModalTab('local')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 650,
                  border: 'none',
                  background: modalTab === 'local' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: modalTab === 'local' ? '#FFFFFF' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                <HardDrive size={14} /> Local Archive / Spec (.zip / .pdf)
              </button>
            </div>

            {/* TAB 1: GITHUB AUTO-SYNC */}
            {modalTab === 'github' && (
              <div>
                {!githubConnected ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', fontWeight: 650, fontSize: '0.875rem', marginBottom: '4px' }}>
                        <GithubIcon size={16} color="#FFFFFF" /> Connect Your GitHub Account
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.4 }}>
                        Automatically pulls your repositories, extracts AST symbols, and tracks commits without needing to manually zip code.
                      </p>
                    </div>

                    {/* Method A: Direct 1-Click OAuth */}
                    <a
                      href={`${getApiUrl()}/api/v1/integrations/github/auth?tenant_id=${workspaceId}&redirect_to=dev_studio`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: '#24292F',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 650,
                        textDecoration: 'none',
                        textAlign: 'center',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <GithubIcon size={16} color="#FFFFFF" /> 1-Click Connect with GitHub OAuth <ExternalLink size={13} />
                    </a>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                      <span style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase' }}>or use personal access token</span>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                    </div>

                    {/* Method B: Personal Access Token */}
                    <form onSubmit={handleGithubConnectToken} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '6px' }}>
                          GitHub Token (with <code>repo</code> scope):
                        </label>
                        <input
                          type="password"
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                          value={githubTokenInput}
                          onChange={(e) => setGithubTokenInput(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '9px 12px',
                            color: '#FFFFFF',
                            fontSize: '0.8125rem',
                            outline: 'none',
                            fontFamily: 'monospace'
                          }}
                        />
                      </div>

                      {githubConnectError && (
                        <div style={{ fontSize: '0.75rem', color: '#FCA5A5', background: 'rgba(239, 68, 68, 0.15)', padding: '6px 10px', borderRadius: '6px' }}>
                          {githubConnectError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={connectingGithub || !githubTokenInput.trim()}
                        style={{
                          background: connectingGithub || !githubTokenInput.trim() ? '#475569' : '#635BFF',
                          border: 'none',
                          color: '#FFFFFF',
                          padding: '9px 16px',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: 650,
                          cursor: connectingGithub || !githubTokenInput.trim() ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        {connectingGithub ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Connect GitHub Token
                      </button>
                    </form>
                  </div>
                ) : (
                  /* GitHub is CONNECTED: Show Repo Dropdown & Fetch */
                  <form onSubmit={handleGithubAutoFetch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* User profile banner */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '10px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {githubUser?.avatar_url ? (
                          <img src={githubUser.avatar_url} alt="GitHub" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                        ) : (
                          <GithubIcon size={20} color="#4ADE80" />
                        )}
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF' }}>@{githubUser?.username}</div>
                          <div style={{ fontSize: '0.7rem', color: '#4ADE80' }}>Connected • {githubRepos.length} Repositories Available</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleGithubDisconnect}
                        style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Disconnect GitHub account"
                      >
                        <LogOut size={12} /> Disconnect
                      </button>
                    </div>

                    {/* Repo Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '6px' }}>
                        Select GitHub Repository to Auto-Fetch:
                      </label>
                      <select
                        value={selectedRepo}
                        onChange={(e) => {
                          setSelectedRepo(e.target.value);
                          const r = githubRepos.find(item => item.full_name === e.target.value);
                          if (r) setSelectedBranch(r.default_branch || 'main');
                        }}
                        style={{
                          width: '100%',
                          background: '#0B0F19',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          color: '#FFFFFF',
                          fontSize: '0.85rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {githubRepos.map(r => (
                          <option key={r.id || r.full_name} value={r.full_name}>
                            {r.full_name} {r.private ? '(Private)' : '(Public)'} • {r.language}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Branch Input */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '6px' }}>
                          Target Branch:
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px' }}>
                          <GitBranch size={14} color="#818CF8" />
                          <input
                            type="text"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '0.8125rem', outline: 'none', width: '100%' }}
                            placeholder="main"
                          />
                        </div>
                      </div>

                      <div style={{ width: '140px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '6px' }}>
                          Quota Cap:
                        </label>
                        <div style={{ fontSize: '0.75rem', color: '#A5B4FC', background: 'rgba(99, 91, 255, 0.1)', border: '1px solid rgba(99, 91, 255, 0.2)', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                          50 Files / 50k LOC
                        </div>
                      </div>
                    </div>

                    {/* Live Progress Bar during Ingestion */}
                    {uploading && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '6px' }}>
                          <span>{uploadStep}</span>
                          <span style={{ fontWeight: 700, color: '#818CF8' }}>{uploadProgress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #635BFF, #38BDF8)', transition: 'width 0.3s ease' }} />
                        </div>
                        {queuePosition > 1 && (
                          <div style={{ fontSize: '0.7rem', color: '#FACC15', marginTop: '6px' }}>
                            ⏳ Queued ahead: {queuePosition - 1} task(s). Protecting API 6,000 TPM ceiling.
                          </div>
                        )}
                      </div>
                    )}

                    {uploadSuccess && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#4ADE80', fontSize: '0.8125rem' }}>
                        <Check size={16} /> Repository auto-fetched and AST indexed successfully!
                      </div>
                    )}

                    {uploadError && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.8125rem' }}>
                        <AlertCircle size={16} /> {uploadError}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setUploadModalOpen(false)}
                        disabled={uploading}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#94A3B8',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          cursor: uploading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={uploading || !selectedRepo}
                        style={{
                          background: uploading || !selectedRepo ? '#475569' : 'linear-gradient(135deg, #635BFF 0%, #4F46E5 100%)',
                          border: 'none',
                          color: '#FFFFFF',
                          padding: '8px 20px',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: 650,
                          cursor: uploading || !selectedRepo ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Auto-Fetch & Index Repo
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: LOCAL ARCHIVE / SPEC UPLOAD */}
            {modalTab === 'local' && (
              <form onSubmit={handleUploadSubmit}>
                {/* File dropzone */}
                <div style={{
                  border: '2px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  marginBottom: '16px',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="file" 
                    id="codeFileInput"
                    accept=".zip,.tar,.gz,.pdf,.py,.js,.jsx,.ts,.tsx,.go,.rs,.java,.cpp,.c,.h,.sql,.md,.json,.yaml"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                        setUploadError(null);
                      }
                    }}
                    style={{ display: 'none' }} 
                  />
                  <label htmlFor="codeFileInput" style={{ cursor: 'pointer', display: 'block' }}>
                    <HardDrive size={32} color="#818CF8" style={{ margin: '0 auto 10px auto' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 650, color: '#FFFFFF', marginBottom: '4px' }}>
                      {uploadFile ? uploadFile.name : 'Choose Repository (.zip), Code File, or Spec (.pdf)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Click to browse local files on your machine'}
                    </div>
                  </label>
                </div>

                {/* Free Tier Quota Limits Display */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A5B4FC', marginBottom: '6px' }}>
                    Enforced Quota Safeguards (Free Tier):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: '#94A3B8' }}>
                    <div>• Max Repository: <strong>10 MB (.zip)</strong></div>
                    <div>• Max Files: <strong>50 files</strong></div>
                    <div>• Max Lines of Code: <strong>50,000 LOC</strong></div>
                    <div>• Architecture PDF: <strong>Max 10 MB & 50 pages</strong></div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '6px' }}>
                    ⚡ Folders like <code>node_modules/</code>, <code>.git/</code>, and lockfiles are automatically ignored.
                  </div>
                </div>

                {/* Live Progress Bar */}
                {uploading && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '6px' }}>
                      <span>{uploadStep}</span>
                      <span style={{ fontWeight: 700, color: '#818CF8' }}>{uploadProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #635BFF, #38BDF8)', transition: 'width 0.3s ease' }} />
                    </div>
                    {queuePosition > 1 && (
                      <div style={{ fontSize: '0.7rem', color: '#FACC15', marginTop: '6px' }}>
                        ⏳ Queued ahead: {queuePosition - 1} task(s). Protecting API 6,000 TPM ceiling.
                      </div>
                    )}
                  </div>
                )}

                {uploadSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#4ADE80', fontSize: '0.8125rem', marginBottom: '16px' }}>
                    <Check size={16} /> Ingestion complete! Updating workspace AST graph...
                  </div>
                )}

                {uploadError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.8125rem', marginBottom: '16px' }}>
                    <AlertCircle size={16} /> {uploadError}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    disabled={uploading}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#94A3B8',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!uploadFile || uploading}
                    style={{
                      background: !uploadFile || uploading ? '#475569' : 'linear-gradient(135deg, #635BFF 0%, #4F46E5 100%)',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 650,
                      cursor: !uploadFile || uploading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} Start Ingestion
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
