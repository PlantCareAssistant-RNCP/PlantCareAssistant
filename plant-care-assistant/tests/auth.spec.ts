import { test, expect } from '@playwright/test';

test('Test d\'authentification', async ({ page }) => {
  // Aller sur la page principale
  await page.goto('http://localhost:3000/');

  // Attendre que le bouton "Login" apparaisse et cliquer dessus
  const loginButton = page.locator('#login');
  await expect(loginButton).toBeVisible();
  await loginButton.click();

  // Trouver le champ "loginUsername" et le remplir
  const usernameField = page.locator('#loginUsername');
  await expect(usernameField).toBeVisible();
  await usernameField.fill('testuser123');

  // Remplir le champ "loginPassword"
  const passwordField = page.locator('#loginPassword');
  await expect(passwordField).toBeVisible();
  await passwordField.fill('Password123');

  // Trouver le bouton avec l'id "signIn" et cliquer dessus
  const signInButton = page.locator('#signIn');
  await expect(signInButton).toBeVisible();
  await signInButton.click();

  // Attendre que la page redirige vers la page d'accueil
  await expect(page).toHaveURL('http://localhost:3000/');

  // Vérifie que les boutons "login" et "register" ne sont plus visibles une fois connecté
  await expect(page.locator('#login')).toHaveCount(0);
  await expect(page.locator('#register')).toHaveCount(0); 
  // Si ces éléments sont masqués au lieu d'être supprimés, utilise toBeHidden() à la place
});
