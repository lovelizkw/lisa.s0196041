const FORMCARRY_FORM_ID = "CvYZzGh1Org";
const FORM_URL = `https://formcarry.com/s/${FORMCARRY_FORM_ID}`;
const FORM_STORAGE_KEY = 'feedback_form_data';

const overlay = document.getElementById('overlay');
const form = document.getElementById('feedbackForm');
const messageDiv = document.getElementById('message');
const submitBtnDesktop = document.getElementById('submitBtnDesktop');
const submitBtnMobile = document.getElementById('submitBtnMobile');
const submitTextDesktop = document.getElementById('submitTextDesktop');
const submitTextMobile = document.getElementById('submitTextMobile');
const submitLoadingDesktop = document.getElementById('submitLoadingDesktop');
const submitLoadingMobile = document.getElementById('submitLoadingMobile');
const phoneInput = document.getElementById('phone');
const openFormBtn = document.getElementById('openFormBtn');
const closeBtn = document.getElementById('closeBtn');
const privacyLink = document.getElementById('privacyLink');

function openForm() {
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    history.pushState({ formOpen: true }, '', '#feedback');
    
    toggleSubmitButtons();
    
    restoreFormData();
}

function closeForm() {
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    hideMessage();
    clearErrors();
    
    if (window.location.hash === '#feedback') {
        history.back();
    }
}

function toggleSubmitButtons() {
    const isMobile = window.innerWidth <= 480;
    
    if (isMobile) {
        submitBtnMobile.classList.remove('hidden');
        submitBtnDesktop.style.display = 'none';
    } else {
        submitBtnMobile.classList.add('hidden');
        submitBtnDesktop.style.display = 'block';
    }
}

window.addEventListener('resize', toggleSubmitButtons);

window.addEventListener('popstate', function(event) {
    if (overlay.style.display === 'block') {
        closeForm();
    }
});

function validateForm() {
    let isValid = true;
    clearErrors();

    const fullName = document.getElementById('fullName').value.trim();
    if (!fullName) {
        showError('fullNameError', 'Введите корректно ваше ФИО');
        isValid = false;
    }

    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showError('emailError', 'Введите корректный email');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showError('emailError', 'Введите корректный email');
        isValid = false;
    }

    const phone = phoneInput.value.trim();
    if (phone && phone !== '+7 (___) ___-__-__') {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        if (cleanPhone.length < 11) {
            showError('phoneError', 'Номер телефона должен содержать 11 цифр');
            isValid = false;
        }
    }

    const message = document.getElementById('messageText').value.trim();
    if (!message) {
        showError('messageError', 'Укажите ваш опыт работы');
        isValid = false;
    }

    const privacyPolicy = document.getElementById('privacyPolicy').checked;
    if (!privacyPolicy) {
        showError('privacyError', 'Необходимо ваше согласие с политикой обработки данных');
        isValid = false;
    }

    return isValid;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    const inputId = elementId.replace('Error', '');
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
    });
    
    const inputElements = document.querySelectorAll('input, textarea');
    inputElements.forEach(element => {
        element.classList.remove('error');
    });
}

function formatPhoneNumber(value) {
    let numbers = value.replace(/\D/g, '');
    
    if (numbers.startsWith('7') || numbers.startsWith('8')) {
        numbers = '7' + numbers.substring(1);
    }
    
    numbers = numbers.substring(0, 11);
    
    if (numbers.length === 0) {
        return '';
    } else if (numbers.length <= 1) {
        return '+7';
    } else if (numbers.length <= 4) {
        return `+7 (${numbers.substring(1, 4)}`;
    } else if (numbers.length <= 7) {
        return `+7 (${numbers.substring(1, 4)}) ${numbers.substring(4, 7)}`;
    } else if (numbers.length <= 9) {
        return `+7 (${numbers.substring(1, 4)}) ${numbers.substring(4, 7)}-${numbers.substring(7, 9)}`;
    } else {
        return `+7 (${numbers.substring(1, 4)}) ${numbers.substring(4, 7)}-${numbers.substring(7, 9)}-${numbers.substring(9, 11)}`;
    }
}

phoneInput.addEventListener('input', function(e) {
    const oldValue = e.target.value;
    const newValue = formatPhoneNumber(oldValue);
    e.target.value = newValue;
    saveFormData();
    
    if (e.target.classList.contains('error')) {
        const errorElement = document.getElementById('phoneError');
        if (errorElement) {
            errorElement.style.display = 'none';
            e.target.classList.remove('error');
        }
    }
});

function saveFormData() {
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        organization: document.getElementById('organization').value,
        message: document.getElementById('messageText').value,
        privacyPolicy: document.getElementById('privacyPolicy').checked
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
}

function restoreFormData() {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            document.getElementById('fullName').value = formData.fullName || '';
            document.getElementById('email').value = formData.email || '';
            
            if (formData.phone && formData.phone !== '+7 (___) ___-__-__') {
                phoneInput.value = formatPhoneNumber(formData.phone);
            } else {
                phoneInput.value = formData.phone || '';
            }
            
            document.getElementById('organization').value = formData.organization || '';
            document.getElementById('messageText').value = formData.message || '';
            document.getElementById('privacyPolicy').checked = formData.privacyPolicy || false;
        } catch (e) {
            console.error('Ошибка восстановления данных:', e);
        }
    }
}

function clearFormData() {
    localStorage.removeItem(FORM_STORAGE_KEY);
    form.reset();
    clearErrors();
}

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    if (type === 'success') {
        setTimeout(hideMessage, 5000);
    }
}

function hideMessage() {
    messageDiv.classList.add('hidden');
}

function showPrivacyPolicy() {
    alert('Политика обработки персональных данных\n\nМы обязуемся защищать ваши персональные данные и использовать их только для обработки вашего запроса.');
}

// Функция отправки формы
async function submitForm() {
    if (!validateForm()) {
        showMessage('Исправьте ошибки в форме', 'error');
        return;
    }

    submitBtnDesktop.disabled = true;
    submitBtnMobile.disabled = true;
    submitTextDesktop.classList.add('hidden');
    submitTextMobile.classList.add('hidden');
    submitLoadingDesktop.classList.remove('hidden');
    submitLoadingMobile.classList.remove('hidden');
    hideMessage();

    try {
        const formData = new FormData(form);
        
        const response = await fetch(FORM_URL, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.code === 200) {
            showMessage('Спасибо за оставленную заявку! Позже с вами свяжется наш специалист', 'success');
            clearFormData();
            setTimeout(() => {
                closeForm();
            }, 3000);
        } else {
            throw new Error(result.message || 'Ошибка отправки формы');
        }

    } catch (error) {
        console.error('Готово:', error);
        showMessage('Спасибо за вашу заявку', 'error');
    } finally {
        submitBtnDesktop.disabled = false;
        submitBtnMobile.disabled = false;
        submitTextDesktop.classList.remove('hidden');
        submitTextMobile.classList.remove('hidden');
        submitLoadingDesktop.classList.add('hidden');
        submitLoadingMobile.classList.add('hidden');
    }
}

openFormBtn.addEventListener('click', openForm);
closeBtn.addEventListener('click', closeForm);
privacyLink.addEventListener('click', function(e) {
    e.preventDefault();
    showPrivacyPolicy();
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    submitForm();
});

form.addEventListener('input', function(event) {
    if (event.target !== phoneInput) {
        saveFormData();
    }
    
    const target = event.target;
    if (target.classList.contains('error')) {
        const errorId = target.id + 'Error';
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.style.display = 'none';
            target.classList.remove('error');
        }
    }
});

form.addEventListener('change', function(event) {
    if (event.target !== phoneInput) {
        saveFormData();
    }
});

overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
        closeForm();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.style.display === 'block') {
        closeForm();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#feedback') {
        openForm();
    }
    
    if (FORMCARRY_FORM_ID === "YOUR_FORMCARRY_FORM_ID") {
        showMessage('⚠️ Для работы формы замените FORMCARRY_FORM_ID на ваш реальный Form ID от formcarry.com', 'error');
    }
});