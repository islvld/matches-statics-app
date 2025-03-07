import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditDisciplineModal from './editDisciplineModal';
import '../styles.css'; // Импорт стилей

const DisciplinesContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const DisciplineCard = styled.div`
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Disciplines = ({ isAdmin }) => {
  const [disciplines, setDisciplines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/disciplines')
      .then(response => response.json())
      .then(data => setDisciplines(data))
      .catch(error => console.error('Ошибка при загрузке дисциплин:', error));
  }, []);

  const filteredDisciplines = disciplines.filter(discipline =>
    discipline.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDisciplineClick = (disciplineId) => {
    navigate(`/matches/${disciplineId}`);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      showError('Недостаточно прав для выполнения операции');
      return;
    }

    const confirmDelete = window.confirm('Вы уверены, что хотите удалить дисциплину?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/disciplines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        showError('Недостаточно прав для удаления дисциплин');
        return;
      }

      if (!response.ok) throw new Error('Ошибка при удалении');
      
      setDisciplines(disciplines.filter(d => d.id !== id));
    } catch (error) {
      showError(error.message);
    }
  };

  const handleSave = async (data) => {
    if (!isAdmin) {
      showError('Недостаточно прав для выполнения операции');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = selectedDiscipline 
        ? `/api/disciplines/${selectedDiscipline.id}`
        : '/api/disciplines';
      const method = selectedDiscipline ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 403) {
        showError('Недостаточно прав для изменения дисциплин');
        return;
      }

      if (!response.ok) throw new Error('Ошибка при сохранении');

      const updatedDisciplines = await fetch('/api/disciplines').then(res => res.json());
      setDisciplines(updatedDisciplines);
      setShowEditModal(false);
      setSelectedDiscipline(null);
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <DisciplinesContainer>
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      <h1>Дисциплины</h1>
      <SearchBar
        type="text"
        placeholder="Поиск по дисциплинам..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isAdmin && (
        <button
          className="add-button"
          onClick={() => {
            setSelectedDiscipline(null); // Сброс выбранной дисциплины для добавления
            setShowEditModal(true);
          }}
        >
          Добавить дисциплину
        </button>
      )}
      {filteredDisciplines.length > 0 ? (
        <div>
          {filteredDisciplines.map((discipline) => (
            <DisciplineCard
              key={discipline.id}
              onClick={() => handleDisciplineClick(discipline.id)}
            >
              <h2>{discipline.name}</h2>
              <p>{discipline.description || 'Описание отсутствует'}</p>
              {isAdmin && (
                <div>
                  <button
                    className="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDiscipline(discipline);
                      setShowEditModal(true);
                    }}
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(discipline.id);
                    }}
                  >
                    🗑️ Удалить
                  </button>
                </div>
              )}
            </DisciplineCard>
          ))}
        </div>
      ) : (
        <p>Нет данных для отображения</p>
      )}
      {showEditModal && (
        <EditDisciplineModal
          discipline={selectedDiscipline}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDiscipline(null);
          }}
          onSave={handleSave}
        />
      )}
    </DisciplinesContainer>
  );
};

export default Disciplines;