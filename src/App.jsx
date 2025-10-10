import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, Code, Split, Plus, Trash2, ChevronRight, ChevronDown, 
  FileText, FolderOpen, Folder, Languages, Download, Upload, 
  Search, Save, Edit2, X, Tag, Play, AlertCircle, Brain 
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import DOMPurify from 'dompurify';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { debounce } from 'lodash';

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
        purpose: 'AI Learning Context - Complete study snapshot for Claude/Astra/Grok/GPT',
        studentInfo: {
          learningGoals: ['TSSR Certification 2026', 'React Development', 'Full-Stack Development', 'Network Administration'],
          lastActivity: new Date().toISOString(),
          totalStudyTime: 'Tracked via checkpoints'
        }
      },
      overview: {
        totalProjects: data.projects.length,
        totalSections: data.projects.reduce((acc, p) => acc + p.sections.length, 0),
        totalNotes: data.projects.reduce((acc, p) => 
          acc + p.sections.reduce((acc2, s) => acc2 + s.notes.length, 0), 0),
        allTags: [...new Set(data.projects.flatMap(p => 
          p.sections.flatMap(s => s.notes.flatMap(n => n.tags))))].sort(),
        totalContentSize: data.projects.reduce((acc, p) => 
          acc + p.sections.reduce((acc2, s) => 
            acc2 + s.notes.reduce((acc3, n) => acc3 + n.content.length, 0), 0), 0)
      },
      completeStructure: data.projects.map(project => ({
        projectName: project.name,
        projectId: project.id,
        sections: project.sections.map(section => ({
          sectionName: section.name,
          sectionId: section.id,
          noteCount: section.notes.length,
          notes: section.notes.map(note => ({
            noteTitle: note.title,
            noteId: note.id,
            tags: note.tags,
            language: note.language || 'html',
            contentLength: note.content.length,
            contentPreview: note.content.substring(0, 200) + '...',
            fullContent: note.content,
            hasCheckpoints: (note.versions || []).length > 0,
            checkpointCount: (note.versions || []).length,
            versionHistory: (note.versions || []).map(v => ({
              version: v.version,
              date: v.date,
              contentLength: v.content.length
            })),
            lastModified: note.versions && note.versions.length > 0 
              ? note.versions[note.versions.length - 1].date 
              : 'Not tracked',
            createdDate: note.id.startsWith('n') ? new Date(parseInt(note.id.substring(1))).toISOString() : 'unknown'
          }))
        }))
      })),
      learningProgress: {
        notesByTag: {},
        notesByLanguage: {},
        projectCompletionStatus: data.projects.map(p => ({
          project: p.name,
          sections: p.sections.length,
          notes: p.sections.reduce((acc, s) => acc + s.notes.length, 0),
          notesWithCheckpoints: p.sections.reduce((acc, s) => 
            acc + s.notes.filter(n => (n.versions || []).length > 0).length, 0)
        })),
        completionMetrics: {
          notesWithTags: data.projects.flatMap(p => 
            p.sections.flatMap(s => s.notes)).filter(n => n.tags.length > 0).length,
          notesWithCheckpoints: data.projects.flatMap(p => 
            p.sections.flatMap(s => s.notes)).filter(n => (n.versions || []).length > 0).length,
          averageContentLength: Math.round(
            data.projects.reduce((acc, p) => 
              acc + p.sections.reduce((acc2, s) => 
                acc2 + s.notes.reduce((acc3, n) => acc3 + n.content.length, 0), 0), 0) /
            Math.max(1, data.projects.reduce((acc, p) => 
              acc + p.sections.reduce((acc2, s) => acc2 + s.notes.length, 0), 0))
          ),
          mostUsedTags: []
        }
      },
      currentSession: {
        currentlyViewing: selectedNote ? {
          noteTitle: selectedNote.title,
          noteId: selectedNote.id,
          tags: selectedNote.tags,
          contentLength: selectedNote.content.length,
          project: data.projects.find(p => 
            p.sections.some(s => s.notes.some(n => n.id === selectedNote.id)))?.name,
          section: data.projects.flatMap(p => p.sections)
            .find(s => s.notes.some(n => n.id === selectedNote.id))?.name
        } : 'No note selected',
        viewMode: viewMode,
        editorTheme: editorTheme,
        searchActive: searchQuery.length > 0,
        searchQuery: searchQuery
      },
      aiInstructions: {
        purpose: 'This JSON contains the COMPLETE learning context of the student.',
        dataStructure: {
          completeStructure: 'Full hierarchy with ALL note content included',
          fullContent: 'Every note includes the complete HTML/code',
          versionHistory: 'Checkpoint history shows learning progression',
          tags: 'Student-created tags indicate topic focus areas'
        },
        howToAnalyze: [
          'Review overview to understand scope',
          'Check currentSession for current work',
          'Analyze learningProgress for strengths/gaps',
          'Read note content for knowledge depth',
          'Check version history for progression',
          'Use tags to map knowledge domains'
        ]
      }
    };

    const tagCounts = {};
    data.projects.forEach(project => {
      project.sections.forEach(section => {
        section.notes.forEach(note => {
          note.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
      });
    });
    aiContext.learningProgress.notesByTag = tagCounts;

    const langCounts = {};
    data.projects.forEach(project => {
      project.sections.forEach(section => {
        section.notes.forEach(note => {
          const lang = note.language || 'html';
          langCounts[lang] = (langCounts[lang] || 0) + 1;
        });
      });
    });
    aiContext.learningProgress.notesByLanguage = langCounts;

    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    aiContext.learningProgress.completionMetrics.mostUsedTags = sortedTags.map(([tag, count]) => ({
      tag, count
    }));

    const jsonStr = JSON.stringify(aiContext, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edunotelab-ai-context-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert(`✅ AI Context Exported!\n\n📊 ${aiContext.overview.totalProjects} Projects\n📝 ${aiContext.overview.totalNotes} Notes\n🏷️ ${aiContext.overview.allTags.length} Tags`);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        setData(imported);
        alert('✅ Import successful!');
      } catch (err) {
        alert('❌ Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const getSanitizedHTML = () => {
    if (!selectedNote) return '';
    
    if (allowScripts) {
      return selectedNote.content;
    }
    
    return DOMPurify.sanitize(selectedNote.content, {
      ALLOWED_TAGS: ['html', 'head', 'body', 'title', 'meta', 'link', 'style', 
                     'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                     'ul', 'ol', 'li', 'a', 'img', 'br', 'hr', 'table', 'tr', 
                     'td', 'th', 'thead', 'tbody', 'strong', 'em', 'b', 'i', 'u'],
      ALLOWED_ATTR: ['class', 'id', 'style', 'href', 'src', 'alt', 'title', 'target']
    });
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

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* SIDEBAR */}
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

      {/* MAIN CONTENT */}
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
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                showTranslation ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title="Translation"
            >
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline">Translate</span>
            </button>
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
                <div className="mt-8 text-sm text-gray-400 space-y-2">
                  <p>✨ Split-view editor with live preview</p>
                  <p>🔍 Search across all notes</p>
                  <p>🏷️ Organize with tags</p>
                  <p>💾 Auto-save to browser</p>
                  <p>🤖 AI Context Export for learning assistance</p>
                </div>
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

        {showTranslation && selectedNote && (
          <div className="h-48 bg-gray-800 border-t border-gray-700 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Languages className="w-5 h-5 text-indigo-400" />
                Translation Preview
              </h3>
              <div className="flex items-center gap-2">
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="ja">🇯🇵 日本語</option>
                  <option value="zh">🇨🇳 中文</option>
                  <option value="ar">🇸🇦 العربية</option>
                </select>
                <button
                  onClick={() => setShowTranslation(false)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-700/30 rounded-lg p-4">
              <div className="flex items-start gap-2 text-sm text-gray-300 mb-2">
                <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Translation Feature (Backend Required)</p>
                  <p className="text-xs text-gray-400">
                    To use real-time translation, integrate Google Translate, DeepL, or LibreTranslate API.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ); 
}

export default App;
