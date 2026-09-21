(function () {
    const READ_SESSION_KEY = 'firestoreReadSession';

    window.recordFirestoreRead = function (snapshot) {
        const session = JSON.parse(localStorage.getItem(READ_SESSION_KEY) || 'null');
        if (!session?.playerId) return;

        const documentCount = typeof snapshot?.size === 'number'
            ? snapshot.size
            : (snapshot?.exists ? 1 : 0);
        session.reads = (Number(session.reads) || 0) + documentCount;
        localStorage.setItem(READ_SESSION_KEY, JSON.stringify(session));
    };

    window.startFirestoreReadSession = function (player) {
        localStorage.setItem(READ_SESSION_KEY, JSON.stringify({
            playerId: player.id,
            playerName: player.name || '',
            reads: 0
        }));
    };

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

    if (!localStorage.getItem(READ_SESSION_KEY)) {
        try {
            const playerSession = JSON.parse(sessionStorage.getItem('playerSession') || 'null');
            if (playerSession?.id) {
                window.startFirestoreReadSession?.({
                    id: playerSession.id,
                    name: playerSession.data?.playerName || ''
                });
            }
        } catch (error) {
            console.warn('Could not initialize Firestore read session:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.style.visibility = 'visible';
        hideAdminNavigationForPlayers();
        addSignOutToNavigation();
    }, { once: true });
})();
