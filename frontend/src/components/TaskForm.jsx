import React, { useState } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: `${process.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks` });

const TaskForm = ({ fetchTasks }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/', { title, description });
  setTitle('');
  setDescription('');
      if (typeof fetchTasks === 'function') {
        fetchTasks();
      }
      // notify other components (TaskList) to refresh when parent didn't pass fetchTasks
      try {
        window.dispatchEvent(new Event('tasksUpdated'));
      } catch (err) {
        // ignore in non-browser environments
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <h3>Add New Task</h3>
      <div className="field">
        <input
          className="input"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <textarea
          className="input"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>
      <div className="actions">
        <button type="submit" className="primary">Add Task</button>
      </div>
    </form>
  );
};

export default TaskForm;
