import { test, expect } from '@playwright/test';

test('Test d\'authentification', async ({ page }) => {
  // Aller sur la page principale
  await page.goto('http://localhost:3000/');

  // Attendre que le bouton "Login" apparaisse et cliquer dessus
  const loginButton = page.locator('#login');
  await expect(loginButton).toBeVisible();
  await loginButton.click();

  // Trouver le champ "loginUsername" et le remplir
  const usernameField = page.locator('#email');
  await expect(usernameField).toBeVisible();
  await usernameField.fill('bradley.loizeau@gmail.com');

  // Remplir le champ "loginPassword"
  const passwordField = page.locator('#password');
  await expect(passwordField).toBeVisible();
  await passwordField.fill('Password123');

  // Trouver le bouton avec l'id "signIn" et cliquer dessus
  const signInButton = page.locator('#signIn');
  await expect(signInButton).toBeVisible();
  await signInButton.click();

  // Attendre que la page redirige vers la page d'accueil
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
});
