import { useState, useEffect } from 'react';
import API from '../api';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await API.get('/images');
      setImages(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching images');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    // Frontend file size/type validation
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }
    if (!selectedFile.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setLoading(true);
      // Do NOT set Content-Type header manually; browser will set the correct multipart boundary
      const resp = await API.post('/images/upload', formData);
      setSelectedFile(null);
      setError(null);
      // if backend returns the created image or a list, we can optimistically add it
      // but we'll simply refresh from server to keep behavior consistent
      fetchImages();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error uploading image');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!filename) return;
    // optimistic UI: remove immediately then revert on failure
    const previous = images;
    setImages((list) => list.filter((i) => i.filename !== filename));
    try {
      await API.delete(`/images/${encodeURIComponent(filename)}`);
      setError(null);
    } catch (err) {
      // revert
      setImages(previous);
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError('Failed to delete image');
    }
  };

  return (
    <div className="image-gallery">
      <div className="upload-section" style={{ marginBottom: '1rem', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
        <input className="input" type="file" accept="image/*" onChange={handleFileChange} />
        <button className="primary" onClick={handleUpload} disabled={loading || !selectedFile}>
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
        {error && <div className="error">{error}</div>}
      </div>

      <div className="gallery-grid image-grid">
        {images.map((image) => (
          <div key={image.filename || image.url} className="gallery-item">
            <button className="delete-btn" onClick={() => handleDelete(image.filename)} title="Delete image">×</button>
            <img src={image.url} alt={image.filename} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;