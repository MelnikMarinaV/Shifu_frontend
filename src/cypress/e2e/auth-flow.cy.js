describe("Основной пользовательский сценарий", () => {
  it("пользователь входит в систему и переходит по разделам", () => {
    cy.visit("http://localhost:5174/");

    cy.get('input[type="text"], input[name="username"]').first().type("marina");

    cy.get('input[type="password"]').first().type("12345");

    cy.contains("button", /войти|login/i).click();

    cy.url().should("include", "/lessons");

    cy.contains("Уроки").should("be.visible");

    cy.visit("http://localhost:5174/my-submissions");

    cy.url().should("include", "/my-submissions");

    cy.visit("http://localhost:5174/settings");

    cy.url().should("include", "/settings");
  });
});
