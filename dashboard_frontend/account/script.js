document.addEventListener('DOMContentLoaded', function() {
    // Пример: загрузка данных пользователя
    const userData = {
        nickname: 'CoolNickname',
        balance: 10000,
        avatar: 'https://i.pravatar.cc/150?img=3'
    };
    
    // Обновляем данные на странице
    document.getElementById('profileNickname').textContent = userData.nickname;
    document.getElementById('profileBalance').textContent = userData.balance.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('profileAvatar').src = userData.avatar;
    
    // Обработчик кнопки пополнения баланса
    document.getElementById('depositBtn').addEventListener('click', function() {
        alert('Функция пополнения баланса будет реализована позже');
    });
    
    // Обработчик смены аватара
    document.querySelector('.edit-avatar').addEventListener('click', function(e) {
        e.preventDefault();
        const newAvatar = prompt('Введите URL нового аватара:');
        if (newAvatar) {
            document.getElementById('profileAvatar').src = newAvatar;
        }
    });
});