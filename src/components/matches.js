import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import AddMatchModal from './addMatchModal';
import EditMatchModal from './editMatchModal';
import '../styles.css';

const MatchesContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #007bff;
  }
`;

const MatchCard = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f5f5f5'};
  }
`;

const Matches = ({ isAdmin }) => {
  const { disciplineId } = useParams();
  const [matches, setMatches] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 3
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [showEditMatchModal, setShowEditMatchModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Обернули fetchMatches в useCallback
  const fetchMatches = useCallback(async (page = 1, limit = 3, search = '') => {
    setIsLoading(true);
    try {
      const url = `/api/matches?disciplineId=${disciplineId}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      setMatches(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Ошибка при загрузке матчей:', error);
      setErrorMessage('Ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
    }
  }, [disciplineId]); // Зависимости useCallback

  useEffect(() => {
    fetchMatches(1, pagination.itemsPerPage, searchTerm);
  }, [fetchMatches, pagination.itemsPerPage, searchTerm]); 

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchMatches(page, pagination.itemsPerPage, searchTerm);
    }
  };

  const handleSaveMatch = async (matchData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен авторизации отсутствует');
        return;
      }

      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        throw new Error('Ошибка при сохранении матча');
      }

      fetchMatches(pagination.currentPage, pagination.itemsPerPage, searchTerm);
      setShowAddMatchModal(false);
    } catch (error) {
      console.error('Ошибка:', error);
      setErrorMessage('Ошибка при сохранении матча');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleEditMatch = async (matchData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/matches/${matchData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении матча');
      }

      fetchMatches(pagination.currentPage, pagination.itemsPerPage, searchTerm);
      setShowEditMatchModal(false);
    } catch (error) {
      console.error('Ошибка:', error);
      setErrorMessage('Ошибка при обновлении матча');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDeleteMatch = async (id) => {
    const confirmDelete = window.confirm('Вы уверены, что хотите удалить матч?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении матча');
      }

      fetchMatches(pagination.currentPage, pagination.itemsPerPage, searchTerm);
    } catch (error) {
      console.error('Ошибка:', error);
      setErrorMessage('Ошибка при удалении матча');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <MatchesContainer>
      <h1>Матчи</h1>
      {isAdmin && (
        <button className="add-button" onClick={() => setShowAddMatchModal(true)}>
          Добавить матч
        </button>
      )}
      {showAddMatchModal && (
        <AddMatchModal
          onClose={() => setShowAddMatchModal(false)}
          onSave={handleSaveMatch}
          disciplineId={disciplineId}
        />
      )}
      {showEditMatchModal && (
        <EditMatchModal
          match={selectedMatch}
          onClose={() => setShowEditMatchModal(false)}
          onSave={handleEditMatch}
        />
      )}
      <SearchBar
        type="text"
        placeholder="Поиск по командам..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isLoading ? (
        <p>Загрузка...</p>
      ) : matches.length > 0 ? (
        <>
          <div>
            {matches.map((match) => (
              <MatchCard key={match.id}>
                <h2>Событие #{match.id}</h2>
                <p>Дата и время: {new Date(match.start_time).toLocaleString()}</p>
                <p>Команда 1: {match.team1_name}</p>
                <p>Команда 2: {match.team2_name}</p>
                <p>Статус: {match.status}</p>
                {match.status === 'completed' && (
                  <>
                    <p>
                      Счет: {match.team1_name} {match.team1_score} - {match.team2_score} {match.team2_name}
                    </p>
                    <p>
                      Победитель:{" "}
                      {match.winner_team_id === null
                        ? "Ничья"
                        : match.winner_team_id === match.team1_id
                        ? match.team1_name
                        : match.team2_name}
                    </p>
                  </>
                )}
                {isAdmin && (
                  <div>
                    <button
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMatch(match);
                        setShowEditMatchModal(true);
                      }}
                    >
                      ✏️ Редактировать
                    </button>
                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMatch(match.id);
                      }}
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                )}
              </MatchCard>
            ))}
          </div>
          
          <Pagination>
            <PageButton 
              onClick={() => handlePageChange(1)}
              disabled={pagination.currentPage === 1}
            >
              «
            </PageButton>
            <PageButton 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              ‹
            </PageButton>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(
                pagination.currentPage - 2,
                pagination.totalPages - 4
              )) + i;
              return (
                <PageButton
                  key={page}
                  onClick={() => handlePageChange(page)}
                  active={page === pagination.currentPage}
                >
                  {page}
                </PageButton>
              );
            })}
            
            <PageButton 
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              ›
            </PageButton>
            <PageButton 
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              »
            </PageButton>
          </Pagination>
          
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            Страница {pagination.currentPage} из {pagination.totalPages}
          </div>
        </>
      ) : (
        <p>Нет матчей для отображения</p>
      )}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
    </MatchesContainer>
  );
};

export default Matches;