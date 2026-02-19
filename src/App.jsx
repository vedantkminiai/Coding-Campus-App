// src/App.jsx
// Root component — manages page routing and shared auth state
import React, { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import HackathonPage from "./pages/HackathonPage";
import QuizPage from "./pages/QuizPage";
import useLocalStorage from "./hooks/useLocalStorage";

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser, removeUser] = useLocalStorage("cc_user", null);

  const handleLogout = () => {
    removeUser();
  };

  const renderPage = () => {
    switch (page) {
      case "home":      return <HomePage setPage={setPage} />;
      case "contact":   return <ContactPage />;
      case "hackathon": return <HackathonPage />;
      case "quiz":      return <QuizPage />;
      default:          return <HomePage setPage={setPage} />;
    }
  };

  return (
    <>
      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        onLogout={handleLogout}
      />
      <main>{renderPage()}</main>
    </>
  );
}

export default App;
