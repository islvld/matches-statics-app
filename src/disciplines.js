import React, { useEffect, useState } from 'react';

const Disciplines = () => {
  const [disciplines, setDisciplines] = useState([]);

  useEffect(() => {
    fetch('/api/disciplines')
      .then(response => response.json())
      .then(data => setDisciplines(data))
      .catch(error => console.error('Ошибка при загрузке дисциплин:', error));
  }, []);

  return (
    
    <div>
        <h1>Дисциплины</h1>
        {disciplines.length > 0 ? (
            <ul>
                {disciplines.map((discipline) => (
                    <li key={discipline.id}>
                        <h2>{discipline.name}</h2>
                        <p>{discipline.description || 'Описание отсутствует'}</p>
                    </li>
                ))}
            </ul>
        ) : (
            <p>Нет данных для отображения</p>
        )}
    </div>
  );
};
console.log('Состояние disciplines:', Disciplines);
export default Disciplines;