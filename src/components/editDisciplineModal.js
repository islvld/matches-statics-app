import React, { useState } from 'react';

const EditDisciplineModal = ({ discipline, onClose, onSave }) => {
  const [name, setName] = useState(discipline?.name || '');
  const [description, setDescription] = useState(discipline?.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Данные для сохранения:', { name, description }); // Логирование данных
    onSave({ name, description }); // Вызов функции onSave
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h2>{discipline ? 'Редактировать дисциплину' : 'Добавить дисциплину'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div style={styles.buttonContainer}>
            <button type="submit">{discipline ? 'Сохранить' : 'Добавить'}</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '300px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
};

export default EditDisciplineModal;