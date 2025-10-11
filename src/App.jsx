import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, Code, Split, Plus, Trash2, ChevronRight, ChevronDown, 
  FileText, FolderOpen, Folder, Languages, Download, Upload, 
  Search, Save, Edit2, X, Tag, Play, AlertCircle, Brain 
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import DOMPurify from 'dompurify';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import debounce from 'lodash.debounce';

const getInitialData = () => {
  const saved = localStorage.getItem('edunotelab-data');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved data');
    }
  }
  return {
    projects: [
      {
        id: 'p0',
        name: '🏠 Home - Getting Started',
        sections: [
          {
            id: 's0',
            name: 'Welcome Guide',
            notes: [
              {
                id: 'n0',
                title: 'Welcome to EduNoteLab',
                content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to EduNoteLab</title>
  <style>
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 40px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      margin: 0;
    }
    .card { 
      background: white; 
      padding: 40px; 
      border-radius: 12px; 
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { 
      color: #6366f1; 
      margin: 0 0 20px 0;
      font-size: 2.5em;
    }
    h2 {
      color: #7c3aed;
      margin-top: 30px;
    }
    p {
      color: #555;
      line-height: 1.8;
      font-size: 1.1em;
    }
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #10b981, #34d399);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    ul {
      line-height: 2;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">🔒 Privacy-first • 🧠 AI-ready • ⚡ Live Preview</span>
    <h1>👋 Welcome to EduNoteLab!</h1>
    <p><strong>Your AI-Powered Study Notebook for Tech Learning</strong></p>
    
    <h2>What is EduNoteLab?</h2>
    <p>EduNoteLab is a powerful note-taking app designed for technical learners. Paste HTML or code, see instant previews, organize by Projects → Sections → Notes, and export AI-ready context — all stored locally on your device.</p>
    
    <h2>Quick Start</h2>
    <ul>
      <li><strong>Create a Project:</strong> Click "+ Project" in the sidebar</li>
      <li><strong>Add Sections:</strong> Click "+" next to any project</li>
      <li><strong>Create Notes:</strong> Click "+" next to any section</li>
      <li><strong>Edit & Preview:</strong> Use split view to see live HTML/code rendering</li>
      <li><strong>Organize:</strong> Add tags to your notes for easy searching</li>
      <li><strong>Save Versions:</strong> Click "Checkpoint" to save snapshots</li>
    </ul>
    
    <h2>✨ Pro Tips</h2>
    <p>💡 Ask AI (Claude, ChatGPT, etc.) to generate styled HTML notes for you, then paste them here!</p>
    <p>🔍 Use the search bar to find notes across all projects</p>
    <p>🤖 Export AI Context to share your entire learning progress with AI assistants</p>
  </div>
</body>
</html>`,
                tags: ['guide', 'welcome', 'tutorial'],
                versions: [],
                translations: {},
                language: 'html'
              }
            ]
          },
          {
            id: 's0b',
            name: 'Features',
            notes: [
              {
                id: 'n0b',
                title: 'Key Features Overview',
                content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EduNoteLab Features</title>
  <style>
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 40px; 
      background: #f3f4f6;
      margin: 0;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    h1 { 
      color: #6366f1; 
      text-align: center;
      font-size: 2.5em;
    }
    .feature {
      background: white;
      padding: 30px;
      margin: 20px 0;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border-left: 5px solid #6366f1;
    }
    .feature h2 {
      color: #7c3aed;
      margin-top: 0;
    }
    .icon {
      font-size: 2em;
      margin-right: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>What makes EduNoteLab different?</h1>
    
    <div class="feature">
      <h2><span class="icon">⧉</span>Split View Editor</h2>
      <p>Code on the left with Monaco syntax highlighting, live preview on the right — perfect for HTML/JS labs and write-ups.</p>
    </div>
    
    <div class="feature">
      <h2><span class="icon">#</span>Projects → Sections → Notes</h2>
      <p>Keep big topics tidy. Hierarchical structure with tags and full-text search across everything.</p>
    </div>
    
    <div class="feature">
      <h2><span class="icon">🔁</span>Auto-save & Checkpoints</h2>
      <p>Every change is saved locally. Create version snapshots you can roll back to anytime.</p>
    </div>
    
    <div class="feature">
      <h2><span class="icon">🌐</span>Translate on Demand</h2>
      <p>Optional API hook for EN↔FR↔DE translations and side-by-side viewing (via backend proxy).</p>
    </div>
    
    <div class="feature">
      <h2><span class="icon">🔒</span>Privacy-First</h2>
      <p>No backend required. Your data stays on your device. Export/import JSON at will.</p>
    </div>
    
    <div class="feature">
      <h2><span class="icon">🤖</span>AI Context Export</h2>
      <p>Export your complete learning context for Claude, ChatGPT, or any AI assistant to analyze your progress.</p>
    </div>
  </div>
</body>
</html>`,
                tags: ['features', 'guide'],
                versions: [],
                translations: {},
                language: 'html'
              }
            ]
          },
          {
            id: 's0c',
            name: 'How to Use',
            notes: [
              {
                id: 'n0c',
                title: 'The Magic Copy-Paste Workflow',
                content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>How to Use EduNoteLab</title>
  <style>
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 40px; 
      background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
      min-height: 100vh;
      margin: 0;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    h1 { 
      color: #6366f1; 
      text-align: center;
      font-size: 2.5em;
    }
    .step {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 30px;
      margin: 30px 0;
      border-radius: 12px;
      border-left: 5px solid #0ea5e9;
    }
    .step-number {
      background: #0ea5e9;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.5em;
      margin-right: 15px;
    }
    .step h2 {
      display: inline;
      color: #0369a1;
      font-size: 1.5em;
    }
    .example {
      background: #fff;
      padding: 15px;
      margin-top: 15px;
      border-radius: 8px;
      border: 2px solid #bae6fd;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>How it works</h1>
    <p style="text-align: center; font-size: 1.2em; color: #64748b;">The "Magic Copy-Paste" workflow with AI makes beautiful notes in seconds.</p>
    
    <div class="step">
      <span class="step-number">1</span>
      <h2>Ask AI</h2>
      <p>Ask Claude, ChatGPT, or any AI to generate a styled HTML note about your topic.</p>
      <div class="example">
        "Generate a styled HTML note about HSRP (Hot Standby Router Protocol) with commands and explanations. Make it visually appealing with CSS."
      </div>
    </div>
    
    <div class="step">
      <span class="step-number">2</span>
      <h2>Paste</h2>
      <p>Create a new note in EduNoteLab and paste the HTML into the code editor.</p>
      <div class="example">
        Click "+ Project" → Add Section → Add Note → Paste your HTML in the left panel
      </div>
    </div>
    
    <div class="step">
      <span class="step-number">3</span>
      <h2>Preview & Learn</h2>
      <p>Toggle split view and see your formatted page instantly! Edit, add tags, and save checkpoints as you learn.</p>
      <div class="example">
        Use the Split View button to see code and preview side-by-side. Make changes and watch them update in real-time!
      </div>
    </div>
    
    <h2 style="color: #6366f1; margin-top: 50px;">🚀 You're Ready!</h2>
    <p>Start building your knowledge base. Create your first project and begin your learning journey!</p>
  </div>
</body>
</html>`,
                tags: ['tutorial', 'workflow', 'guide'],
                versions: [],
                translations: {},
                language: 'html'
              }
            ]
          }
        ]
      },
      {
        id: 'p1',
        name: 'React Learning Path',
        sections: [
          {
            id: 's1',
            name: 'HTML & CSS Basics',
            notes: [
              {
                id: 'n1',
                title: 'First React Component',
                content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First React</title>
  <style>
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 40px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      margin: 0;
    }
    .card { 
      background: white; 
      padding: 30px; 
      border-radius: 12px; 
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      max-width: 600px;
      margin: 0 auto;
      animation: fadeIn 0.5s ease-in;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    h1 { 
      color: #6366f1; 
      margin: 0 0 20px 0;
    }
    p {
      color: #555;
      line-height: 1.6;
    }
    .button {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 15px;
    }
    .button:hover {
      background: #4f46e5;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>👋 Hello React!</h1>
    <p>This is my first component. I can edit the code on the left and see changes instantly!</p>
    <p><strong>Try it:</strong> Change the title or add more HTML elements.</p>
    <button class="button" onclick="alert('Button clicked!')">Click Me!</button>
  </div>
</body>
</html>`,
                tags: ['react', 'basics', 'html'],
                versions: [],
                translations: {},
                language: 'html'
              }
            ]
          }
        ]
      },
      {
        id: 'p2',
        name: 'TSSR Exam 2026',
        sections: [
          {
            id: 's2',
            name: 'Network Labs',
            notes: []
          },
          {
            id: 's3',
            name: 'Windows Server',
            notes: []
          }
        ]
      }
    ]
  };
};

