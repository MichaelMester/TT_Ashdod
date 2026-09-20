(function () {
    const pageName = window.location.pathname.split('/').pop() || 'index.html';

    document.documentElement.style.visibility = 'hidden';

    const email = sessionStorage.getItem('playerEmail');
    const password = sessionStorage.getItem('playerPassword');

    function isAdminSession() {
        try {
            const playerSession = JSON.parse(sessionStorage.getItem('playerSession') || 'null');
            return playerSession?.data?.admin === true;
        } catch (error) {
            return false;
        }
    }

    function hideNavigation() {
        document.addEventListener('DOMContentLoaded', () => {
            const navigation = document.querySelector('.standalone-nav');
            if (navigation) navigation.style.display = 'none';
            document.documentElement.style.visibility = 'visible';
        }, { once: true });
    }

    function addSignOutToNavigation() {
        const signOut = (event) => {
            event.preventDefault();
            sessionStorage.removeItem('playerEmail');
            sessionStorage.removeItem('playerPassword');
            sessionStorage.removeItem('playerSession');
            localStorage.removeItem('playerEmail');
            localStorage.removeItem('playerPassword');
            localStorage.removeItem('authReturnTo');
            window.location.replace('index.html');
        };

        const desktopMenu = document.querySelector('.standalone-nav-menu');
        if (desktopMenu && !desktopMenu.querySelector('[data-sign-out]')) {
            const desktopItem = document.createElement('li');
            const desktopLink = document.createElement('a');
            desktopLink.href = '#';
            desktopLink.textContent = 'יציאה';
            desktopLink.dataset.signOut = 'true';
            desktopLink.addEventListener('click', signOut);
            desktopItem.appendChild(desktopLink);
            desktopMenu.appendChild(desktopItem);
        }

        const mobileMenu = document.querySelector('.standalone-mobile-menu');
        if (mobileMenu && !mobileMenu.querySelector('[data-sign-out]')) {
            const mobileLink = document.createElement('a');
            mobileLink.href = '#';
            mobileLink.textContent = 'יציאה';
            mobileLink.dataset.signOut = 'true';
            mobileLink.addEventListener('click', signOut);
            mobileMenu.appendChild(mobileLink);
        }
    }

    function hideAdminNavigationForPlayers() {
        let playerSession = null;

        try {
            playerSession = JSON.parse(sessionStorage.getItem('playerSession') || 'null');
        } catch (error) {
            console.warn('Could not read player session:', error);
        }

        if (playerSession?.data?.admin === true) {
            return;
        }

        document.querySelectorAll('a[href="admin.html"]').forEach((adminLink) => {
            const menuItem = adminLink.closest('li');
            if (menuItem) {
                menuItem.remove();
            } else {
                adminLink.remove();
            }
        });
    }

    if (!email || !password) {
        if (pageName === 'index.html') {
            hideNavigation();
        }
        if (pageName !== 'index.html') {
            const returnTo = `${pageName}${window.location.search}${window.location.hash}`;
            localStorage.setItem('authReturnTo', returnTo);
            window.location.replace('index.html');
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.documentElement.style.visibility = 'visible';
            }, { once: true });
        }
        return;
    }

    if (pageName === 'admin.html' && !isAdminSession()) {
        window.location.replace('index.html');
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.style.visibility = 'visible';
        hideAdminNavigationForPlayers();
        addSignOutToNavigation();
    }, { once: true });
})();
