import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Стили для модального окна
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background: #0056b3;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-bottom: 15px;
`;

const AddMatchModal = ({ onClose, onSave }) => {
  const [disciplines, setDisciplines] = useState([]); // Список дисциплин
  const [teams, setTeams] = useState([]); // Список всех команд
  const [filteredTeams, setFilteredTeams] = useState([]); // Команды, отфильтрованные по дисциплине
  const [formData, setFormData] = useState({
    discipline_id: '',
    team1_id: '',
    team2_id: '',
    start_time: '',
    end_time: '',
    status: 'upcoming',
    team1_score: 0, // Счет команды 1
    team2_score: 0, // Счет команды 2
  });
  const [error, setError] = useState(''); // Сообщение об ошибке

  // Загрузка дисциплин и команд при монтировании компонента
  useEffect(() => {
    // Загружаем список дисциплин
    fetch('/api/disciplines')
      .then((response) => response.json())
      .then((data) => setDisciplines(data))
      .catch((error) => console.error('Ошибка при загрузке дисциплин:', error));

    // Загружаем список команд
    fetch('/api/teams')
      .then((response) => response.json())
      .then((data) => setTeams(data))
      .catch((error) => console.error('Ошибка при загрузке команд:', error));
  }, []);

  // Фильтрация команд при изменении выбранной дисциплины
  useEffect(() => {
    if (formData.discipline_id) {
      const filtered = teams.filter(
        (team) => team.discipline_id === parseInt(formData.discipline_id)
      );
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams([]);
    }
  }, [formData.discipline_id, teams]);

  // Обработка изменений в форме
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Обработка отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();

    // Валидация данных
    if (!formData.discipline_id) {
      setError('Выберите дисциплину');
      return;
    }
    if (!formData.team1_id || !formData.team2_id) {
      setError('Выберите обе команды');
      return;
    }
    if (formData.team1_id === formData.team2_id) {
      setError('Команды должны быть разными');
      return;
    }
    if (!formData.start_time) {
      setError('Укажите дату и время начала');
      return;
    }
    if (formData.status === 'completed' && !formData.end_time) {
      setError('Укажите дату и время окончания');
      return;
    }
    if (formData.status === 'completed' && (formData.team1_score === '' || formData.team2_score === '')) {
      setError('Укажите счет матча');
      return;
    }

    console.log('Данные для сохранения:', formData);
    setError(''); // Сброс ошибки
    onSave(formData); // Вызов функции сохранения
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>Добавить матч</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleSubmit}>
          {/* Поле выбора дисциплины */}
          <FormGroup>
            <Label>Дисциплина</Label>
            <Select
              name="discipline_id"
              value={formData.discipline_id}
              onChange={handleChange}
              required
            >
              <option value="">Выберите дисциплину</option>
              {disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          {/* Поле выбора команды 1 */}
          <FormGroup>
            <Label>Команда 1</Label>
            <Select
              name="team1_id"
              value={formData.team1_id}
              onChange={handleChange}
              required
            >
              <option value="">Выберите команду 1</option>
              {filteredTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          {/* Поле выбора команды 2 */}
          <FormGroup>
            <Label>Команда 2</Label>
            <Select
              name="team2_id"
              value={formData.team2_id}
              onChange={handleChange}
              required
            >
              <option value="">Выберите команду 2</option>
              {filteredTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          {/* Поле выбора даты и времени начала */}
          <FormGroup>
            <Label>Дата и время начала</Label>
            <Input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </FormGroup>

          {/* Поле выбора даты и времени окончания (отображается только для завершенных матчей) */}
          {formData.status === 'completed' && (
            <FormGroup>
              <Label>Дата и время окончания</Label>
              <Input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </FormGroup>
          )}

          {/* Поле выбора статуса */}
          <FormGroup>
            <Label>Статус</Label>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="upcoming">Запланирован</option>
              <option value="ongoing">В процессе</option>
              <option value="completed">Завершен</option>
            </Select>
          </FormGroup>

          {/* Поля для ввода счета (отображаются только для завершенных матчей) */}
          {formData.status === 'completed' && (
            <>
              <FormGroup>
                <Label>Счет команды 1</Label>
                <Input
                  type="number"
                  name="team1_score"
                  value={formData.team1_score}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Счет команды 2</Label>
                <Input
                  type="number"
                  name="team2_score"
                  value={formData.team2_score}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </>
          )}

          {/* Кнопки */}
          <Button type="submit">Сохранить</Button>
          <Button type="button" onClick={onClose}>
            Отмена
          </Button>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddMatchModal;