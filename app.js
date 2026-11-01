// Клас для одного слова
class Word {
    constructor(title, definition, example, category, id) {
        this.id = id || Date.now().toString(); // Простий генератор ID
        this.title = title;
        this.definition = definition;
        this.example = example;
        this.category = category;
    }
}

// Клас для роботи зі словником
class Dictionary {
    constructor() {
        this.words = [];
        this.loadFromStorage();
    }

    addWord(word) {
        this.words.push(word);
        this.saveToStorage();
    }

    deleteWord(id) {
        this.words = this.words.filter(w => w.id !== id);
        this.saveToStorage();
    }

    updateWord(id, updatedWord) {
        let index = this.words.findIndex(w => w.id === id);
        if (index !== -1) {
            this.words[index] = updatedWord;
            this.saveToStorage();
        }
    }

    saveToStorage() {
        localStorage.setItem('myDict', JSON.stringify(this.words));
    }

    loadFromStorage() {
        let data = localStorage.getItem('myDict');
        if (data) {
            this.words = JSON.parse(data);
        }
    }
}

let dict = new Dictionary();
let form = document.getElementById('word-form');
let list = document.getElementById('word-list');
let searchInput = document.getElementById('search');

// Функція виведення списку на екран
function renderList(searchQuery = '') {
    list.innerHTML = '';
    
    // Сортуємо по алфавіту
    let sortedWords = [...dict.words].sort((a, b) => a.title.localeCompare(b.title));

    sortedWords.forEach(word => {
        // Якщо є пошуковий запит, фільтруємо елементи
        if (searchQuery !== '') {
            let regex = new RegExp(searchQuery, 'i');
            if (!regex.test(word.title) && !regex.test(word.definition)) {
                return; // Пропускаємо, якщо немає збігів
            }
        }

        let li = document.createElement('li');
        li.dataset.id = word.id;
        
        // Функція для підсвітки знайденого тексту (метод replace)
        function highlight(text) {
            if (!searchQuery) return text;
            let reg = new RegExp(`(${searchQuery})`, 'gi');
            return text.replace(reg, '<span class="highlight">$1</span>');
        }

        li.innerHTML = `
            <h3>${highlight(word.title)} (${word.category})</h3>
            <p><b>Визначення:</b> ${highlight(word.definition)}</p>
            <p><b>Приклад:</b> ${word.example}</p>
            <button class="edit-btn">Редагувати</button>
            <button class="del-btn">Видалити</button>
        `;
        
        list.appendChild(li);
    });
}

// Обробка відправки форми
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Зупиняємо перезавантаження сторінки
    
    let id = document.getElementById('word-id').value;
    let title = document.getElementById('title').value;
    let definition = document.getElementById('definition').value;
    let example = document.getElementById('example').value;
    let category = document.getElementById('category').value;

    // Додаткова перевірка в JS регулярним виразом
    let wordRegex = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s-]+$/;
    if (!wordRegex.test(title)) {
        alert("Слово має містити лише літери!");
        return;
    }

    let newWord = new Word(title, definition, example, category, id ? id : null);

    if (id) {
        dict.updateWord(id, newWord);
        document.getElementById('word-id').value = '';
        document.getElementById('cancel-btn').style.display = 'none';
    } else {
        dict.addWord(newWord);
    }

    form.reset();
    renderList(searchInput.value);
});

// Делегування подій для кнопок видалення та редагування
list.addEventListener('click', function(event) {
    let li = event.target.closest('li');
    if (!li) return;
    let id = li.dataset.id;

    if (event.target.classList.contains('del-btn')) {
        let isConfirmed = confirm("Дійсно видалити?");
        if (isConfirmed) {
            dict.deleteWord(id);
            renderList(searchInput.value);
        }
    }

    if (event.target.classList.contains('edit-btn')) {
        let wordToEdit = dict.words.find(w => w.id === id);
        if (wordToEdit) {
            document.getElementById('word-id').value = wordToEdit.id;
            document.getElementById('title').value = wordToEdit.title;
            document.getElementById('definition').value = wordToEdit.definition;
            document.getElementById('example').value = wordToEdit.example;
            document.getElementById('category').value = wordToEdit.category;
            
            document.getElementById('cancel-btn').style.display = 'inline-block';
        }
    }
});

// Кнопка скасування редагування
document.getElementById('cancel-btn').addEventListener('click', function() {
    form.reset();
    document.getElementById('word-id').value = '';
    this.style.display = 'none';
});

// Обробка події input для пошуку в реальному часі
searchInput.addEventListener('input', function() {
    renderList(this.value.trim());
});

// Завантаження списку при відкритті сторінки
renderList();