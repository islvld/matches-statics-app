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

const Text = styled.p`
  margin: 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f5f5f5;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: ${(props) => (props.disabled ? '#f5f5f5' : 'white')};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
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

const EditMatchModal = ({ match, onClose, onSave }) => {
  const [disciplines, setDisciplines] = useState([]); // Список дисциплин
  const [teams, setTeams] = useState([]); // Список всех команд
  const [formData, setFormData] = useState({
    discipline_id: '',
    team1_id: '',
    team2_id: '',
    start_time: '',
    end_time: '',
    status: 'upcoming',
    team1_score: 0,
    team2_score: 0,
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

  // При открытии модального окна заполняем форму данными матча
  useEffect(() => {
    if (match) {
      setFormData({
        discipline_id: match.discipline_id,
        team1_id: match.team1_id,
        team2_id: match.team2_id,
        start_time: match.start_time,
        end_time: match.end_time || '',
        status: match.status,
        team1_score: match.team1_score || 0,
        team2_score: match.team2_score || 0,
      });
    }
  }, [match]);

  // Обработка изменений в форме
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Обработка отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();

    // Валидация данных
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
    onSave({ ...formData, id: match.id }); // Вызов функции сохранения с ID матча
  };

  // Находим название дисциплины по ID
  const disciplineName = disciplines.find((d) => d.id === parseInt(formData.discipline_id))?.name || '';

  // Находим названия команд по ID
  const team1Name = teams.find((t) => t.id === parseInt(formData.team1_id))?.name || '';
  const team2Name = teams.find((t) => t.id === parseInt(formData.team2_id))?.name || '';

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>Редактировать матч #{match?.id}</h2> {/* Отображаем номер матча */}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleSubmit}>
          {/* Поле для отображения дисциплины */}
          <FormGroup>
            <Label>Дисциплина</Label>
            <Text>{disciplineName}</Text>
          </FormGroup>

          {/* Поле для отображения команды 1 */}
          <FormGroup>
            <Label>Команда 1</Label>
            <Text>{team1Name}</Text>
          </FormGroup>

          {/* Поле для отображения команды 2 */}
          <FormGroup>
            <Label>Команда 2</Label>
            <Text>{team2Name}</Text>
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

export default EditMatchModal;