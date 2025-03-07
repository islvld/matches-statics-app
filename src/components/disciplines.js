import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import EditDisciplineModal from './editDisciplineModal';

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

 const handleDelete = async (id) => {
  const confirmDelete = window.confirm('Вы уверены, что хотите удалить дисциплину?');
  if (confirmDelete) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/disciplines/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      setDisciplines(disciplines.filter(d => d.id !== id));
    }
  }
};

const handleSave = async (data) => {
  const token = localStorage.getItem('token');
  const url = selectedDiscipline ? `/api/disciplines/${selectedDiscipline.id}` : '/api/disciplines';
  const method = selectedDiscipline ? 'PUT' : 'POST';

  console.log('Отправка данных на сервер:', data); // Логирование данных

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const updatedDisciplines = await fetch('/api/disciplines').then(res => res.json());
      setDisciplines(updatedDisciplines);
      setShowEditModal(false); // Закрытие модального окна
      setSelectedDiscipline(null); // Сброс выбранной дисциплины
    } else {
      console.error('Ошибка при сохранении:', response.statusText);
    }
  } catch (error) {
    console.error('Ошибка при отправке запроса:', error);
  }
};

  return (
    <DisciplinesContainer>
      <h1>Дисциплины</h1>
      <SearchBar
        type="text"
        placeholder="Поиск по дисциплинам..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isAdmin && (
        <button onClick={() => {
          setSelectedDiscipline(null); // Сброс выбранной дисциплины для добавления
          setShowEditModal(true);
        }}>Добавить дисциплину</button>
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
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDiscipline(discipline);
                    setShowEditModal(true);
                  }}>✏️</button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(discipline.id);
                  }}>🗑️</button>
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