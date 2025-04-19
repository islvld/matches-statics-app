import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditDisciplineModal from './editDisciplineModal';
import '../styles.css';

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

const Disciplines = ({ isAdmin }) => {
  const [disciplines, setDisciplines] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDisciplines = async (page = 1, limit = 3) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/disciplines?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      setDisciplines(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Ошибка при загрузке дисциплин:', error);
      setErrorMessage('Ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisciplines();
  }, []);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchDisciplines(page, pagination.itemsPerPage);
    }
  };

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
            setSelectedDiscipline(null);
            setShowEditModal(true);
          }}
        >
          Добавить дисциплину
        </button>
      )}
      
      {isLoading ? (
        <p>Загрузка...</p>
      ) : filteredDisciplines.length > 0 ? (
        <>
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