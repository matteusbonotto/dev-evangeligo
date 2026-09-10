import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../features/authentication/context/AuthContext";
import { HomePage } from "./HomePage";

function renderHomePage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("HomePage", () => {
  it("exibe o título principal", () => {
    renderHomePage();
    expect(
      screen.getByRole("heading", {
        name: /uma jornada bíblica que respeita o seu ritmo/i,
      }),
    ).toBeInTheDocument();
  });

  it("exibe os princípios", () => {
    renderHomePage();
    expect(screen.getByText("Palavra em primeiro lugar")).toBeInTheDocument();
    expect(screen.getByText("Privacidade real")).toBeInTheDocument();
  });
});
