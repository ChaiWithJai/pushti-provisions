import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { WellnessProvider } from './context/WellnessContext';
import { MainContent } from './components/MainContent';

function App() {
  return (
    <BrowserRouter>
      <WellnessProvider>
        <Layout>
          <MainContent />
        </Layout>
      </WellnessProvider>
    </BrowserRouter>
  );
}

export default App;