function App() {
  const [data, setData] = useState(getInitialData);
  const [selectedNote, setSelectedNote] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [newTag, setNewTag] = useState('');
  const [lastSaved, setLastSaved] = useState(new Date());
  const [targetLang, setTargetLang] = useState('fr');
  const [allowScripts, setAllowScripts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [showLanding, setShowLanding] = useState(() => {
    const hasVisited = localStorage.getItem('edunotelab-visited');
    const hasData = localStorage.getItem('edunotelab-data');
    return !hasVisited && !hasData;
  });

  const debouncedSave = useMemo(
    () => debounce(() => {
      setIsSaving(true);
      localStorage.setItem('edunotelab-data', JSON.stringify(data));
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 500);
    }, 500),
    [data]
  );

  useEffect(() => {
    debouncedSave();
    return () => debouncedSave.cancel();
  }, [data, debouncedSave]);

  useEffect(() => {
    if (data.projects[0]?.sections[0]?.notes[0] && !selectedNote) {
      const firstNote = data.projects[0].sections[0].notes[0];
      setSelectedNote(firstNote);
      setExpandedProjects({ [data.projects[0].id]: true });
      setExpandedSections({ [data.projects[0].sections[0].id]: true });
    }
  }, [data]);

  const matchesSearch = (note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return note.title.toLowerCase().includes(query) || 
           note.content.toLowerCase().includes(query) ||
           note.tags.some(tag => tag.toLowerCase().includes(query));
  };

  const filteredProjects = useMemo(() => {
    return data.projects.map(project => ({
      ...project,
      sections: project.sections.map(section => ({
        ...section,
        notes: section.notes.filter(matchesSearch)
      })).filter(section => section.notes.length > 0 || !searchQuery)
    })).filter(project => project.sections.length > 0 || !searchQuery);
  }, [data, searchQuery]);

  const updateNoteContent = (content) => {
    if (!selectedNote) return;
    
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      for (let project of newData.projects) {
        for (let section of project.sections) {
          const note = section.notes.find(n => n.id === selectedNote.id);
          if (note) {
            note.content = content;
            setSelectedNote({ ...note });
            return newData;
          }
        }
      }
      return prevData;
    });
  };

  const addProject = () => {
    const name = prompt('Enter project name:');
    if (!name) return;
    
    const newProject = {
      id: 'p' + Date.now(),
      name,
      sections: []
    };
    setData({ ...data, projects: [...data.projects, newProject] });
    setExpandedProjects({ ...expandedProjects, [newProject.id]: true });
  };

  const addSection = (projectId) => {
    const name = prompt('Enter section name:');
    if (!name) return;
    
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const project = newData.projects.find(p => p.id === projectId);
      if (project) {
        const newSection = {
          id: 's' + Date.now(),
          name,
          notes: []
        };
        project.sections.push(newSection);
        setExpandedSections({ ...expandedSections, [newSection.id]: true });
      }
      return newData;
    });
  };

  const addNote = (projectId, sectionId) => {
    const title = prompt('Enter note title:');
    if (!title) return;
    
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const project = newData.projects.find(p => p.id === projectId);
      if (project) {
        const section = project.sections.find(s => s.id === sectionId);
        if (section) {
          const newNote = {
            id: 'n' + Date.now(),
            title,
            content: `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #6366f1; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>Start editing your note here...</p>
</body>
</html>`,
            tags: [],
            versions: [],
            translations: {},
            language: 'html'
          };
          section.notes.push(newNote);
          setSelectedNote(newNote);
        }
      }
      return newData;
    });
  };

  const deleteItem = (type, ids) => {
    const confirmMsg = `Delete this ${type}? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;
    
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      
      if (type === 'project') {
        newData.projects = newData.projects.filter(p => p.id !== ids.projectId);
      } else if (type === 'section') {
        const project = newData.projects.find(p => p.id === ids.projectId);
        if (project) {
          project.sections = project.sections.filter(s => s.id !== ids.sectionId);
        }
      } else if (type === 'note') {
        const project = newData.projects.find(p => p.id === ids.projectId);
        if (project) {
          const section = project.sections.find(s => s.id === ids.sectionId);
          if (section) {
            section.notes = section.notes.filter(n => n.id !== ids.noteId);
            if (selectedNote?.id === ids.noteId) {
              setSelectedNote(null);
            }
          }
        }
      }
      return newData;
    });
  };

  const startRename = (id, currentName) => {
    setEditingId(id);
    setEditingValue(currentName);
  };

  const finishRename = (type, ids) => {
    if (!editingValue.trim()) {
      setEditingId(null);
      return;
    }

    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      
      if (type === 'project') {
        const project = newData.projects.find(p => p.id === ids.projectId);
        if (project) project.name = editingValue;
      } else if (type === 'section') {
        const project = newData.projects.find(p => p.id === ids.projectId);
        if (project) {
          const section = project.sections.find(s => s.id === ids.sectionId);
          if (section) section.name = editingValue;
        }
      } else if (type === 'note') {
        const project = newData.projects.find(p => p.id === ids.projectId);
        if (project) {
          const section = project.sections.find(s => s.id === ids.sectionId);
          if (section) {
            const note = section.notes.find(n => n.id === ids.noteId);
            if (note) {
              note.title = editingValue;
              if (selectedNote?.id === note.id) {
                setSelectedNote({ ...note });
              }
            }
          }
        }
      }
      return newData;
    });
    setEditingId(null);
  };

  const addTag = () => {
    if (!newTag.trim() || !selectedNote) return;
    
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      for (let project of newData.projects) {
        for (let section of project.sections) {
          const note = section.notes.find(n => n.id === selectedNote.id);
          if (note && !note.tags.includes(newTag.trim())) {
            note.tags.push(newTag.trim());
            setSelectedNote({ ...note });
          }
        }
      }
      return newData;
    });
    setNewTag('');
  };

  const removeTag = (tagToRemove) => {
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      for (let project of newData.projects) {
        for (let section of project.sections) {
          const note = section.notes.find(n => n.id === selectedNote.id);
          if (note) {
            note.tags = note.tags.filter(t => t !== tagToRemove);
            setSelectedNote({ ...note });
          }
        }
      }
      return newData;
    });
  };

  const saveCheckpoint = () => {
    if (!selectedNote) return;
    
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      for (let project of newData.projects) {
        for (let section of project.sections) {
          const note = section.notes.find(n => n.id === selectedNote.id);
          if (note) {
            note.versions = note.versions || [];
            note.versions.push({
              version: note.versions.length + 1,
              content: note.content,
              date: new Date().toISOString(),
              timestamp: Date.now()
            });
          }
        }
      }
      return newData;
    });
    alert(`✅ Checkpoint #${(selectedNote.versions?.length || 0) + 1} saved!`);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edunotelab-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAIContext = () => {
    const aiContext = {
      metadata: {
        exportDate: new Date().toISOString(),
        appName: 'EduNoteLab',
        appVersion: '1.0.0',
        purpose: 'AI Learning Context - Complete study snapshot for Claude/Astra/Grok/GPT'
      },
      overview: {
        totalProjects: data.projects.length,
        totalSections: data.projects.reduce((acc, p) => acc + p.sections.length, 0),
        totalNotes: data.projects.reduce((acc, p) => 
          acc + p.sections.reduce((acc2, s) => acc2 + s.notes.length, 0), 0)
      },
      completeStructure: data.projects
    };

    const jsonStr = JSON.stringify(aiContext, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edunotelab-ai-context-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target.result);
  
        // Detect supported shapes
        let projects = null;
        if (Array.isArray(raw?.projects)) {
          projects = raw.projects;                       // full backup
        } else if (Array.isArray(raw?.completeStructure)) {
          projects = raw.completeStructure;              // AI Context export
        } else if (Array.isArray(raw)) {
          projects = raw;                                // bare array of projects
        }
  
        if (!projects) {
          alert('❌ Invalid format: expected { projects: [...] } or { completeStructure: [...] }');
          return;
        }
  
        // Normalize and validate data structure
        projects.forEach((project, pi) => {
          if (!project.id || !project.name) throw new Error(`Project #${pi} missing id/name`);
          project.sections = Array.isArray(project.sections) ? project.sections : [];
          project.sections.forEach((section, si) => {
            if (!section.id || !section.name) throw new Error(`Section #${si} in "${project.name}" missing id/name`);
            section.notes = Array.isArray(section.notes) ? section.notes : [];
            section.notes.forEach((note, ni) => {
              if (!note.id || !note.title || !note.content) {
                throw new Error(`Note #${ni} in "${section.name}" missing id/title/content`);
              }
              note.tags = Array.isArray(note.tags) ? note.tags : [];
              note.versions = Array.isArray(note.versions) ? note.versions : [];
              note.translations = note.translations || {};
              note.language = note.language || 'html';
            });
          });
        });
  
        const imported = { projects };
        setData(imported);
        localStorage.setItem('edunotelab-data', JSON.stringify(imported));
  
        // Open first note
        if (projects[0]) {
          setExpandedProjects({ [projects[0].id]: true });
          if (projects[0].sections[0]) {
            setExpandedSections({ [projects[0].sections[0].id]: true });
            if (projects[0].sections[0].notes[0]) {
              setSelectedNote(projects[0].sections[0].notes[0]);
            }
          }
        }
  
        alert(`✅ Import successful! ${projects.length} project(s) loaded.`);
      } catch (err) {
        alert(`❌ Invalid JSON: ${err.message}`);
        console.error('Import error:', err);
      }
    };
  
    reader.readAsText(file);
  };
  

  const getSanitizedHTML = () => {
    if (!selectedNote) return '';
    if (allowScripts) return selectedNote.content;
    return DOMPurify.sanitize(selectedNote.content);
  };

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const getLanguage = () => {
    if (!selectedNote) return 'html';
    const content = selectedNote.content.toLowerCase();
    if (content.includes('<!doctype') || content.includes('<html')) return 'html';
    if (content.startsWith('{') || content.startsWith('[')) return 'json';
    if (content.includes('def ') || content.includes('import ')) return 'python';
    return selectedNote.language || 'html';
  };

  const enterApp = () => {
    localStorage.setItem('edunotelab-visited', 'true');
    setShowLanding(false);
    // Auto-select the Welcome note when entering the app
    if (data.projects[0]?.sections[0]?.notes[0]) {
      const welcomeNote = data.projects[0].sections[0].notes[0];
      setSelectedNote(welcomeNote);
      setExpandedProjects({ [data.projects[0].id]: true });
      setExpandedSections({ [data.projects[0].sections[0].id]: true });
    }
  };

  // REPLACE your entire "if (showLanding) { return (...) }" block with this code
