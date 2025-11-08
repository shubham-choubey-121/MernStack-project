import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api/tasks' });

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await API.get('/');
      setTasks(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/${id}`);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleStatus = async (task) => {
    try {
      const newStatus =
        task.status === 'Pending'
          ? 'In Progress'
          : task.status === 'In Progress'
          ? 'Completed'
          : 'Pending';
      await API.put(`/${task._id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const saveEdit = async (id) => {
    try {
      await API.put(`/${id}`, { title: editTitle, description: editDescription });
      cancelEdit();
      fetchTasks();
    } catch (err) {
      console.error('Failed to save task', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    const onTasksUpdated = () => fetchTasks();
    window.addEventListener('tasksUpdated', onTasksUpdated);
    return () => window.removeEventListener('tasksUpdated', onTasksUpdated);
  }, []);

  return (
    <div>
      <h3>Task List</h3>
      {tasks.length === 0 && <div className="muted">No tasks yet.</div>}
      {tasks.map((task) => (
        <div key={task._id} className="task-card">
          {editingId === task._id ? (
            <div>
              <div className="field">
                <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="field">
                <textarea className="input" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem' }}>
                <button className="ghost" onClick={cancelEdit}>Cancel</button>
                <button className="primary" onClick={() => saveEdit(task._id)}>Save</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{task.title}</h4>
                <div className="task-meta">{task.status}</div>
              </div>
              {task.description && <p className="muted" style={{ marginTop: '.5rem' }}>{task.description}</p>}
              <div style={{ marginTop: '.6rem', display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => toggleStatus(task)} className="ghost">Toggle</button>
                <button onClick={() => startEdit(task)} className="ghost">Edit</button>
                <button onClick={() => deleteTask(task._id)} className="ghost">Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
