import React, { useState } from 'react';
import '../styles.css';

const EditDisciplineModal = ({ discipline, onClose, onSave }) => {
  const [name, setName] = useState(discipline?.name || '');
  const [description, setDescription] = useState(discipline?.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, description });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{discipline ? 'Редактировать дисциплину' : 'Добавить дисциплину'}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="modal-input"
            required
          />
          <textarea
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="modal-textarea"
          />
          <div className="modal-buttons">
            <button type="submit" className="modal-button">
              {discipline ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={onClose} className="modal-button cancel">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDisciplineModal;