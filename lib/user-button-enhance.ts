// Add click handler to UserButton dropdown card
if (typeof window !== 'undefined') {
  // Wait for the DOM to load
  const addProfileLinkToUserButton = () => {
    // Find the user info section in the dropdown (usually the first menu item)
    const observer = new MutationObserver(() => {
      const userInfoCard = document.querySelector('[data-neon-auth-ui] [role="menuitem"]:first-child');
      if (userInfoCard && !userInfoCard.hasAttribute('data-profile-link')) {
        userInfoCard.setAttribute('data-profile-link', 'true');
        userInfoCard.addEventListener('click', () => {
          window.location.href = '/profile';
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addProfileLinkToUserButton);
  } else {
    addProfileLinkToUserButton();
  }
}

export {};
