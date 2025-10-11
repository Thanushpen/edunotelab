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
    if (data.projects[0]?.sections[0]?.notes[0]) {
      const firstNote = data.projects[0].sections[0].notes[0];
      setSelectedNote(firstNote);
      setExpandedProjects({ [data.projects[0].id]: true });
      setExpandedSections({ [data.projects[0].sections[0].id]: true });
    }
  }, []);

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
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported || !imported.projects || !Array.isArray(imported.projects)) {
          alert('❌ Invalid format');
          return;
        }
        setData(imported);
        alert('✅ Import successful!');
        if (imported.projects[0]) {
          setExpandedProjects({ [imported.projects[0].id]: true });
          if (imported.projects[0].sections[0]) {
            setExpandedSections({ [imported.projects[0].sections[0].id]: true });
            if (imported.projects[0].sections[0].notes[0]) {
              setSelectedNote(imported.projects[0].sections[0].notes[0]);
            }
          }
        }
      } catch (err) {
        alert('❌ Invalid JSON file!');
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
  };

  if (showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-gray-100">
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg">
                E
              </div>
              <span className="text-xl font-bold">EduNoteLab</span>
            </div>
            <button
              onClick={enterApp}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Open App →
            </button>
          </div>
        </header>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-semibold mb-6">
                🔒 Privacy-first • 🧠 AI-ready • ⚡ Live Preview
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your AI-Powered <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Study Notebook</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Paste HTML or code, see instant previews, organize by Projects → Sections → Notes, and export AI-ready context. All stored locally on your device.
              </p>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={enterApp}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </button>
                <a
                  href="#how"
                  className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-semibold text-lg transition-all"
                >
                  See How It Works
                </a>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
              <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs text-gray-500">index.html — preview</span>
              </div>
              <div className="p-4 bg-gray-900">
                <pre className="text-sm text-gray-300 overflow-x-auto">
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
        </section>

        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What makes EduNoteLab different?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built for technical learners: networking, systems, cloud, and frontend dev. Live split-view rendering keeps your notes structured and searchable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '⧉', title: 'Split View Editor', desc: 'Code on the left with Monaco syntax highlighting, live preview on the right — perfect for HTML/JS labs.' },
              { icon: '#', title: 'Projects → Sections → Notes', desc: 'Keep big topics tidy. Hierarchical structure with tags and full-text search across everything.' },
              { icon: '🔁', title: 'Auto-save & Checkpoints', desc: 'Every change saved locally. Create version snapshots you can roll back to anytime.' },
              { icon: '🌐', title: 'Translate on Demand', desc: 'Optional API hook for translations and side-by-side viewing (via backend proxy).' },
              { icon: '🔒', title: 'Privacy-First', desc: 'No backend required. Your data stays on your device. Export/import JSON at will.' },
              { icon: '🤖', title: 'AI Context Export', desc: 'Export your complete learning context for Claude, ChatGPT, or any AI assistant.' }
            ].map((feature, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-indigo-600/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl mb-4 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The "Magic Copy-Paste" workflow with AI makes beautiful notes in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-700/50 rounded-2xl p-6">
              <div className="text-4xl font-bold text-indigo-400 mb-3">1</div>
              <h3 className="text-xl font-bold mb-2">Ask AI</h3>
              <p className="text-gray-400">"Generate a styled HTML note about HSRP with commands & explanations."</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-2xl p-6">
              <div className="text-4xl font-bold text-purple-400 mb-3">2</div>
              <h3 className="text-xl font-bold mb-2">Paste</h3>
              <p className="text-gray-400">Create a note → paste the HTML into the code pane.</p>
            </div>
            <div className="bg-gradient-to-br from-pink-900/30 to-cyan-900/30 border border-pink-700/50 rounded-2xl p-6">
              <div className="text-4xl font-bold text-cyan-400 mb-3">3</div>
              <h3 className="text-xl font-bold mb-2">Preview</h3>
              <p className="text-gray-400">Toggle split view and see your formatted page instantly.</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={enterApp}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Start Learning Now →
            </button>
          </div>
        </section>

        <footer className="border-t border-gray-800 mt-20">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-gray-400">
            <div>© {new Date().getFullYear()} EduNoteLab — Made for learners.</div>
            <div className="flex gap-6">
              <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
              <a href="#how" className="hover:text-indigo-400 transition-colors">How it works</a>
              <button onClick={enterApp} className="hover:text-indigo-400 transition-colors font-semibold">Open App</button>
            </div>
          </div>
        </footer>
      </div>
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
