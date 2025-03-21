import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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

const AddMatchModal = ({ onClose, onSave }) => {
  const [disciplines, setDisciplines] = useState([]);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    discipline_id: '',
    team1_id: '',
    team2_id: '',
    start_time: '',
    end_time: '',
    status: 'scheduled',
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>Добавить матч</h2>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Дисциплина</Label>
            <Select name="discipline_id" value={formData.discipline_id} onChange={handleChange} required>
              <option value="">Выберите дисциплину</option>
              {disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Команда 1</Label>
            <Select name="team1_id" value={formData.team1_id} onChange={handleChange} required>
              <option value="">Выберите команду 1</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Команда 2</Label>
            <Select name="team2_id" value={formData.team2_id} onChange={handleChange} required>
              <option value="">Выберите команду 2</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          </FormGroup>
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
          <FormGroup>
            <Label>Статус</Label>
            <Select name="status" value={formData.status} onChange={handleChange} required>
              <option value="scheduled">Запланирован</option>
              <option value="in_progress">В процессе</option>
              <option value="completed">Завершен</option>
            </Select>
          </FormGroup>
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