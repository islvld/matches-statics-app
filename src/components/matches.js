import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const MatchesContainer = styled.div`
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

const MatchCard = styled.div`
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Matches = () => {
  const { disciplineId } = useParams();
  const [matches, setMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`/api/matches?disciplineId=${disciplineId}`)
      .then(response => response.json())
      .then(data => setMatches(data))
      .catch(error => console.error('Ошибка при загрузке матчей:', error));
  }, [disciplineId]);

  // Фильтрация матчей по названию команды
  const filteredMatches = matches.filter(match =>
    match.team1_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.team2_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MatchesContainer>
      <h1>Матчи</h1>
      <SearchBar
        type="text"
        placeholder="Поиск по командам..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredMatches.length > 0 ? (
        <div>
          {filteredMatches.map((match) => (
            <MatchCard key={match.id}>
              <h2>Событие #{match.id}</h2>
              <p>Дата и время: {new Date(match.start_time).toLocaleString()}</p>
              <p>Команда 1: {match.team1_name}</p>
              <p>Команда 2: {match.team2_name}</p>
              <p>Статус: {match.status}</p>
              {match.status === 'completed' && (
                <p>
                  Счет: {match.team1_name} {match.team1_score} - {match.team2_score} {match.team2_name}
                </p>
              )}
              {match.winner_team_id && (
                <p>Победитель: {match.winner_team_id === match.team1_id ? match.team1_name : match.team2_name}</p>
              )}
            </MatchCard>
          ))}
        </div>
      ) : (
        <p>Нет матчей для отображения</p>
      )}
    </MatchesContainer>
  );
};

export default Matches;