// Place this right before your main "return (" statement in App.jsx


if (showLanding) {
  return (
    <>
      <div
        className="landing-wrapper"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent), #0a0e27',
          color: '#f8fafc',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
          position: 'relative',
          minHeight: '100vh',
        }}
      >
          {/* Animated background elements */}
          <div
            className="animated-bg-circle-1"
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '800px',
              height: '800px',
              background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(80px)',
              animation: 'float 20s ease-in-out infinite',
            }}
          ></div>
          <div
            className="animated-bg-circle-2"
            style={{
              position: 'absolute',
              bottom: '-30%',
              left: '-5%',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(80px)',
              animation: 'float 15s ease-in-out infinite reverse',
            }}
          ></div>

          {/* Nav */}
          <nav
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 50,
              backdropFilter: 'blur(20px) saturate(180%)',
              background: 'rgba(10, 14, 39, 0.8)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              className="nav-container"
              style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                    fontWeight: 800,
                    fontSize: '18px',
                    color: '#fff',
                  }}
                >
                  E
                </div>
                <span
                  className="brand-name"
                  style={{
                    fontSize: '20px',
                    background: 'linear-gradient(to right, #f8fafc, #e2e8f0)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  EduNoteLab
                </span>
              </div>
              <div className="nav-links" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <a
                  href="#features"
                  className="nav-link"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                >
                  Features
                </a>
                <a
                  href="#how"
                  className="nav-link"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                >
                  How it works
                </a>
                <button
                  onClick={enterApp}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 15px 30px -5px rgba(99, 102, 241, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 25px -5px rgba(99, 102, 241, 0.5)';
                  }}
                >
                  Open App →
                </button>
              </div>
            </div>
          </nav>

          {/* Hero */}
          <header
            className="hero-section"
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '80px 32px 40px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '60px', alignItems: 'center' }}>
              <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '24px',
                    backdropFilter: 'blur(10px)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>🔒 Privacy-first</span>
                  <span style={{ color: '#4b5563' }}>•</span>
                  <span>🧠 AI-ready</span>
                  <span style={{ color: '#4b5563' }}>•</span>
                  <span>⚡ Live Preview</span>
                </div>

                <h1
                  style={{
                    fontSize: 'clamp(32px, 5.5vw, 68px)',
                    lineHeight: 1.1,
                    margin: '0 0 24px',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Your AI-Powered{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    Study Notebook
                  </span>
                </h1>

                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: '18px',
                    lineHeight: 1.8,
                    marginBottom: '32px',
                    maxWidth: '90%',
                  }}
                >
                  Paste HTML or code, see instant previews, organize by Projects → Sections → Notes, and export AI-ready context. All stored locally on your device.
                </p>

                <div className="hero-buttons" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <button
                    onClick={enterApp}
                    style={{
                      padding: '14px 32px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 15px 30px -5px rgba(99, 102, 241, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 10px 25px -5px rgba(99, 102, 241, 0.5)';
                    }}
                  >
                    Get Started Free
                  </button>

                  <a
                    href="#how"
                    style={{
                      padding: '14px 32px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e2e8f0',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: 600,
                      transition: 'all 0.3s',
                      background: 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(10px)',
                      display: 'inline-block',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.08)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.03)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    See workflow →
                  </a>
                </div>
              </div>

              {/* Code preview mock */}
              <div
                className="code-preview"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(20px)',
                  animation: 'fadeInUp 0.8s ease-out 0.2s both',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(0,0,0,0.2)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500 }}>index.html</div>
                </div>
                <div style={{ padding: '20px', background: 'rgba(0, 0, 0, 0.3)' }}>
                  <pre
                    style={{
                      margin: 0,
                      overflow: 'auto',
                      padding: '20px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(10, 15, 35, 0.95))',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      color: '#e2e8f0',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      fontFamily: 'ui-monospace, monospace',
                    }}
                  >
                    <code>{`<section class="card">
  <h2>React Hooks Cheatsheet</h2>
  <ul>
    <li><strong>useState</strong> — local state</li>
    <li><strong>useEffect</strong> — side effects</li>
    <li><strong>useMemo</strong> — memoize values</li>
  </ul>
</section>`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </header>

          {/* Features */}
          <section
            id="features"
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '80px 32px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2
                style={{
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  margin: '0 0 16px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                What makes EduNoteLab different?
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
                Built for technical learners: networking, systems, cloud, and frontend dev. Live split-view rendering keeps your notes structured and searchable.
              </p>
            </div>

            <div className="features-grid" style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {[
                {
                  icon: '⧉',
                  title: 'Split View Editor',
                  desc: 'Code on the left with Monaco syntax highlighting, live preview on the right — perfect for HTML/JS labs.',
                },
                {
                  icon: '#',
                  title: 'Projects → Sections → Notes',
                  desc: 'Keep big topics tidy. Hierarchical structure with tags and full-text search across everything.',
                },
                {
                  icon: '🔁',
                  title: 'Auto-save & Checkpoints',
                  desc: 'Every change saved locally. Create version snapshots you can roll back to anytime.',
                },
                {
                  icon: '🌐',
                  title: 'Translate on Demand',
                  desc: 'Optional API hook for translations and side-by-side viewing (via backend proxy).',
                },
                {
                  icon: '🔒',
                  title: 'Privacy-First',
                  desc: 'No backend required. Your data stays on your device. Export/import JSON at will.',
                },
                {
                  icon: '🤖',
                  title: 'AI Context Export',
                  desc: 'Export your complete learning context for Claude, ChatGPT, or any AI assistant.',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="feature-card"
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '28px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(99, 102, 241, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      fontSize: '24px',
                      marginBottom: '20px',
                      boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 700 }}>{feature.title}</h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px', lineHeight: 1.7 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section
            id="how"
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '80px 32px 120px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2
                style={{
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  margin: '0 0 16px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                How it works
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
                The "Magic Copy-Paste" workflow with AI makes beautiful notes in seconds.
              </p>
            </div>

            <div
              className="steps-grid"
              style={{
                display: 'grid',
                gap: '24px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                marginBottom: '48px',
              }}
            >
              {[
                {
                  num: '1',
                  title: 'Ask AI',
                  desc: 'Generate a styled HTML note about HSRP with commands & explanations.',
                },
                {
                  num: '2',
                  title: 'Paste',
                  desc: 'Create a note → paste the HTML into the code pane.',
                },
                {
                  num: '3',
                  title: 'Preview',
                  desc: 'Toggle split view and see your formatted page instantly.',
                },
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderLeft: '4px solid #6366f1',
                    padding: '28px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '36px',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      marginBottom: '16px',
                    }}
                  >
                    {step.num}
                  </div>
                  <h3 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 700 }}>{step.title}</h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={enterApp}
                style={{
                  padding: '14px 32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 30px -5px rgba(99, 102, 241, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 25px -5px rgba(99, 102, 241, 0.5)';
                }}
              >
                Start Learning Now →
              </button>

              <a
                href="#features"
                style={{
                  padding: '14px 32px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  transition: 'all 0.3s',
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.03)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                Explore Features
              </a>
            </div>
          </section>
        </div>

        {/* CSS Animations and Mobile Responsive Styles */}
        <style>{`
  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(5deg); }
    66% { transform: translate(-20px, 20px) rotate(-5deg); }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Ensure scrolling on all devices */
  .landing-wrapper {
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  /* Mobile Responsive Styles */
  @media (max-width: 768px) {
    .landing-wrapper {
      padding-bottom: 60px;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      -webkit-overflow-scrolling: touch;
    }

    .animated-bg-circle-1,
    .animated-bg-circle-2 {
      display: none;
    }

    .nav-container {
      padding: 12px 16px !important;
      flex-wrap: wrap;
    }

    .brand-name {
      font-size: 18px !important;
    }

    .nav-links {
      width: 100%;
      justify-content: center;
      margin-top: 8px;
    }

    .nav-link {
      padding: 8px 12px !important;
      font-size: 13px !important;
    }

    .hero-section {
      padding: 40px 20px !important;
    }

    .hero-grid {
      grid-template-columns: 1fr !important;
      gap: 40px !important;
    }

    .hero-buttons {
      flex-direction: column;
      align-items: stretch;
    }

    .hero-buttons button,
    .hero-buttons a {
      text-align: center;
      width: 100%;
    }

    .code-preview {
      order: -1;
    }

    .features-grid {
      grid-template-columns: 1fr !important;
      padding: 0 20px;
    }

    .steps-grid {
      grid-template-columns: 1fr !important;
      padding: 0 20px;
    }

    .feature-card {
      padding: 20px !important;
    }

    h1 {
      font-size: clamp(28px, 8vw, 48px) !important;
    }

    h2 {
      font-size: clamp(24px, 6vw, 36px) !important;
    }

    p {
      font-size: 16px !important;
    }
  }

  @media (max-width: 480px) {
    .nav-links {
      gap: 6px !important;
    }

    .nav-link {
      display: none;
    }

    .hero-section {
      padding: 30px 16px !important;
    }

    .features-grid,
    .steps-grid {
      gap: 16px !important;
    }
  }
`}</style>
      </>
    );
  }



  return (
    <div className="flex h-screen bg-gray-900 text-gray-100" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            EduNoteLab
          </h1>
          <p className="text-xs text-gray-400 mt-1">Learn. Build. Remember. ✨</p>
        </div>

        <div className="p-3 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="p-3 border-b border-gray-700 flex gap-2">
          <button
            onClick={addProject}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Project
          </button>
          <button
            onClick={exportData}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Export backup JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={exportAIContext}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            title="Export AI Context"
          >
            <Brain className="w-4 h-4" />
          </button>
          <label className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer" title="Import data">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredProjects.map(project => (
            <div key={project.id}>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg group transition-colors">
                <button onClick={() => toggleProject(project.id)} className="hover:text-indigo-400">
                  {expandedProjects[project.id] ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  }
                </button>
                {expandedProjects[project.id] ? 
                  <FolderOpen className="w-4 h-4 text-indigo-400" /> : 
                  <Folder className="w-4 h-4 text-indigo-400" />
                }
                
                {editingId === project.id ? (
                  <input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => finishRename('project', { projectId: project.id })}
                    onKeyDown={(e) => e.key === 'Enter' && finishRename('project', { projectId: project.id })}
                    className="flex-1 px-2 py-1 bg-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium">{project.name}</span>
                )}
                
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                  <button
                    onClick={() => startRename(project.id, project.name)}
                    className="p-1 hover:bg-gray-600 rounded"
                    title="Rename"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => addSection(project.id)}
                    className="p-1 hover:bg-gray-600 rounded"
                    title="Add Section"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteItem('project', { projectId: project.id })}
                    className="p-1 hover:bg-red-600 rounded"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {expandedProjects[project.id] && (
                <div className="ml-6 space-y-1 mt-1">
                  {project.sections.map(section => (
                    <div key={section.id}>
                      <div className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg group transition-colors">
                        <button onClick={() => toggleSection(section.id)} className="hover:text-cyan-400">
                          {expandedSections[section.id] ? 
                            <ChevronDown className="w-4 h-4" /> : 
                            <ChevronRight className="w-4 h-4" />
                          }
                        </button>
                        
                        {editingId === section.id ? (
                          <input
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => finishRename('section', { projectId: project.id, sectionId: section.id })}
                            onKeyDown={(e) => e.key === 'Enter' && finishRename('section', { projectId: project.id, sectionId: section.id })}
                            className="flex-1 px-2 py-1 bg-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            autoFocus
                          />
                        ) : (
                          <span className="flex-1 text-sm text-gray-300">{section.name}</span>
                        )}
                        
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                          <button
                            onClick={() => startRename(section.id, section.name)}
                            className="p-1 hover:bg-gray-600 rounded"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => addNote(project.id, section.id)}
                            className="p-1 hover:bg-gray-600 rounded"
                            title="Add Note"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteItem('section', { projectId: project.id, sectionId: section.id })}
                            className="p-1 hover:bg-red-600 rounded"
                            title="Delete Section"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {expandedSections[section.id] && (
                        <div className="ml-6 space-y-1 mt-1">
                          {section.notes.map(note => (
                            <div
                              key={note.id}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer group transition-all ${
                                selectedNote?.id === note.id 
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg' 
                                  : 'hover:bg-gray-700'
                              }`}
                              onClick={() => setSelectedNote(note)}
                            >
                              <FileText className="w-4 h-4 text-cyan-400" />
                              
                              {editingId === note.id ? (
                                <input
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onBlur={() => finishRename('note', { projectId: project.id, sectionId: section.id, noteId: note.id })}
                                  onKeyDown={(e) => e.key === 'Enter' && finishRename('note', { projectId: project.id, sectionId: section.id, noteId: note.id })}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-2 py-1 bg-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                  autoFocus
                                />
                              ) : (
                                <span className="flex-1 text-sm truncate">{note.title}</span>
                              )}
                              
                              <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startRename(note.id, note.title);
                                  }}
                                  className="p-1 hover:bg-gray-600 rounded"
                                  title="Rename"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteItem('note', { projectId: project.id, sectionId: section.id, noteId: note.id });
                                  }}
                                  className="p-1 hover:bg-red-600 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-700 text-xs text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Saved {Math.floor((Date.now() - lastSaved) / 1000)}s ago</span>
              </>
            )}
          </div>
          <select 
            value={editorTheme}
            onChange={(e) => setEditorTheme(e.target.value)}
            className="px-2 py-1 bg-gray-700 rounded text-xs border-none focus:outline-none"
          >
            <option value="vs-dark">Dark</option>
            <option value="vs">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {selectedNote && (
              <>
                <h2 className="text-lg font-semibold truncate max-w-md">{selectedNote.title}</h2>
                <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('code')}
                    className={`p-2 rounded transition-colors ${viewMode === 'code' ? 'bg-indigo-600' : 'hover:bg-gray-600'}`}
                    title="Code Only"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`p-2 rounded transition-colors ${viewMode === 'split' ? 'bg-indigo-600' : 'hover:bg-gray-600'}`}
                    title="Split View"
                  >
                    <Split className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`p-2 rounded transition-colors ${viewMode === 'preview' ? 'bg-indigo-600' : 'hover:bg-gray-600'}`}
                    title="Preview Only"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {selectedNote && (
              <>
                <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg text-xs cursor-pointer hover:bg-gray-600 transition-colors">
                  <Play className="w-4 h-4" />
                  <input
                    type="checkbox"
                    checked={allowScripts}
                    onChange={(e) => setAllowScripts(e.target.checked)}
                    className="w-3 h-3"
                  />
                  <span>Run JS</span>
                </label>
                <button
                  onClick={saveCheckpoint}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm font-medium"
                  title="Save checkpoint"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Checkpoint</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!selectedNote ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center max-w-md p-8">
                <FileText className="w-20 h-20 mx-auto mb-6 text-gray-600" />
                <h2 className="text-2xl font-bold mb-2 text-gray-300">Welcome to EduNoteLab</h2>
                <p className="text-base mb-4">Your smart notebook for React, HTML, and TSSR exam prep</p>
                <button
                  onClick={addProject}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-base font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  Create Your First Project
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-hidden">
                {viewMode === 'split' ? (
                  <PanelGroup direction="horizontal">
                    <Panel defaultSize={50} minSize={20}>
                      <div className="h-full">
                        <Editor
                          height="100%"
                          language={getLanguage()}
                          value={selectedNote.content}
                          onChange={(value) => updateNoteContent(value || '')}
                          theme={editorTheme}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            roundedSelection: true,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            wordWrap: 'on'
                          }}
                        />
                      </div>
                    </Panel>
                    <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-indigo-600 transition-colors cursor-col-resize" />
                    <Panel defaultSize={50} minSize={20}>
                      <div className="h-full bg-white">
                        <iframe
                          srcDoc={getSanitizedHTML()}
                          className="w-full h-full border-none"
                          title="Preview"
                          sandbox={allowScripts ? "allow-scripts" : ""}
                        />
                      </div>
                    </Panel>
                  </PanelGroup>
                ) : viewMode === 'code' ? (
                  <Editor
                    height="100%"
                    language={getLanguage()}
                    value={selectedNote.content}
                    onChange={(value) => updateNoteContent(value || '')}
                    theme={editorTheme}
                    options={{
                      minimap: { enabled: true },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: true,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on'
                    }}
                  />
                ) : (
                  <div className="h-full bg-white">
                    <iframe
                      srcDoc={getSanitizedHTML()}
                      className="w-full h-full border-none"
                      title="Preview"
                      sandbox={allowScripts ? "allow-scripts" : ""}
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-800 border-t border-gray-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                  {selectedNote.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-xs flex items-center gap-1 group hover:from-indigo-700 hover:to-purple-700 transition-all"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="opacity-70 hover:opacity-100 hover:text-red-300 transition-opacity"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addTag();
                        if (e.key === 'Escape') setNewTag('');
                      }}
                      className="px-3 py-1 bg-gray-700 rounded-full text-xs w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:w-48 transition-all"
                    />
                    {newTag && (
                      <button
                        onClick={addTag}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-full text-xs transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
                {selectedNote.versions && selectedNote.versions.length > 0 && (
                  <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                    <Save className="w-3 h-3" />
                    {selectedNote.versions.length} checkpoint{selectedNote.versions.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
