import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

const Disciplines = () => {
  const [disciplines, setDisciplines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  return (
    <DisciplinesContainer>
      <h1>Дисциплины</h1>
      <SearchBar
        type="text"
        placeholder="Поиск по дисциплинам..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredDisciplines.length > 0 ? (
        <div>
          {filteredDisciplines.map((discipline) => (
            <DisciplineCard
              key={discipline.id}
              onClick={() => handleDisciplineClick(discipline.id)}
            >
              <h2>{discipline.name}</h2>
              <p>{discipline.description || 'Описание отсутствует'}</p>
            </DisciplineCard>
          ))}
        </div>
      ) : (
        <p>Нет данных для отображения</p>
      )}
    </DisciplinesContainer>
  );
};

export default Disciplines;