const mysql = require('mysql2/promise');
const { faker } = require('@faker-js/faker');

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_new_password',
    database: 'mydatabase'
  });

  try {
    // Обновляем или добавляем дивизионы
    const division = [
      ['Новичок', 0, 1000],
      ['Любитель', 1001, 2000],
      ['Продвинутый', 2001, 3000],
      ['Эксперт', 3001, 4000],
      ['Мастер', 4001, 5000]
    ];

    for (const [name, min_rating, max_rating] of division) {
      await connection.execute(
        'INSERT INTO divisions (name, min_rating, max_rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE min_rating = VALUES(min_rating), max_rating = VALUES(max_rating)',
        [name, min_rating, max_rating]
      );
    }

    console.log('Дивизионы успешно обновлены');

    // Обновляем или добавляем членов
    for (let i = 0; i < 100; i++) {
      const member = {
        user_id: faker.number.int({ min: 1000, max: 9999 }),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        rating: faker.number.int({ min: 0, max: 5000 })
      };

      const query = `
        INSERT INTO members (user_id, first_name, last_name, rating)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          rating = VALUES(rating)
      `;

      await connection.execute(query, Object.values(member));
    }

    console.log('Члены успешно обновлены и добавлены');
  } catch (error) {
    console.error('Ошибка при обновлении данных:', error);
  } finally {
    await connection.end();
  }
}

seed();