# MatchStats - Веб-приложение для статистики матчей

## Описание проекта
**MatchStats** — это веб-приложение для отображения статистики матчей по различным дисциплинам. Проект разработан с использованием **React** и **MySQL Workbench** без использования ORM, с реализацией **CRUD**-функционала и кастомного дизайна.

## Функционал
- **Главная страница**:
  - Отображает список доступных дисциплин (CS2, Valorant, Dota 2, Футбол, Хоккей и др.).
  - Поле поиска по названию дисциплины
- **Страница дисциплины**:
  - Список матчей данной дисциплины.
  - Каждый матч представлен в виде отдельного блока с информацией:
    - Название турнира
    - Дата/время начала
    - Участвующие команды
- **Страница матча**:
  - Подробная информация о матче:
    - Дата/время начала
    - Участвующие команды
    - Счет
- **Поиск и фильтрация**:
  - Возможность искать матчи по названию команд, дисциплины по названию.
  - Отображение результатов поиска по нажатию Enter или кнопки "Продолжить".

## Технологический стек
- **Frontend**: React, JavaScript, CSS
- **Backend**: Node.js (без использования ORM, чистый SQL)
- **База данных**: MySQL
- **Среда разработки**: VS Code

## Структура базы данных
### Таблица дисциплин (`disciplines`)
```sql
CREATE TABLE `disciplines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB;
```

### Таблица команд (`teams`)
```sql
CREATE TABLE `teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `discipline_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`discipline_id`) REFERENCES `disciplines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### Таблица матчей (`matches`)
```sql
CREATE TABLE `matches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discipline_id` int DEFAULT NULL,
  `team1_id` int DEFAULT NULL,
  `team2_id` int DEFAULT NULL,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `winner_team_id` int DEFAULT NULL,
  `status` enum('upcoming','ongoing','completed') DEFAULT 'upcoming',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`discipline_id`) REFERENCES `disciplines` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`team1_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`team2_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`winner_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;
```

### Таблица статистики матчей (`match_statistics`)
```sql
CREATE TABLE `match_statistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_id` int DEFAULT NULL,
  `team1_score` int DEFAULT NULL,
  `team2_score` int DEFAULT NULL,
  `additional_stats` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### Таблица пользователей (`users`)
```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('admin','moderator','user') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB;
```